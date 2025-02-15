import React from 'react';
import { Star, TrendingUp } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Alice Diouf",
      role: "Entrepreneur",
      image: "https://images.unsplash.com/photo-1665686304355-0b09b1e3b03c?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      story: {
        text: "DubaiWealth Horizon a transformé ma façon d'investir. Les rendements sont excellents et le processus est transparent.",
        stats: {
          initial: "10,000 Fcfa",
          current: "120,000 Fcfa",
          duration: "6 mois"
        }
      },
      rating: 5
    },
    {
      name: "Sophie Elama",
      role: "Investisseuse",
      image: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?auto=format&fit=facearea&facepad=10&w=300&h=300&q=80",
      story: {
        text: "Une plateforme exceptionnelle qui m'a permis de diversifier mon portefeuille avec des investissements immobiliers de qualité à Dubai.",
        stats: {
          initial: "5,000 Fcfa",
          current: "50.000 Fcfa",
          duration: "3 mois"
        }
      },
      rating: 5
    },
    {
      name: "Mohammed Al-Rashid",
      role: "Investisseur Premium",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      story: {
        text: "Le service client est exceptionnel et les opportunités d'investissement sont uniques. Je recommande vivement.",
        stats: {
          initial: "25,000 $",
          current: "42,500 $",
          duration: "6 mois"
        }
      },
      rating: 5
    }
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative h-[400px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=80"
            alt="Dubai Success"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Témoignages
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              Découvrez les histoires de réussite de nos investisseurs.
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-16 w-16 rounded-full"
                  />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600">{testimonial.story.text}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Investissement Initial</p>
                    <p className="text-xl font-bold text-blue-600">{testimonial.story.stats.initial}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Valeur Actuelle</p>
                    <p className="text-xl font-bold text-green-600">{testimonial.story.stats.current}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="text-xl font-bold text-purple-600">{testimonial.story.stats.duration}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "98%",
                label: "Clients Satisfaits",
                icon: <Star className="h-8 w-8 text-yellow-400" />
              },
              {
                number: "15%",
                label: "Rendement Moyen Mensuel",
                icon: <TrendingUp className="h-8 w-8 text-green-500" />
              },
              {
                number: "5000+",
                label: "Investisseurs Actifs",
                icon: <Star className="h-8 w-8 text-blue-500" />
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Rejoignez nos investisseurs satisfaits
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Commencez votre voyage vers la liberté financière dès aujourd'hui
          </p>
          <button className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Commencer Maintenant
          </button>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;