import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import { useAuthStore } from './authStore';

interface Investment {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  user_id: string;
  transaction_id?: string;
}

interface ReferredInvestment {
  id: string;
  status: string;
  amount: number;
}

interface ReferralWithInvestments {
  id: string;
  full_name: string;
  email: string;
  referred_by: string;
  created_at: string;
  user_investments: Investment[];
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  level: number;
  is_active: boolean;
  total_investment: number;
  total_commission: number;
  last_investment_date: string | null;
  created_at: string;
  updated_at: string;
  referred: {
    full_name: string;
    email: string;
  };
}

interface ReferralState {
  referrals: Referral[];
  referralsByLevel: {
    1: Referral[];
    2: Referral[];
  };
  loading: boolean;
  totalCommission: number;
  activeReferrals: number;
  loadReferrals: () => Promise<void>;
  getReferralLink: () => string;
  debugReferralInvestments: () => Promise<void>;
}

const calculateCommission = (amount: number, level: number): number => {
  switch (level) {
    case 1:
      return amount * 0.05; // 5% pour niveau 1
    case 2:
      return amount * 0.02; // 2% pour niveau 2
    case 3:
      return amount * 0.01; // 1% pour niveau 3
    default:
      return 0;
  }
};

export const useReferralStore = create<ReferralState>((set) => ({
  referrals: [],
  referralsByLevel: { 1: [], 2: [] },
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

      console.log('Récupération des filleuls pour l\'utilisateur:', user.id);

      // Récupérer les filleuls de niveau 1
      const { data: level1Data, error: level1Error } = await supabase
        .from('referral_status')
        .select(`
          *,
          referred:profiles!referred_id (
            id,
            full_name,
            email
          )
        `)
        .eq('referrer_id', user.id);

      if (level1Error) throw level1Error;

      // Récupérer les filleuls de niveau 2
      const level2Promises = level1Data.map(async (level1Referral) => {
        const { data: level2Data, error: level2Error } = await supabase
          .from('referral_status')
          .select(`
            *,
            referred:profiles!referred_id (
              id,
              full_name,
              email
            )
          `)
          .eq('referrer_id', level1Referral.referred_id);

        if (level2Error) throw level2Error;
        return level2Data;
      });

      const level2Results = await Promise.all(level2Promises);
      const level2Data = level2Results.flat();

      console.log('Données brutes des filleuls niveau 1:', JSON.stringify(level1Data, null, 2));
      console.log('Données brutes des filleuls niveau 2:', JSON.stringify(level2Data, null, 2));

      const mapReferral = (ref: any, level: number) => ({
        id: ref.id,
        referrer_id: ref.referrer_id,
        referred_id: ref.referred_id,
        level: level,
        is_active: ref.is_active,
        total_investment: ref.total_investment,
        total_commission: ref.total_commission,
        last_investment_date: ref.last_investment_date,
        created_at: ref.created_at,
        updated_at: ref.updated_at,
        referred: {
          id: ref.referred.id,
          full_name: ref.referred.full_name,
          email: ref.referred.email
        }
      });

      const level1Referrals = level1Data.map((ref: any) => mapReferral(ref, 1));
      const level2Referrals = level2Data.map((ref: any) => mapReferral(ref, 2));

      const referrals = [...level1Referrals, ...level2Referrals];

      const referralsByLevel = {
        1: level1Referrals,
        2: level2Referrals
      };

      const totalCommission = referrals.reduce((sum, ref) => sum + ref.total_commission, 0);
      const activeReferralsCount = referrals.filter(ref => ref.is_active).length;

      console.log('=== RÉSUMÉ DES CALCULS ===');
      console.log('Referrals:', {
        total_filleuls: referrals.length,
        filleuls_actifs: activeReferralsCount,
        commission_totale: totalCommission,
        details_niveau_1: referralsByLevel[1].map(ref => ({
          nom: ref.referred.full_name,
          total_investi: ref.total_investment,
          commission: ref.total_commission,
          statut: ref.is_active ? 'Actif' : 'Inactif',
          dernier_investissement: ref.last_investment_date
        })),
        details_niveau_2: referralsByLevel[2].map(ref => ({
          nom: ref.referred.full_name,
          total_investi: ref.total_investment,
          commission: ref.total_commission,
          statut: ref.is_active ? 'Actif' : 'Inactif',
          dernier_investissement: ref.last_investment_date
        }))
      });

      set({
        referrals,
        referralsByLevel,
        totalCommission,
        activeReferrals: activeReferralsCount,
        loading: false
      });

      console.log('État final du store:', {
        referrals,
        referralsByLevel,
        totalCommission,
        activeReferrals: activeReferralsCount,
      });

    } catch (error) {
      console.error('Erreur lors du chargement des filleuls:', error);
      set({ referrals: [], totalCommission: 0, activeReferrals: 0, loading: false });
    }
  },

  debugReferralInvestments: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Aucun utilisateur connecté pour le débogage');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          referred_by,
          user_investments(
            id,
            status,
            amount
          )
        `)
        .eq('referred_by', user.id);

      if (error) throw error;

      console.log('Données de débogage:', data);
    } catch (error) {
      console.error('Erreur de débogage:', error);
    }
  },

  getReferralLink: () => {
    const profile = useAuthStore.getState().profile;
    if (!profile?.referral_code) return '';
    return `${window.location.origin}/register?ref=${profile.referral_code}`;
  }
}));
