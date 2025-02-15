import React, { useEffect } from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

const Transactions = () => {
  const {
    transactions,
    loading,
    totalReceived,
    totalWithdrawn,
    availableBalance,
    loadTransactions,
    startAutoUpdate,
    stopAutoUpdate
  } = useTransactionStore();

  useEffect(() => {
    // Chargement initial
    loadTransactions();
    
    // Configuration de la mise à jour automatique toutes les heures
    const updateInterval = setInterval(() => {
      loadTransactions();
    }, 60 * 60 * 1000); // 1 heure en millisecondes

    startAutoUpdate();

    return () => {
      clearInterval(updateInterval);
      stopAutoUpdate();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDetails = (type: string) => {
    switch (type) {
      case 'investment':
        return {
          icon: <ArrowUpCircle className="h-5 w-5 text-blue-500" />,
          text: 'Investissement'
        };
      case 'return':
        return {
          icon: <ArrowDownCircle className="h-5 w-5 text-green-500" />,
          text: 'Rendement'
        };
      case 'withdrawal':
        return {
          icon: <ArrowUpCircle className="h-5 w-5 text-red-500" />,
          text: 'Retrait'
        };
      case 'referral':
        return {
          icon: <ArrowDownCircle className="h-5 w-5 text-purple-500" />,
          text: 'Commission parrainage'
        };
      default:
        return {
          icon: <ArrowDownCircle className="h-5 w-5 text-gray-500" />,
          text: 'Transaction'
        };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Historique des Transactions</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Total Reçu</h3>
              <p className="text-2xl font-bold text-green-600">
                {totalReceived.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Total Retiré</h3>
              <p className="text-2xl font-bold text-red-600">
                {totalWithdrawn.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Solde Disponible</h3>
              <p className="text-2xl font-bold text-blue-600">
                {availableBalance.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune transaction</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vos transactions apparaîtront ici une fois que vous aurez effectué des opérations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => {
                    const { icon, text } = getTypeDetails(transaction.type);
                    return (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleString('fr-FR', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {icon}
                            <span className="ml-2 text-sm text-gray-900">{text}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'withdrawal' ? '-' : '+'}
                            {transaction.amount.toLocaleString('fr-FR')} FCFA
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatusColor(transaction.status)
                          }`}>
                            {transaction.status === 'completed' ? 'Complété' :
                             transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;