import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SessionTrackerProps {
  onSessionUpdate?: (data: any[]) => void;
}

const SessionTracker = ({ onSessionUpdate }: SessionTrackerProps) => {
  useEffect(() => {
    const updateSessionInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const userAgent = window.navigator.userAgent;
          const deviceInfo = {
            browser: getBrowserInfo(userAgent),
            os: getOSInfo(userAgent),
            device: getDeviceInfo(userAgent)
          };

          // Obtenir la localisation
          const locationInfo = await getLocationInfo();

          // Vérifier si une session existe déjà pour cet utilisateur
          const { data: existingSessions } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (existingSessions) {
            // Mettre à jour la session existante
            await supabase
              .from('user_sessions')
              .update({
                device_info: deviceInfo,
                location: locationInfo,
                is_online: true,
                last_active: new Date().toISOString()
              })
              .eq('user_id', user.id);
          } else {
            // Créer une nouvelle session
            await supabase
              .from('user_sessions')
              .insert({
                user_id: user.id,
                device_info: deviceInfo,
                location: locationInfo,
                is_online: true,
                session_start: new Date().toISOString(),
                last_active: new Date().toISOString()
              });
          }

          // Charger et envoyer les données mises à jour
          const { data: updatedSessions } = await supabase
            .from('user_sessions')
            .select(`
              *,
              profiles (
                full_name,
                email,
                avatar_url
              )
            `)
            .order('last_active', { ascending: false });

          if (onSessionUpdate && updatedSessions) {
            onSessionUpdate(updatedSessions);
          }
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
      .channel('user_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions'
        },
        async () => {
          // Recharger toutes les sessions lors d'un changement
          const { data } = await supabase
            .from('user_sessions')
            .select(`
              *,
              profiles (
                full_name,
                email,
                avatar_url
              )
            `)
            .order('last_active', { ascending: false });

          if (onSessionUpdate && data) {
            onSessionUpdate(data);
          }
        }
      )
      .subscribe();

    // Marquer l'utilisateur comme hors ligne lors de la fermeture de la page
    const handleBeforeUnload = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_sessions')
          .update({ is_online: false })
          .eq('user_id', user.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Nettoyage
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      window.removeEventListener('beforeunload', handleBeforeUnload);
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

const getDeviceInfo = (userAgent: string): string => {
  if (userAgent.includes('Mobile')) {
    return 'Mobile';
  } else if (userAgent.includes('Tablet')) {
    return 'Tablet';
  }
  return 'Desktop';
};

const getLocationInfo = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name || 'Inconnu',
      city: data.city || 'Inconnue',
      region: data.region || 'Inconnue'
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la localisation:', error);
    return {
      country: 'Inconnu',
      city: 'Inconnue',
      region: 'Inconnue'
    };
  }
};

export default SessionTracker;
