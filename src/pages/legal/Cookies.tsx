import React from 'react';

const Cookies = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Politique des Cookies</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Qu'est-ce qu'un Cookie ?</h2>
          <p>Un cookie est un petit fichier texte stocké sur votre ordinateur lors de la visite d'un site web.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Utilisation des Cookies</h2>
          <p>Nous utilisons des cookies pour :</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Améliorer votre expérience utilisateur</li>
            <li>Mémoriser vos préférences</li>
            <li>Assurer la sécurité de votre compte</li>
            <li>Analyser l'utilisation de notre site</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Types de Cookies</h2>
          <ul className="list-disc ml-6 mt-2">
            <li>Cookies essentiels</li>
            <li>Cookies de performance</li>
            <li>Cookies de fonctionnalité</li>
            <li>Cookies analytiques</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Gestion des Cookies</h2>
          <p>Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez via les paramètres de votre navigateur.</p>
        </section>
      </div>
    </div>
  );
};

export default Cookies;
