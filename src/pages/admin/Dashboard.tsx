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
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuthStore } from '../../store/authStore';
import { AlertCircle, DollarSign, Users, Activity, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalInvestments: number;
  activeInvestments: number;
  totalUsers: number;
  pendingPayments: number;
  dailyROI: number;
  monthlyData: any[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestments: 0,
    activeInvestments: 0,
    totalUsers: 0,
    pendingPayments: 0,
    dailyROI: 0,
    monthlyData: []
  });

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/dashboard');
      return;
    }
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les statistiques de base
      const [
        { count: totalUsers },
        { count: totalInvestments },
        { count: activeInvestments },
        { count: pendingPayments }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_investments').select('*', { count: 'exact', head: true }),
        supabase.from('user_investments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('payment_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      // Calculer le ROI quotidien total
      const { data: investments } = await supabase
        .from('user_investments')
        .select('amount, investment_plans(daily_roi)')
        .eq('status', 'active');

      const dailyROI = investments?.reduce((acc, inv) => {
        return acc + (inv.amount * (inv.investment_plans?.daily_roi || 0) / 100);
      }, 0) || 0;

      // Charger les données mensuelles
      const { data: monthlyData } = await supabase
        .from('user_investments')
        .select('created_at, amount')
        .order('created_at', { ascending: true });

      const monthlyStats = processMonthlyData(monthlyData || []);

      setStats({
        totalUsers: totalUsers || 0,
        totalInvestments: totalInvestments || 0,
        activeInvestments: activeInvestments || 0,
        pendingPayments: pendingPayments || 0,
        dailyROI,
        monthlyData: monthlyStats
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (data: any[]) => {
    const monthlyMap = data.reduce((acc: any, { created_at, amount }) => {
      const month = new Date(created_at).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + amount;
      return acc;
    }, {});

    return Object.entries(monthlyMap).map(([month, amount]) => ({
      month,
      amount
    }));
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
      <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investissements Totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvestments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeInvestments} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
            <Activity className="h-4 w-4 text-muted-foreground" />
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              À vérifier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Investissements Mensuels</CardTitle>
            <CardDescription>
              Total des investissements par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#3b82f6" name="Montant (FCFA)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendance des Investissements</CardTitle>
            <CardDescription>
              Évolution des investissements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    name="Montant (FCFA)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/payments')}>
          <CardHeader>
            <CardTitle>Vérification des Paiements</CardTitle>
            <CardDescription>
              Gérer les paiements en attente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>{stats.pendingPayments} paiements à vérifier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/users')}>
          <CardHeader>
            <CardTitle>Gestion des Utilisateurs</CardTitle>
            <CardDescription>
              Voir et gérer les utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>{stats.totalUsers} utilisateurs inscrits</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/investments')}>
          <CardHeader>
            <CardTitle>Suivi des Investissements</CardTitle>
            <CardDescription>
              Gérer les investissements actifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span>{stats.activeInvestments} investissements actifs</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
