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

          // Get location info
          const locationInfo = await getLocationInfo();

          // Check for existing session for this user and get the most recent one
          const { data: existingSessions } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('last_active', { ascending: false });

          if (existingSessions && existingSessions.length > 0) {
            // Update existing session
            await supabase
              .from('user_sessions')
              .update({
                device_info: deviceInfo,
                location: locationInfo,
                is_online: true,
                last_active: new Date().toISOString()
              })
              .eq('id', existingSessions[0].id);
          } else {
            // Create new session
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

          // Load and send updated sessions data
          if (onSessionUpdate) {
            const { data: updatedSessions } = await supabase
              .from('user_sessions')
              .select('*')
              .order('last_active', { ascending: false });

            if (updatedSessions) {
              onSessionUpdate(updatedSessions);
            }
          }
        }
      } catch (error) {
        console.error('Error updating session:', error);
      }
    };

    // Initial update and interval setup
    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 30000);

    // Set up realtime tracking channel
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
          // Reload all sessions on change
          if (onSessionUpdate) {
            const { data } = await supabase
              .from('user_sessions')
              .select('*')
              .order('last_active', { ascending: false });

            if (data) {
              onSessionUpdate(data);
            }
          }
        }
      )
      .subscribe();

    // Mark user as offline when page closes
    const handleBeforeUnload = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sessions } = await supabase
          .from('user_sessions')
          .select('id')
          .eq('user_id', user.id)
          .order('last_active', { ascending: false })
          .limit(1);
          
        if (sessions && sessions.length > 0) {
          await supabase
            .from('user_sessions')
            .update({ is_online: false })
            .eq('id', sessions[0].id);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onSessionUpdate]);

  return null;
};

// Utilities
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
  return 'Other';
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
  return 'Other';
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
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown'
    };
  } catch (error) {
    console.error('Error retrieving location:', error);
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
};

export default SessionTracker;