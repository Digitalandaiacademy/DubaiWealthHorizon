import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import { useAuthStore } from './authStore';

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  level: number;
  status: string;
  total_investment: number;
  total_commission: number;
  created_at: string;
  referred: {
    full_name: string;
    email: string;
    id: string;
  };
  referred_investments: {
    id: string;
    status: string;
    amount: number;
  }[];
}

interface ReferralState {
  referrals: Referral[];
  loading: boolean;
  totalCommission: number;
  activeReferrals: number;
  loadReferrals: () => Promise<void>;
  getReferralLink: () => string;
  debugReferralInvestments: () => Promise<void>;
}

export const useReferralStore = create<ReferralState>((set) => ({
  referrals: [],
  loading: false,
  totalCommission: 0,
  activeReferrals: 0,

  loadReferrals: async () => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Aucun utilisateur connecté');
        set({ referrals: [], totalCommission: 0, activeReferrals: 0, loading: false });
        return;
      }

      console.log('Utilisateur connecté pour récupération des filleuls:', user.id);

      // Requête pour récupérer les filleuls avec leurs investissements détaillés
      const { data: referralsData, error: referralsError } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          email, 
          referred_by,
          user_investments:user_investments(
            id, 
            status, 
            amount,
            investment_plans:investment_plans(
              name,
              daily_roi
            )
          )
        `)
        .eq('referred_by', user.id);

      if (referralsError) {
        console.error('Erreur lors de la récupération des filleuls:', referralsError);
        throw referralsError;
      }

      console.log('Données brutes des filleuls:', referralsData);

      // Transformer les données des filleuls
      const referrals = (referralsData || []).map(ref => {
        // Filtrer et analyser les investissements
        const activeInvestments = ref.user_investments.filter(inv => inv.status === 'active');
        
        // Calculer le total des investissements actifs
        const totalInvestment = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);

        return {
          id: ref.id,
          referred_id: ref.id,
          referred: {
            full_name: ref.full_name || 'Nom non disponible',
            email: ref.email || 'Email non disponible'
          },
          status: activeInvestments.length > 0 ? 'active' : 'inactive',
          level: 1, // Tous sont niveau 1 car directement parrainés
          total_investment: totalInvestment,
          total_commission: activeInvestments.reduce((sum, inv) => {
            // Calculer la commission de 5%
            const roiRate = inv.investment_plans?.daily_roi || 0.05;
            return sum + (inv.amount * roiRate);
          }, 0),
          created_at: ref.created_at
        };
      });

      // Calculer les totaux
      const totalCommission = referrals.reduce((sum, ref) => sum + ref.total_commission, 0);
      const activeReferrals = referrals.filter(r => r.status === 'active').length;

      console.log('Données finales des filleuls:', {
        referrals,
        totalCommission,
        activeReferrals
      });

      set({ 
        referrals, 
        totalCommission, 
        activeReferrals 
      });
    } catch (error) {
      console.error('Erreur globale lors du chargement des filleuls:', error);
      set({ referrals: [], totalCommission: 0, activeReferrals: 0 });
    } finally {
      set({ loading: false });
    }
  },

  debugReferralInvestments: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Aucun utilisateur connecté pour le débogage');
        return;
      }

      console.log('Débogage des investissements des filleuls pour l\'utilisateur:', user.id);

      // Requête détaillée pour récupérer les filleuls avec leurs investissements
      const { data: referralsData, error: referralsError } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          email, 
          referred_by,
          user_investments:user_investments(
            id, 
            status, 
            amount,
            user_id,
            created_at,
            investment_plans(
              name,
              daily_roi,
              duration
            )
          )
        `)
        .eq('referred_by', user.id);

      if (referralsError) {
        console.error('Erreur lors de la récupération des filleuls pour débogage:', referralsError);
        return;
      }

      console.log('Données complètes des filleuls:', JSON.stringify(referralsData, null, 2));

      // Analyse détaillée de chaque filleul et de ses investissements
      referralsData?.forEach(referral => {
        console.group(`Filleul: ${referral.full_name} (ID: ${referral.id})`);
        console.log('Nombre total d\'investissements:', referral.user_investments.length);
        
        // Détails des investissements
        referral.user_investments.forEach(investment => {
          console.log('Investissement:', {
            id: investment.id,
            status: investment.status,
            amount: investment.amount,
            user_id: investment.user_id,
            created_at: investment.created_at,
            plan: investment.investment_plans
          });
        });

        // Investissements actifs
        const activeInvestments = referral.user_investments.filter(inv => inv.status === 'active');
        console.log('Investissements actifs:', activeInvestments.length);
        
        console.groupEnd();
      });

    } catch (error) {
      console.error('Erreur de débogage globale:', error);
    }
  },

  getReferralLink: () => {
    const profile = useAuthStore.getState().profile;
    if (!profile?.referral_code) return '';
    return `${window.location.origin}/register?ref=${profile.referral_code}`;
  }
}));