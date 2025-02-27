import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

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
  };
  investments: Investment[];
  totalAmount: number;
  totalReturns: number;
  totalWithdrawn: number;
  availableBalance: number;
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

const AdminInvestments = () => {
  const [groupedInvestments, setGroupedInvestments] = useState<GroupedInvestments>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const calculateReturns = (investment: Investment) => {
    const startDate = new Date(investment.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyReturn = (parseInt(investment.amount) * investment.investment_plans.daily_roi) / 100;
    return Math.floor(dailyReturn * daysDiff);
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
            email
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

      const grouped = (investmentsData || []).reduce((acc: GroupedInvestments, inv: Investment) => {
        if (!acc[inv.user_id]) {
          acc[inv.user_id] = {
            user: {
              full_name: inv.profiles?.full_name || 'N/A',
              email: inv.profiles?.email || 'N/A'
            },
            investments: [],
            totalAmount: 0,
            totalReturns: 0,
            totalWithdrawn: 0,
            availableBalance: 0
          };
        }
        acc[inv.user_id].investments.push(inv);
        acc[inv.user_id].totalAmount += parseInt(inv.amount);
        if (inv.status === 'active') {
          acc[inv.user_id].totalReturns += calculateReturns(inv);
        }
        return acc;
      }, {});

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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  </div>
                </div>
              </div>
              
              {expandedUsers.has(userId) && (
                <div className="overflow-x-auto transition-all duration-300 ease-in-out">
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
