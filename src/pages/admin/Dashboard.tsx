import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuthStore } from '../../store/authStore';
import { 
  AlertCircle, 
  DollarSign, 
  Users, 
  Activity, 
  TrendingUp,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Award
} from 'lucide-react';

interface DashboardStats {
  totalInvestments: number;
  activeInvestments: number;
  totalUsers: number;
  pendingPayments: number;
  dailyROI: number;
  monthlyData: any[];
  userGrowth: any[];
  recentActivity: Activity[];
  referralStats: {
    totalReferrals: number;
    activeReferrals: number;
    totalCommissions: number;
    topReferrers: any[];
  };
}

interface InvestmentTotals {
  pending: number;
  verified: number;
  rejected: number;
  growth: number;
}

interface Activity {
  id: string;
  type: 'investment' | 'payment' | 'withdrawal' | 'user' | 'referral';
  description: string;
  timestamp: string;
  amount?: number;
  status?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestments: 0,
    activeInvestments: 0,
    totalUsers: 0,
    pendingPayments: 0,
    dailyROI: 0,
    monthlyData: [],
    userGrowth: [],
    recentActivity: [],
    referralStats: {
      totalReferrals: 0,
      activeReferrals: 0,
      totalCommissions: 0,
      topReferrers: []
    }
  });
  const [investmentTotals, setInvestmentTotals] = useState<InvestmentTotals>({
    pending: 0,
    verified: 0,
    rejected: 0,
    growth: 0
  });

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/dashboard');
      return;
    }
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000); // Rafraîchir toutes les minutes
    return () => clearInterval(interval);
  }, [profile, timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const timeRangeDate = new Date();

      switch (timeRange) {
        case 'day':
          timeRangeDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          timeRangeDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          timeRangeDate.setMonth(now.getMonth() - 1);
          break;
      }

      // Charger les totaux d'investissement
      const statuses = ['pending', 'active', 'rejected'];
      const totalResults: { [key: string]: number } = {};
      const previousTotals: { [key: string]: number } = {};

      for (const status of statuses) {
        // Totaux actuels
        const { data: currentData } = await supabase
          .from('user_investments')
          .select('amount')
          .eq('status', status);

        // Totaux précédents
        const { data: previousData } = await supabase
          .from('user_investments')
          .select('amount')
          .eq('status', status)
          .lt('created_at', timeRangeDate.toISOString());

        totalResults[status] = currentData?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;
        previousTotals[status] = previousData?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;
      }

      // Calculer la croissance
      const currentTotal = totalResults['active'] + totalResults['pending'];
      const previousTotal = previousTotals['active'] + previousTotals['pending'];
      const growth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

      setInvestmentTotals({
        pending: totalResults['pending'],
        verified: totalResults['active'],
        rejected: totalResults['rejected'],
        growth
      });

      // Charger les statistiques utilisateurs
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeInvestments } = await supabase
        .from('user_investments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: pendingPayments } = await supabase
        .from('payment_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculer le ROI quotidien
      const { data: activeInvestmentsData } = await supabase
        .from('user_investments')
        .select('amount, investment_plans(daily_roi)')
        .eq('status', 'active');

      const dailyROI = activeInvestmentsData?.reduce((sum, inv) => {
        const amount = parseFloat(inv.amount);
        const roi = inv.investment_plans?.daily_roi || 0;
        return sum + (amount * roi / 100);
      }, 0) || 0;

      // Charger les données mensuelles
      const monthlyData = await loadMonthlyData();
      const userGrowth = await loadUserGrowth();
      const recentActivity = await loadRecentActivity();
      
      // Charger les statistiques de parrainage
      const referralStats = await loadReferralStats();

      setStats({
        totalUsers: totalUsers || 0,
        totalInvestments: Math.round(totalResults['pending'] + totalResults['active']),
        activeInvestments: activeInvestments || 0,
        pendingPayments: pendingPayments || 0,
        dailyROI,
        monthlyData,
        userGrowth,
        recentActivity,
        referralStats
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyData = async () => {
    const { data } = await supabase
      .from('user_investments')
      .select('amount, created_at')
      .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

    const monthlyTotals = data?.reduce((acc: any, inv) => {
      const month = new Date(inv.created_at).toLocaleDateString('fr-FR', { month: 'long' });
      acc[month] = (acc[month] || 0) + parseFloat(inv.amount);
      return acc;
    }, {});

    return Object.entries(monthlyTotals || {}).map(([month, amount]) => ({
      month,
      amount
    }));
  };

  const loadUserGrowth = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at');

    const userGrowth = data?.reduce((acc: any, user) => {
      const month = new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(userGrowth || {}).map(([month, count]) => ({
      month,
      users: count
    }));
  };

  const loadReferralStats = async () => {
    try {
      // Get all referral status entries
      const { data: referralData, error } = await supabase
        .from('referral_status')
        .select(`
          *,
          referrer:referrer_id(
            id,
            full_name,
            email
          )
        `);
        
      if (error) throw error;
      
      // Calculate total referrals
      const totalReferrals = referralData?.length || 0;
      
      // Calculate active referrals
      const activeReferrals = referralData?.filter(ref => ref.is_active).length || 0;
      
      // Calculate total commissions
      const totalCommissions = referralData?.reduce((sum, ref) => sum + (ref.total_commission || 0), 0) || 0;
      
      // Get top referrers
      const referrerMap = new Map();
      
      referralData?.forEach(ref => {
        if (!ref.referrer) return;
        
        const referrerId = ref.referrer.id;
        if (!referrerMap.has(referrerId)) {
          referrerMap.set(referrerId, {
            id: referrerId,
            name: ref.referrer.full_name || ref.referrer.email,
            referralCount: 0,
            commission: 0
          });
        }
        
        const referrer = referrerMap.get(referrerId);
        referrer.referralCount += 1;
        referrer.commission += (ref.total_commission || 0);
      });
      
      const topReferrers = Array.from(referrerMap.values())
        .sort((a, b) => b.referralCount - a.referralCount)
        .slice(0, 5);
      
      return {
        totalReferrals,
        activeReferrals,
        totalCommissions,
        topReferrers
      };
    } catch (error) {
      console.error('Error loading referral stats:', error);
      return {
        totalReferrals: 0,
        activeReferrals: 0,
        totalCommissions: 0,
        topReferrers: []
      };
    }
  };

  const loadRecentActivity = async () => {
    const activities: Activity[] = [];

    // Derniers investissements
    const { data: investments } = await supabase
      .from('user_investments')
      .select(`
        *,
        profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    investments?.forEach(inv => {
      activities.push({
        id: inv.id,
        type: 'investment',
        description: `Nouvel investissement par ${inv.profiles.full_name}`,
        timestamp: inv.created_at,
        amount: parseFloat(inv.amount),
        status: inv.status
      });
    });

    // Derniers paiements
    const { data: payments } = await supabase
      .from('payment_verifications')
      .select(`
        *,
        profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    payments?.forEach(payment => {
      activities.push({
        id: payment.id,
        type: 'payment',
        description: `Paiement ${payment.status} de ${payment.profiles.full_name}`,
        timestamp: payment.created_at,
        amount: payment.amount,
        status: payment.status
      });
    });
    
    // Dernières activités de parrainage
    const { data: referrals } = await supabase
      .from('referral_status')
      .select(`
        *,
        referrer:referrer_id(full_name),
        referred:referred_id(full_name)
      `)
      .order('updated_at', { ascending: false })
      .limit(5);
      
    referrals?.forEach(referral => {
      if (referral.total_commission > 0) {
        activities.push({
          id: referral.id,
          type: 'referral',
          description: `Commission de parrainage pour ${referral.referrer?.full_name || 'Utilisateur'}`,
          timestamp: referral.updated_at,
          amount: referral.total_commission,
          status: 'completed'
        });
      }
    });

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </div>
          <button
            onClick={loadDashboardData}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filtres de période */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange('day')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === 'day' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          24h
        </button>
        <button
          onClick={() => setTimeRange('week')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === 'week' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          7 jours
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === 'month' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          30 jours
        </button>
      </div>

      {/* Résumé des totaux d'investissements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total En Attente</span>
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">
              {investmentTotals.pending.toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total Vérifiés</span>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-700">
                {investmentTotals.verified.toLocaleString('fr-FR')} FCFA
              </p>
              <div className="flex items-center text-sm">
                {investmentTotals.growth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={investmentTotals.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(investmentTotals.growth).toFixed(1)}% vs période précédente
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total Rejetés</span>
              <DollarSign className="h-5 w-5 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">
              {investmentTotals.rejected.toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investissements Actifs</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInvestments}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.totalInvestments} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Inscrits sur la plateforme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Quotidien</CardTitle>
            <Percent className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyROI.toLocaleString('fr-FR')} FCFA</div>
            <p className="text-xs text-muted-foreground">
              À distribuer aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements en Attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              À vérifier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques de parrainage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de Parrainage</CardTitle>
            <CardDescription>
              Vue d'ensemble du programme de parrainage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Filleuls</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.referralStats.totalReferrals}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Filleuls Actifs</p>
                    <p className="text-2xl font-bold text-green-700">{stats.referralStats.activeReferrals}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commissions Totales</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {stats.referralStats.totalCommissions.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taux de Conversion</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {stats.referralStats.totalReferrals > 0 
                        ? ((stats.referralStats.activeReferrals / stats.referralStats.totalReferrals) * 100).toFixed(1) 
                        : '0'}%
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Top 5 Parrains</h3>
            <div className="space-y-3">
              {stats.referralStats.topReferrers.length > 0 ? (
                stats.referralStats.topReferrers.map((referrer, index) => (
                  <div key={referrer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{referrer.name}</p>
                        <p className="text-xs text-gray-500">{referrer.referralCount} filleuls</p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">
                      {referrer.commission.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Aucun parrain actif</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution des Commissions</CardTitle>
            <CardDescription>
              Répartition des commissions par niveau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Niveau 1 (5%)', value: stats.referralStats.totalCommissions * 0.7 },
                      { name: 'Niveau 2 (2%)', value: stats.referralStats.totalCommissions * 0.3 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[0, 1].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} FCFA`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Commission Moyenne</p>
                <p className="text-xl font-bold text-blue-700">
                  {stats.referralStats.totalReferrals > 0 
                    ? (stats.referralStats.totalCommissions / stats.referralStats.totalReferrals).toLocaleString('fr-FR')
                    : '0'} FCFA
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Taux d'Activité</p>
                <p className="text-xl font-bold text-green-700">
                  {stats.referralStats.totalReferrals > 0 
                    ? ((stats.referralStats.activeReferrals / stats.referralStats.totalReferrals) * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Investissements</CardTitle>
            <CardDescription>
              Total des investissements par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyData}>
                  <defs>
                    <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    fillOpacity={1}
                    fill="url(#colorInvestment)"
                    name="Montant (FCFA)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Croissance des Utilisateurs</CardTitle>
            <CardDescription>
              Nouveaux utilisateurs par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.userGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8b5cf6" 
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Utilisateurs" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité Récente */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>
            Les 5 dernières activités sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {activity.type === 'investment' && <TrendingUp className="h-5 w-5 text-blue-500" />}
                  {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-green-500" />}
                  {activity.type === 'withdrawal' && <ArrowDownRight className="h-5 w-5 text-red-500" />}
                  {activity.type === 'referral' && <Award className="h-5 w-5 text-purple-500" />}
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <span className={`text-sm font-medium ${
                    activity.status === 'pending' ? 'text-yellow-600' :
                    activity.status === 'verified' || activity.status === 'active' || activity.status === 'completed' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {activity.amount.toLocaleString('fr-FR')} FCFA
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-yellow-50 to-yellow-100"
          onClick={() => navigate('/admin/payments')}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vérification des Paiements</span>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </CardTitle>
            <CardDescription>
              Gérer les paiements en attente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-700 font-medium">
                {stats.pendingPayments} paiements à vérifier
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100"
          onClick={() => navigate('/admin/users')}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gestion des Utilisateurs</span>
              <Users className="h-5 w-5 text-purple-500" />
            </CardTitle>
            <CardDescription>
              Voir et gérer les utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-purple-700 font-medium">
                {stats.totalUsers} utilisateurs inscrits
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100"
          onClick={() => navigate('/admin/investments')}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Suivi des Investissements</span>
              <Activity className="h-5 w-5 text-blue-500" />
            </CardTitle>
            <CardDescription>
              Gérer les investissements actifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-blue-700 font-medium">
                {stats.activeInvestments} investissements actifs
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;