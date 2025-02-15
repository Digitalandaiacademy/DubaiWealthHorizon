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
  createWithdrawal: (amount: number, paymentMethod: string, withdrawalInfo: WithdrawalInfo) => Promise<void>;
  startAutoUpdate: () => void;
  stopAutoUpdate: () => void;
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

    createWithdrawal: async (amount: number, paymentMethod: string, withdrawalInfo: WithdrawalInfo) => {
      // Recharger les transactions pour avoir le solde le plus à jour
      await get().loadTransactions();
      
      // Calculer les rendements avec le bon taux
      const returns = await calculateReturns();
      const transactions = get().transactions;
      
      // Calculer le solde disponible en prenant en compte les retraits en attente
      const completedWithdrawals = transactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const pendingWithdrawals = transactions
        .filter(t => t.type === 'withdrawal' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      const availableBalance = Math.floor(returns - completedWithdrawals - pendingWithdrawals);

      console.log('Debug - Store createWithdrawal:', {
        amount,
        returns,
        completedWithdrawals,
        pendingWithdrawals,
        availableBalance
      });

      if (amount > availableBalance) {
        throw new Error('Solde insuffisant');
      }

      // Récupérer l'ID de l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de la création du retrait:', error);
        throw error;
      }

      // Recharger les transactions après le retrait
      await get().loadTransactions();
    },

    startAutoUpdate: () => {
      if (!updateInterval) {
        updateInterval = setInterval(() => {
          get().loadTransactions();
        }, 60000); // Mise à jour toutes les minutes
      }
    },

    stopAutoUpdate: () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    }
  };
});