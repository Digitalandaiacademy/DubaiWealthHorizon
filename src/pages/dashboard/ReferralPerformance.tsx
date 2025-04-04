import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useReferralStore } from '../../store/referralStore';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  DollarSign,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react';
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

interface ReferralPerformanceData {
  monthlyCommissions: any[];
  referralsByLevel: any[];
  topReferrals: any[];
  conversionRate: number;
  totalEarnings: number;
  activeReferrals: number;
  totalReferrals: number;
}

const ReferralPerformance = () => {
  const { profile } = useAuthStore();
  const { referrals, referralsByLevel, loadReferrals, totalCommission } = useReferralStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<ReferralPerformanceData>({
    monthlyCommissions: [],
    referralsByLevel: [],
    topReferrals: [],
    conversionRate: 0,
    totalEarnings: 0,
    activeReferrals: 0,
    totalReferrals: 0
  });
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [showTips, setShowTips] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await loadReferrals();
      
      // Generate performance analytics
      generatePerformanceData();
    } catch (error) {
      console.error('Error loading referral performance data:', error);
      setError('Erreur lors du chargement des données de performance');
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceData = () => {
    // 1. Monthly commissions
    const monthlyData = generateMonthlyCommissions();
    
    // 2. Referrals by level
    const levelData = generateReferralsByLevel();
    
    // 3. Top referrals
    const topReferralsData = generateTopReferrals();
    
    // 4. Calculate conversion rate
    const conversionRate = calculateConversionRate();
    
    // 5. Count active referrals
    const activeReferralsCount = referrals.filter(ref => ref.is_active).length;
    
    setPerformanceData({
      monthlyCommissions: monthlyData,
      referralsByLevel: levelData,
      topReferrals: topReferralsData,
      conversionRate,
      totalEarnings: totalCommission || 0,
      activeReferrals: activeReferralsCount,
      totalReferrals: referrals.length
    });
  };

  const generateMonthlyCommissions = () => {
    const now = new Date();
    const data = [];
    
    // Determine number of months to show based on timeRange
    let monthsToShow = 3;
    if (timeRange === 'quarter') monthsToShow = 6;
    if (timeRange === 'year') monthsToShow = 12;
    
    // Group referrals by month
    const monthlyCommissions: Record<string, number> = {};
    
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      monthlyCommissions[monthYear] = 0;
    }
    
    // Calculate commissions for each month
    referrals.forEach(referral => {
      if (referral.last_investment_date) {
        const date = new Date(referral.last_investment_date);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        
        if (monthlyCommissions[monthYear] !== undefined) {
          monthlyCommissions[monthYear] += referral.total_commission || 0;
        }
      }
    });
    
    // Convert to array for chart
    Object.entries(monthlyCommissions).forEach(([month, commission]) => {
      data.push({
        month,
        commission: Math.round(commission)
      });
    });
    
    // Reverse to show chronological order
    return data.reverse();
  };

  const generateReferralsByLevel = () => {
    const level1Count = referralsByLevel[1]?.length || 0;
    const level2Count = referralsByLevel[2]?.length || 0;
    
    const level1Active = referralsByLevel[1]?.filter(ref => ref.is_active).length || 0;
    const level2Active = referralsByLevel[2]?.filter(ref => ref.is_active).length || 0;
    
    const level1Commission = referralsByLevel[1]?.reduce((sum, ref) => sum + (ref.total_commission || 0), 0) || 0;
    const level2Commission = referralsByLevel[2]?.reduce((sum, ref) => sum + (ref.total_commission || 0), 0) || 0;
    
    return [
      { name: 'Niveau 1', count: level1Count, active: level1Active, commission: level1Commission },
      { name: 'Niveau 2', count: level2Count, active: level2Active, commission: level2Commission }
    ];
  };

  const generateTopReferrals = () => {
    // Get top 5 referrals by commission
    return [...referrals]
      .sort((a, b) => (b.total_commission || 0) - (a.total_commission || 0))
      .slice(0, 5)
      .map(ref => ({
        name: ref.referred?.full_name || 'Utilisateur',
        commission: ref.total_commission || 0,
        level: ref.level
      }));
  };

  const calculateConversionRate = () => {
    const activeCount = referrals.filter(ref => ref.is_active).length;
    return referrals.length > 0 ? (activeCount / referrals.length) * 100 : 0;
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
          onClick={loadData}
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
        <h1 className="text-2xl font-bold text-gray-900">Performance de Parrainage</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            3 mois
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            6 mois
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
            onClick={loadData}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Filleuls</p>
              <p className="text-xl font-bold text-gray-900">{performanceData.totalReferrals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Commissions Totales</p>
              <p className="text-xl font-bold text-green-600">{formatAmount(performanceData.totalEarnings)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Award className="h-6 w-6 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Taux de Conversion</p>
              <p className="text-xl font-bold text-purple-600">{performanceData.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Commission Moyenne</p>
              <p className="text-xl font-bold text-orange-600">
                {performanceData.totalReferrals > 0 
                  ? formatAmount(performanceData.totalEarnings / performanceData.totalReferrals)
                  : '0 FCFA'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Commissions Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Évolution des Commissions</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performanceData.monthlyCommissions}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
              <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Commission']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="commission" 
                name="Commission mensuelle" 
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
        {/* Referrals by Level */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Filleuls par Niveau</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData.referralsByLevel}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="Total" fill="#0088FE" />
                <Bar yAxisId="left" dataKey="active" name="Actifs" fill="#00C49F" />
                <Bar yAxisId="right" dataKey="commission" name="Commission" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Referrals */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Award className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Top 5 Filleuls</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData.topReferrals}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${value.toLocaleString()}`} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Commission']} />
                <Legend />
                <Bar dataKey="commission" name="Commission" fill="#8884d8">
                  {performanceData.topReferrals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tips for Improving Referral Performance */}
      {showTips && (
        <div className="bg-blue-50 rounded-lg shadow p-6 relative">
          <button 
            onClick={() => setShowTips(false)}
            className="absolute top-4 right-4 text-blue-500 hover:text-blue-700"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center mb-4">
            <Share2 className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-blue-900">Conseils pour Améliorer vos Performances</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                <span className="block h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Partagez sur les Réseaux Sociaux</h3>
                <p className="text-blue-700 text-sm">Utilisez vos plateformes sociales pour partager votre lien de parrainage avec une explication des avantages.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                <span className="block h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Créez du Contenu Éducatif</h3>
                <p className="text-blue-700 text-sm">Expliquez les avantages de l'investissement et comment votre lien de parrainage peut aider.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                <span className="block h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Suivez vos Performances</h3>
                <p className="text-blue-700 text-sm">Analysez quelles méthodes de partage fonctionnent le mieux et concentrez-vous sur celles-ci.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                <span className="block h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</span>
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Accompagnez vos Filleuls</h3>
                <p className="text-blue-700 text-sm">Aidez vos filleuls à démarrer pour augmenter leur taux de conversion et vos commissions.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralPerformance;