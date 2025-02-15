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
      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          plan:investment_plans(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ userInvestments: data || [] });
    } finally {
      set({ loading: false });
    }
  },

  createInvestment: async (planId: string, amount: number, transactionId: string, paymentMethod: string) => {
    try {
      // Créer l'investissement
      const { error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          plan_id: planId,
          amount: amount,
          status: 'pending'
        });

      if (investmentError) throw investmentError;

      // Créer la vérification de paiement
      const { error: paymentError } = await supabase
        .from('payment_verifications')
        .insert({
          transaction_id: transactionId,
          amount: amount,
          payment_method: paymentMethod,
          status: 'pending'
        });

      if (paymentError) throw paymentError;

      toast.success('Investissement créé avec succès');
      await get().loadUserInvestments();
    } catch (error: any) {
      toast.error(error.message);
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

        // Si l'investissement a plus de 90 jours, le marquer comme terminé
        if (daysDiff >= 90) {
          const { error } = await supabase
            .from('user_investments')
            .update({ status: 'completed' })
            .eq('id', investment.id);

          if (error) throw error;

          // Créer une notification
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
      console.error('Erreur lors de la vérification des investissements:', error);
    }
  }
}));