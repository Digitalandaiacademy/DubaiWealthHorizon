import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openSection, setOpenSection] = useState<string | null>('general');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const sections = [
    {
      id: 'general',
      title: 'Questions Générales',
      questions: [
        {
          id: 'what-is',
          question: "Qu'est-ce que DubaiWealth Horizon ?",
          answer: "DubaiWealth Horizon est une plateforme d'investissement immobilier qui permet aux particuliers d'investir dans des projets immobiliers de prestige à Dubai. Nous sélectionnons soigneusement les meilleurs projets et permettons aux investisseurs de participer avec des montants accessibles."
        },
        {
          id: 'how-works',
          question: "Comment fonctionne la plateforme ?",
          answer: "Notre plateforme permet aux investisseurs de choisir parmi différents plans d'investissement, chacun offrant des rendements différents selon la durée et le montant investi. Une fois inscrit, vous pouvez suivre vos investissements en temps réel via votre tableau de bord personnalisé."
        },
        {
          id: 'min-investment',
          question: "Quel est le montant minimum d'investissement ?",
          answer: "Le montant minimum d'investissement commence à 1,000$ avec notre Plan Découverte, ce qui permet à un large public d'accéder à l'investissement immobilier à Dubai."
        }
      ]
    },
    {
      id: 'investment',
      title: 'Investissements',
      questions: [
        {
          id: 'returns',
          question: "Comment sont calculés les rendements ?",
          answer: "Les rendements sont calculés en fonction du plan choisi et sont basés sur les revenus générés par les projets immobiliers. Les rendements varient de 0.5% par jour pour le Plan Découverte à 15% par mois pour le Plan Elite."
        },
        {
          id: 'payment',
          question: "Comment sont effectués les paiements ?",
          answer: "Les paiements sont effectués directement sur votre compte bancaire selon la fréquence de votre plan (quotidien, hebdomadaire ou mensuel). Vous pouvez suivre tous vos paiements dans votre espace personnel."
        },
        {
          id: 'risks',
          question: "Quels sont les risques ?",
          answer: "Comme tout investissement, il existe des risques liés au marché immobilier. Cependant, nous minimisons ces risques en sélectionnant rigoureusement nos projets et en diversifiant notre portefeuille immobilier."
        }
      ]
    },
    {
      id: 'technical',
      title: 'Questions Techniques',
      questions: [
        {
          id: 'account',
          question: "Comment créer un compte ?",
          answer: "La création d'un compte est simple et rapide. Cliquez sur 'Inscription', remplissez le formulaire avec vos informations personnelles, vérifiez votre email, et vous pourrez commencer à investir."
        },
        {
          id: 'security',
          question: "Comment est assurée la sécurité de mon compte ?",
          answer: "Nous utilisons un cryptage de bout en bout et une authentification à deux facteurs. Toutes les transactions sont sécurisées et surveillées 24/7 par notre équipe de sécurité."
        },
        {
          id: 'support',
          question: "Comment contacter le support ?",
          answer: "Notre équipe support est disponible 24/7 via chat en direct, email ou téléphone. Les membres Premium et Elite bénéficient d'un accès prioritaire au support."
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
        Questions Fréquentes
      </h1>

      <div className="max-w-3xl mx-auto">
        {/* Search Bar - To be implemented */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Rechercher une question..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                {openSection === section.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {/* Questions */}
              {openSection === section.id && (
                <div className="p-6 space-y-4">
                  {section.questions.map((item) => (
                    <div key={item.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                      <button
                        onClick={() => setOpenQuestion(openQuestion === item.id ? null : item.id)}
                        className="w-full text-left"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
                          {openQuestion === item.id ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </button>
                      {openQuestion === item.id && (
                        <p className="mt-4 text-gray-600">{item.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-gray-600 mb-6">
            Notre équipe est disponible 24/7 pour répondre à toutes vos questions.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Contacter le Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;