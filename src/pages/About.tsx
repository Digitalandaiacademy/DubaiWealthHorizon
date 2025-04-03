import React from 'react';
import { Building2, Shield, Users, Trophy } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative h-[400px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=1920&q=80"
            alt="Dubai Business District"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Notre Histoire
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              Découvrez comment DubaiWealth Horizon est devenu le leader de l'investissement immobilier à Dubai.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
            <p className="text-gray-600 text-lg mb-6">
              Chez DubaiWealth Horizon, notre mission est de démocratiser l'accès aux investissements immobiliers de prestige à Dubai. Nous croyons que chacun devrait avoir l'opportunité de participer à la croissance exceptionnelle du marché immobilier dubaïote.
            </p>
            <p className="text-gray-600 text-lg">
              Notre plateforme innovante permet aux investisseurs de tous horizons de participer à des projets immobiliers soigneusement sélectionnés, avec des rendements attractifs et une gestion transparente.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                icon: <Shield className="h-12 w-12 text-blue-600" />,
                title: "Sécurité",
                description: "Investissements sécurisés et conformes aux réglementations"
              },
              {
                icon: <Users className="h-12 w-12 text-blue-600" />,
                title: "Communauté",
                description: "Une communauté grandissante d'investisseurs avisés"
              },
              {
                icon: <Building2 className="h-12 w-12 text-blue-600" />,
                title: "Expertise",
                description: "Une expertise pointue du marché immobilier de Dubai"
              },
              {
                icon: <Trophy className="h-12 w-12 text-blue-600" />,
                title: "Excellence",
                description: "Un engagement constant vers l'excellence"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Alexandre Laurent",
                role: "Fondateur & CEO",
                image: "https://images.unsplash.com/photo-1642257834579-eee89ff3e9fd?auto=format&fit=facearea&facepad=10&w=300&h=300&q=80",
                description: "15 ans d'expérience dans l'immobilier de luxe à Dubai"
              },
              {
                name: "Sarah Ebode",
                role: "Directrice des Investissements",
                image: "https://images.unsplash.com/photo-1655720357761-f18ea9e5e7e6?auto=format&fit=facearea&facepad=20&w=300&h=300&q=80",
                description: "Experte en analyse financière et gestion de portefeuille"
              },
              {
                name: "Mohammed Al-Rashid",
                role: "Directeur des Opérations",
                image: "https://images.unsplash.com/photo-1559418162-0d309d8d10a3?auto=format&fit=facearea&facepad=10&w=300&h=300&q=80",
                description: "Spécialiste du marché immobilier de Dubai"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Transparence",
              description: "Nous croyons en une communication claire et honnête avec nos investisseurs. Chaque aspect de nos investissements est documenté et accessible."
            },
            {
              title: "Innovation",
              description: "Notre plateforme utilise les dernières technologies pour offrir une expérience d'investissement simple et efficace."
            },
            {
              title: "Intégrité",
              description: "Nous maintenons les plus hauts standards d'éthique professionnelle dans toutes nos opérations."
            },
            {
              title: "Excellence",
              description: "Nous nous efforçons constamment d'améliorer nos services et de dépasser les attentes de nos clients."
            }
          ].map((value, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;