import React, { useEffect, useState } from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast'; // Import toast

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  payment_method?: string;
  payment_details?: {
    fullName: string;
    phoneNumber?: string;
    email: string;
    cryptoAddress?: string;
    paymentMethod?: string;
    paymentCategory?: string;
  };
  user?: {
    full_name: string;
    email: string;
    created_at: string;
  };
}

const AdminWithdrawals = () => {
  const { transactions, loadTransactions, loadUserDetails } = useTransactionStore();
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      await loadTransactions();
      const withdrawalTransactions = await Promise.all(
        transactions
          .filter(t => t.type === 'withdrawal')
          .map(async (transaction) => {
            const userDetails = await loadUserDetails(transaction.user_id);
            return {
              ...transaction,
              user: userDetails
            };
          })
      );
      setWithdrawals(withdrawalTransactions);
    };

    fetchTransactions();
  }, []);

  const handleStatusChange = async (withdrawalId: string, status: 'completed' | 'rejected') => {
    try {
      setLoading(true);
      await useTransactionStore.getState().updateWithdrawalStatus(withdrawalId, status);
      toast.success(`Retrait ${status === 'completed' ? 'validé' : 'rejeté'} avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Une erreur est survenue lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des Retraits</h2>

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
                  Détails
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(withdrawal.created_at), 'PPP HH:mm', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {withdrawal.user?.full_name || withdrawal.payment_details?.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {withdrawal.amount.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {withdrawal.payment_method || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>
                      <p>Méthode: {withdrawal.payment_details?.paymentMethod}</p>
                      <p>Catégorie: {withdrawal.payment_details?.paymentCategory === 'electronic' 
                        ? 'Paiement électronique et mobile' 
                        : 'Paiement en cryptomonnaie'}</p>
                      <p>Email: {withdrawal.user?.email || withdrawal.payment_details?.email || 'N/A'}</p>
                      {withdrawal.payment_details?.phoneNumber && (
                        <p>Tél: {withdrawal.payment_details.phoneNumber}</p>
                      )}
                      {withdrawal.payment_details?.cryptoAddress && (
                        <p>Adresse: {withdrawal.payment_details.cryptoAddress}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {withdrawal.status === 'pending' && (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleStatusChange(withdrawal.id, 'completed')}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                        >
                          ✅ Valider le retrait
                        </button>
                        <button
                          onClick={() => handleStatusChange(withdrawal.id, 'rejected')}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                        >
                          ❌ Rejeter le retrait
                        </button>
                      </div>
                    )}
                    {withdrawal.status === 'completed' && (
                      <span className="text-green-600 font-semibold">Validé ✅</span>
                    )}
                    {withdrawal.status === 'rejected' && (
                      <span className="text-red-600 font-semibold">Rejeté ❌</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawals;
