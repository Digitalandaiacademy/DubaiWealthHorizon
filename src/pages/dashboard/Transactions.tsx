import React, { useEffect, useState } from 'react';
import TransactionModal from '../../components/ui/TransactionModal';
import { useTransactionStore } from '../../store/transactionStore';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, Calendar, DollarSign, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  type: 'investment' | 'return' | 'withdrawal' | 'referral' | 'commission_withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  description?: string;
}

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
    const updateInterval = setInterval(() => {
      loadTransactions();
    }, 60 * 60 * 1000);
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
          text: 'Retrait standard'
        };
      case 'commission_withdrawal':
        return {
          icon: <ArrowUpCircle className="h-5 w-5 text-purple-500" />,
          text: 'Retrait commission'
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

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Historique des Transactions</h1>
        <button 
          onClick={() => window.location.reload()} 
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M8 16H3v5"></path>
          </svg>
        </button>
      </div>

      {/* Mobile-friendly stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Reçu</p>
              <p className="text-xl font-bold text-green-600">
                {totalReceived.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ArrowUpCircle className="h-6 w-6 text-red-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Retiré</p>
              <p className="text-xl font-bold text-red-600">
                {totalWithdrawn.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Solde Disponible</p>
              <p className="text-xl font-bold text-blue-600">
                {availableBalance.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter options */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Toutes
          </button>
          <button 
            onClick={() => setFilter('investment')}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === 'investment' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Investissements
          </button>
          <button 
            onClick={() => setFilter('return')}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === 'return' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Rendements
          </button>
          <button 
            onClick={() => setFilter('withdrawal')}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === 'withdrawal' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Retraits
          </button>
          <button 
            onClick={() => setFilter('referral')}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === 'referral' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Commissions
          </button>
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune transaction</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vos transactions apparaîtront ici une fois que vous aurez effectué des opérations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Mobile-optimized transaction cards */}
              {filteredTransactions.map((transaction) => {
                const { icon, text } = getTypeDetails(transaction.type);
                const isWithdrawal = transaction.type === 'withdrawal' || transaction.type === 'commission_withdrawal';
                
                return (
                  <div 
                    key={transaction.id} 
                    onClick={() => handleRowClick(transaction)}
                    className="bg-gray-50 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        {icon}
                        <span className="ml-2 font-medium">{text}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'completed' ? 'Complété' :
                         transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(transaction.created_at)}
                      </div>
                      <div className={`text-lg font-bold ${isWithdrawal ? 'text-red-600' : 'text-green-600'}`}>
                        {isWithdrawal ? '-' : '+'}
                        {transaction.amount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        transaction={selectedTransaction} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Transactions;