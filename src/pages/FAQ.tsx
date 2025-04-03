import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ 
  question, 
  answer, 
  children 
}: { 
  question: string, 
  answer?: string, 
  children?: React.ReactNode 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
        {isOpen ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-gray-500" />}
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 space-y-2">
          {answer && <p>{answer}</p>}
          {children}
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-12 text-gray-900">Questions Fréquentes</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-8">
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-blue-600">Informations Générales</h2>
          <FAQItem 
            question="Qu'est-ce que DubaiWealth Horizon ?"
            answer="DubaiWealth Horizon est une plateforme d'investissement innovante qui permet aux utilisateurs de générer des revenus passifs grâce à des plans d'investissement flexibles et sécurisés."
          />
          <FAQItem 
            question="Comment fonctionne la plateforme ?"
            answer="Vous pouvez choisir un plan d'investissement, investir un montant minimum, et commencer à générer des revenus quotidiens. Nos algorithmes calculent et créditent vos gains automatiquement."
          />
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-blue-600">Investissements</h2>
          <FAQItem 
            question="Quels sont les montants minimums d'investissement ?"
            answer="Les montants minimums varient selon les plans. Actuellement, nous proposons des plans à partir de 25 000 FCFA avec des rendements quotidiens différenciés."
          />
          <FAQItem 
            question="Comment sont calculés mes revenus ?"
            answer="Vos revenus sont calculés quotidiennement en fonction du plan choisi et du montant investi. Le taux de rendement (ROI) est fixe et appliqué chaque jour."
          />
          <FAQItem 
            question="Puis-je retirer mes investissements à tout moment ?"
            answer="Oui, vous pouvez demander un retrait à tout moment. Les fonds seront transférés selon les méthodes de paiement que vous avez choisies."
          />
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-blue-600">Méthodes de Paiement</h2>
          <FAQItem 
            question="Quelles sont les méthodes de paiement disponibles ?"
          >
            <ul className="list-disc list-inside">
              <li>Paiements électroniques : Orange Money, MTN Mobile Money, Wave</li>
              <li>Cryptomonnaies : BTC, USDT, ETH, Doge</li>
            </ul>
          </FAQItem>
          <FAQItem 
            question="Comment sont sécurisés mes paiements ?"
            answer="Nous utilisons des protocoles de cryptage de pointe et travaillons avec des partenaires financiers reconnus pour garantir la sécurité de vos transactions."
          />
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-blue-600">Sécurité et Confidentialité</h2>
          <FAQItem 
            question="Mes données personnelles sont-elles protégées ?"
            answer="Absolument. Nous appliquons les normes les plus strictes de protection des données personnelles et utilisons un cryptage de bout en bout."
          />
          <FAQItem 
            question="Votre plateforme est-elle légale ?"
            answer="Oui, nous sommes entièrement conformes aux réglementations financières locales et internationales. Nous travaillons en toute transparence."
          />
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-blue-600">Support et Assistance</h2>
          <FAQItem 
            question="Comment puis-je contacter le support ?"
            answer="Vous pouvez nous joindre whatsapp , télégram ou via notre formulaire de contact en ligne disponible 24/7."
          />
          <FAQItem 
            question="Délai de traitement des retraits"
            answer="Les retraits sont généralement traités sous 24 à 48 heures ouvrables, selon la méthode de paiement choisie."
          />
        </section>

        <section className="mt-8 text-center">
          <p className="text-gray-600">
            Une question qui n'est pas dans cette liste ? 
            <a href="/about" className="text-blue-600 ml-2 hover:underline">
              Contactez-nous
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default FAQ;