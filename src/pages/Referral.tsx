import React from 'react';
import { Users, Gift, TrendingUp, Award } from 'lucide-react';

const Referral = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative h-[400px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=80"
            alt="Dubai Networking"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Programme de Parrainage
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              Gagnez des commissions attractives en partageant DubaiWealth Horizon avec votre réseau.
            </p>
          </div>
        </div>
      </section>

      {/* Referral Levels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Programme à 3 Niveaux</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              level: "Niveau 1",
              commission: "10%",
              description: "Commission directe sur les investissements de vos filleuls",
              icon: <Users className="h-12 w-12 text-blue-600" />
            },
            {
              level: "Niveau 2",
              commission: "5%",
              description: "Commission sur les investissements des filleuls de vos filleuls",
              icon: <Gift className="h-12 w-12 text-blue-600" />
            },
            {
              level: "Niveau 3",
              commission: "2%",
              description: "Commission sur les investissements du troisième niveau",
              icon: <Award className="h-12 w-12 text-blue-600" />
            }
          ].map((level, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="flex justify-center mb-6">{level.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{level.level}</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">{level.commission}</p>
              <p className="text-gray-600">{level.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Inscrivez-vous",
                description: "Créez votre compte sur DubaiWealth Horizon"
              },
              {
                step: "2",
                title: "Partagez",
                description: "Partagez votre code de parrainage unique"
              },
              {
                step: "3",
                title: "Suivez",
                description: "Suivez les investissements de vos filleuls"
              },
              {
                step: "4",
                title: "Gagnez",
                description: "Recevez vos commissions automatiquement"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Avantages du Programme</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Commissions à Vie",
              description: "Recevez des commissions sur tous les investissements de vos filleuls, sans limite de temps"
            },
            {
              title: "Paiements Rapides",
              description: "Les commissions sont versées automatiquement sur votre compte tous les mois"
            },
            {
              title: "Tableau de Bord Dédié",
              description: "Suivez vos performances et celles de votre réseau en temps réel"
            },
            {
              title: "Support Premium",
              description: "Bénéficiez d'un support prioritaire pour vous et vos filleuls"
            }
          ].map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à développer votre réseau ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Commencez dès maintenant et construisez une source de revenus passive
          </p>
          <button className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Rejoindre le Programme
          </button>
        </div>
      </section>
    </div>
  );
};

export default Referral;