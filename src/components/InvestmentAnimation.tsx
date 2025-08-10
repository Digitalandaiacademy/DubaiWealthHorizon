import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface InvestmentAnimationProps {
  amount: number;
  dailyRoi: number;
  startDate: string;
  isActive?: boolean;
  cycleDays: number;
}

const InvestmentAnimation = ({ 
  amount = 0, 
  dailyRoi = 0, 
  startDate = new Date().toISOString(), 
  isActive = true,
  cycleDays = 60
}: InvestmentAnimationProps) => {
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [cycleCompleted, setCycleCompleted] = useState(false);

  useEffect(() => {
    if (!isActive || !amount || !dailyRoi) return;

    // Calculer les gains actuels basés sur le temps écoulé
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const totalDuration = cycleDays * 24 * 60 * 60 * 1000; // Durée totale du cycle en millisecondes
    const cycleEndTime = start + totalDuration;
    
    // Vérifier si le cycle est terminé
    const isCycleCompleted = now >= cycleEndTime;
    setCycleCompleted(isCycleCompleted);
    
    // Calculer les jours écoulés, plafonnés à cycleDays
    const daysElapsed = Math.min(
      Math.floor((now - start) / (1000 * 60 * 60 * 24)),
      cycleDays
    );
    
    const dailyReturn = amount * (dailyRoi / 100);
    
    // Mettre à jour les gains toutes les secondes
    const interval = setInterval(() => {
      if (isCycleCompleted) {
        // Si le cycle est terminé, afficher les gains finaux
        const finalEarnings = dailyReturn * cycleDays;
        setCurrentEarnings(finalEarnings);
        setTimeLeft('Investissement terminé');
      } else {
        const currentTime = new Date().getTime();
        // Calculer les secondes dans le jour actuel
        const secondsInDay = (currentTime - start) % (1000 * 60 * 60 * 24) / 1000;
        // Calculer le rendement du jour en fonction des secondes écoulées
        const todayReturn = (dailyReturn * secondsInDay) / (24 * 60 * 60);
        // Calculer les gains totaux
        const totalEarnings = (dailyReturn * daysElapsed) + todayReturn;
        setCurrentEarnings(Math.max(0, totalEarnings));

        // Calculer le temps restant jusqu'à la fin du cycle
        const timeRemaining = cycleEndTime - currentTime;
        
        if (timeRemaining <= 0) {
          setTimeLeft('Investissement terminé');
          setCycleCompleted(true);
        } else {
          const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
          setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [amount, dailyRoi, startDate, isActive, cycleDays]);

  const formatAmount = (value: number) => {
    return Math.max(0, value).toLocaleString('fr-FR');
  };

  return (
    <div className="space-y-4">
      {/* Animation de l'arbre d'investissement avec gains */}
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

        {/* Overlay avec les gains et le compte à rebours */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <div className="text-center text-white">
            <div className="text-2xl font-bold mb-2">
              +{formatAmount(currentEarnings)} FCFA
            </div>
            <div className="text-sm font-medium px-3 py-1 bg-blue-600 rounded-full">
              {timeLeft}
            </div>
            {cycleCompleted && (
              <div className="mt-2 text-sm font-medium px-3 py-1 bg-red-600 rounded-full">
                Cycle terminé
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques de l'investissement */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Gain quotidien</p>
            <p className="text-lg font-bold text-green-600">
              {formatAmount(amount * (dailyRoi / 100))} FCFA
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gain total estimé</p>
            <p className="text-lg font-bold text-blue-600">
              {formatAmount(amount * (dailyRoi / 100) * cycleDays)} FCFA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentAnimation;
