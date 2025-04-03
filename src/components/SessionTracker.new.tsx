import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSessionStore } from '../store/sessionStore';

const SessionTracker = () => {
  const location = useLocation();
  const { trackPageView, updateStats } = useSessionStore();

  useEffect(() => {
    const updateSessionInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const userAgent = window.navigator.userAgent;
          await supabase.from('profiles').update({
            last_active: new Date().toISOString(),
            browser_info: {
              browser: getBrowserInfo(userAgent),
              os: getOSInfo(userAgent)
            },
            ip_address: await getIpAddress()
          }).eq('id', user.id);

          // Mettre à jour les statistiques
          await updateStats();
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la session:', error);
      }
    };

    // Mise à jour initiale
    updateSessionInfo();

    // Configurer l'intervalle de mise à jour
    const interval = setInterval(updateSessionInfo, 30000);

    // Suivre les changements de page
    trackPageView(location.pathname);

    return () => {
      clearInterval(interval);
    };
  }, [location.pathname, updateStats, trackPageView]);

  return null;
};

// Utilitaires
const getBrowserInfo = (userAgent: string): string => {
  if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Chrome')) {
    return 'Chrome';
  } else if (userAgent.includes('Safari')) {
    return 'Safari';
  } else if (userAgent.includes('Edge')) {
    return 'Edge';
  }
  return 'Autre';
};

const getOSInfo = (userAgent: string): string => {
  if (userAgent.includes('Windows')) {
    return 'Windows';
  } else if (userAgent.includes('Mac')) {
    return 'MacOS';
  } else if (userAgent.includes('Linux')) {
    return 'Linux';
  } else if (userAgent.includes('Android')) {
    return 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return 'iOS';
  }
  return 'Autre';
};

const getIpAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'adresse IP:', error);
    return 'Inconnue';
  }
};

export default SessionTracker;
