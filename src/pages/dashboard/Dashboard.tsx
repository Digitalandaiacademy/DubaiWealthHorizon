import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useInvestmentStore } from '../../store/investmentStore';
import { useTransactionStore } from '../../store/transactionStore';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, ArrowUpCircle, ArrowDownCircle, AlertCircle, Calendar } from 'lucide-react';
import InvestmentAnimation from '../../components/InvestmentAnimation';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { profile } = useAuthStore();
  const { userInvestments, loadUserInvestments, loading: investmentsLoading } = useInvestmentStore();
  const { 
    transactions, 
    totalReceived, 
    totalWithdrawn, 
    availableBalance, 
    loadTransactions,
    startAutoUpdate,
    stopAutoUpdate,
    loading: transactionsLoading 
  } = useTransactionStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadUserInvestments();
        await loadTransactions();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    loadData();
    
    // Set up automatic update
    const updateInterval = setInterval(() => {
      loadData();
    }, 60 * 1000); // Update every minute

    startAutoUpdate();

    return () => {
      clearInterval(updateInterval);
      stopAutoUpdate();
    };
  }, []);

  const activeInvestments = userInvestments.filter(i => i.status === 'active');
  const totalInvested = userInvestments.reduce((sum, i) => sum + i.amount, 0);

  const loading = investmentsLoading || transactionsLoading;

  const getTypeDetails = (type) => {
    switch (type) {
      case 'investment':
        return { icon: <ArrowUpCircle className="h-5 w-5 text-blue-500" />, text: 'Investissement' };
      case 'return':
        return { icon: <ArrowDownCircle className="h-5 w-5 text-green-500" />, text: 'Rendement' };
      case 'withdrawal':
        return { icon: <ArrowUpCircle className="h-5 w-5 text-red-500" />, text: 'Retrait' };
      case 'referral':
        return { icon: <ArrowDownCircle className="h-5 w-5 text-purple-500" />, text: 'Commission' };
      default:
        return { icon: <AlertCircle className="h-5 w-5 text-gray-500" />, text: 'Transaction' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {profile?.full_name || 'Investisseur'}
          </h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord
          </p>
        </div>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">Total Investi</p>
              <p className="text-lg font-bold text-gray-900 truncate">{formatAmount(totalInvested)} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">Gains Totaux</p>
              <p className="text-lg font-bold text-green-600 truncate">{formatAmount(totalReceived)} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-purple-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">Solde Disponible</p>
              <p className="text-lg font-bold text-purple-600 truncate">{formatAmount(availableBalance)} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ArrowUpCircle className="h-6 w-6 text-red-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">Total Retiré</p>
              <p className="text-lg font-bold text-red-600 truncate">{formatAmount(totalWithdrawn)} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active investments section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Investissements Actifs</h2>
            <Link
              to="/dashboard/invest"
              className="inline-flex items-center px-3 py-1.5 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Investir
            </Link>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : activeInvestments.length > 0 ? (
            <div className="space-y-4">
              {activeInvestments.map((investment) => {
                // Check if investment cycle is completed
                const startDate = new Date(investment.created_at);
                const currentDate = new Date();
                const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const isCycleCompleted = diffDays >= investment.cycle_days;
                
                // Calculate daily return
                const dailyReturn = (investment.amount * investment.plan.daily_roi) / 100;
                
                return (
                  <div key={investment.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{investment.plan.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(investment.created_at)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        investment.status === 'active' 
                          ? (isCycleCompleted ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800') 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {investment.status === 'active' 
                          ? (isCycleCompleted ? 'Cycle terminé' : 'Actif') 
                          : 'Inactif'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Montant investi</p>
                        <p className="text-lg font-bold">{formatAmount(investment.amount)} FCFA</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Gain quotidien</p>
                        <p className="text-lg font-bold text-green-600">{formatAmount(dailyReturn)} FCFA</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">Aucun investissement actif pour le moment.</p>
              <Link
                to="/dashboard/invest"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Commencer à investir
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Dernières Transactions</h2>
            <Link
              to="/dashboard/transactions"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Voir tout
            </Link>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => {
                const { icon, text } = getTypeDetails(transaction.type);
                const isWithdrawal = transaction.type === 'withdrawal' || transaction.type === 'commission_withdrawal';
                
                return (
                  <div 
                    key={transaction.id} 
                    className="bg-gray-50 rounded-lg p-3 shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        {icon}
                        <span className="ml-2 text-sm font-medium">{text}</span>
                      </div>
                      <span className={`text-sm ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'completed' ? 'Complété' :
                         transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(transaction.created_at)}
                      </div>
                      <div className={`text-base font-bold ${isWithdrawal ? 'text-red-600' : 'text-green-600'}`}>
                        {isWithdrawal ? '-' : '+'}
                        {formatAmount(transaction.amount)} FCFA
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="text-center pt-2">
                <Link
                  to="/dashboard/transactions"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Voir toutes les transactions
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">Aucune transaction pour le moment.</p>
          )}
        </div>
      </div>
      
      {/* WhatsApp assistance button */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center space-y-2">
        <span className="text-gray-700 text-sm bg-white px-2 py-1 rounded-md shadow-md">
          Besoin d'aide ?
        </span>
        <a 
          href="https://wa.me/2348062450400?text=Besoin%20d'assistance" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 12.3a9.8 9.8 0 0 1-1.1 4.5c-.7 1.5-2.2 3.3-3.7 4.2a10.2 10.2 0 0 1-4.5 1.1 9.8 9.8 0 0 1-4.5-1.1L2 22l1.1-5.3a9.8 9.8 0 0 1-1.1-4.5 10.2 10.2 0 0 1 1.1-4.5 9.8 9.8 0 0 1 4.5-3.7 10.2 10.2 0 0 1 4.5-1.1h.5a9.8 9.8 0 0 1 4.5 1.1 10.2 10.2 0 0 1 3.7 3.7 9.8 9.8 0 0 1 1.1 4.5z"/>
            <path d="M16.2 14.7c-.3 1-1.6 1.6-2.7 1.2-1.2-.5-4.3-2.6-5.4-5.5-.4-1 .1-2.4 1.2-2.7.6-.2 1.3 0 1.7.6l.8 1.2c.3.4.3.9 0 1.3l-.6.8c.5 1.1 1.3 1.9 2.4 2.4l.8-.6c.4-.3.9-.3 1.3 0l1.2.8c.6.4.8 1.1.6 1.7z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;