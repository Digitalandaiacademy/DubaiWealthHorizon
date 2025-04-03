import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface InvestmentPlan {
  id: string;
  name: string;
  price: number;
  daily_roi: number;
  min_withdrawal: number;
  features: string[];
}

interface UserInvestment {
  id: string;
  plan_id: string;
  amount: number;
  status: string;
  created_at: string;
  plan: InvestmentPlan;
  cycle_days: number;
}

interface InvestmentState {
  plans: InvestmentPlan[];
  userInvestments: UserInvestment[];
  loading: boolean;
  loadPlans: () => Promise<void>;
  loadUserInvestments: () => Promise<void>;
  createInvestment: (planId: string, amount: number, transactionId: string, paymentMethod: string) => Promise<void>;
  checkInvestmentStatus: () => Promise<void>;
}

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  plans: [],
  userInvestments: [],
  loading: false,

  loadPlans: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .order('price');

      if (error) {
        console.error('Error loading plans:', error);
        throw error;
      }
      set({ plans: data || [] });
    } catch (error) {
      console.error('Failed to load investment plans:', error);
      toast.error('Erreur lors du chargement des plans d\'investissement');
    } finally {
      set({ loading: false });
    }
  },

  loadUserInvestments: async () => {
    try {
      set({ loading: true });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user found');
        set({ userInvestments: [] });
        return;
      }

      // Load cycle duration from system settings with proper error handling
      let cycleDays = 60; // Default value
      try {
        const { data: cycleData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'investment_cycle_days')
          .limit(1)
          .maybeSingle();

        if (cycleData?.value) {
          cycleDays = parseInt(cycleData.value);
        }
      } catch (settingsError) {
        console.warn('Could not load investment cycle days, using default:', settingsError);
      }

      // Load investments for the current user
      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          plan:investment_plans(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user investments:', error);
        throw error;
      }

      console.log('Loaded user investments:', data);

      // Add cycle duration to each investment
      const investmentsWithCycle = (data || []).map(inv => ({
        ...inv,
        cycle_days: cycleDays
      }));

      set({ userInvestments: investmentsWithCycle });
    } catch (error: any) {
      console.error('Error loading investments:', error);
      toast.error('Erreur lors du chargement des investissements');
    } finally {
      set({ loading: false });
    }
  },

  createInvestment: async (planId: string, amount: number, transactionId: string, paymentMethod: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Find pending payment verification
      const { data: payment, error: paymentError } = await supabase
        .from('payment_verifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .eq('investment_plan', planId)
        .maybeSingle();

      if (paymentError) {
        console.error('Error finding payment verification:', paymentError);
        throw paymentError;
      }
      
      if (!payment) {
        throw new Error('Paiement non trouvé');
      }

      // Use RPC function to verify payment and create investment
      const { data, error: rpcError } = await supabase.rpc(
        'verify_payment_and_create_investment',
        {
          p_payment_id: payment.id,
          p_transaction_id: transactionId,
          p_user_id: user.id,
          p_plan_id: planId,
          p_amount: amount
        }
      );

      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw rpcError;
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la création de l\'investissement');
      }

      toast.success('Investissement créé avec succès');
      await get().loadUserInvestments();
    } catch (error: any) {
      console.error('Error creating investment:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'investissement');
      throw error;
    }
  },

  checkInvestmentStatus: async () => {
    try {
      const { userInvestments } = get();
      
      // Check each active investment
      for (const investment of userInvestments) {
        if (investment.status !== 'active') continue;

        const startDate = new Date(investment.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // If investment is older than cycle days, mark as completed
        if (daysDiff >= investment.cycle_days) {
          const { error } = await supabase
            .from('user_investments')
            .update({ status: 'completed' })
            .eq('id', investment.id);

          if (error) throw error;

          // Create notification
          await supabase
            .from('notifications')
            .insert({
              user_id: investment.user_id,
              title: 'Investissement terminé',
              message: `Votre investissement de ${investment.amount.toLocaleString('fr-FR')} FCFA est arrivé à terme.`,
              type: 'info'
            });
        }
      }

      await get().loadUserInvestments();
    } catch (error: any) {
      console.error('Error checking investment status:', error);
    }
  }
}));