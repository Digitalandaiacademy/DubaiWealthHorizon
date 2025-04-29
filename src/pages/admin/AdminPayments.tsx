import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  Search, AlertCircle, Check, X, Eye, 
  Calendar, Clock, BarChart, Download,
  Filter, SlidersHorizontal, RefreshCw,
  ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface PaymentVerification {
  id: string;
  transaction_id: string;
  verified_transaction_id: string | null;
  user_id: string;
  amount: number;
  payment_method: string;
  payment_country?: string;
  payer_phone?: string;
  payer_name?: string;
  payment_details?: {
    provider?: string;
    phone_number?: string;
    full_name?: string;
    ussd_code?: string;
  };
  status: string;
  created_at: string;
  verified_at: string | null;
  rejected_at: string | null;
  investment_id: string | null;
  note?: string;
  profiles: {
    full_name: string;
    email: string;
    phone_number: string;
  };
  investment_plans: {
    name: string;
    price: number;
    daily_roi: number;
  };
}

interface DailyStats {
  date: string;
  total: number;
  count: number;
}

interface Stats {
  totalAmount: {
    pending: number;
    verified: number;
    rejected: number;
  };
  dailyStats: DailyStats[];
  successRate: number;
  averageAmount: number;
}

const AdminPayments = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentVerification | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [stats, setStats] = useState<Stats>({
    totalAmount: {
      pending: 0,
      verified: 0,
      rejected: 0
    },
    dailyStats: [],
    successRate: 0,
    averageAmount: 0
  });

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/dashboard');
      return;
    }
    loadPayments();
    const interval = setInterval(loadPayments, 30000); // Rafraîchissement auto
    return () => clearInterval(interval);
  }, [profile, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      const { data: paymentData, error } = await supabase
        .from('payment_verifications')
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone_number
          ),
          investment_plans (
            name,
            price,
            daily_roi
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const payments = paymentData || [];
      setPayments(payments);

      // Calcul des statistiques
      const stats = calculateStats(payments);
      setStats(stats);

    } catch (error: any) {
      console.error('Erreur lors du chargement des paiements:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (payments: PaymentVerification[]): Stats => {
    const totalsByStatus = payments.reduce((acc, payment) => ({
      ...acc,
      [payment.status]: (acc[payment.status as keyof typeof acc] || 0) + payment.amount
    }), {
      pending: 0,
      verified: 0,
      rejected: 0
    });

    const successRate = payments.length > 0
      ? (payments.filter(p => p.status === 'verified').length / payments.length) * 100
      : 0;

    const averageAmount = payments.length > 0
      ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
      : 0;

    // Statistiques journalières
    const dailyStats = getDailyStats(payments);

    return {
      totalAmount: totalsByStatus,
      dailyStats,
      successRate,
      averageAmount
    };
  };

  const getDailyStats = (payments: PaymentVerification[]): DailyStats[] => {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayPayments = payments.filter(p => 
        p.created_at.startsWith(date)
      );

      return {
        date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        total: dayPayments.reduce((sum, p) => sum + p.amount, 0),
        count: dayPayments.length
      };
    });
  };

  const handleProvideTransactionId = async (payment: PaymentVerification) => {
    try {
      const { error: paymentError } = await supabase
        .from('payment_verifications')
        .update({
          verified_transaction_id: transactionId
        })
        .eq('id', payment.id);

      if (paymentError) throw paymentError;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          title: 'ID de Transaction Fourni',
          message: `L'administrateur a fourni l'ID de transaction pour votre paiement de ${payment.amount.toLocaleString('fr-FR')} FCFA.\n` +
                  `Veuillez entrer l'ID de transaction ${transactionId} pour finaliser votre investissement.\n` +
                  `Plan: ${payment.investment_plans.name}`,
          type: 'success'
        });

      if (notificationError) throw notificationError;

      toast.success('ID de transaction fourni avec succès');
      setSelectedPayment(null);
      loadPayments();
    } catch (error: any) {
      console.error('Erreur lors de la fourniture de l\'ID de transaction:', error);
      toast.error(error.message);
    }
  };

  const handleRejectPayment = async (payment: PaymentVerification) => {
    try {
      const { error: paymentError } = await supabase
        .from('payment_verifications')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (paymentError) throw paymentError;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          title: 'Paiement Rejeté',
          message: `Votre paiement de ${payment.amount.toLocaleString('fr-FR')} FCFA a été rejeté.`,
          type: 'error'
        });

      if (notificationError) throw notificationError;

      toast.success('Paiement rejeté');
      setSelectedPayment(null);
      loadPayments();
    } catch (error: any) {
      console.error('Erreur lors du rejet:', error);
      toast.error(error.message);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Utilisateur', 'Email', 'Montant', 'Méthode', 'Status', 'ID Transaction'].join(','),
      ...payments.map(p => [
        new Date(p.created_at).toLocaleDateString('fr-FR'),
        p.profiles.full_name,
        p.profiles.email,
        p.amount,
        p.payment_method,
        p.status,
        p.transaction_id
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredPayments = payments
    .filter(payment => {
      const searchStr = searchTerm.toLowerCase();
      return (
        payment.status === statusFilter &&
        (payment.profiles.full_name.toLowerCase().includes(searchStr) ||
         payment.profiles.email.toLowerCase().includes(searchStr) ||
         payment.transaction_id?.toLowerCase().includes(searchStr))
      );
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return sortOrder === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount;
      }
    });

  const pageCount = Math.ceil(filteredPayments.length / itemsPerPage);
  const currentPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPaymentDetails = (payment: PaymentVerification) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700">Détails du plan</h4>
            <p>Nom : {payment.investment_plans.name}</p>
            <p>Prix : {payment.amount.toLocaleString()} FCFA</p>
            <p>ROI journalier : {payment.investment_plans.daily_roi}%</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Détails de l'investisseur</h4>
            <p>Nom : {payment.profiles.full_name}</p>
            <p>Email : {payment.profiles.email}</p>
            <p>Téléphone : {payment.profiles.phone_number}</p>
          </div>
        </div>

        {payment.payment_country === 'cameroun' && (
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Informations de paiement au Cameroun</h4>
            <div className="grid grid-cols-2 gap-4 text-blue-700">
              <div>
                <p>Pays : Cameroun</p>
                <p>Méthode : {payment.payment_details?.provider}</p>
                <p>Code USSD : {payment.payment_details?.ussd_code}</p>
              </div>
              <div>
                <p>Nom du payeur : {payment.payer_name}</p>
                <p>Téléphone du payeur : {payment.payer_phone}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-medium text-gray-700">Statut du paiement</h4>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-sm ${
              payment.status === 'verified' ? 'bg-green-100 text-green-800' :
              payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {payment.status === 'verified' ? 'Vérifié' :
               payment.status === 'rejected' ? 'Rejeté' :
               'En attente'}
            </span>
            <span className="text-gray-500">
              {new Date(payment.created_at).toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-900">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-yellow-700">
                {stats.totalAmount.pending.toLocaleString('fr-FR')} FCFA
              </span>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-900">ID Fournis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-700">
                {stats.totalAmount.verified.toLocaleString('fr-FR')} FCFA
              </span>
              <Check className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-900">Taux de Succès</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-700">
                {stats.successRate.toFixed(1)}%
              </span>
              <BarChart className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-900">Montant Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-700">
                {stats.averageAmount.toLocaleString('fr-FR')} FCFA
              </span>
              <AlertCircle className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des tendances */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances des Paiements</CardTitle>
          <CardDescription>Évolution sur les 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyStats}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Barre d'outils */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">En attente</option>
            <option value="verified">ID Fournis</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {viewMode === 'list' ? <Calendar /> : <FileText />}
          </button>
          <button
            onClick={exportData}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Download />
          </button>
          <button
            onClick={loadPayments}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw />
          </button>
        </div>
      </div>

      {/* Liste des paiements */}
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPayments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className={`hover:bg-gray-50 ${
                      expandedPayment === payment.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.profiles.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.profiles.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.amount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {payment.transaction_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : payment.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {payment.status === 'pending' ? 'En attente' :
                         payment.status === 'verified' ? 'ID Fourni' : 'Rejeté'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleProvideTransactionId(payment)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRejectPayment(payment)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}à{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredPayments.length)}
                  </span>
                  {' '}sur{' '}
                  <span className="font-medium">{filteredPayments.length}</span>
                  {' '}résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                        ${currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Détails du paiement</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {renderPaymentDetails(selectedPayment)}

            {selectedPayment.status === 'pending' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Transaction
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Entrez l'ID de transaction"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => handleProvideTransactionId(selectedPayment)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Fournir l'ID
                  </button>
                  <button
                    onClick={() => handleRejectPayment(selectedPayment)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
