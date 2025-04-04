import React, { useEffect, useState } from 'react';
import { supabase, getConnectionStatus } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Activity, Monitor, MapPin, Clock, Users, Globe, Laptop, WifiOff } from 'lucide-react';
import SessionTracker from '../../components/SessionTracker';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  browser_info: {
    browser: string;
    os: string;
    device: string;
  };
  ip_address: string;
  last_active: string;
  created_at: string;
  current_page?: string;
}

const UserActivity = () => {
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalUsers: 0,
    averageSessionDuration: 0
  });

  const loadActiveUsers = async () => {
    const { isOnline, isConnected } = getConnectionStatus();
    
    if (!isOnline) {
      setError('You are currently offline. Please check your internet connection.');
      setLoading(false);
      return;
    }

    if (!isConnected) {
      setError('Unable to connect to the database. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get users active in the last 5 minutes
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .gt('last_active', fiveMinutesAgo.toISOString());

      if (error) throw error;

      // Get total user count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setActiveUsers(data || []);
      calculateStats(data || [], count || 0);
    } catch (error) {
      console.error('Error loading active users:', error);
      setError('Failed to load active users. Please try again later.');
      // Keep the previous data if available
      if (activeUsers.length === 0) {
        setActiveUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (users: UserProfile[], totalCount: number) => {
    const totalActive = users.length;
    
    // Calculate average session duration
    const totalDuration = users.reduce((acc, user) => {
      if (!user.last_active || !user.created_at) return acc;
      
      const lastActive = new Date(user.last_active).getTime();
      const created = new Date(user.created_at).getTime();
      const duration = lastActive - created;
      
      return acc + duration;
    }, 0);
    
    const averageSessionDuration = totalActive > 0 ? totalDuration / totalActive : 0;

    setStats({
      totalActive,
      totalUsers: totalCount,
      averageSessionDuration
    });
  };

  const handleSessionUpdate = (data: any[]) => {
    loadActiveUsers();
  };

  const calculateDuration = (createdAt: string, lastActive: string) => {
    const start = new Date(createdAt).getTime();
    const end = new Date(lastActive).getTime();
    const diff = end - start;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadActiveUsers();
    // Refresh data every 30 seconds
    const interval = setInterval(loadActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <SessionTracker onSessionUpdate={handleSessionUpdate} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Activité des Utilisateurs</h1>
        <button
          onClick={loadActiveUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Rafraîchir
        </button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-2 text-red-700">
            <WifiOff className="h-5 w-5" />
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Sessions Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalActive} / {stats.totalUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Utilisateurs Connectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {activeUsers.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Durée Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {Math.floor(stats.averageSessionDuration / 60000)}m
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs actifs */}
      <div className="grid gap-4">
        {activeUsers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Aucun utilisateur actif pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          activeUsers.map((user) => (
            <Card key={user.id} className="w-full transition-colors duration-200 border-green-200 bg-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {user.full_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {user.full_name || 'Utilisateur'}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-700">En ligne</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  {user.browser_info && (
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {user.browser_info.browser} sur {user.browser_info.os}
                        {user.browser_info.device && ` (${user.browser_info.device})`}
                      </span>
                    </div>
                  )}
                  {user.ip_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        IP: {user.ip_address}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Durée: {calculateDuration(user.created_at, user.last_active)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Dernière activité: {formatLastActive(user.last_active)}
                    </span>
                  </div>
                </div>
                {user.current_page && (
                  <div className="mt-2 p-2 bg-green-100 rounded-md">
                    <p className="text-sm text-green-800">
                      Page actuelle: {user.current_page}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UserActivity;