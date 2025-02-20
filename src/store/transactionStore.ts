import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface WithdrawalInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: 'investment' | 'return' | 'withdrawal' | 'referral';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  totalReceived: number;
  totalWithdrawn: number;
  availableBalance: number;
  loadTransactions: () => Promise<void>;
  createWithdrawal: ({ amount, paymentMethod, paymentDetails, paymentCategory }: { amount: number | string, paymentMethod: string, paymentDetails: any, paymentCategory: string }) => Promise<any>;
  startAutoUpdate: () => void;
  stopAutoUpdate: () => void;
  loadUserDetails: (userId: string) => Promise<{
    full_name: string;
    email: string;
    created_at: string;
  } | null>;
  updateWithdrawalStatus: (withdrawalId: string, status: 'completed' | 'rejected') => Promise<any>;
}

export const useTransactionStore = create<TransactionState>((set, get) => {
  let updateInterval: NodeJS.Timeout | null = null;

  const calculateReturns = async () => {
    // Récupérer les investissements avec leurs plans
    const { data: investments, error } = await supabase
      .from('user_investments')
      .select(`
        *,
        plan:investment_plans(*)
      `)
      .eq('status', 'active');

    if (error) {
      console.error('Erreur lors de la récupération des investissements:', error);
      return 0;
    }

    let totalReturns = 0;

    investments?.forEach(investment => {
      const startDate = new Date(investment.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Utiliser le taux de rendement quotidien du plan
      const dailyReturn = (investment.amount * investment.plan.daily_roi) / 100;
      totalReturns += dailyReturn * daysDiff;
    });

    return Math.floor(totalReturns);
  };

  return {
    transactions: [],
    loading: false,
    totalReceived: 0,
    totalWithdrawn: 0,
    availableBalance: 0,

    loadTransactions: async () => {
      try {
        set({ loading: true });
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transactions = data || [];
        
        // Calculer les rendements avec le bon taux
        const returns = await calculateReturns();

        // Calculer le total des retraits (complétés + en attente)
        const completedWithdrawals = transactions
          .filter(t => t.type === 'withdrawal' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const pendingWithdrawals = transactions
          .filter(t => t.type === 'withdrawal' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalWithdrawn = completedWithdrawals;
        const availableBalance = Math.floor(returns - completedWithdrawals - pendingWithdrawals);

        console.log('Debug - Store loadTransactions:', {
          returns,
          completedWithdrawals,
          pendingWithdrawals,
          availableBalance
        });

        set({
          transactions,
          totalReceived: returns,
          totalWithdrawn,
          availableBalance
        });
      } finally {
        set({ loading: false });
      }
    },

    createWithdrawal: async ({ amount, paymentMethod, paymentDetails, paymentCategory }) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          throw new Error('Utilisateur non authentifié');
        }

        // Convertir amount en nombre si ce n'est pas déjà un nombre
        const withdrawalAmount = typeof amount === 'number' ? amount : Number(amount);

        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: userData.user.id,
            type: 'withdrawal',
            amount: withdrawalAmount,
            status: 'pending',
            payment_details: {
              ...paymentDetails,
              paymentMethod,
              paymentCategory
            }
          })
          .select();

        if (error) {
          console.error('Erreur lors de la création du retrait:', error);
          throw error;
        }

        // Recharger les transactions après la création
        await get().loadTransactions();

        return data;
      } catch (error) {
        console.error('Erreur lors de la création du retrait:', error);
        throw error;
      }
    },

    startAutoUpdate: () => {
      if (!updateInterval) {
        updateInterval = setInterval(() => {
          get().loadTransactions();
        }, 60000); // Mise à jour toutes les minutes
      }
    },

    loadUserDetails: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, created_at')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Erreur lors du chargement des détails de l\'utilisateur:', error);
        return null;
      }
    },

    stopAutoUpdate: () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    },

    updateWithdrawalStatus: async (withdrawalId: string, status: 'completed' | 'rejected') => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          throw new Error('Utilisateur non authentifié');
        }

        const { data, error } = await supabase
          .from('transactions')
          .update({ status })
          .eq('id', withdrawalId)
          .select();

        if (error) {
          console.error('Erreur lors de la mise à jour du retrait:', error);
          throw error;
        }

        // Recharger les transactions après la mise à jour
        await get().loadTransactions();

        return data;
      } catch (error) {
        console.error('Erreur lors de la mise à jour du retrait:', error);
        throw error;
      }
    },
  };
});