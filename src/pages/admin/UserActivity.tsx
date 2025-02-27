import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Activity, Monitor, MapPin, Clock, Users, Globe, Laptop } from 'lucide-react';
import SessionTracker from '../../components/SessionTracker';

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
    region: string;
  };
  is_online: boolean;
  last_active: string;
  session_start: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

const UserActivity = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalSessions: 0,
    averageSessionDuration: 0
  });

  const loadSessions = async () => {
    try {
      setLoading(true);
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

      const validSessions = (data || []).filter(session => 
        session.profiles && session.device_info && session.location
      );

      setSessions(validSessions);
      calculateStats(validSessions);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessions: UserSession[]) => {
    const totalActive = sessions.filter(s => s.is_online).length;
    const totalSessions = sessions.length;
    
    const totalDuration = sessions.reduce((acc, session) => {
      const duration = new Date().getTime() - new Date(session.session_start).getTime();
      return acc + duration;
    }, 0);
    
    const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

    setStats({
      totalActive,
      totalSessions,
      averageSessionDuration
    });
  };

  const handleSessionUpdate = (data: UserSession[]) => {
    const validSessions = data.filter(session => 
      session.profiles && session.device_info && session.location
    );
    setSessions(validSessions);
    calculateStats(validSessions);
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
    loadSessions();
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(loadSessions, 30000);
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
          onClick={loadSessions}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Rafraîchir
        </button>
      </div>

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
              {stats.totalActive} / {stats.totalSessions}
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
              {sessions.filter(s => s.is_online).length}
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

      {/* Liste des sessions */}
      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Aucune session active pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className={`w-full transition-colors duration-200 ${
              session.is_online ? 'border-green-200 bg-green-50' : ''
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  {session.profiles.avatar_url ? (
                    <img
                      src={session.profiles.avatar_url}
                      alt={session.profiles.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {session.profiles.full_name?.[0] || session.profiles.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {session.profiles.full_name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{session.profiles.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    session.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <span className={session.is_online ? 'text-green-700' : 'text-gray-500'}>
                    {session.is_online ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {session.device_info.browser} sur {session.device_info.os}
                      {session.device_info.device && ` (${session.device_info.device})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {session.location.city}, {session.location.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Durée: {calculateDuration(session.session_start)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Dernière activité: {formatLastActive(session.last_active)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UserActivity;
