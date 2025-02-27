import React, { useEffect, useState } from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Search, Download } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  type: 'investment' | 'return' | 'withdrawal' | 'referral' | 'commission_withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
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
  } | null;
}

interface GroupedWithdrawals {
  [key: string]: {
    user: Transaction['user'];
    withdrawals: Transaction[];
    totalAmount: number;
    pendingAmount: number;
    completedCount: number;
    totalCount: number;
  };
}

const AdminWithdrawals = () => {
  const { transactions, loadTransactions, loading } = useTransactionStore();
  const [groupedWithdrawals, setGroupedWithdrawals] = useState<GroupedWithdrawals>({});
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadTransactions();
  }, []); // S'exécute une seule fois au montage

  useEffect(() => {
    if (transactions.length > 0) {
      const withdrawalTransactions = transactions.filter(
        t => t.type === 'withdrawal' || t.type === 'commission_withdrawal'
      );
      groupWithdrawalsByUser(withdrawalTransactions);
    }
  }, [transactions]);

  const groupWithdrawalsByUser = (withdrawalsList: Transaction[]) => {
    const grouped = withdrawalsList.reduce((acc: GroupedWithdrawals, withdrawal) => {
      const userId = withdrawal.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: withdrawal.user,
          withdrawals: [],
          totalAmount: 0,
          pendingAmount: 0,
          completedCount: 0,
          totalCount: 0
        };
      }
      acc[userId].withdrawals.push(withdrawal);
      acc[userId].totalAmount += withdrawal.amount;
      if (withdrawal.status === 'pending') {
        acc[userId].pendingAmount += withdrawal.amount;
      }
      if (withdrawal.status === 'completed') {
        acc[userId].completedCount += 1;
      }
      acc[userId].totalCount += 1;
      return acc;
    }, {});

    setGroupedWithdrawals(grouped);
  };

  const handleStatusChange = async (withdrawalId: string, status: 'completed' | 'rejected') => {
    try {
      await useTransactionStore.getState().updateWithdrawalStatus(withdrawalId, status);
      await loadTransactions(); // Recharger toutes les transactions
      toast.success(`Retrait ${status === 'completed' ? 'validé' : 'rejeté'} avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Une erreur est survenue lors de la mise à jour du statut');
    }
  };

  const toggleUserExpansion = (userId: string) => {
    const newExpandedUsers = new Set(expandedUsers);
    if (newExpandedUsers.has(userId)) {
      newExpandedUsers.delete(userId);
    } else {
      newExpandedUsers.add(userId);
    }
    setExpandedUsers(newExpandedUsers);
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

  const filteredGroupedWithdrawals = Object.entries(groupedWithdrawals)
    .filter(([_, data]) => {
      const matchesSearch = data.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          data.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           data.withdrawals.some(w => w.status === statusFilter);
      
      const matchesType = typeFilter === 'all' || 
                         data.withdrawals.some(w => 
                           (typeFilter === 'standard' && w.type === 'withdrawal') ||
                           (typeFilter === 'commission' && w.type === 'commission_withdrawal')
                         );
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort(([_, a], [__, b]) => {
      return sortOrder === 'desc' 
        ? b.totalAmount - a.totalAmount 
        : a.totalAmount - b.totalAmount;
    });

  const totalPendingAmount = Object.values(groupedWithdrawals)
    .reduce((sum, data) => sum + data.pendingAmount, 0);

  const totalCompletedToday = Object.values(groupedWithdrawals)
    .reduce((sum, data) => {
      return sum + data.withdrawals.filter(w => 
        w.status === 'completed' && 
        new Date(w.created_at).toDateString() === new Date().toDateString()
      ).length;
    }, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Retraits</h2>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Retraits en attente</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {totalPendingAmount.toLocaleString()} FCFA
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Validés aujourd'hui</h3>
          <p className="text-2xl font-bold text-green-600">
            {totalCompletedToday}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total utilisateurs</h3>
          <p className="text-2xl font-bold text-blue-600">
            {Object.keys(groupedWithdrawals).length}
          </p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="completed">Validés</option>
          <option value="rejected">Rejetés</option>
        </select>
        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Tous les types</option>
          <option value="standard">Standard</option>
          <option value="commission">Commission</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          {sortOrder === 'desc' ? '↓' : '↑'} Montant
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroupedWithdrawals.map(([userId, data]) => (
            <div key={userId} className="bg-white rounded-lg shadow overflow-hidden">
              {/* En-tête utilisateur avec résumé */}
              <div
                className="bg-gray-50 px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleUserExpansion(userId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {expandedUsers.has(userId) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {data.user?.full_name || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500">{data.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total retiré</p>
                      <p className="font-semibold">{data.totalAmount.toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">En attente</p>
                      <p className="font-semibold text-yellow-600">
                        {data.pendingAmount.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Taux de succès</p>
                      <p className="font-semibold text-green-600">
                        {((data.completedCount / data.totalCount) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nombre de retraits</p>
                      <p className="font-semibold">{data.totalCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails des retraits */}
              {expandedUsers.has(userId) && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
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
                      {data.withdrawals
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((withdrawal) => (
                          <tr key={withdrawal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(withdrawal.created_at), 'PPP HH:mm', { locale: fr })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {withdrawal.amount.toLocaleString()} FCFA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                withdrawal.type === 'commission_withdrawal' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {withdrawal.type === 'commission_withdrawal' ? 'Commission' : 'Standard'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {withdrawal.payment_details?.paymentMethod || withdrawal.payment_method || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div>
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
                                {withdrawal.status === 'pending' ? 'En attente' :
                                 withdrawal.status === 'completed' ? 'Validé' :
                                 withdrawal.status === 'rejected' ? 'Rejeté' : 
                                 withdrawal.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {withdrawal.status === 'pending' && (
                                <div className="flex flex-col space-y-2">
                                  <button
                                    onClick={() => handleStatusChange(withdrawal.id, 'completed')}
                                    disabled={loading}
                                    className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                                  >
                                    ✅ Valider
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(withdrawal.id, 'rejected')}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                                  >
                                    ❌ Rejeter
                                  </button>
                                </div>
                              )}
                              {withdrawal.status === 'completed' && (
                                <span className="text-green-600">Validé ✅</span>
                              )}
                              {withdrawal.status === 'rejected' && (
                                <span className="text-red-600">Rejeté ❌</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
