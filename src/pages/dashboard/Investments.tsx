import React, { useEffect } from 'react';
import { useInvestmentStore } from '../../store/investmentStore';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import InvestmentAnimation from '../../components/InvestmentAnimation';

const Investments = () => {
  const { userInvestments, plans, loadUserInvestments, loadPlans, loading } = useInvestmentStore();

  useEffect(() => {
    loadUserInvestments();
    loadPlans();
  }, []);

  const activeInvestments = userInvestments.filter(inv => inv.status === 'active');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes Investissements</h1>
        <Link
          to="/dashboard/investments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nouvel Investissement
        </Link>
      </div>

      {/* Investissements actifs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Investissements Actifs
          </h2>
        </div>

        <div className="p-6">
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
                  to="/dashboard/investments/new"
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
                // Calculer les gains actuels pour cet investissement
                const startDate = new Date(investment.created_at);
                const currentDate = new Date();
                const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const dailyEarning = (investment.amount * investment.plan.daily_roi) / 100;
                const currentEarnings = dailyEarning * diffDays;

                return (
                  <div key={investment.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {investment.plan.name}
                      </h3>
                      <div className="text-sm text-gray-500">
                        Investissement initial: {investment.amount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-lg font-medium text-green-600">
                        Gains actuels: {currentEarnings.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-sm text-gray-500">
                        ROI journalier: {investment.plan.daily_roi}%
                      </div>
                    </div>
                    <InvestmentAnimation
                      amount={currentEarnings}
                      dailyRoi={investment.plan.daily_roi}
                      startDate={investment.created_at}
                      isActive={true}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Plans disponibles */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Plans d'Investissement Disponibles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-2xl font-bold text-blue-600 mb-4">
                {plan.price.toLocaleString('fr-FR')} FCFA
              </div>
              <div className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
              <Link
                to={`/dashboard/investments/new?plan=${plan.id}`}
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choisir ce plan
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Investments;