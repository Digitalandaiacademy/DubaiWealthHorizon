import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { Search, User, Mail, Phone, Shield, UserPlus, Users as UsersIcon, Activity, Calendar, Award, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in: string;
  referral_code: string;
  referral_stats?: {
    directReferrals: number;
    indirectReferrals: number;
    totalCommission: number;
    activeReferrals: number;
    directReferralsList: ReferralUser[];
    indirectReferralsList: ReferralUser[];
  };
}

interface ReferralUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  is_active: boolean;
  total_investment: number;
  total_commission: number;
}

interface ReferralStatus {
  id: string;
  referrer_id: string;
  referred_id: string;
  level: number;
  is_active: boolean;
  total_investment: number;
  total_commission: number;
  created_at: string;
  referred: {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
  };
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
    newThisMonth: 0,
    totalReferrals: 0,
    totalCommissions: 0
  });
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedReferralSection, setExpandedReferralSection] = useState<{[key: string]: boolean}>({});

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

    const totalReferrals = users.reduce((sum, user) => sum + (user.referral_stats?.directReferrals || 0) + (user.referral_stats?.indirectReferrals || 0), 0);
    const totalCommissions = users.reduce((sum, user) => sum + (user.referral_stats?.totalCommission || 0), 0);

    const stats = {
      total: users.length,
      active: users.filter(user => user.last_sign_in && new Date(user.last_sign_in) > new Date(now.setDate(now.getDate() - 30))).length,
      admins: users.filter(user => user.is_admin).length,
      newThisMonth: users.filter(user => {
        const createdDate = new Date(user.created_at);
        return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
      }).length,
      totalReferrals,
      totalCommissions
    };

    setUserStats(stats);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users with their profiles
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      
      // Get referral status data with referred user details
      const { data: referralData, error: referralError } = await supabase
        .from('referral_status')
        .select(`
          *,
          referred:referred_id (
            id,
            full_name,
            email,
            created_at
          )
        `);
        
      if (referralError) throw referralError;
      
      // Process users and add referral stats
      const processedUsers = userData.map(user => {
        // Find direct referrals (level 1)
        const directReferrals = referralData.filter(ref => 
          ref.referrer_id === user.id && ref.level === 1
        );
        
        // Find indirect referrals (level 2)
        const indirectReferrals = referralData.filter(ref => 
          ref.referrer_id === user.id && ref.level === 2
        );
        
        // Calculate total commission
        const totalCommission = [...directReferrals, ...indirectReferrals]
          .reduce((sum, ref) => sum + (ref.total_commission || 0), 0);
          
        // Count active referrals
        const activeReferrals = [...directReferrals, ...indirectReferrals]
          .filter(ref => ref.is_active).length;
          
        // Create lists of direct and indirect referrals with user details
        const directReferralsList = directReferrals.map(ref => ({
          id: ref.referred_id,
          full_name: ref.referred?.full_name || 'Utilisateur inconnu',
          email: ref.referred?.email || 'Email inconnu',
          created_at: ref.referred?.created_at || ref.created_at,
          is_active: ref.is_active,
          total_investment: ref.total_investment || 0,
          total_commission: ref.total_commission || 0
        }));
        
        const indirectReferralsList = indirectReferrals.map(ref => ({
          id: ref.referred_id,
          full_name: ref.referred?.full_name || 'Utilisateur inconnu',
          email: ref.referred?.email || 'Email inconnu',
          created_at: ref.referred?.created_at || ref.created_at,
          is_active: ref.is_active,
          total_investment: ref.total_investment || 0,
          total_commission: ref.total_commission || 0
        }));
          
        return {
          ...user,
          referral_stats: {
            directReferrals: directReferrals.length,
            indirectReferrals: indirectReferrals.length,
            totalCommission,
            activeReferrals,
            directReferralsList,
            indirectReferralsList
          }
        };
      });

      setUsers(processedUsers || []);
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

  const toggleUserExpansion = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const toggleReferralSection = (userId: string, section: string) => {
    const key = `${userId}-${section}`;
    setExpandedReferralSection(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isReferralSectionExpanded = (userId: string, section: string) => {
    const key = `${userId}-${section}`;
    return expandedReferralSection[key] || false;
  };

  const filteredUsers = users.filter(user => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = user.full_name?.toLowerCase().includes(searchStr) ||
      user.email.toLowerCase().includes(searchStr) ||
      user.phone_number?.toLowerCase().includes(searchStr);

    if (selectedFilter === 'tous') return matchesSearch;
    if (selectedFilter === 'admins') return matchesSearch && user.is_admin;
    if (selectedFilter === 'actifs') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return matchesSearch && user.last_sign_in && new Date(user.last_sign_in) > lastMonth;
    }
    if (selectedFilter === 'parrains') {
      return matchesSearch && (user.referral_stats?.directReferrals || 0) > 0;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Filleuls</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalReferrals}</p>
            </div>
            <Award className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Commissions</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalCommissions.toLocaleString('fr-FR')}</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500" />
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
          <button
            onClick={() => setSelectedFilter('parrains')}
            className={`px-4 py-2 rounded-lg ${
              selectedFilter === 'parrains' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Parrains
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
                    Parrainage
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
                  <React.Fragment key={user.id}>
                    <tr 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedUser === user.id ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleUserExpansion(user.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white font-medium text-lg">
                                {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'Utilisateur sans nom'}
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
                            <span className="text-sm text-gray-500">{user.phone_number || 'Non renseigné'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm text-gray-900">
                              {user.referral_stats?.directReferrals || 0} directs / {user.referral_stats?.indirectReferrals || 0} indirects
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-gray-900">
                              {(user.referral_stats?.totalCommission || 0).toLocaleString('fr-FR')} FCFA
                            </span>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAdminStatus(user.id, user.is_admin);
                          }}
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
                    
                    {/* Expanded user details */}
                    {expandedUser === user.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-blue-50">
                          <div className="space-y-6">
                            {/* Informations de parrainage */}
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du Parrainage</h3>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-500">Code de parrainage</p>
                                  <p className="text-base font-medium">{user.referral_code || 'Non défini'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Filleuls directs (Niveau 1)</p>
                                    <p className="text-base font-medium">{user.referral_stats?.directReferrals || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Filleuls indirects (Niveau 2)</p>
                                    <p className="text-base font-medium">{user.referral_stats?.indirectReferrals || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Filleuls actifs</p>
                                    <p className="text-base font-medium">{user.referral_stats?.activeReferrals || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Commission totale</p>
                                    <p className="text-base font-medium text-green-600">
                                      {(user.referral_stats?.totalCommission || 0).toLocaleString('fr-FR')} FCFA
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Liste des filleuls directs */}
                              {(user.referral_stats?.directReferrals || 0) > 0 && (
                                <div className="mt-6">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer bg-blue-50 p-3 rounded-lg"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleReferralSection(user.id, 'direct');
                                    }}
                                  >
                                    <h4 className="font-medium text-blue-800">Liste des filleuls directs (Niveau 1)</h4>
                                    {isReferralSectionExpanded(user.id, 'direct') ? (
                                      <ChevronUp className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-blue-600" />
                                    )}
                                  </div>
                                  
                                  {isReferralSectionExpanded(user.id, 'direct') && (
                                    <div className="mt-3 overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investissement</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {user.referral_stats?.directReferralsList.map((referral) => (
                                            <tr key={referral.id} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{referral.full_name}</td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{referral.email}</td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                  referral.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {referral.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {referral.total_investment.toLocaleString('fr-FR')} FCFA
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                                                {referral.total_commission.toLocaleString('fr-FR')} FCFA
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Liste des filleuls indirects */}
                              {(user.referral_stats?.indirectReferrals || 0) > 0 && (
                                <div className="mt-6">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer bg-purple-50 p-3 rounded-lg"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleReferralSection(user.id, 'indirect');
                                    }}
                                  >
                                    <h4 className="font-medium text-purple-800">Liste des filleuls indirects (Niveau 2)</h4>
                                    {isReferralSectionExpanded(user.id, 'indirect') ? (
                                      <ChevronUp className="h-5 w-5 text-purple-600" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-purple-600" />
                                    )}
                                  </div>
                                  
                                  {isReferralSectionExpanded(user.id, 'indirect') && (
                                    <div className="mt-3 overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investissement</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {user.referral_stats?.indirectReferralsList.map((referral) => (
                                            <tr key={referral.id} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{referral.full_name}</td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{referral.email}</td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                  referral.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {referral.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {referral.total_investment.toLocaleString('fr-FR')} FCFA
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                                                {referral.total_commission.toLocaleString('fr-FR')} FCFA
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Informations supplémentaires */}
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Supplémentaires</h3>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-500">ID Utilisateur</p>
                                  <p className="text-xs font-mono bg-gray-100 p-2 rounded">{user.id}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Statut du compte</p>
                                  <div className="flex items-center mt-1">
                                    <span className={`w-3 h-3 rounded-full ${user.last_sign_in && new Date(user.last_sign_in) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></span>
                                    <span className="text-sm">
                                      {user.last_sign_in && new Date(user.last_sign_in) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'Actif' : 'Inactif'}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Actions</p>
                                  <div className="flex space-x-2 mt-1">
                                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                      Envoyer un message
                                    </button>
                                    <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                                      Suspendre
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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