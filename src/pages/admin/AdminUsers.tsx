import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { Search, User, Mail, Phone, Shield, UserPlus, Users as UsersIcon, Activity, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('tous');
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      calculateUserStats();
    }
  }, [users]);

  const calculateUserStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const stats = {
      total: users.length,
      active: users.filter(user => user.last_sign_in && new Date(user.last_sign_in) > new Date(now.setDate(now.getDate() - 30))).length,
      admins: users.filter(user => user.is_admin).length,
      newThisMonth: users.filter(user => {
        const createdDate = new Date(user.created_at);
        return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
      }).length
    };

    setUserStats(stats);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentStatus }
          : user
      ));

      toast.success(`Statut administrateur ${!currentStatus ? 'accordé' : 'retiré'}`);
    } catch (error: any) {
      console.error('Erreur lors de la modification du statut:', error);
      toast.error(error.message);
    }
  };

  const getUserGrowthData = () => {
    const monthlyData: { [key: string]: number } = {};
    users.forEach(user => {
      const date = new Date(user.created_at);
      const monthYear = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      utilisateurs: count
    }));
  };

  const filteredUsers = users.filter(user => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = user.full_name.toLowerCase().includes(searchStr) ||
      user.email.toLowerCase().includes(searchStr) ||
      user.phone_number.toLowerCase().includes(searchStr);

    if (selectedFilter === 'tous') return matchesSearch;
    if (selectedFilter === 'admins') return matchesSearch && user.is_admin;
    if (selectedFilter === 'actifs') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return matchesSearch && user.last_sign_in && new Date(user.last_sign_in) > lastMonth;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Administrateurs</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.admins}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nouveaux ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.newThisMonth}</p>
            </div>
            <UserPlus className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Graphique de croissance */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Croissance des Utilisateurs</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getUserGrowthData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="utilisateurs" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedFilter('tous')}
            className={`px-4 py-2 rounded-lg ${
              selectedFilter === 'tous' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedFilter('admins')}
            className={`px-4 py-2 rounded-lg ${
              selectedFilter === 'admins' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setSelectedFilter('actifs')}
            className={`px-4 py-2 rounded-lg ${
              selectedFilter === 'actifs' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Actifs
          </button>
        </div>
      </div>

      {/* Table des utilisateurs */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-medium text-lg">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{user.phone_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {user.last_sign_in 
                            ? new Date(user.last_sign_in).toLocaleDateString('fr-FR')
                            : 'Jamais'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                          ${user.is_admin
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                      >
                        <Shield className={`h-4 w-4 mr-1 ${user.is_admin ? 'text-blue-600' : 'text-gray-400'}`} />
                        {user.is_admin ? 'Admin' : 'Utilisateur'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
