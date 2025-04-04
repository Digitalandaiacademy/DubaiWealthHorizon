import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '../../components/ui/card';
import { Monitor, Globe, Clock, Circle, Users, BarChart, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserProfile {
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
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const [pageViews, setPageViews] = useState<PageViewStats[]>([]);
  const [browserStats, setBrowserStats] = useState<BrowserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get users active in the last 5 minutes
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { data: activeUsers, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .gt('last_active', fiveMinutesAgo.toISOString());

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Get total user count
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(countError.message);
      }

      setActiveUsers(activeUsers || []);
      setTotalUsers(count || 0);
      updateStats(activeUsers || []);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (users: UserProfile[]) => {
    // Page view statistics
    const pageViewCounts: Record<string, number> = {};
    users.forEach(user => {
      if (user.current_page) {
        pageViewCounts[user.current_page] = (pageViewCounts[user.current_page] || 0) + 1;
      }
    });

    const totalPageViews = Object.values(pageViewCounts).reduce((sum, count) => sum + count, 0);
    
    const pageViewStats = Object.entries(pageViewCounts)
      .map(([path, count]) => ({
        path,
        count,
        percentage: totalPageViews > 0 ? (count / totalPageViews) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    setPageViews(pageViewStats);

    // Browser statistics
    const browserCounts: Record<string, number> = {};
    users.forEach(user => {
      if (user.browser_info?.browser) {
        const browser = user.browser_info.browser;
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      }
    });

    const totalBrowsers = Object.values(browserCounts).reduce((sum, count) => sum + count, 0);
    
    const browserStatistics = Object.entries(browserCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalBrowsers > 0 ? (count / totalBrowsers) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    setBrowserStats(browserStatistics);
  };

  useEffect(() => {
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">
              {error}
            </p>
          </div>
          <button 
            onClick={fetchActiveUsers}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading && activeUsers.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Suivi des Utilisateurs en Temps Réel
        </h1>
        <button
          onClick={fetchActiveUsers}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>
      
      {/* Vue d'ensemble des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs en ligne
          </h3>
          <p className="text-3xl font-bold mt-2">{activeUsers.length}</p>
          <p className="text-sm text-gray-500">sur {totalUsers} utilisateurs</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Pages vues
          </h3>
          <p className="text-3xl font-bold mt-2">
            {pageViews.reduce((sum, page) => sum + page.count, 0)}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Navigateurs différents
          </h3>
          <p className="text-3xl font-bold mt-2">{browserStats.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pages les plus visitées */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Pages les plus visitées
          </h2>
          <div className="space-y-2">
            {pageViews.length > 0 ? (
              pageViews.map((page, index) => (
                <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{page.path || 'Page inconnue'}</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${page.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                    {page.count} vues
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Aucune donnée disponible</p>
            )}
          </div>
        </Card>

        {/* Distribution des navigateurs */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Navigateurs utilisés
          </h2>
          <div className="space-y-2">
            {browserStats.length > 0 ? (
              browserStats.map((browser, index) => (
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
              ))
            ) : (
              <p className="text-center text-gray-500">Aucune donnée disponible</p>
            )}
          </div>
        </Card>
      </div>

      {/* Liste des utilisateurs actifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeUsers.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur actif</h3>
            <p className="mt-1 text-sm text-gray-500">
              Il n'y a pas d'utilisateurs actifs en ce moment.
            </p>
          </div>
        ) : (
          activeUsers.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold">
                    {user.full_name?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{user.full_name || user.email}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Circle className="w-2 h-2 mr-1.5 fill-green-500" />
                    En ligne
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {user.browser_info && (
                  <div className="flex items-center">
                    <Monitor className="w-4 h-4 mr-2" />
                    <span>
                      {user.browser_info.browser} sur {user.browser_info.os}
                    </span>
                  </div>
                )}

                {user.ip_address && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>IP: {user.ip_address}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>
                    Dernière activité: {format(new Date(user.last_active), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                  </span>
                </div>

                {user.current_page && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      Page actuelle: {user.current_page}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UserTracking;