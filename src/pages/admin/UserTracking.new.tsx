import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '../../components/ui/card';
import { Monitor, Globe, Clock, Circle, Users, BarChart, Activity } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';

const UserTracking = () => {
  const { stats, updateStats } = useSessionStore();

  useEffect(() => {
    // Mettre à jour les statistiques au chargement de la page
    updateStats();

    // Rafraîchir les statistiques toutes les 30 secondes
    const interval = setInterval(updateStats, 30000);

    return () => clearInterval(interval);
  }, [updateStats]);

  // Calculer les statistiques des pages vues
  const pageViewStats = Object.entries(stats.pageViews)
    .map(([path, count]) => ({
      path,
      count,
      percentage: (count / Object.values(stats.pageViews).reduce((a, b) => a + b, 0)) * 100
    }))
    .sort((a, b) => b.count - a.count);

  // Calculer les statistiques des navigateurs
  const browserStats = Object.entries(stats.browserStats)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / Object.values(stats.browserStats).reduce((a, b) => a + b, 0)) * 100
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Suivi des Utilisateurs en Temps Réel
      </h1>
      
      {/* Vue d'ensemble des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs en ligne
          </h3>
          <p className="text-3xl font-bold mt-2">{stats.activeUsers}</p>
          <p className="text-sm text-gray-500">sur {stats.totalUsers} utilisateurs</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Pages vues
          </h3>
          <p className="text-3xl font-bold mt-2">
            {Object.values(stats.pageViews).reduce((a, b) => a + b, 0)}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Navigateurs différents
          </h3>
          <p className="text-3xl font-bold mt-2">{Object.keys(stats.browserStats).length}</p>
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
            {pageViewStats.map((page, index) => (
              <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div className="flex-1">
                  <span className="text-sm font-medium">{page.path}</span>
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
            ))}
          </div>
        </Card>

        {/* Distribution des navigateurs */}
        <Card className="p-4">
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
      </div>
    </div>
  );
};

export default UserTracking;
