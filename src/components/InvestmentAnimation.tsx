import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface InvestmentAnimationProps {
  amount: number;
  dailyRoi: number;
  startDate: string;
  isActive?: boolean;
}

const InvestmentAnimation = ({ 
  amount = 0, 
  dailyRoi = 0, 
  startDate = new Date().toISOString(), 
  isActive = true 
}: InvestmentAnimationProps) => {
  const [currentAmount, setCurrentAmount] = useState(amount);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!isActive || !amount || !dailyRoi) return;

    // Calculer le montant actuel basé sur le temps écoulé
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const daysElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const dailyReturn = amount * (dailyRoi / 100);
    
    // Mettre à jour le montant toutes les secondes
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const secondsInDay = (currentTime - start) % (1000 * 60 * 60 * 24) / 1000;
      const todayReturn = (dailyReturn * secondsInDay) / (24 * 60 * 60);
      const newAmount = amount + (dailyReturn * daysElapsed) + todayReturn;
      setCurrentAmount(Math.max(0, newAmount));

      // Calculer le temps restant jusqu'à la fin des 3 mois
      const endDate = new Date(start + (90 * 24 * 60 * 60 * 1000));
      const timeRemaining = endDate.getTime() - currentTime;
      
      if (timeRemaining <= 0) {
        setTimeLeft('Investissement terminé');
        clearInterval(interval);
      } else {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [amount, dailyRoi, startDate, isActive]);

  // Calculer les projections
  const dailyReturn = amount * (dailyRoi / 100);
  const weeklyReturn = dailyReturn * 7;
  const monthlyReturn = dailyReturn * 30;
  const totalReturn = dailyReturn * 90;

  const formatAmount = (value: number) => {
    return Math.max(0, value).toLocaleString('fr-FR');
  };

  return (
    <div className="space-y-8">
      {/* Animation de l'arbre d'investissement */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Tronc de l'arbre */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 bg-green-800 rounded-t-lg"
              initial={{ height: 20 }}
              animate={{ height: [20, 30, 40, 50] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Feuillage */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Pièces */}
            <motion.div
              className="absolute bottom-12 left-0 text-yellow-300 text-xl"
              animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              💰
            </motion.div>
            <motion.div
              className="absolute bottom-16 right-0 text-yellow-300 text-xl"
              animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
            >
              💰
            </motion.div>
          </div>
        </div>

        {/* Overlay avec les informations */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
          <div className="text-2xl font-bold text-white mb-1">
            {formatAmount(currentAmount)} FCFA
          </div>
          <div className="text-sm text-white/90">
            +{formatAmount(dailyReturn)} FCFA / jour
          </div>
          {isActive && timeLeft && (
            <div className="mt-2">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                {timeLeft}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Projections */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Rendement Quotidien</h3>
          <p className="text-2xl font-bold text-blue-600">
            +{formatAmount(dailyReturn)} FCFA
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Rendement Hebdomadaire</h3>
          <p className="text-2xl font-bold text-green-600">
            +{formatAmount(weeklyReturn)} FCFA
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Rendement Mensuel</h3>
          <p className="text-2xl font-bold text-purple-600">
            +{formatAmount(monthlyReturn)} FCFA
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Rendement Total (3 mois)</h3>
          <p className="text-2xl font-bold text-indigo-600">
            +{formatAmount(totalReturn)} FCFA
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentAnimation;