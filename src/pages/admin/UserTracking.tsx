import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '../../components/ui/card';
import { Monitor, Globe, Clock, Circle, Users, BarChart, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserSession {
  id: string;
  email: string;
  full_name: string;
  browser_info: {
    browser: string;
    os: string;
  };
  ip_address: string;
  last_active: string;
  created_at: string;
  current_page?: string;
}

interface PageViewStats {
  path: string;
  count: number;
  percentage: number;
}

interface BrowserStats {
  name: string;
  count: number;
  percentage: number;
}

const UserTracking = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [pageViews, setPageViews] = useState<PageViewStats[]>([]);
  const [browserStats, setBrowserStats] = useState<BrowserStats[]>([]);

  const fetchActiveSessions = async () => {
    try {
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
      updateStats(activeUsers || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateStats = (users: UserSession[]) => {
    // Statistiques des navigateurs
    const browserStats = users.reduce((acc: { [key: string]: number }, user) => {
      if (user.browser_info?.browser) {
        const browser = user.browser_info.browser;
        acc[browser] = (acc[browser] || 0) + 1;
      }
      return acc;
    }, {});

    const totalBrowsers = Object.values(browserStats).reduce((a, b) => a + b, 0);

    setBrowserStats(
      Object.entries(browserStats)
        .map(([name, count]) => ({
          name,
          count,
          percentage: (count / totalBrowsers) * 100
        }))
        .sort((a, b) => b.count - a.count)
    );
  };

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 30000);

    const channel = supabase
      .channel('user-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchActiveSessions();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Suivi des Utilisateurs en Temps Réel
      </h1>
      
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs en ligne
          </h3>
          <p className="text-3xl font-bold mt-2">{sessions.length}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Navigateurs différents
          </h3>
          <p className="text-3xl font-bold mt-2">{browserStats.length}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Adresses IP uniques
          </h3>
          <p className="text-3xl font-bold mt-2">
            {new Set(sessions.map(s => s.ip_address)).size}
          </p>
        </Card>
      </div>

      {/* Distribution des navigateurs */}
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Navigateurs utilisés
        </h2>
        <div className="space-y-2">
          {browserStats.map((browser, index) => (
            <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <div className="flex-1">
                <span className="text-sm font-medium">{browser.name}</span>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${browser.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                {browser.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Liste des utilisateurs actifs */}
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserTracking;
