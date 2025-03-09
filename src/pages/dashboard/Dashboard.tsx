import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useInvestmentStore } from '../../store/investmentStore';
import { useTransactionStore } from '../../store/transactionStore';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import InvestmentAnimation from '../../components/InvestmentAnimation';

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
    // Chargement initial des données
    loadUserInvestments();
    loadTransactions();

    // Configuration de la mise à jour automatique
    const updateInterval = setInterval(() => {
      loadUserInvestments();
      loadTransactions();
    }, 60 * 1000); // Mise à jour toutes les minutes

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
      case 'deposit':
        return { icon: <TrendingUp className="h-5 w-5 text-green-600" />, text: 'Recharge' };
      case 'withdrawal':
        return { icon: <ArrowUpCircle className="h-5 w-5 text-red-600" />, text: 'Retrait' };
      case 'earning':
        return { icon: <DollarSign className="h-5 w-5 text-green-600" />, text: 'Gain' };
      default:
        return { icon: <AlertCircle className="h-5 w-5 text-gray-400" />, text: 'Autre' };
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête du tableau de bord */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {profile?.full_name || 'Investisseur'}
          </h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord DubaiWealth Horizon
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


      {/* Cartes des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Investissement total */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Investi</h3>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatAmount(totalInvested)} FCFA</p>
          <p className="text-sm text-gray-500">{activeInvestments.length} investissement(s) actif(s)</p>
        </div>

        {/* Gains totaux */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Gains Totaux</h3>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatAmount(totalReceived)} FCFA</p>
          <p className="text-sm text-gray-500">Rendement cumulé</p>
        </div>

        {/* Solde disponible */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Solde Disponible</h3>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatAmount(availableBalance)} FCFA</p>
          <p className="text-sm text-gray-500">Disponible pour retrait</p>
        </div>

        {/* Total retiré */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Retiré</h3>
            <ArrowUpCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatAmount(totalWithdrawn)} FCFA</p>
          <p className="text-sm text-gray-500">Montant total retiré</p>
        </div>
      </div>

      {/* Section des investissements actifs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Investissements Actifs</h2>
            <Link
              to="/dashboard/invest"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <TrendingUp className="-ml-1 mr-2 h-5 w-5" />
              Nouvel Investissement
            </Link>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <InvestmentAnimation />
            </div>
          ) : activeInvestments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROI Quotidien
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeInvestments.map((investment) => (
                    <tr key={investment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {investment.plan.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatAmount(investment.amount)} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {investment.plan.daily_roi}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(investment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${getStatusColor(investment.status)} font-medium`}>
                          {investment.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun investissement actif pour le moment.</p>
              <Link
                to="/dashboard/invest"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Commencer à investir
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Section des dernières transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Dernières Transactions</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <InvestmentAnimation />
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.slice(0, 5).map((transaction) => {
                    const { icon, text } = getTypeDetails(transaction.type);
                    return (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {icon}
                            <span className="ml-2 text-sm text-gray-900">{text}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatAmount(transaction.amount)} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${getStatusColor(transaction.status)} font-medium`}>
                            {transaction.status === 'completed' ? 'Complété' :
                             transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">Aucune transaction pour le moment.</p>
          )}
        </div>
      </div>
      {/* Bouton d'assistance WhatsApp */}
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