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

      if (error) throw error;
      set({ plans: data || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadUserInvestments: async () => {
    try {
      set({ loading: true });

      // Charger la durée du cycle depuis les paramètres système
      const { data: cycleData, error: cycleError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'investment_cycle_days')
        .single();

      if (cycleError) throw cycleError;
      const cycleDays = parseInt(cycleData?.value || '60');

      // Charger les investissements
      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          plan:investment_plans(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ajouter la durée du cycle à chaque investissement
      const investmentsWithCycle = (data || []).map(inv => ({
        ...inv,
        cycle_days: cycleDays
      }));

      set({ userInvestments: investmentsWithCycle });
    } catch (error: any) {
      console.error('Erreur lors du chargement des investissements:', error);
    } finally {
      set({ loading: false });
    }
  },

  createInvestment: async (planId: string, amount: number, transactionId: string, paymentMethod: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Trouver le payment_verification en attente
      const { data: payment, error: paymentError } = await supabase
        .from('payment_verifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .eq('investment_plan', planId)
        .single();

      if (paymentError) throw paymentError;
      if (!payment) throw new Error('Paiement non trouvé');

      // Utiliser la fonction RPC pour vérifier le paiement et créer l'investissement
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

      if (rpcError) throw rpcError;
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la création de l\'investissement');
      }

      toast.success('Investissement créé avec succès');
      await get().loadUserInvestments();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'investissement:', error);
      throw error;
    }
  },

  checkInvestmentStatus: async () => {
    try {
      const { userInvestments } = get();
      
      // Vérifier chaque investissement actif
      for (const investment of userInvestments) {
        if (investment.status !== 'active') continue;

        const startDate = new Date(investment.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Si l'investissement a plus de 60 jours, le marquer comme terminé
        if (daysDiff >= investment.cycle_days) {
          const { error } = await supabase
            .from('user_investments')
            .update({ status: 'completed' })
            .eq('id', investment.id);

          if (error) throw error;

          // Créer une notification
          await supabase
            .from('notifications')
            .insert({
              user_id: investment.plan_id,
              title: 'Investissement terminé',
              message: `Votre investissement de ${investment.amount.toLocaleString('fr-FR')} FCFA est arrivé à terme.`,
              type: 'info'
            });
        }
      }

      await get().loadUserInvestments();
    } catch (error: any) {
      console.error('Erreur lors de la vérification des investissements:', error);
    }
  }
}));
