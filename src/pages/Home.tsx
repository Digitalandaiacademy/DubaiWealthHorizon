import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';
import RealTimeSimulator from '../components/RealTimeSimulator';
import InvestmentAnimation from '../components/InvestmentAnimation';
import PaymentMethods from '../components/PaymentMethods';

const Home = () => {
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
    }
  ];

  return (
    <div className="relative">
      {/* Bouton Telegram flottant */}
      <a
        href="https://t.me/dubaiwealthhorizon"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 animate-pulse hover:animate-none group"
        style={{
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          background: 'linear-gradient(45deg, #0088cc, #005f8c)'
        }}
      >
        <svg 
          className="w-6 h-6 animate-bounce group-hover:animate-none"
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-3.737 15.475-3.737 15.475-.23.928-.907 1.151-1.471.731 0 0-4.172-3.09-5.931-4.525-.39-.318-.145-.783.085-.928 1.229-.763 11.025-10.203 11.286-10.373.509-.339.339-.205-.169.134-8.716 5.695-11.223 7.338-11.699 7.659-.445.299-1.332.092-1.332.092L1.875 15.6c-.882-.271-.929-.883-.203-1.334 0 0 14.693-5.931 15.349-6.188.656-.257 1.542-.104 1.542.083z"/>
        </svg>
        <span className="font-medium">
          Rejoignez notre canal Telegram !
        </span>
      </a>

      {/* Hero Section */}
      <section className="relative h-[600px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80"
            alt="Dubai Skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Investissez dans l'Avenir<br />
              <span className="text-blue-400">de Dubai</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl">
              Participez aux projets immobiliers les plus prometteurs de Dubai.
              Investissez dès maintenant et générez des revenus réguliers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Commencer Maintenant
              </Link>
              <Link
                to="/about"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                En Savoir Plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Animation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Faites Fructifier Votre Argent</h2>
          <p className="mt-4 text-xl text-gray-600">
            Visualisez la croissance de votre investissement
          </p>
        </div>
        <InvestmentAnimation />
      </section>

      {/* Real-Time Investment Simulator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <RealTimeSimulator />
      </section>

      {/* Investment Plans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Nos Plans d'Investissement</h2>
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

      {/* Payment Methods */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PaymentMethods />
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à commencer votre voyage d'épargne ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'investisseurs qui font confiance à DubaiWealth Horizon
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Créer un Compte
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;