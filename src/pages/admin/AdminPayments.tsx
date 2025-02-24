import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  Search, AlertCircle, Check, X, Eye, 
  Calendar, Clock, BarChart 
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
  ResponsiveContainer 
} from 'recharts';

interface PaymentVerification {
  id: string;
  transaction_id: string;
  verified_transaction_id: string | null;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  verified_at: string | null;
  rejected_at: string | null;
  investment_id: string | null;
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

const AdminPayments = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentVerification | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [totalAmount, setTotalAmount] = useState<{
    pending: number;
    verified: number;
    rejected: number;
  }>({
    pending: 0,
    verified: 0,
    rejected: 0
  });

  const [investorEvolution, setInvestorEvolution] = useState<{ period: string; count: number }[]>([]);
  const [activeInvestmentsEvolution, setActiveInvestmentsEvolution] = useState<{ period: string; count: number }[]>([]);
  const [periodType, setPeriodType] = useState('month');
  const [roiTotals, setRoiTotals] = useState({
    totalRoi: 0,
    roiByStatus: {
      pending: 0,
      verified: 0,
      rejected: 0
    }
  });

  const formatDate = (date: Date) => {
    switch(periodType) {
      case 'day':
        return date.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short' 
        });
      case 'week':
        return `Semaine ${getWeekNumber(date)}`;
      case 'month':
      default:
        return date.toLocaleDateString('fr-FR', { 
          month: 'long', 
          year: 'numeric' 
        });
    }
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const loadInvestmentEvolution = async () => {
    try {
      // Requête pour l'évolution des investisseurs
      const { data: investorData, error: investorError } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at');

      console.log('Données Investisseurs Brutes:', {
        data: investorData,
        error: investorError,
        count: investorData?.length
      });

      // Requête pour l'évolution des investissements actifs
      const { data: investmentData, error: investmentError } = await supabase
        .from('user_investments')
        .select('created_at, status')
        .eq('status', 'active')
        .order('created_at');

      console.log('Données Investissements Brutes:', {
        data: investmentData,
        error: investmentError,
        count: investmentData?.length
      });

      if (investorError || investmentError) {
        throw new Error(investorError?.message || investmentError?.message);
      }

      // Grouper les données par période
      const groupData = (data: { created_at: string }[]) => {
        console.log('Données à grouper:', data);

        const grouped: Record<string, number> = {};
        data.forEach(item => {
          const date = new Date(item.created_at);
          let key;
          
          switch(periodType) {
            case 'day':
              key = formatDate(date);
              break;
            case 'week':
              key = formatDate(date);
              break;
            case 'month':
            default:
              key = formatDate(date);
          }

          grouped[key] = (grouped[key] || 0) + 1;
        });

        const groupedArray = Object.entries(grouped).map(([period, count]) => ({
          period,
          count
        })).sort((a, b) => 
          new Date(a.period).getTime() - new Date(b.period).getTime()
        );

        console.log('Données Groupées:', groupedArray);
        return groupedArray;
      };

      // Vérifier si les données existent avant de les traiter
      const processedInvestorData = investorData?.length ? groupData(investorData) : [];
      const processedInvestmentData = investmentData?.length ? groupData(investmentData) : [];

      console.log('Données Investisseurs Traitées:', processedInvestorData);
      console.log('Données Investissements Traitées:', processedInvestmentData);

      setInvestorEvolution(processedInvestorData);
      setActiveInvestmentsEvolution(processedInvestmentData);

    } catch (error) {
      console.error('Erreur lors du chargement de l\'évolution:', error);
      toast.error('Impossible de charger les graphiques');
    }
  };

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/dashboard');
      return;
    }
    loadPayments();
    loadInvestmentEvolution();
  }, [profile, statusFilter, periodType]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      type PaymentVerificationResponse = {
        id: string;
        transaction_id: string;
        verified_transaction_id: string | null;
        user_id: string;
        amount: number;
        payment_method: string;
        status: string;
        created_at: string;
        verified_at: string | null;
        rejected_at: string | null;
        investment_id: string | null;
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
      };

      const { data: paymentData, error } = await supabase
        .from('payment_verifications')
        .select(`
          id,
          transaction_id,
          verified_transaction_id,
          user_id,
          amount,
          payment_method,
          status,
          created_at,
          verified_at,
          rejected_at,
          investment_id,
          profiles (
            full_name,
            email,
            phone_number
          ),
          investment_plans!payment_verifications_investment_plan_fkey (
            name,
            price,
            daily_roi
          )
        `)
        .eq('status', statusFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((paymentData as PaymentVerificationResponse[]) || []);

      const totals = await Promise.all([
        supabase
          .from('payment_verifications')
          .select('amount', { count: 'exact' })
          .eq('status', 'pending'),
        supabase
          .from('payment_verifications')
          .select('amount', { count: 'exact' })
          .eq('status', 'verified'),
        supabase
          .from('payment_verifications')
          .select('amount', { count: 'exact' })
          .eq('status', 'rejected')
      ]);

      const calculateTotal = (result: any) => 
        result.data?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;

      setTotalAmount({
        pending: calculateTotal(totals[0]),
        verified: calculateTotal(totals[1]),
        rejected: calculateTotal(totals[2])
      });

      calculateRoiTotals();

    } catch (error: any) {
      console.error('Erreur lors du chargement des paiements:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (payment: PaymentVerification) => {
    try {
      // Enregistrer l'ID de transaction vérifié
      const { error: paymentError } = await supabase
        .from('payment_verifications')
        .update({
          verified_transaction_id: transactionId
        })
        .eq('id', payment.id);

      if (paymentError) throw paymentError;

      // Créer une notification pour l'utilisateur
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          title: 'ID de Transaction Disponible',
          message: `L'ID de transaction pour votre paiement de ${payment.amount.toLocaleString('fr-FR')} FCFA est maintenant disponible.\n\n` +
            `📋 ID de transaction : ${transactionId}\n` +
            `💰 Montant : ${payment.amount.toLocaleString('fr-FR')} FCFA\n` +
            `📈 Plan : ${payment.investment_plans.name}\n\n` +
            `Pour valider votre investissement, veuillez vous rendre dans la section "Vérification de paiement" et entrer cet ID de transaction.`,
          type: 'info'
        });

      if (notificationError) throw notificationError;

      toast.success("Paiement vérifié avec succès. Une notification a été envoyée à l'utilisateur.");
      setSelectedPayment(null);
      loadPayments();
    } catch (error: any) {
      console.error('Erreur lors de la vérification:', error);
      toast.error(`Erreur lors de la vérification: ${error.message}`);
    }
  };

  const rejectPayment = async (payment: PaymentVerification) => {
    try {
      const { error: updateError } = await supabase
        .from('payment_verifications')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          title: 'Paiement Rejeté',
          message: `Votre paiement de ${payment.amount.toLocaleString('fr-FR')} FCFA a été rejeté. Veuillez contacter le support pour plus d'informations.`,
          type: 'error'
        });

      if (notificationError) throw notificationError;

      toast.success('Paiement rejeté');
      loadPayments();
    } catch (error: any) {
      console.error('Erreur lors du rejet:', error);
      toast.error(error.message);
    }
  };

  const calculateRoiTotals = () => {
    if (!payments) return {
      totalRoi: 0,
      roiByStatus: {
        pending: 0,
        verified: 0,
        rejected: 0
      }
    };

    const roiTotals = payments.reduce((acc, payment) => {
      // Calculer le ROI en pourcentage
      const initialAmount = payment.amount || 0;
      const roiAmount = payment.investment_plans.daily_roi * initialAmount;
      const roiPercentage = initialAmount > 0 
        ? ((roiAmount - initialAmount) / initialAmount) * 100 
        : 0;

      // Accumuler par statut
      switch (payment.status) {
        case 'pending':
          acc.roiByStatus.pending += roiAmount;
          break;
        case 'verified':
          acc.roiByStatus.verified += roiAmount;
          break;
        case 'rejected':
          acc.roiByStatus.rejected += roiAmount;
          break;
      }

      // Total ROI
      acc.totalRoi += roiAmount;

      return acc;
    }, {
      totalRoi: 0,
      roiByStatus: {
        pending: 0,
        verified: 0,
        rejected: 0
      }
    });

    console.log('Totaux ROI:', roiTotals);
    setRoiTotals(roiTotals);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Résumé des totaux */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {totalAmount.pending.toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Vérifiés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {totalAmount.verified.toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Rejetés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {totalAmount.rejected.toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {roiTotals.totalRoi.toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vérification des Paiements</h1>
        
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="pending">En attente</option>
            <option value="verified">Vérifiés</option>
            <option value="rejected">Rejetés</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun paiement {statusFilter === 'pending' ? 'en attente' : statusFilter === 'verified' ? 'vérifié' : 'rejeté'}</h3>
          </CardContent>
        </Card>
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
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments
                  .filter(payment => {
                    const searchStr = searchTerm.toLowerCase();
                    return (
                      payment.profiles.full_name.toLowerCase().includes(searchStr) ||
                      payment.profiles.email.toLowerCase().includes(searchStr) ||
                      payment.profiles.phone_number.toLowerCase().includes(searchStr)
                    );
                  })
                  .map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.profiles.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.profiles.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.profiles.phone_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.investment_plans.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ROI: {payment.investment_plans.daily_roi}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.amount.toLocaleString('fr-FR')} FCFA
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {payment.payment_method === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.transaction_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {payment.status === 'pending'
                            ? 'En attente'
                            : payment.status === 'verified'
                            ? 'Vérifié'
                            : 'Rejeté'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {payment.status === 'pending' && (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedPayment(payment)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => rejectPayment(payment)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nouveaux graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Graphique Évolution des Investisseurs */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Évolution des Investisseurs</CardTitle>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setPeriodType('day')}
                  className={`p-2 rounded ${periodType === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Jour
                </button>
                <button 
                  onClick={() => setPeriodType('week')}
                  className={`p-2 rounded ${periodType === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Semaine
                </button>
                <button 
                  onClick={() => setPeriodType('month')}
                  className={`p-2 rounded ${periodType === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Mois
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={investorEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  name="Nouveaux Investisseurs" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique Évolution des Investissements Actifs */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Investissements Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activeInvestmentsEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#82ca9d" 
                  name="Investissements Actifs" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Modal de vérification */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Vérification du paiement
                </h3>
                <div className="mt-2 px-7 py-3">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      <strong>Utilisateur:</strong> {selectedPayment.profiles.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Plan:</strong> {selectedPayment.investment_plans.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Montant:</strong> {selectedPayment.amount.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Méthode:</strong> {selectedPayment.payment_method === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}
                    </p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="ID de la transaction"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={() => handleVerifyPayment(selectedPayment)}
                    className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Enregistrer l'ID
                  </button>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
