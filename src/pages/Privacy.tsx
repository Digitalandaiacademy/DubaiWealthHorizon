import React from 'react';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>
        
        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <p className="text-gray-600 mb-4">
              Chez DubaiWealth Horizon, nous prenons la protection de vos données personnelles très au sérieux. 
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
            </p>
          </section>

          {/* Key Features */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <Shield className="h-8 w-8 text-blue-600" />,
                title: "Protection des Données",
                description: "Vos données sont cryptées et stockées de manière sécurisée"
              },
              {
                icon: <Lock className="h-8 w-8 text-blue-600" />,
                title: "Sécurité Renforcée",
                description: "Authentification à deux facteurs et surveillance continue"
              },
              {
                icon: <Eye className="h-8 w-8 text-blue-600" />,
                title: "Transparence",
                description: "Contrôle total sur vos données personnelles"
              },
              {
                icon: <FileCheck className="h-8 w-8 text-blue-600" />,
                title: "Conformité",
                description: "Respect des normes internationales de protection des données"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </section>

          {/* Detailed Sections */}
          {[
            {
              title: "Collecte des Données",
              content: `Nous collectons les informations suivantes :
              • Informations d'identification (nom, prénom, email)
              • Données de connexion et d'utilisation
              • Informations de transaction
              • Préférences de communication`
            },
            {
              title: "Utilisation des Données",
              content: `Vos données sont utilisées pour :
              • Gérer votre compte et vos investissements
              • Améliorer nos services
              • Communiquer sur nos offres
              • Assurer la sécurité de la plateforme`
            },
            {
              title: "Protection des Données",
              content: `Nous mettons en œuvre les mesures suivantes :
              • Cryptage de bout en bout
              • Stockage sécurisé
              • Accès restreint aux données
              • Surveillance continue des menaces`
            },
            {
              title: "Vos Droits",
              content: `Vous disposez des droits suivants :
              • Accès à vos données
              • Rectification des informations
              • Suppression de votre compte
              • Opposition au traitement
              • Portabilité des données`
            }
          ].map((section, index) => (
            <section key={index} className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <div className="text-gray-600 whitespace-pre-line">{section.content}</div>
            </section>
          ))}

          {/* Contact Section */}
          <section className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nous Contacter</h2>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant notre politique de confidentialité ou l'exercice de vos droits, 
              vous pouvez nous contacter :
            </p>
            <ul className="text-gray-600 space-y-2">
              <li>Email : privacy@dubaiwealthhorizon.com</li>
              <li>Téléphone : +971 XX XXX XXXX</li>
              <li>Adresse : Dubai, Émirats Arabes Unis</li>
            </ul>
          </section>

          {/* Last Update */}
          <p className="text-sm text-gray-500 text-center">
            Dernière mise à jour : Mars 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;