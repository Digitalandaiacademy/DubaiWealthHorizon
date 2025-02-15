import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { Search, TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface Investment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: string;
  created_at: string;
  last_roi_date: string;
  profiles: {
    full_name: string;
    email: string;
  };
  investment_plans: {
    name: string;
    daily_roi: number;
  };
}

const AdminInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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

      if (error) throw error;
      console.log('Investments loaded:', data); // Pour déboguer
      setInvestments(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des investissements:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateInvestmentStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_investments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setInvestments(investments.map(inv => 
        inv.id === id 
          ? { ...inv, status: newStatus }
          : inv
      ));

      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error(error.message);
    }
  };

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = (
      inv.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.investment_plans.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return statusFilter === 'all' 
      ? matchesSearch 
      : matchesSearch && inv.status === statusFilter;
  });

  const calculateTotalROI = (investment: Investment) => {
    const dailyROI = (investment.amount * investment.investment_plans.daily_roi) / 100;
    return dailyROI.toLocaleString('fr-FR');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Investissements</h1>
        
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investisseur
                  </th>
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
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvestments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {investment.profiles.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {investment.profiles.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {investment.investment_plans.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {investment.investment_plans.daily_roi}% / jour
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {investment.amount.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateTotalROI(investment)} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Créé le: {new Date(investment.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Dernier ROI: {investment.last_roi_date 
                              ? new Date(investment.last_roi_date).toLocaleDateString('fr-FR')
                              : 'Aucun'
                            }
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${investment.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : investment.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {investment.status === 'active'
                          ? 'Actif'
                          : investment.status === 'completed'
                          ? 'Terminé'
                          : 'Annulé'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        value={investment.status}
                        onChange={(e) => updateInvestmentStatus(investment.id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="active">Actif</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvestments;
