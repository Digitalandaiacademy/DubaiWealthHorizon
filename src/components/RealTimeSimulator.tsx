import React, { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';

interface Investment {
  name: string;
  amount: number;
  plan: string;
  timestamp: Date;
}

const names = [
  'Jean', 'Marie', 'Pierre', 'Sophie', 'Lucas', 'Emma', 'Thomas', 'Julie', 'Nicolas', 'Laura',
  'Alexandre', 'Sarah', 'Mohammed', 'Fatima', 'John', 'Maria', 'David', 'Anna', 'Carlos', 'Yuki',
  'Aïcha', 'Abdoulaye', 'Aminata', 'Boubacar', 'Chantal', 'Djamila', 'El Hadj', 'Fanta', 'Ibrahima', 'Kadiatou',
  'Mamadou', 'Nafissatou', 'Oumar', 'Ramatoulaye', 'Sékou', 'Tidiane', 'Zainab', 'Yacouba', 'Ousmane', 'Awa',
  'Bintou', 'Cheick', 'Diarra', 'Fadel', 'Habib', 'Ismaël', 'Kadija', 'Lamine', 'Maimouna', 'Néné',
  'Pape', 'Rokhaya', 'Samba', 'Téné', 'Waly', 'Youssouf', 'Zalika', 'Adama', 'Bakary', 'Coumba',
  'Daouda', 'Faty', 'Gora', 'Hawa', 'Idrissa', 'Jelila', 'Kader', 'Lalla', 'Moussa', 'Nafi',
  'Ousmane', 'Penda', 'Rama', 'Saliou', 'Tahirou', 'Umar', 'Véronique', 'Wade', 'Yacine', 'Zara','Dupont', 'Laurent', 'Martin', 'Bernard', 'Dubois', 'Petit', 'Moreau', 'Leroy', 'Roux', 'Michel',
  'Chen', 'Al-Rashid', 'Hassan', 'Smith', 'Garcia', 'Kim', 'Kowalski', 'Rodriguez', 'Tanaka', 'Sow',
  'Diallo', 'Traoré', 'Keita', 'Cissé', 'Ba', 'Ndiaye', 'Diop', 'Fall', 'Gueye', 'Kane',
  'Sy', 'Mbaye', 'Diagne', 'Camara', 'Sarr', 'Thiam', 'Touré', 'Niang', 'Bâ', 'Diakhaté',
  'Faye', 'Mendy', 'Sane', 'Diaw', 'Sakho', 'Diouf', 'Ly', 'Badiane', 'Gassama', 'Coly',
  'Ndao', 'Sagna', 'Mané', 'Samb', 'Dione', 'Diatta', 'Sène', 'Gning', 'Diédhiou', 'Sall',
  'Ndour', 'Diouf', 'Gaye', 'Ndiaye', 'Sow', 'Diallo', 'Traoré', 'Keita', 'Cissé', 'Ba',
  'Ndiaye', 'Diop', 'Fall', 'Gueye', 'Kane', 'Sy', 'Mbaye', 'Diagne', 'Camara', 'Sarr',
  'Thiam', 'Touré', 'Niang', 'Bâ', 'Diakhaté', 'Faye', 'Mendy', 'Sane', 'Diaw', 'Sakho',
  'Diouf', 'Ly', 'Badiane', 'Gassama', 'Coly', 'Ndao', 'Sagna', 'Mané', 'Samb', 'Dione',
  'Diatta', 'Sène', 'Gning', 'Diédhiou', 'Sall', 'Ndour', 'Diouf', 'Gaye', 'Ndiaye', 'Sow',
  'Diallo', 'Traoré', 'Keita', 'Cissé', 'Ba', 'Ndiaye', 'Diop', 'Fall', 'Gueye', 'Kane',
  'Sy', 'Mbaye', 'Diagne', 'Camara', 'Sarr', 'Thiam', 'Touré', 'Niang', 'Bâ', 'Diakhaté',
  'Faye', 'Mendy'
];

const plans = [
  'Plan Bronze', 'Plan Argent', 'Plan Or', 'Plan Platine', 'Plan Saphir',
  'Plan Émeraude', 'Plan Rubis', 'Plan Diamant', 'Plan Royal', 'Plan Impérial',
  'Plan Légendaire', 'Plan Suprême'
];

const amounts = [5000, 7500, 10000, 12500, 15000, 20000, 25000, 50000, 100000, 250000, 500000, 750000];

const RealTimeSimulator = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [totalInvested, setTotalInvested] = useState(100000000); // Starting at 100M FCFA

  useEffect(() => {
    // Generate initial investments
    const initialInvestments = Array.from({ length: 5 }, () => generateInvestment());
    setInvestments(initialInvestments);

    // Add new investment every 3-7 seconds
    const interval = setInterval(() => {
      const newInvestment = generateInvestment();
      setInvestments(prev => [newInvestment, ...prev.slice(0, 4)]);
      setTotalInvested(prev => prev + newInvestment.amount);
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(interval);
  }, []);

  const generateInvestment = (): Investment => ({
    name: names[Math.floor(Math.random() * names.length)],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    plan: plans[Math.floor(Math.random() * plans.length)],
    timestamp: new Date()
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Investissements en Direct</h3>
        <div className="flex items-center text-blue-600">
          <DollarSign className="h-6 w-6 mr-2" />
          <span className="text-2xl font-bold">{totalInvested.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {investments.map((investment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-fade-in"
          >
            <div>
              <p className="font-semibold text-gray-900">{investment.name}</p>
              <p className="text-sm text-gray-500">{investment.plan}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600">{investment.amount.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-xs text-gray-500">
                {new Date(investment.timestamp).toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeSimulator;