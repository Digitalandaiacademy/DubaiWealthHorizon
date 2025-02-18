import React from 'react';

const PolitiqueConfidentialite = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Politique de Confidentialité</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Collecte des Données</h2>
          <p>Nous collectons uniquement les données nécessaires à votre utilisation de nos services :</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Informations d'identification</li>
            <li>Coordonnées de contact</li>
            <li>Informations de transaction</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Utilisation des Données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Gérer votre compte</li>
            <li>Traiter vos investissements</li>
            <li>Vous informer sur nos services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Protection des Données</h2>
          <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Vos Droits</h2>
          <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données.</p>
        </section>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
