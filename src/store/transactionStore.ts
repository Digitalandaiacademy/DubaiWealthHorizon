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
  type: 'investment' | 'return' | 'withdrawal' | 'referral' | 'commission_withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  created_at: string;
  payment_method?: string;
  payment_details?: {
    fullName: string;
    phoneNumber?: string;
    email: string;
    cryptoAddress?: string;
    paymentMethod?: string;
    paymentCategory?: string;
  };
  user?: {
    full_name: string;
    email: string;
    created_at: string;
  } | null;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  totalReceived: number;
  totalWithdrawn: number;
  availableBalance: number;
  newPendingWithdrawals: Transaction[];
  lastCheckedTimestamp: string;
  setLoading: (loading: boolean) => void;
  loadTransactions: () => Promise<void>;
  createWithdrawal: ({ amount, paymentMethod, paymentDetails, paymentCategory, type }: { 
    amount: number | string, 
    paymentMethod: string, 
    paymentDetails: any, 
    paymentCategory: string,
    type?: 'withdrawal' | 'commission_withdrawal' 
  }) => Promise<any>;
  startAutoUpdate: () => void;
  stopAutoUpdate: () => void;
  loadUserDetails: (userId: string) => Promise<{
    full_name: string;
    email: string;
    created_at: string;
  } | null>;
  updateWithdrawalStatus: (withdrawalId: string, status: 'completed' | 'rejected') => Promise<any>;
  acknowledgeNewWithdrawals: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => {
  let updateInterval: NodeJS.Timeout | null = null;
  let lastChecked = new Date().toISOString();

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
    newPendingWithdrawals: [],
    lastCheckedTimestamp: lastChecked,
    setLoading: (loading: boolean) => set({ loading }),
    acknowledgeNewWithdrawals: () => {
      set({
        lastCheckedTimestamp: new Date().toISOString(),
        newPendingWithdrawals: []
      });
    },

    loadTransactions: async () => {
      try {
        set({ loading: true });
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            user:profiles(
              full_name,
              email,
              created_at
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transactions = data || [];
        
        // Calculer les rendements avec le bon taux
        const returns = await calculateReturns();

        // Calculer les totaux par type de retrait
        const standardWithdrawals = transactions
          .filter(t => t.type === 'withdrawal' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const commissionWithdrawals = transactions
          .filter(t => t.type === 'commission_withdrawal' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const pendingWithdrawals = transactions
          .filter(t => t.type === 'withdrawal' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);

        const pendingCommissionWithdrawals = transactions
          .filter(t => t.type === 'commission_withdrawal' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalWithdrawn = standardWithdrawals + commissionWithdrawals;
        const availableBalance = Math.floor(returns - standardWithdrawals - pendingWithdrawals);

        console.log('Debug - Store loadTransactions:', {
          returns,
          standardWithdrawals,
          commissionWithdrawals,
          pendingWithdrawals,
          pendingCommissionWithdrawals,
          totalWithdrawn,
          availableBalance
        });

        // Détecter les nouvelles demandes de retrait
        const newWithdrawals = transactions.filter(t => 
          (t.type === 'withdrawal' || t.type === 'commission_withdrawal') &&
          t.status === 'pending' &&
          new Date(t.created_at) > new Date(get().lastCheckedTimestamp)
        );

        set({
          transactions,
          totalReceived: returns,
          totalWithdrawn,
          availableBalance,
          newPendingWithdrawals: newWithdrawals
        });
      } finally {
        set({ loading: false });
      }
    },

    createWithdrawal: async ({ amount, paymentMethod, paymentDetails, paymentCategory, type = 'withdrawal' }) => {
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
            type,
            amount: withdrawalAmount,
            status: 'pending',
            payment_method: paymentMethod,
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
        set({ loading: true });
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          throw new Error('Utilisateur non authentifié');
        }

        const { data, error } = await supabase
          .from('transactions')
          .update({ status })
          .eq('id', withdrawalId)
          .select(`
            *,
            user:profiles(
              full_name,
              email,
              created_at
            )
          `);

        if (error) {
          console.error('Erreur lors de la mise à jour du retrait:', error);
          throw error;
        }

        // Mise à jour locale du state
        set(state => {
          const updatedTransactions = state.transactions.map(t =>
            t.id === withdrawalId ? { ...t, status } : t
          );

          // Recalculer les totaux
          const standardWithdrawals = updatedTransactions
            .filter(t => t.type === 'withdrawal' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

          const commissionWithdrawals = updatedTransactions
            .filter(t => t.type === 'commission_withdrawal' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

          const pendingWithdrawals = updatedTransactions
            .filter(t => t.type === 'withdrawal' && t.status === 'pending')
            .reduce((sum, t) => sum + t.amount, 0);

          const totalWithdrawn = standardWithdrawals + commissionWithdrawals;
          const availableBalance = Math.floor(state.totalReceived - standardWithdrawals - pendingWithdrawals);

          return {
            transactions: updatedTransactions,
            totalWithdrawn,
            availableBalance,
            loading: false,
            newPendingWithdrawals: state.newPendingWithdrawals.filter(w => w.id !== withdrawalId),
            lastCheckedTimestamp: state.lastCheckedTimestamp
          };
        });

        return data;
      } catch (error) {
        console.error('Erreur lors de la mise à jour du retrait:', error);
        set({ loading: false });
        throw error;
      }
    },
  };
});