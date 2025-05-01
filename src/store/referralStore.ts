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
      return amount * 0.10; // 10% pour niveau 1
    case 2:
      return amount * 0.05; // 5% pour niveau 2
    case 3:
      return amount * 0.02; // 2% pour niveau 3 (sera activé dans le futur)
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

      // Récupérer les filleuls directs (niveau 1)
      const { data: directReferrals, error: directError } = await supabase
        .from('profiles')
        .select('id, full_name, email, referred_by')
        .eq('referred_by', user.id);

      if (directError) throw directError;

      // Récupérer les filleuls de niveau 2
      const directReferralIds = directReferrals.map(ref => ref.id);
      const { data: indirectReferrals, error: indirectError } = await supabase
        .from('profiles')
        .select('id, full_name, email, referred_by')
        .in('referred_by', directReferralIds);

      if (indirectError) throw indirectError;

      // Récupérer les statuts des filleuls
      const allReferralIds = [...directReferrals.map(ref => ref.id), ...indirectReferrals.map(ref => ref.id)];
      const { data: referralStatuses, error: statusError } = await supabase
        .from('referral_status')
        .select('*')
        .in('referred_id', allReferralIds);

      if (statusError) throw statusError;

      // Mapper les données pour le niveau 1
      const level1Referrals = directReferrals.map(profile => {
        const status = referralStatuses.find(rs => rs.referred_id === profile.id) || {};
        return {
          id: status.id || profile.id,
          referrer_id: profile.referred_by,
          referred_id: profile.id,
          level: 1,
          is_active: status.is_active || false,
          total_investment: status.total_investment || 0,
          total_commission: status.total_commission || 0,
          last_investment_date: status.last_investment_date || null,
          created_at: status.created_at || profile.created_at || new Date().toISOString(),
          updated_at: status.updated_at || profile.created_at || new Date().toISOString(),
          referred: {
            full_name: profile.full_name,
            email: profile.email
          }
        };
      });

      // Mapper les données pour le niveau 2
      const level2Referrals = indirectReferrals.map(profile => {
        const status = referralStatuses.find(rs => rs.referred_id === profile.id) || {};
        return {
          id: status.id || profile.id,
          referrer_id: profile.referred_by,
          referred_id: profile.id,
          level: 2,
          is_active: status.is_active || false,
          total_investment: status.total_investment || 0,
          total_commission: status.total_commission || 0,
          last_investment_date: status.last_investment_date || null,
          created_at: status.created_at || profile.created_at || new Date().toISOString(),
          updated_at: status.updated_at || profile.created_at || new Date().toISOString(),
          referred: {
            full_name: profile.full_name,
            email: profile.email
          }
        };
      });

      const referralsByLevel = {
        1: level1Referrals,
        2: level2Referrals
      };

      const totalCommission = [...level1Referrals, ...level2Referrals]
        .reduce((sum, ref) => sum + ref.total_commission, 0);

      const activeReferralsCount = [...level1Referrals, ...level2Referrals]
        .filter(ref => ref.is_active).length;

      set({
        referrals: [...level1Referrals, ...level2Referrals],
        referralsByLevel,
        totalCommission,
        activeReferrals: activeReferralsCount,
        loading: false
      });

      console.log('État final du store:', {
        niveau1: {
          total: level1Referrals.length,
          actifs: level1Referrals.filter(r => r.is_active).length
        },
        niveau2: {
          total: level2Referrals.length,
          actifs: level2Referrals.filter(r => r.is_active).length
        }
      });

    } catch (error) {
      console.error('Erreur lors du chargement des filleuls:', error);
      set({ referrals: [], totalCommission: 0, activeReferrals: 0, loading: false });
    }
  },

  getReferralLink: () => {
    const profile = useAuthStore.getState().profile;
    if (!profile?.referral_code) return '';
    return `${window.location.origin}/register?ref=${profile.referral_code}`;
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
  }
}));