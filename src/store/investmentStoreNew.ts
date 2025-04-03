import create from 'zustand';
import { supabase } from '../utils/supabaseClient';

interface Investment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  investment_plans: {
    name: string;
    daily_roi: number;
  };
}

interface Investor {
  id: string;
  name: string;
  activeInvestments: Investment[];
  totalEarnings: number;
  availableBalance: number;
}

interface InvestmentStore {
  investments: Investment[];
  investors: Investor[];
  loadInvestments: () => Promise<void>;
  loadInvestors: () => Promise<void>;
}

export const useInvestmentStore = create<InvestmentStore>((set) => ({
  investments: [],
  investors: [],
  loadInvestments: async () => {
    const { data, error } = await supabase
      .from('user_investments')
      .select(`*,
        profiles (
          full_name,
          email
        ),
        investment_plans (
          name,
          daily_roi
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des investissements:', error);
      return;
    }
    set({ investments: data || [] });
  },
  loadInvestors: async () => {
    const { data, error } = await supabase
      .from('investors') // Assuming you have a table for investors
      .select(`
        id,
        name,
        activeInvestments: user_investments (
          id,
          amount,
          status,
          created_at,
          investment_plans (
            name,
            daily_roi
          )
        )
      `);

    if (error) {
      console.error('Erreur lors de la récupération des investisseurs:', error);
      return;
    }
    set({ investors: data || [] });
  },
}));
