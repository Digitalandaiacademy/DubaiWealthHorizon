import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

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
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user found for calculating returns');
        return 0;
      }

      // Récupérer les investissements avec leurs plans
      const { data: investments, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          plan:investment_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching investments for returns calculation:', error);
        return 0;
      }

      console.log('Investments for returns calculation:', investments);

      let totalReturns = 0;

      investments?.forEach(investment => {
        const startDate = new Date(investment.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - startDate.getTime());
        
        // Limiter les jours au cycle d'investissement (60 jours par défaut ou cycle_days si défini)
        const cycleDays = investment.cycle_days || 60;
        const daysDiff = Math.min(
          Math.floor(diffTime / (1000 * 60 * 60 * 24)),
          cycleDays
        );
        
        // Utiliser le taux de rendement quotidien du plan
        const dailyReturn = (investment.amount * investment.plan.daily_roi) / 100;
        const investmentReturn = dailyReturn * daysDiff;
        
        console.log(`Investment ${investment.id} return:`, {
          amount: investment.amount,
          roi: investment.plan.daily_roi,
          days: daysDiff,
          dailyReturn,
          totalReturn: investmentReturn
        });
        
        totalReturns += investmentReturn;
      });

      console.log('Total calculated returns:', totalReturns);
      return Math.floor(totalReturns);
    } catch (error) {
      console.error('Error in calculateReturns:', error);
      return 0;
    }
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
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('No authenticated user found for loading transactions');
          set({ 
            transactions: [],
            totalReceived: 0,
            totalWithdrawn: 0,
            availableBalance: 0,
            loading: false
          });
          return;
        }
        
        // Load transactions for the current user
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading transactions:', error);
          throw error;
        }

        console.log('Loaded transactions:', data);
        const transactions = data || [];
        
        // Calculer les rendements avec le bon taux et en respectant les cycles
        const returns = await calculateReturns();

        // Calculer les totaux par type de retrait
        const standardWithdrawals = transactions
          .filter(t => t.type === 'withdrawal' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const commissionWithdrawals = transactions
          .filter(t => t.type === 'commission_withdrawal' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const referralCredits = transactions
          .filter(t => t.type === 'referral' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const pendingWithdrawals = transactions
          .filter(t => t.type === 'withdrawal' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);

        const pendingCommissionWithdrawals = transactions
          .filter(t => t.type === 'commission_withdrawal' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalWithdrawn = standardWithdrawals + commissionWithdrawals;
        const availableBalance = Math.floor(returns + referralCredits - standardWithdrawals - pendingWithdrawals);

        console.log('Transaction store calculations:', {
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
      } catch (error) {
        console.error('Error in loadTransactions:', error);
        toast.error('Erreur lors du chargement des transactions');
      } finally {
        set({ loading: false });
      }
    },

    createWithdrawal: async ({ amount, paymentMethod, paymentDetails, paymentCategory, type = 'withdrawal' }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Utilisateur non authentifié');
        }

        // Convertir amount en nombre si ce n'est pas déjà un nombre
        const withdrawalAmount = typeof amount === 'number' ? amount : Number(amount);

        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
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
          .maybeSingle();

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
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
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