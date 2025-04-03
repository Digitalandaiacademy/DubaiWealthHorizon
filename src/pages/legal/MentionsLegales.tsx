import React from 'react';

const MentionsLegales = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mentions Légales</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Éditeur du Site</h2>
          <p>DubaiWealth Horizon</p>
          <p>Adresse : [Adresse complète]</p>
          <p>Email : contact@dubaiwealthhorizon.com</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Hébergement</h2>
          <p>Le site est hébergé par [Nom de l'hébergeur]</p>
          <p>Adresse : [Adresse de l'hébergeur]</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Propriété Intellectuelle</h2>
          <p>L'ensemble du contenu de ce site est protégé par les lois sur la propriété intellectuelle.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>Pour toute question, veuillez nous contacter via WhatsApp au +2348062450400 ou sur Telegram @Dubaiwealthinvest_supports</p>
        </section>
      </div>
    </div>
  );
};

export default MentionsLegales;
