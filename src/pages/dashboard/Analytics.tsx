import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useInvestmentStore } from '../../store/investmentStore';
import { useTransactionStore } from '../../store/transactionStore';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart2, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const Analytics = () => {
  const { profile } = useAuthStore();
  const { userInvestments, loadUserInvestments } = useInvestmentStore();
  const { transactions, loadTransactions } = useTransactionStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [dailyReturns, setDailyReturns] = useState<any[]>([]);
  const [investmentDistribution, setInvestmentDistribution] = useState<any[]>([]);
  const [returnsProjection, setReturnsProjection] = useState<any[]>([]);
  const [transactionsByType, setTransactionsByType] = useState<any[]>([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await Promise.all([
          loadUserInvestments(),
          loadTransactions()
        ]);
        
        generateAnalytics();
      } catch (error) {
        console.error('Error loading analytics data:', error);
        setError('Erreur lors du chargement des données analytiques');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [timeRange]);

  const generateAnalytics = () => {
    // 1. Daily Returns Chart
    generateDailyReturnsData();
    
    // 2. Investment Distribution by Plan
    generateInvestmentDistribution();
    
    // 3. Returns Projection
    generateReturnsProjection();
    
    // 4. Transactions by Type
    generateTransactionsByType();
  };

  const generateDailyReturnsData = () => {
    const now = new Date();
    const data = [];
    
    // Determine date range based on selected timeRange
    let daysToShow = 30;
    if (timeRange === 'week') daysToShow = 7;
    if (timeRange === 'year') daysToShow = 365;
    
    // Generate dates
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Calculate returns for this date
      let dailyReturn = 0;
      
      userInvestments.forEach(investment => {
        if (investment.status === 'active') {
          const investmentDate = new Date(investment.created_at);
          
          // Only count if investment was active on this date
          if (investmentDate <= date) {
            const daysSinceInvestment = Math.floor((date.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24));
            
            // Only count if within cycle days
            if (daysSinceInvestment < investment.cycle_days) {
              dailyReturn += (investment.amount * investment.plan.daily_roi) / 100;
            }
          }
        }
      });
      
      data.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        return: Math.round(dailyReturn)
      });
    }
    
    setDailyReturns(data);
  };

  const generateInvestmentDistribution = () => {
    // Group investments by plan
    const planTotals: Record<string, number> = {};
    
    userInvestments.forEach(investment => {
      const planName = investment.plan.name;
      planTotals[planName] = (planTotals[planName] || 0) + investment.amount;
    });
    
    // Convert to array for chart
    const data = Object.entries(planTotals).map(([name, value]) => ({
      name,
      value
    }));
    
    setInvestmentDistribution(data);
  };

  const generateReturnsProjection = () => {
    const now = new Date();
    const data = [];
    
    // Project returns for the next 12 months
    for (let i = 0; i <= 12; i++) {
      const projectionDate = new Date();
      projectionDate.setMonth(now.getMonth() + i);
      
      let projectedReturn = 0;
      
      userInvestments.forEach(investment => {
        if (investment.status === 'active') {
          const investmentDate = new Date(investment.created_at);
          const monthsSinceInvestment = i + ((now.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
          
          // Calculate returns up to the cycle end
          const cycleDurationMonths = investment.cycle_days / 30;
          if (monthsSinceInvestment < cycleDurationMonths) {
            // Full month of returns
            projectedReturn += (investment.amount * investment.plan.daily_roi * 30) / 100;
          } else if (monthsSinceInvestment - i < cycleDurationMonths) {
            // Partial month (until cycle ends)
            const daysRemaining = Math.max(0, investment.cycle_days - Math.floor((now.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24)));
            projectedReturn += (investment.amount * investment.plan.daily_roi * daysRemaining) / 100;
          }
        }
      });
      
      data.push({
        month: projectionDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        return: Math.round(projectedReturn)
      });
    }
    
    setReturnsProjection(data);
  };

  const generateTransactionsByType = () => {
    // Group transactions by type
    const typeTotals: Record<string, number> = {
      investment: 0,
      return: 0,
      withdrawal: 0,
      referral: 0,
      commission_withdrawal: 0
    };
    
    transactions.forEach(transaction => {
      if (transaction.status === 'completed') {
        typeTotals[transaction.type] = (typeTotals[transaction.type] || 0) + transaction.amount;
      }
    });
    
    // Convert to array for chart
    const data = Object.entries(typeTotals).map(([type, amount]) => {
      const typeLabels: Record<string, string> = {
        investment: 'Investissements',
        return: 'Rendements',
        withdrawal: 'Retraits',
        referral: 'Commissions',
        commission_withdrawal: 'Retraits de commission'
      };
      
      return {
        name: typeLabels[type] || type,
        amount
      };
    });
    
    setTransactionsByType(data);
  };

  const formatAmount = (value: number) => {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p className="font-medium">{error}</p>
        </div>
        <button 
          onClick={generateAnalytics}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analyse de Performance</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            30 jours
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            12 mois
          </button>
          <button
            onClick={generateAnalytics}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Daily Returns Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Rendements Quotidiens</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyReturns}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${value.toLocaleString()} FCFA`} />
              <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Rendement']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="return" 
                name="Rendement quotidien" 
                stroke="#3b82f6" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two charts in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Investment Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <PieChartIcon className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Répartition des Investissements</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {investmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Montant']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Transactions par Type</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={transactionsByType}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Montant']} />
                <Bar dataKey="amount" name="Montant" fill="#8884d8">
                  {transactionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Returns Projection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-orange-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Projection des Rendements (12 mois)</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={returnsProjection}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
              <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Rendement projeté']} />
              <Legend />
              <Bar 
                dataKey="return" 
                name="Rendement mensuel projeté" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          * Projection basée sur vos investissements actifs actuels et leurs cycles respectifs.
        </p>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Insights Financiers</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-700 mb-2">Meilleur Jour de Rendement</h3>
            <p className="text-lg font-bold">
              {dailyReturns.length > 0 
                ? formatAmount(Math.max(...dailyReturns.map(day => day.return)))
                : 'Aucune donnée'}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-700 mb-2">Plan le Plus Rentable</h3>
            <p className="text-lg font-bold">
              {investmentDistribution.length > 0
                ? investmentDistribution.sort((a, b) => b.value - a.value)[0].name
                : 'Aucune donnée'}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-700 mb-2">Rendement Moyen Quotidien</h3>
            <p className="text-lg font-bold">
              {dailyReturns.length > 0
                ? formatAmount(dailyReturns.reduce((sum, day) => sum + day.return, 0) / dailyReturns.length)
                : 'Aucune donnée'}
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-700 mb-2">Projection à 12 Mois</h3>
            <p className="text-lg font-bold">
              {returnsProjection.length > 0
                ? formatAmount(returnsProjection.reduce((sum, month) => sum + month.return, 0))
                : 'Aucune donnée'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;