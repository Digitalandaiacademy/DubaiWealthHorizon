import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { Search, AlertCircle, Check, X, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface PaymentVerification {
  id: string;
  transaction_id: string;
  verified_transaction_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  verified_at: string | null;
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
  investment_id: string;
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

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/dashboard');
      return;
    }
    loadPayments();
  }, [profile, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_verifications')
        .select(`
          *,
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
      setPayments(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des paiements:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (payment: PaymentVerification) => {
    try {
      if (!transactionId) {
        toast.error("Veuillez entrer l'ID de la transaction");
        return;
      }

      // Mise à jour du paiement avec l'ID de transaction vérifié
      const { error: paymentError } = await supabase
        .from('payment_verifications')
        .update({
          verified_transaction_id: transactionId,
          verified_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (paymentError) throw paymentError;

      toast.success("ID de transaction enregistré. En attente de la confirmation de l'utilisateur.");
      setSelectedPayment(null);
      setTransactionId('');
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

      // Créer une notification pour l'utilisateur
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

  return (
    <div className="space-y-6 p-6">
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
