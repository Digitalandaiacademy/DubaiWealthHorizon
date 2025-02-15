import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Simulator = () => {
  const [amount, setAmount] = useState<number>(50000);
  const [selectedPlan, setSelectedPlan] = useState<string>('Plan Or');
  const [duration, setDuration] = useState<number>(90);
  const [results, setResults] = useState({
    dailyReturn: 0,
    weeklyReturn: 0,
    monthlyReturn: 0,
    totalReturn: 0,
    finalAmount: 0
  });

  const plans = [
    { name: 'Plan Bronze', roi: 0.8, minAmount: 5000 },
    { name: 'Plan Argent', roi: 1.0, minAmount: 7500 },
    { name: 'Plan Or', roi: 1.2, minAmount: 10000 },
    { name: 'Plan Platine', roi: 1.5, minAmount: 12500 },
    { name: 'Plan Saphir', roi: 1.8, minAmount: 15000 },
    { name: 'Plan Émeraude', roi: 2.0, minAmount: 20000 },
    { name: 'Plan Rubis', roi: 2.2, minAmount: 25000 },
    { name: 'Plan Diamant', roi: 2.5, minAmount: 50000 },
    { name: 'Plan Royal', roi: 3.0, minAmount: 100000 },
    { name: 'Plan Impérial', roi: 3.5, minAmount: 250000 },
    { name: 'Plan Légendaire', roi: 4.0, minAmount: 500000 },
    { name: 'Plan Suprême', roi: 4.5, minAmount: 750000 }
  ];

  useEffect(() => {
    const plan = plans.find(p => p.name === selectedPlan);
    if (!plan) return;

    const dailyReturn = amount * (plan.roi / 100);
    const weeklyReturn = dailyReturn * 7;
    const monthlyReturn = dailyReturn * 30;
    const totalReturn = dailyReturn * duration;
    const finalAmount = amount + totalReturn;

    setResults({
      dailyReturn,
      weeklyReturn,
      monthlyReturn,
      totalReturn,
      finalAmount
    });
  }, [amount, selectedPlan, duration]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simulateur de Rendement
          </h1>
          <p className="text-xl text-gray-600">
            Calculez vos rendements potentiels en fonction de votre investissement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Paramètres de Simulation
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant de l'investissement (FCFA)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="5000"
                  step="1000"
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan d'investissement
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {plans.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name} - {plan.roi}% par jour
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (jours)
                </label>
                <input
                  type="range"
                  min="1"
                  max="90"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-2">
                  {duration} jours
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Résultats Estimés
            </h2>

            <div className="space-y-6">
              <motion.div
                className="bg-blue-50 rounded-lg p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Rendement Quotidien</span>
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {results.dailyReturn.toLocaleString('fr-FR')} FCFA
                </div>
              </motion.div>

              <motion.div
                className="bg-green-50 rounded-lg p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Rendement Hebdomadaire</span>
                  <Calculator className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {results.weeklyReturn.toLocaleString('fr-FR')} FCFA
                </div>
              </motion.div>

              <motion.div
                className="bg-purple-50 rounded-lg p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Rendement Mensuel</span>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {results.monthlyReturn.toLocaleString('fr-FR')} FCFA
                </div>
              </motion.div>

              <motion.div
                className="bg-indigo-50 rounded-lg p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Rendement Total</span>
                  <Clock className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  {results.totalReturn.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Capital final: {results.finalAmount.toLocaleString('fr-FR')} FCFA
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Graphique ou visualisation */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Progression de l'Investissement
          </h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            {/* Ici, vous pouvez ajouter un graphique avec Recharts ou une autre librairie */}
            <p className="text-gray-500">Graphique de progression (à implémenter)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;