import React, { useState } from 'react';
import { Lightbulb, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface Tip {
  title: string;
  content: string;
  category: 'investment' | 'savings' | 'referral' | 'security';
}

const FinancialTips: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const tips: Tip[] = [
    {
      title: "Diversifiez vos investissements",
      content: "Répartissez votre capital entre différents plans d'investissement pour optimiser vos rendements tout en minimisant les risques.",
      category: "investment"
    },
    {
      title: "Réinvestissez vos gains",
      content: "Pour maximiser la croissance de votre capital, envisagez de réinvestir une partie de vos rendements dans de nouveaux plans.",
      category: "investment"
    },
    {
      title: "Définissez des objectifs clairs",
      content: "Établissez des objectifs financiers précis avec des échéances pour rester motivé et suivre votre progression.",
      category: "savings"
    },
    {
      title: "Partagez votre lien de parrainage",
      content: "Utilisez les réseaux sociaux et les groupes de discussion pour partager votre lien de parrainage et augmenter vos commissions.",
      category: "referral"
    },
    {
      title: "Sécurisez votre compte",
      content: "Utilisez un mot de passe fort et unique, et activez l'authentification à deux facteurs pour protéger votre compte.",
      category: "security"
    }
  ];

  const currentTip = tips[currentTipIndex];

  const handleNext = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  const handlePrevious = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex - 1 + tips.length) % tips.length);
  };

  if (dismissed) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'investment':
        return 'bg-blue-50 text-blue-800';
      case 'savings':
        return 'bg-green-50 text-green-800';
      case 'referral':
        return 'bg-purple-50 text-purple-800';
      case 'security':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 relative">
      <button 
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex items-start mb-3">
        <Lightbulb className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center">
            <h3 className="font-medium text-gray-900">{currentTip.title}</h3>
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getCategoryColor(currentTip.category)}`}>
              {currentTip.category === 'investment' ? 'Investissement' :
               currentTip.category === 'savings' ? 'Épargne' :
               currentTip.category === 'referral' ? 'Parrainage' : 'Sécurité'}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{currentTip.content}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Conseil {currentTipIndex + 1} sur {tips.length}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevious}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Conseil précédent"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Conseil suivant"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialTips;