import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpCircle, TrendingUp, DollarSign } from 'lucide-react';

interface InvestmentStatsProps {
  investment: {
    amount: number;
    dailyRoi: number;
    startDate: string;
  };
}

const InvestmentStats = ({ investment }: InvestmentStatsProps) => {
  const { amount, dailyRoi, startDate } = investment;
  const dailyReturn = amount * (dailyRoi / 100);

  // Générer les données pour le graphique
  const generateChartData = () => {
    const data = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      
      data.push({
        day: i + 1,
        amount: amount + (dailyReturn * i),
        return: dailyReturn * i
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-8">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Capital Initial</p>
              <p className="text-2xl font-bold text-gray-900">
                {amount.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ROI Quotidien</p>
              <p className="text-2xl font-bold text-gray-900">
                {dailyRoi}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rendement Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {(dailyReturn * 90).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique de progression */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Progression de l'Investissement
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `${value.toLocaleString('fr-FR')} FCFA`}
                labelFormatter={(label: number) => `Jour ${label}`}
              />
              <Bar dataKey="amount" name="Capital Total" fill="#3B82F6" />
              <Bar dataKey="return" name="Rendement" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InvestmentStats;