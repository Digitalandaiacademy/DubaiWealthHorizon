import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import { useAuthStore } from './authStore';

interface Investment {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  user_id: string;
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
  status: string;
  total_investment: number;
  total_commission: number;
  created_at: string;
  referred: {
    full_name: string;
    email: string;
  };
  referred_investments: Array<{
    id: string;
    status: string;
    amount: number;
  }>;
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

      // Récupérer tous les filleuls directs (niveau 1) avec leurs investissements
      // Récupérer les filleuls avec leurs investissements
      // Récupérer tous les filleuls
      // Récupérer tous les filleuls
      // Récupérer d'abord les filleuls
      const { data: level1Data, error: level1Error } = await supabase
        .from('profiles')
        .select('id, full_name, email, referred_by, created_at')
        .eq('referred_by', user.id);

      if (level1Error) throw level1Error;

      // Récupérer les investissements actifs pour chaque filleul
      const filleulsWithInvestments = await Promise.all((level1Data || []).map(async (filleul) => {
        const { data: investments } = await supabase
          .from('user_investments')
          .select('*')
          .eq('user_id', filleul.id)
          .eq('status', 'active');

        return {
          ...filleul,
          user_investments: investments || []
        };
      }));

      console.log('Filleuls avec leurs investissements:', JSON.stringify(filleulsWithInvestments, null, 2));

      console.log('Données brutes des filleuls:', JSON.stringify(level1Data, null, 2));

      console.log('Données brutes des filleuls:', JSON.stringify(level1Data, null, 2));

      console.log('=== DONNÉES BRUTES DES FILLEULS ===');
      console.log('Filleuls niveau 1:', JSON.stringify(level1Data, null, 2));

      if (level1Error) throw level1Error;

      // Transformer les données des filleuls
      const level1Referrals = filleulsWithInvestments.map((ref: ReferralWithInvestments) => {
        console.log('Traitement du filleul:', ref);

        // Vérifier les investissements actifs
        const investments = ref.user_investments || [];
        const activeInvs = investments.filter(inv => inv.status === 'active');
        const totalInv = activeInvs.reduce((sum, inv) => sum + (inv.amount || 0), 0);

        console.log(`Filleul ${ref.full_name}:`, {
          total_investissements: investments.length,
          investissements_actifs: activeInvs.length,
          montant_total: totalInv
        });

        // Créer l'objet referral
        const result: Referral = {
          id: ref.id,
          referrer_id: ref.referred_by,
          referred_id: ref.id,
          referred: {
            full_name: ref.full_name || 'Nom non disponible',
            email: ref.email || 'Email non disponible'
          },
          status: activeInvs.length > 0 ? 'active' : 'inactive',
          level: 1,
          total_investment: totalInv,
          total_commission: calculateCommission(totalInv, 1),
          created_at: ref.created_at || new Date().toISOString(),
          referred_investments: activeInvs
        };

        console.log('Résultat final pour le filleul:', {
          nom: result.referred.full_name,
          statut: result.status,
          investissements_actifs: result.referred_investments.length,
          montant_total: result.total_investment
        });

        return result;
      });

      console.log('Résultats finaux:', level1Referrals.map(r => ({
        nom: r.referred.full_name,
        statut: r.status,
        investissements: r.referred_investments.length
      })));

      // Récupérer les filleuls de niveau 2
      const level2Data = await Promise.all(
        level1Data?.map(async (ref) => {
          const { data } = await supabase
            .from('profiles')
            .select(`
              id,
              full_name,
              email,
              referred_by,
              created_at,
              user_investments (
                id,
                status,
                amount
              )
            `)
            .eq('referred_by', ref.id);
          return data || [];
        }) || []
      );

      // Transformer les données de niveau 2
      const level2Referrals = level2Data.flat().map((ref: any) => {
        const investments = Array.isArray(ref.user_investments) ? ref.user_investments : [];
        const activeInvestments = investments
          .filter((inv: Investment) => inv && inv.status === 'active')
          .map((inv: Investment) => ({
            ...inv,
            amount: typeof inv.amount === 'number' ? inv.amount : parseFloat(String(inv.amount)) || 0
          }));

        const totalInvestment = activeInvestments.reduce((sum: number, inv: Investment) => sum + inv.amount, 0);
        const commission = calculateCommission(totalInvestment, 2);

        console.log(`Filleul niveau 2 ${ref.full_name}:`, {
          investissements_actifs: activeInvestments.length,
          total_investi: totalInvestment,
          commission: commission
        });

        return { 
          ...ref, 
          activeInvestments, 
          totalInvestment,
          commission
        };
      });

      // Récupérer les filleuls de niveau 3
      const level3Data = await Promise.all(
        level2Referrals.map(async (ref) => {
          const { data } = await supabase
            .from('profiles')
            .select(`
              id,
              full_name,
              email,
              referred_by,
              created_at,
              user_investments (
                id,
                status,
                amount
              )
            `)
            .eq('referred_by', ref.id);
          return data || [];
        })
      );

      // Transformer les données de niveau 3
      const level3Referrals = level3Data.flat().map((ref: any) => {
        const investments = Array.isArray(ref.user_investments) ? ref.user_investments : [];
        const activeInvestments = investments
          .filter((inv: Investment) => inv && inv.status === 'active')
          .map((inv: Investment) => ({
            ...inv,
            amount: typeof inv.amount === 'number' ? inv.amount : parseFloat(String(inv.amount)) || 0
          }));

        const totalInvestment = activeInvestments.reduce((sum: number, inv: Investment) => sum + inv.amount, 0);
        const commission = calculateCommission(totalInvestment, 3);

        console.log(`Filleul niveau 3 ${ref.full_name}:`, {
          investissements_actifs: activeInvestments.length,
          total_investi: totalInvestment,
          commission: commission
        });

        return { 
          ...ref, 
          activeInvestments, 
          totalInvestment,
          commission
        };
      });

      // Calculer les totaux des commissions
      const level1Commission = level1Referrals.reduce((sum, ref) => sum + ref.total_commission, 0);
      const level2Commission = level2Referrals.reduce((sum, ref) => sum + (ref.commission || 0), 0);
      const level3Commission = level3Referrals.reduce((sum, ref) => sum + (ref.commission || 0), 0);
      // Calculer le nombre total de filleuls actifs
      const activeReferralsCount = 
        level1Referrals.filter(ref => ref.status === 'active').length +
        level2Referrals.filter(ref => ref.activeInvestments?.length > 0).length +
        level3Referrals.filter(ref => ref.activeInvestments?.length > 0).length;

      const totalCommission = level1Commission + level2Commission + level3Commission;

      console.log('=== RÉSUMÉ DES CALCULS ===');
      console.log('Niveau 1:', {
        total_filleuls: level1Referrals.length,
        filleuls_actifs: level1Referrals.filter(ref => ref.status === 'active').length,
        commission: level1Commission,
        details: level1Referrals.map(ref => ({
          nom: ref.referred.full_name,
          investissements: ref.referred_investments.map(inv => ({
            montant: inv.amount,
            statut: inv.status,
            date: inv.created_at
          })),
          total_investi: ref.total_investment,
          commission: ref.total_commission,
          statut: ref.status
        }))
      });

      console.log('Niveau 2:', {
        total_filleuls: level2Referrals.length,
        filleuls_actifs: level2Referrals.filter(ref => ref.activeInvestments?.length > 0).length,
        commission: level2Commission,
        details: level2Referrals.map(ref => ({
          nom: ref.full_name,
          investissements: ref.activeInvestments?.map(inv => ({
            montant: inv.amount,
            statut: inv.status,
            date: inv.created_at
          })),
          total_investi: ref.totalInvestment,
          commission: ref.commission
        }))
      });

      console.log('Niveau 3:', {
        total_filleuls: level3Referrals.length,
        filleuls_actifs: level3Referrals.filter(ref => ref.activeInvestments?.length > 0).length,
        commission: level3Commission,
        details: level3Referrals.map(ref => ({
          nom: ref.full_name,
          investissements: ref.activeInvestments?.map(inv => ({
            montant: inv.amount,
            statut: inv.status,
            date: inv.created_at
          })),
          total_investi: ref.totalInvestment,
          commission: ref.commission
        }))
      });

      console.log('=== TOTAUX ===', {
        filleuls_actifs: activeReferralsCount,
        commission_totale: totalCommission,
        commission_par_niveau: {
          niveau_1: level1Commission,
          niveau_2: level2Commission,
          niveau_3: level3Commission
        }
      });

      set({
        referrals: level1Referrals,
        totalCommission,
        activeReferrals: activeReferralsCount,
        loading: false
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
