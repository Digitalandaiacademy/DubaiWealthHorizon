import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '../../components/ui/card';
import { Monitor, Globe, Clock, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserSession {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  browser_info: {
    browser: string;
    os: string;
  };
  ip_address: string;
  last_active: string;
  created_at: string;
}

const UserTracking = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);

  const fetchActiveSessions = async () => {
    try {
      // Récupérer les utilisateurs actifs (dernière activité < 5 minutes)
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const { data: activeUsers, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          last_active,
          browser_info,
          ip_address,
          created_at
        `)
        .gt('last_active', fiveMinutesAgo.toISOString());

      if (error) {
        console.error('Erreur lors de la récupération des sessions:', error);
        return;
      }

      setSessions(activeUsers || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 30000); // Rafraîchir toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Suivi des Utilisateurs en Temps Réel
      </h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Circle className="w-4 h-4 fill-green-500 text-green-500" />
          Utilisateurs en ligne: {sessions.length}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <span className="text-lg font-semibold">
                  {session.full_name?.[0] || session.email[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{session.full_name || session.email}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Circle className="w-2 h-2 mr-1.5 fill-green-500" />
                  En ligne
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {session.browser_info && (
                <div className="flex items-center">
                  <Monitor className="w-4 h-4 mr-2" />
                  <span>
                    {session.browser_info.browser} sur {session.browser_info.os}
                  </span>
                </div>
              )}

              {session.ip_address && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>IP: {session.ip_address}</span>
                </div>
              )}

              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  Dernière activité: {format(new Date(session.last_active), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                </span>
              </div>

              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  Compte créé le: {format(new Date(session.created_at), 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserTracking;
