import { useEffect } from 'react';
import { supabase, getConnectionStatus } from '../lib/supabase';

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

          // Get cached location first
          let locationInfo = await getCachedLocationInfo();
          const ipAddress = await getCachedIpAddress();

          // Update user profile with session data
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              browser_info: deviceInfo,
              ip_address: ipAddress,
              last_active: new Date().toISOString(),
              current_page: window.location.pathname
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating user profile:', updateError);
          }

          // Load and send updated sessions data if callback provided
          if (onSessionUpdate) {
            const { data: activeUsers, error: loadError } = await supabase
              .from('profiles')
              .select('*')
              .gt('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString());

            if (loadError) {
              console.error('Error loading active users:', loadError);
            } else if (activeUsers) {
              const transformedSessions = activeUsers.map(profile => ({
                id: profile.id,
                user_id: profile.id,
                device_info: profile.browser_info || {
                  browser: 'Unknown',
                  os: 'Unknown',
                  device: 'Unknown'
                },
                location: locationInfo,
                is_online: true,
                last_active: profile.last_active,
                session_start: profile.created_at,
                profiles: {
                  full_name: profile.full_name,
                  email: profile.email,
                  avatar_url: null
                }
              }));
              
              onSessionUpdate(transformedSessions);
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

    // Mark user as offline when page closes
    const handleBeforeUnload = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ 
              last_active: new Date().toISOString(),
              current_page: null
            })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error in beforeunload handler:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
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

const getCachedLocationInfo = async () => {
  const defaultLocation = {
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown'
  };

  try {
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      return JSON.parse(cachedLocation);
    }
  } catch (error) {
    console.warn('Failed to get cached location:', error);
  }

  return defaultLocation;
};

const getCachedIpAddress = async (): Promise<string> => {
  try {
    const cachedIp = localStorage.getItem('userIp');
    if (cachedIp) {
      return cachedIp;
    }
  } catch (error) {
    console.warn('Failed to get cached IP:', error);
  }
  return 'Unknown';
};

export default SessionTracker;