import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronUp, Search, Users, Award } from 'lucide-react';

interface Investment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: string;
  status: string;
  created_at: string;
  transaction_id: string;
  profiles: {
    full_name: string;
    email: string;
    referral_code: string;
    referred_by: string | null;
  };
  investment_plans: {
    name: string;
    daily_roi: number;
  };
}

interface UserData {
  user: {
    full_name: string;
    email: string;
    referral_code: string;
    referred_by: string | null;
  };
  investments: Investment[];
  totalAmount: number;
  totalReturns: number;
  totalWithdrawn: number;
  availableBalance: number;
  referralInfo: {
    referralCode: string;
    referredBy: string | null;
    referralCount: number;
    totalCommission: number;
    referralsList: ReferralUser[];
  };
}

interface ReferralUser {
  id: string;
  full_name: string;
  email: string;
  level: number;
  is_active: boolean;
  total_investment: number;
  total_commission: number;
}

interface GroupedInvestments {
  [key: string]: UserData;
}

interface Transaction {
  user_id: string;
  amount: number;
  type: string;
  status: string;
}

interface ReferralStatus {
  referrer_id: string;
  referred_id: string;
  level: number;
  total_commission: number;
  is_active: boolean;
  referred: {
    id: string;
    full_name: string;
    email: string;
  };
}

const AdminInvestments = () => {
  const [groupedInvestments, setGroupedInvestments] = useState<GroupedInvestments>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [expandedReferrals, setExpandedReferrals] = useState<Set<string>>(new Set());

  const calculateReturns = (investment: Investment) => {
    const startDate = new Date(investment.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Récupérer les informations du plan pour obtenir cycle_days
    // Par défaut, utiliser 60 jours si cycle_days n'est pas disponible
    const cycleDays = 60; // Valeur par défaut
    
    // Limiter les jours écoulés au nombre de jours du cycle
    const cappedDays = Math.min(daysDiff, cycleDays);
    
    const dailyReturn = (parseInt(investment.amount) * investment.investment_plans.daily_roi) / 100;
    return Math.floor(dailyReturn * cappedDays);
  };

  useEffect(() => {
    loadInvestments();
    const interval = setInterval(loadInvestments, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('user_investments')
        .select(`
          *,
          profiles (
            full_name,
            email,
            referral_code,
            referred_by
          ),
          investment_plans (
            name,
            daily_roi
          )
        `)
        .order('created_at', { ascending: false });

      if (investmentsError) throw investmentsError;

      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('transactions')
        .select('*')
        .in('type', ['withdrawal'])
        .eq('status', 'completed');

      if (withdrawalsError) throw withdrawalsError;
      
      // Load referral data with referred user details
      const { data: referralStatusData, error: referralError } = await supabase
        .from('referral_status')
        .select(`
          *,
          referred:referred_id (
            id,
            full_name,
            email
          )
        `);
        
      if (referralError) throw referralError;
      
      // Process referral data
      const referralsByUser: {[key: string]: {
        count: number, 
        commission: number,
        referrals: ReferralUser[]
      }} = {};
      
      referralStatusData?.forEach((status: ReferralStatus) => {
        if (!referralsByUser[status.referrer_id]) {
          referralsByUser[status.referrer_id] = { 
            count: 0, 
            commission: 0,
            referrals: []
          };
        }
        
        referralsByUser[status.referrer_id].count += 1;
        referralsByUser[status.referrer_id].commission += status.total_commission || 0;
        
        // Add referred user details to the list
        if (status.referred) {
          referralsByUser[status.referrer_id].referrals.push({
            id: status.referred_id,
            full_name: status.referred.full_name || 'Utilisateur inconnu',
            email: status.referred.email || 'Email inconnu',
            level: status.level,
            is_active: status.is_active,
            total_investment: 0, // Will be updated later if available
            total_commission: status.total_commission || 0
          });
        }
      });

      const grouped = (investmentsData || []).reduce((acc: GroupedInvestments, inv: Investment) => {
        if (!acc[inv.user_id]) {
          acc[inv.user_id] = {
            user: {
              full_name: inv.profiles?.full_name || 'N/A',
              email: inv.profiles?.email || 'N/A',
              referral_code: inv.profiles?.referral_code || 'N/A',
              referred_by: inv.profiles?.referred_by || null
            },
            investments: [],
            totalAmount: 0,
            totalReturns: 0,
            totalWithdrawn: 0,
            availableBalance: 0,
            referralInfo: {
              referralCode: inv.profiles?.referral_code || 'N/A',
              referredBy: inv.profiles?.referred_by || null,
              referralCount: referralsByUser[inv.user_id]?.count || 0,
              totalCommission: referralsByUser[inv.user_id]?.commission || 0,
              referralsList: referralsByUser[inv.user_id]?.referrals || []
            }
          };
        }
        acc[inv.user_id].investments.push(inv);
        acc[inv.user_id].totalAmount += parseInt(inv.amount);
        if (inv.status === 'active') {
          acc[inv.user_id].totalReturns += calculateReturns(inv);
        }
        return acc;
      }, {});

      // Update investment amounts for referrals
      Object.values(grouped).forEach(userData => {
        // For each user's referrals, update their investment amount if they exist in our grouped data
        userData.referralInfo.referralsList.forEach(referral => {
          if (grouped[referral.id]) {
            referral.total_investment = grouped[referral.id].totalAmount;
          }
        });
      });

      (withdrawalsData || []).forEach((withdrawal: Transaction) => {
        if (grouped[withdrawal.user_id]) {
          grouped[withdrawal.user_id].totalWithdrawn += withdrawal.amount;
        }
      });

      Object.values(grouped).forEach((userData) => {
        userData.availableBalance = userData.totalReturns - userData.totalWithdrawn;
      });

      setGroupedInvestments(grouped);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement des investissements");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpansion = (userId: string) => {
    const newExpandedUsers = new Set(expandedUsers);
    if (newExpandedUsers.has(userId)) {
      newExpandedUsers.delete(userId);
    } else {
      newExpandedUsers.add(userId);
    }
    setExpandedUsers(newExpandedUsers);
  };

  const toggleReferralsExpansion = (userId: string) => {
    const newExpandedReferrals = new Set(expandedReferrals);
    if (newExpandedReferrals.has(userId)) {
      newExpandedReferrals.delete(userId);
    } else {
      newExpandedReferrals.add(userId);
    }
    setExpandedReferrals(newExpandedReferrals);
  };

  const filteredInvestments = Object.entries(groupedInvestments).filter(([_, data]) => {
    const matchesSearch = data.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    return matchesSearch && data.investments.some(inv => inv.status === statusFilter);
  });

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Investissements</h1>
        <button
          onClick={loadInvestments}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Rafraîchir
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un investisseur..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="completed">Terminé</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvestments.map(([userId, data]) => (
            <div key={userId} className="bg-white rounded-lg shadow overflow-hidden">
              <div 
                className="bg-gray-50 px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleUserExpansion(userId)}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {expandedUsers.has(userId) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {data.user.full_name}
                        </h2>
                        <p className="text-sm text-gray-500">{data.user.email}</p>
                      </div>
                    </div>
                    
                    {/* Referral badge */}
                    {data.referralInfo.referralCount > 0 && (
                      <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        <Award className="h-4 w-4 mr-1" />
                        <span>{data.referralInfo.referralCount} filleuls</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500">Total investi</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {data.totalAmount.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500">Gains totaux</p>
                      <p className="text-lg font-semibold text-green-600">
                        {data.totalReturns.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500">Total retiré</p>
                      <p className="text-lg font-semibold text-red-600">
                        {data.totalWithdrawn.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500">Solde disponible</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {data.availableBalance.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500">Commission parrainage</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {data.referralInfo.totalCommission.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedUsers.has(userId) && (
                <div className="overflow-x-auto transition-all duration-300 ease-in-out">
                  {/* Informations de parrainage */}
                  <div className="p-4 bg-blue-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-blue-800">Informations de Parrainage</h3>
                      
                      {data.referralInfo.referralCount > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReferralsExpansion(userId);
                          }}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          {expandedReferrals.has(userId) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Masquer les filleuls
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Voir les filleuls
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-500">Code de parrainage</p>
                        <p className="text-base font-medium">{data.referralInfo.referralCode}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-500">Nombre de filleuls</p>
                        <p className="text-base font-medium">{data.referralInfo.referralCount}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-500">Commission totale</p>
                        <p className="text-base font-medium text-purple-600">
                          {data.referralInfo.totalCommission.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </div>
                    
                    {data.referralInfo.referredBy && (
                      <div className="bg-white p-4 rounded-lg shadow mb-4">
                        <p className="text-sm text-gray-500">Parrainé par</p>
                        <p className="text-base font-medium">{data.referralInfo.referredBy}</p>
                      </div>
                    )}
                    
                    {/* Liste des filleuls */}
                    {expandedReferrals.has(userId) && data.referralInfo.referralsList.length > 0 && (
                      <div className="mt-4 overflow-x-auto">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Liste des filleuls</h4>
                        <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investissement</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {data.referralInfo.referralsList.map((referral) => (
                              <tr key={referral.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{referral.full_name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{referral.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    referral.level === 1 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    Niveau {referral.level}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    referral.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {referral.is_active ? 'Actif' : 'Inactif'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {referral.total_investment.toLocaleString('fr-FR')} FCFA
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                                  {referral.total_commission.toLocaleString('fr-FR')} FCFA
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  
                  {/* Investissements */}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ROI Quotidien
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gains
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.investments.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {inv.investment_plans?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ROI: {inv.investment_plans?.daily_roi || 0}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {parseInt(inv.amount).toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {((parseInt(inv.amount) * inv.investment_plans.daily_roi) / 100).toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {inv.status === 'active' ? calculateReturns(inv).toLocaleString('fr-FR') + ' FCFA' : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {inv.transaction_id || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${inv.status === 'active' ? 'bg-green-100 text-green-800' : 
                                inv.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {inv.status === 'active' ? 'Actif' :
                               inv.status === 'completed' ? 'Terminé' : 
                               inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInvestments;
