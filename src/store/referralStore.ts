import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import { useAuthStore } from './authStore';

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  level: number;
  status: string;
  total_commission: number;
  created_at: string;
  referred: {
    full_name: string;
    email: string;
  };
}

interface ReferralState {
  referrals: Referral[];
  loading: boolean;
  totalCommission: number;
  activeReferrals: number;
  loadReferrals: () => Promise<void>;
  getReferralLink: () => string;
}

export const useReferralStore = create<ReferralState>((set) => ({
  referrals: [],
  loading: false,
  totalCommission: 0,
  activeReferrals: 0,

  loadReferrals: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:profiles!referred_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const referrals = data || [];
      const totalCommission = referrals.reduce((sum, r) => sum + (r.total_commission || 0), 0);
      const activeReferrals = referrals.filter(r => r.status === 'active').length;

      set({ referrals, totalCommission, activeReferrals });
    } finally {
      set({ loading: false });
    }
  },

  getReferralLink: () => {
    const profile = useAuthStore.getState().profile;
    if (!profile?.referral_code) return '';
    return `${window.location.origin}/register?ref=${profile.referral_code}`;
  }
}));