import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalInvestments: number;
  activeInvestments: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingPayments: number;
  pendingWithdrawals: number;
}

interface RecentActivity {
  id: string;
  type: 'investment' | 'withdrawal' | 'registration' | 'payment';
  profiles: {
    full_name: string;
    email: string;
  };
  amount?: number;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalInvestments: 0,
    activeInvestments: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingPayments: 0,
    pendingWithdrawals: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthStore();

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les statistiques
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: totalInvestments },
        { count: activeInvestments },
        { data: transactions },
        { count: pendingPayments },
        { count: pendingWithdrawals }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('profiles').select('*', { count: 'exact' }).eq('payment_status', 'verified'),
        supabase.from('user_investments').select('*', { count: 'exact' }),
        supabase.from('user_investments').select('*', { count: 'exact' }).eq('status', 'active'),
        supabase.from('transactions').select('*'),
        supabase.from('profiles').select('*', { count: 'exact' }).eq('payment_status', 'pending'),
        supabase.from('transactions').select('*', { count: 'exact' })
          .eq('type', 'withdrawal')
          .eq('status', 'pending')
      ]);

      const totalDeposits = transactions?.data
        ?.filter(t => t.type === 'investment' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const totalWithdrawals = transactions?.data
        ?.filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalInvestments: totalInvestments || 0,
        activeInvestments: activeInvestments || 0,
        totalDeposits,
        totalWithdrawals,
        pendingPayments: pendingPayments || 0,
        pendingWithdrawals: pendingWithdrawals || 0
      });

      // Charger l'activité récente
      const { data: activity } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          status,
          created_at,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity(activity || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.is_admin) {
      loadDashboardData();
    }
  }, [profile]);

  if (!profile?.is_admin) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Accès refusé</h3>
          <p className="mt-1 text-gray-500">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({stats.activeUsers} actifs)
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Investissements</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalInvestments}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({stats.activeInvestments} actifs)
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Dépôts</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalDeposits.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Retraits</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalWithdrawals.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Paiements en Attente ({stats.pendingPayments})
          </h2>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {stats.pendingPayments} paiements nécessitent une vérification
            </p>
            <Link
              to="/dashboard/admin/payments"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Gérer les paiements
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Retraits en Attente ({stats.pendingWithdrawals})
          </h2>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {stats.pendingWithdrawals} retraits à traiter
            </p>
            <Link
              to="/dashboard/admin/withdrawals"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Gérer les retraits
            </Link>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Activité Récente</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucune activité récente
                  </td>
                </tr>
              ) : (
                recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {activity.type === 'investment' ? (
                          <ArrowDownCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <ArrowUpCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className="text-sm text-gray-900">
                          {activity.type === 'investment' ? 'Investissement' : 'Retrait'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.profiles?.full_name || 'Utilisateur inconnu'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {activity.profiles?.email || 'Email non disponible'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activity.amount?.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${activity.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {activity.status === 'completed' ? 'Complété' :
                         activity.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;