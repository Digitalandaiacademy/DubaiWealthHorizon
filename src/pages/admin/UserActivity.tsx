import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Activity, Monitor, MapPin, Clock } from 'lucide-react';

interface UserSession {
  id: string;
  user_id: string;
  device_info: {
    browser: string;
    os: string;
    device: string;
  };
  location: {
    country: string;
    city: string;
  };
  is_online: boolean;
  last_active: string;
  session_start: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

const UserActivity = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    const channel = supabase
      .channel('user-activity')
      .on('presence', { event: 'sync' }, () => {
        loadSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Activité des Utilisateurs</h1>
      
      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                {session.profiles.avatar_url && (
                  <img
                    src={session.profiles.avatar_url}
                    alt={session.profiles.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <CardTitle className="text-lg">
                    {session.profiles.full_name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{session.profiles.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${session.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                {session.is_online ? 'En ligne' : 'Hors ligne'}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>
                    {session.device_info.browser} sur {session.device_info.os}
                    {session.device_info.device && ` (${session.device_info.device})`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {session.location.city}, {session.location.country}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Durée: {calculateDuration(session.session_start)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserActivity;
