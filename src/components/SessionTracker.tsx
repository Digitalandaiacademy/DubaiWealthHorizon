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

          // Get location info with error handling
          const locationInfo = await getLocationInfo();

          // Check for existing session for this user and get the most recent one
          const { data: existingSessions, error: sessionError } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('last_active', { ascending: false });

          if (sessionError) {
            console.error('Error fetching sessions:', sessionError);
            return;
          }

          if (existingSessions && existingSessions.length > 0) {
            // Update existing session with error handling
            const { error: updateError } = await supabase
              .from('user_sessions')
              .update({
                device_info: deviceInfo,
                location: locationInfo,
                is_online: true,
                last_active: new Date().toISOString()
              })
              .eq('id', existingSessions[0].id);

            if (updateError) {
              console.error('Error updating session:', updateError);
            }
          } else {
            // Create new session with error handling
            const { error: insertError } = await supabase
              .from('user_sessions')
              .insert({
                user_id: user.id,
                device_info: deviceInfo,
                location: locationInfo,
                is_online: true,
                session_start: new Date().toISOString(),
                last_active: new Date().toISOString()
              });

            if (insertError) {
              console.error('Error creating session:', insertError);
            }
          }

          // Load and send updated sessions data
          if (onSessionUpdate) {
            const { data: updatedSessions, error: loadError } = await supabase
              .from('user_sessions')
              .select('*')
              .order('last_active', { ascending: false });

            if (loadError) {
              console.error('Error loading updated sessions:', loadError);
            } else if (updatedSessions) {
              onSessionUpdate(updatedSessions);
            }
          }
        }
      } catch (error) {
        console.error('Error in session tracking:', error);
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
            try {
              const { data, error } = await supabase
                .from('user_sessions')
                .select('*')
                .order('last_active', { ascending: false });

              if (error) {
                console.error('Error loading sessions after change:', error);
              } else if (data) {
                onSessionUpdate(data);
              }
            } catch (error) {
              console.error('Error in realtime update:', error);
            }
          }
        }
      )
      .subscribe();

    // Mark user as offline when page closes
    const handleBeforeUnload = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: sessions, error: sessionError } = await supabase
            .from('user_sessions')
            .select('id')
            .eq('user_id', user.id)
            .order('last_active', { ascending: false })
            .limit(1);
            
          if (sessionError) {
            console.error('Error fetching session for offline status:', sessionError);
            return;
          }

          if (sessions && sessions.length > 0) {
            const { error: updateError } = await supabase
              .from('user_sessions')
              .update({ is_online: false })
              .eq('id', sessions[0].id);

            if (updateError) {
              console.error('Error updating offline status:', updateError);
            }
          }
        }
      } catch (error) {
        console.error('Error in beforeunload handler:', error);
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
    if (!response.ok) {
      throw new Error('Location service unavailable');
    }
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