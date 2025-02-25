import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, Shield, Clock } from 'lucide-react';

const Investment = () => {
  const [amount, setAmount] = useState<number>(5000);
  const [selectedPlan, setSelectedPlan] = useState<string>('Plan Bronze (0.8% / jour)');
  const [duration, setDuration] = useState<number>(30);
  const [results, setResults] = useState({
    totalReturn: 0,
    finalCapital: 0,
    dailyReturn: 0
  });

  const investmentPlans = [
    {
      title: 'Plan Bronze',
      price: '5,000',
      color: 'from-amber-500 to-amber-700',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      rendement: '4%',
      features: [
        'Rendement quotidien de 4%',
        'Retrait minimum: 1,000 FCFA',
        'Support 24/7',
        'Tableau de bord basique'
      ]
    },
    {
      title: 'Plan Argent',
      price: '7,500',
      color: 'from-gray-400 to-gray-600',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200',
      rendement: '4.1%',
      features: [
        'Rendement quotidien de 4.1%',
        'Retrait minimum: 1,500 FCFA',
        'Support prioritaire',
        'Tableau de bord personnalisé'
      ]
    },
    {
      title: 'Plan Or',
      price: '10,000',
      color: 'from-yellow-500 to-yellow-700',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      rendement: '4.2%',
      features: [
        'Rendement quotidien de 4.2%',
        'Retrait minimum: 2,000 FCFA',
        'Support VIP',
        'Accès aux statistiques avancées'
      ]
    },
    {
      title: 'Plan Platine',
      price: '12,500',
      color: 'from-slate-600 to-slate-800',
      textColor: 'text-slate-600',
      borderColor: 'border-slate-200',
      rendement: '4.5%',
      features: [
        'Rendement quotidien de 4.5%',
        'Retrait minimum: 2,500 FCFA',
        'Support dédié',
        'Analyses de marché'
      ]
    },
    {
      title: 'Plan Saphir',
      price: '15,000',
      color: 'from-blue-500 to-blue-700',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      rendement: '4.6%',
      features: [
        'Rendement quotidien de 4.6%',
        'Retrait minimum: 3,000 FCFA',
        'Conseiller personnel',
        'Rapports détaillés'
      ]
    },
    {
      title: 'Plan Émeraude',
      price: '20,000',
      color: 'from-emerald-500 to-emerald-700',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      rendement: '4.8%',
      features: [
        'Rendement quotidien de 4.8%',
        'Retrait minimum: 4,000 FCFA',
        'Conseiller VIP',
        'Accès événements exclusifs'
      ]
    },
    {
      title: 'Plan Rubis',
      price: '25,000',
      color: 'from-red-500 to-red-700',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
      rendement: '4.9%',
      features: [
        'Rendement quotidien de 4.9%',
        'Retrait minimum: 5,000 FCFA',
        'Service conciergerie',
        'Bonus mensuels'
      ]
    },
    {
      title: 'Plan Diamant',
      price: '50,000',
      color: 'from-violet-500 to-violet-700',
      textColor: 'text-violet-600',
      borderColor: 'border-violet-200',
      rendement: '5%',
      features: [
        'Rendement quotidien de 5%',
        'Retrait minimum: 10,000 FCFA',
        'Service premium',
        'Bonus trimestriels'
      ]
    },
    {
      title: 'Plan Royal',
      price: '100,000',
      color: 'from-purple-500 to-purple-700',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      rendement: '5%',
      features: [
        'Rendement quotidien de 5%',
        'Retrait minimum: 20,000 FCFA',
        'Service ultra-premium',
        'Bonus spéciaux'
      ]
    },
    {
      title: 'Plan Impérial',
      price: '250,000',
      color: 'from-indigo-500 to-indigo-700',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
      rendement: '5.1%',
      features: [
        'Rendement quotidien de 5.1%',
        'Retrait minimum: 50,000 FCFA',
        'Service élite',
        'Avantages exclusifs'
      ]
    },
    {
      title: 'Plan Légendaire',
      price: '500,000',
      color: 'from-fuchsia-500 to-fuchsia-700',
      textColor: 'text-fuchsia-600',
      borderColor: 'border-fuchsia-200',
      rendement: '5.6%',
      features: [
        'Rendement quotidien de 5.6%',
        'Retrait minimum: 100,000 FCFA',
        'Service légendaire',
        'Avantages illimités'
      ]
    },
    {
      title: 'Plan Suprême',
      price: '750,000',
      color: 'from-rose-500 to-rose-700',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-200',
      rendement: '6%',
      features: [
        'Rendement quotidien de 6%',
        'Retrait minimum: 150,000 FCFA',
        'Service suprême',
        'Privilèges exclusifs'
      ]
    },
    {
      title: 'Plan Titan',
      price: '1,000,000',
      color: 'from-teal-500 to-teal-700',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-200',
      rendement: '6.5%',
      features: [
        'Rendement quotidien de 6.5%',
        'Retrait minimum: 200,000 FCFA',
        'Service ultra-élite',
        'Accès VIP aux événements'
      ]
    },
    {
      title: 'Plan Ultime',
      price: '5,000,000',
      color: 'from-cyan-500 to-cyan-700',
      textColor: 'text-cyan-600',
      borderColor: 'border-cyan-200',
      rendement: '7%',
      features: [
        'Rendement quotidien de 7%',
        'Retrait minimum: 1,000,000 FCFA',
        'Support personnel 24/7',
        'Partenariats exclusifs'
      ]
    },
    {
      title: 'Plan Suprême Élité',
      price: '10,000,000',
      color: 'from-green-500 to-green-700',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      rendement: '7.5%',
      features: [
        'Rendement quotidien de 7.5%',
        'Retrait minimum: 2,000,000 FCFA',
        'Gestionnaire de compte dédié',
        'Avantages et privilèges uniques'
      ]
    }
  ];

  const calculateReturns = () => {
    const percentage = parseFloat(selectedPlan.match(/\d+\.?\d*/)?.[0] || '0');
    
    const dailyReturn = (amount * (percentage / 100));
    
    const totalReturn = dailyReturn * duration;
    
    const finalCapital = amount + totalReturn;

    setResults({
      totalReturn: Math.round(totalReturn),
      finalCapital: Math.round(finalCapital),
      dailyReturn: Math.round(dailyReturn)
    });
  };

  useEffect(() => {
    calculateReturns();
  }, [amount, selectedPlan, duration]);

  return (
    <div className="space-y-16 py-8">
      <section className="relative h-[400px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1920&q=80"
            alt="Dubai Real Estate"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Plans d'Investissement
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              Découvrez nos plans d'investissement adaptés à vos objectifs et commencez à générer des revenus passifs.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {investmentPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-br ${plan.color} text-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105`}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-2">FCFA</span>
                </div>
                <div className="bg-white/20 rounded-lg p-2 mb-6">
                  <p className="text-center font-semibold">
                    Rendement {plan.rendement} / jour
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="block w-full text-center bg-white py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  style={{ color: `var(--tw-gradient-from)` }}
                >
                  Commencer
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              icon: <Calculator className="h-8 w-8 text-blue-600" />,
              title: "Rendements Attractifs",
              description: "Des rendements parmi les plus compétitifs du marché"
            },
            {
              icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
              title: "Croissance Garantie",
              description: "Profitez de la croissance du marché immobilier de Dubai"
            },
            {
              icon: <Shield className="h-8 w-8 text-blue-600" />,
              title: "Capital Garanti",
              description: "Votre investissement initial est totalement sécurisé"
            },
            {
              icon: <Clock className="h-8 w-8 text-blue-600" />,
              title: "Flexibilité",
              description: "Choisissez la durée et la fréquence de vos rendements"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simulateur de Rendement</h2>
            <p className="mt-4 text-lg text-gray-600">
              Calculez vos rendements potentiels en fonction de votre investissement
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Paramètres</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Montant de l'investissement (FCFA)
                    </label>
                    <input
                      type="number"
                      min="5000"
                      step="500"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plan d'investissement
                    </label>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {investmentPlans.map((plan, index) => (
                        <option key={index}>
                          {plan.title} ({plan.rendement} / jour)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Durée (jours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Résultats Estimés</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Rendement Total</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {results.totalReturn.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Capital Final</p>
                    <p className="text-3xl font-bold text-green-600">
                      {results.finalCapital.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Rendement Quotidien</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {results.dailyReturn.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Investment;
