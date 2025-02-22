import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SessionTrackerProps {
  onSessionUpdate?: (data: any) => void;
}

const SessionTracker = ({ onSessionUpdate }: SessionTrackerProps) => {
  useEffect(() => {
    const updateSessionInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const userAgent = window.navigator.userAgent;
          const ipAddress = await getIpAddress();
          
          await supabase.from('profiles').update({
            last_active: new Date().toISOString(),
            browser_info: {
              browser: getBrowserInfo(userAgent),
              os: getOSInfo(userAgent)
            },
            ip_address: ipAddress
          }).eq('id', user.id);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la session:', error);
      }
    };

    // Mise à jour initiale et configuration de l'intervalle
    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 30000);

    // Configuration du canal de suivi en temps réel
    const channel = supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          if (onSessionUpdate) {
            onSessionUpdate(payload);
          }
        }
      )
      .subscribe();

    // Nettoyage
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [onSessionUpdate]);

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
