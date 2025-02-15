import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Check, X, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentVerification {
  id: string;
  transaction_id: string;
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
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { profile } = useAuthStore();

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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (payment: PaymentVerification, approved: boolean) => {
    try {
      const { error: verificationError } = await supabase
        .from('payment_verifications')
        .update({
          status: approved ? 'verified' : 'rejected',
          verified_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (verificationError) throw verificationError;

      // Update user's payment status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          payment_status: approved ? 'verified' : 'rejected'
        })
        .eq('id', payment.user_id);

      if (profileError) throw profileError;

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          title: approved ? 'Paiement approuvé' : 'Paiement rejeté',
          message: approved 
            ? `Votre paiement de ${payment.amount.toLocaleString('fr-FR')} FCFA a été approuvé.`
            : `Votre paiement de ${payment.amount.toLocaleString('fr-FR')} FCFA a été rejeté.`,
          type: approved ? 'success' : 'error'
        });

      if (notificationError) throw notificationError;

      toast.success(approved ? 'Paiement approuvé' : 'Paiement rejeté');
      loadPayments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (profile?.is_admin) {
      loadPayments();
    }
  }, [profile]);

  const filteredPayments = payments.filter(p => 
    p.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Vérification des Paiements</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucun paiement en attente
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
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
                      <div className="text-sm font-medium text-gray-900">
                        {payment.amount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_method === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => processPayment(payment, true)}
                            className="text-green-600 hover:text-green-900"
                            title="Approuver"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => processPayment(payment, false)}
                            className="text-red-600 hover:text-red-900"
                            title="Rejeter"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
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

export default AdminPayments;