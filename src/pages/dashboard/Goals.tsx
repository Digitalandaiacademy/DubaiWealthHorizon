import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useInvestmentStore } from '../../store/investmentStore';
import { useTransactionStore } from '../../store/transactionStore';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash, 
  AlertTriangle,
  RefreshCw,
  X,
  DollarSign,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: 'investment' | 'earnings' | 'referral' | 'other';
  status: 'active' | 'completed' | 'failed';
  created_at: string;
}

const Goals = () => {
  const { profile } = useAuthStore();
  const { userInvestments } = useInvestmentStore();
  const { totalReceived } = useTransactionStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: 0,
    deadline: '',
    category: 'earnings'
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setGoals(data || []);
      
      // Update goal progress
      updateGoalProgress(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      setError('Erreur lors du chargement des objectifs');
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (currentGoals: Goal[]) => {
    try {
      // Calculate current amounts for each goal
      const updatedGoals = currentGoals.map(goal => {
        let currentAmount = 0;
        
        switch (goal.category) {
          case 'investment':
            // Sum of all investments
            currentAmount = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
            break;
          case 'earnings':
            // Total earnings
            currentAmount = totalReceived;
            break;
          case 'referral':
            // Referral commissions - would need to be calculated from referral store
            // For now, keep the existing value
            currentAmount = goal.current_amount;
            break;
          default:
            currentAmount = goal.current_amount;
        }
        
        // Check if goal is completed
        const status = currentAmount >= goal.target_amount 
          ? 'completed' 
          : (goal.deadline && new Date(goal.deadline) < new Date()) 
            ? 'failed' 
            : 'active';
        
        return {
          ...goal,
          current_amount: currentAmount,
          status
        };
      });
      
      // Update goals in database
      for (const goal of updatedGoals) {
        if (
          goal.current_amount !== currentGoals.find(g => g.id === goal.id)?.current_amount ||
          goal.status !== currentGoals.find(g => g.id === goal.id)?.status
        ) {
          await supabase
            .from('user_goals')
            .update({
              current_amount: goal.current_amount,
              status: goal.status
            })
            .eq('id', goal.id);
        }
      }
      
      setGoals(updatedGoals);
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.title) {
        toast.error('Veuillez entrer un titre pour l\'objectif');
        return;
      }
      
      if (formData.target_amount <= 0) {
        toast.error('Le montant cible doit être supérieur à 0');
        return;
      }
      
      const newGoal = {
        user_id: profile?.id,
        title: formData.title,
        target_amount: formData.target_amount,
        current_amount: 0,
        deadline: formData.deadline || null,
        category: formData.category,
        status: 'active'
      };
      
      if (editingGoalId) {
        // Update existing goal
        const { error } = await supabase
          .from('user_goals')
          .update(newGoal)
          .eq('id', editingGoalId);
        
        if (error) throw error;
        
        toast.success('Objectif mis à jour avec succès');
      } else {
        // Add new goal
        const { error } = await supabase
          .from('user_goals')
          .insert(newGoal);
        
        if (error) throw error;
        
        toast.success('Objectif ajouté avec succès');
      }
      
      // Reset form and reload goals
      setFormData({
        title: '',
        target_amount: 0,
        deadline: '',
        category: 'earnings'
      });
      setShowAddForm(false);
      setEditingGoalId(null);
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'objectif');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount,
      deadline: goal.deadline || '',
      category: goal.category
    });
    setEditingGoalId(goal.id);
    setShowAddForm(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
      
      toast.success('Objectif supprimé avec succès');
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Erreur lors de la suppression de l\'objectif');
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Aucune';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'investment':
        return 'Investissement';
      case 'earnings':
        return 'Gains';
      case 'referral':
        return 'Parrainage';
      default:
        return 'Autre';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'investment':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'earnings':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'referral':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Atteint
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Échoué
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            En cours
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes Objectifs Financiers</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingGoalId(null);
              setFormData({
                title: '',
                target_amount: 0,
                deadline: '',
                category: 'earnings'
              });
            }}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showAddForm ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Annuler
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Nouvel Objectif
              </>
            )}
          </button>
          <button
            onClick={loadGoals}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p className="font-medium">{error}</p>
          </div>
          <button 
            onClick={loadGoals}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Add/Edit Goal Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingGoalId ? 'Modifier l\'objectif' : 'Ajouter un nouvel objectif'}
          </h2>
          
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de l'objectif
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Atteindre 100,000 FCFA de gains"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="earnings">Gains</option>
                <option value="investment">Investissement</option>
                <option value="referral">Parrainage</option>
                <option value="other">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant cible (FCFA)
              </label>
              <input
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 100000"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date limite (optionnel)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingGoalId ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun objectif défini</h3>
          <p className="text-gray-600 mb-4">
            Définissez des objectifs financiers pour suivre votre progression et rester motivé.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer mon premier objectif
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
            
            return (
              <div key={goal.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {getCategoryIcon(goal.category)}
                      <div className="ml-2">
                        <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-500">{getCategoryLabel(goal.category)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(goal.status)}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditGoal(goal)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Progression</span>
                      <span className="text-sm font-medium text-gray-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          goal.status === 'completed' ? 'bg-green-600' : 
                          goal.status === 'failed' ? 'bg-red-600' : 
                          'bg-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Montant actuel</p>
                      <p className="font-medium text-gray-900">{formatAmount(goal.current_amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Montant cible</p>
                      <p className="font-medium text-gray-900">{formatAmount(goal.target_amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date limite</p>
                      <p className="font-medium text-gray-900">{formatDate(goal.deadline)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;