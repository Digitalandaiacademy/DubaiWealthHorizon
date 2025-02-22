import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SessionStats {
  totalUsers: number;
  activeUsers: number;
  browserStats: {
    [key: string]: number;
  };
  pageViews: {
    [key: string]: number;
  };
}

interface SessionStore {
  stats: SessionStats;
  updateStats: () => Promise<void>;
  trackPageView: (path: string) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    browserStats: {},
    pageViews: {},
  },

  updateStats: async () => {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      // Récupérer les utilisateurs actifs
      const { data: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*')
        .gt('last_active', fiveMinutesAgo.toISOString());

      if (activeError) throw activeError;

      // Récupérer le nombre total d'utilisateurs
      const { count: totalUsers, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Calculer les statistiques des navigateurs
      const browserStats = (activeUsers || []).reduce((acc: { [key: string]: number }, user) => {
        if (user.browser_info?.browser) {
          const browser = user.browser_info.browser;
          acc[browser] = (acc[browser] || 0) + 1;
        }
        return acc;
      }, {});

      set({
        stats: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers?.length || 0,
          browserStats,
          pageViews: get().stats.pageViews,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
  },

  trackPageView: async (path: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Mettre à jour les statistiques de pages vues
        set((state) => ({
          stats: {
            ...state.stats,
            pageViews: {
              ...state.stats.pageViews,
              [path]: (state.stats.pageViews[path] || 0) + 1,
            },
          },
        }));

        // Mettre à jour les informations de l'utilisateur
        await supabase
          .from('profiles')
          .update({
            last_active: new Date().toISOString(),
            current_page: path,
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Erreur lors du suivi de la page:', error);
    }
  },
}));
