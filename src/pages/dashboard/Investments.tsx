import React, { useEffect } from 'react';
import { useInvestmentStore } from '../../store/investmentStore';
import { TrendingUp, AlertCircle, Calendar, DollarSign, Percent, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import InvestmentAnimation from '../../components/InvestmentAnimation';

const Investments = () => {
  const { userInvestments, plans, loadUserInvestments, loadPlans, loading } = useInvestmentStore();

  useEffect(() => {
    loadUserInvestments();
    loadPlans();
  }, []);

  const activeInvestments = userInvestments.filter(inv => inv.status === 'active');

  // Calculate earnings correctly based on cycle days
  const calculateEarnings = (investment) => {
    const startDate = new Date(investment.created_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    
    // Cap days at cycle_days
    const diffDays = Math.min(
      Math.floor(diffTime / (1000 * 60 * 60 * 24)),
      investment.cycle_days
    );
    
    const dailyEarning = (investment.amount * investment.plan.daily_roi) / 100;
    return dailyEarning * diffDays;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString('fr-FR');
  };

  // Calculate days elapsed since investment started
  const getDaysElapsed = (startDateString) => {
    const startDate = new Date(startDateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes Investissements</h1>
        <Link
          to="/dashboard/invest"
          className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Investir
          </span>
        </Link>
      </div>

      <div className="flex items-end justify-end">
        <div className="flex flex-col items-center">
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
          <span className="text-sm text-gray-500 mt-1">Actualiser</span>
        </div>
      </div>

      {/* Active investments */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Investissements Actifs
          </h2>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : activeInvestments.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun investissement actif</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer votre premier investissement.
              </p>
              <div className="mt-6">
                <Link
                  to="/dashboard/invest"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <TrendingUp className="-ml-1 mr-2 h-5 w-5" />
                  Nouvel Investissement
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {activeInvestments.map((investment) => {
                // Calculate current earnings correctly
                const currentEarnings = calculateEarnings(investment);
                
                // Check if investment cycle is completed
                const startDate = new Date(investment.created_at);
                const currentDate = new Date();
                const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const isCycleCompleted = diffDays >= investment.cycle_days;
                
                // Calculate daily return
                const dailyReturn = (investment.amount * investment.plan.daily_roi) / 100;
                
                // Calculate days elapsed
                const daysElapsed = getDaysElapsed(investment.created_at);

                return (
                  <div key={investment.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{investment.plan.name}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(investment.created_at)}
                        </div>
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
                    
                    {/* Investment details - Mobile friendly grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-xs text-gray-600">Montant investi</span>
                        </div>
                        <p className="text-base font-bold">{formatAmount(investment.amount)} FCFA</p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Percent className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-xs text-gray-600">ROI quotidien</span>
                        </div>
                        <p className="text-base font-bold">{investment.plan.daily_roi}%</p>
                      </div>
                    </div>
                    
                    {/* Current earnings section */}
                    <div className="bg-white p-3 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center mb-1">
                            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm font-medium text-gray-700">Gains actuels</span>
                          </div>
                          <p className="text-xl font-bold text-green-600">{formatAmount(currentEarnings)} FCFA</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end mb-1">
                            <Clock className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="text-xs text-gray-600">Jours écoulés</span>
                          </div>
                          <p className="text-sm">
                            <span className="font-bold">{daysElapsed}</span> jours 
                            <span className="text-xs text-gray-500 ml-1">
                              ({formatAmount(dailyReturn)} FCFA/jour)
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Vos gains actuels représentent {daysElapsed} fois votre gain journalier
                      </div>
                    </div>
                    
                    {/* Investment Animation - Shows real-time mining and earnings */}
                    <InvestmentAnimation
                      amount={investment.amount}
                      dailyRoi={investment.plan.daily_roi}
                      startDate={investment.created_at}
                      isActive={investment.status === 'active'}
                      cycleDays={investment.cycle_days}
                    />
                    
                    {isCycleCompleted && (
                      <div className="mt-3 p-2 bg-orange-50 rounded-lg text-center">
                        <p className="text-sm text-orange-700 font-medium">
                          Cycle d'investissement terminé ({investment.cycle_days} jours)
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Available plans - Mobile-friendly grid */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Plans d'Investissement Disponibles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="text-xl font-bold text-blue-600 mb-2">
                  {plan.price.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="bg-blue-50 rounded-lg p-2 mb-3 text-center">
                  <p className="text-sm font-semibold text-blue-700">
                    {plan.daily_roi}% / jour
                  </p>
                </div>
                <Link
                  to={`/dashboard/invest?plan=${plan.id}`}
                  className="block w-full text-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Choisir ce plan
                </Link>
              </div>
            </div>
          ))}
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

export default Investments;