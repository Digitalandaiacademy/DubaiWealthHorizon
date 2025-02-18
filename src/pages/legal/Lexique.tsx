import React from 'react';

const Lexique = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lexique</h1>
      
      <div className="space-y-6">
        <section className="grid gap-6">
          <div>
            <h2 className="text-xl font-semibold text-blue-600">Investissement</h2>
            <p className="mt-2">Action de placer des capitaux dans une entreprise ou un projet avec l'espoir d'en tirer des bénéfices.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600">ROI (Retour sur Investissement)</h2>
            <p className="mt-2">Ratio financier qui mesure le montant d'argent gagné ou perdu par rapport à la somme initialement investie.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600">Portefeuille d'investissement</h2>
            <p className="mt-2">Collection d'actifs financiers détenus par un investisseur.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600">Diversification</h2>
            <p className="mt-2">Stratégie consistant à répartir ses investissements sur différents types d'actifs pour réduire les risques.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600">KYC (Know Your Customer)</h2>
            <p className="mt-2">Processus permettant de vérifier l'identité des clients et d'évaluer les risques potentiels.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600">Blockchain</h2>
            <p className="mt-2">Technologie de stockage et de transmission d'informations transparente et sécurisée.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Lexique;
