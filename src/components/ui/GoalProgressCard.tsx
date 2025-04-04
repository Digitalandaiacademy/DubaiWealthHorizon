import React from 'react';
import { Target, Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface GoalProgressCardProps {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  status: 'active' | 'completed' | 'failed';
  category: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const GoalProgressCard: React.FC<GoalProgressCardProps> = ({
  title,
  targetAmount,
  currentAmount,
  deadline,
  status,
  category,
  onEdit,
  onDelete
}) => {
  const progress = Math.min(100, Math.round((currentAmount / targetAmount) * 100));
  
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Aucune';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };
  
  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    
    const deadline = new Date(dateString);
    const now = new Date();
    
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const daysRemaining = deadline ? getDaysRemaining(deadline) : null;
  
  const getStatusBadge = () => {
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
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Progression</span>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                status === 'completed' ? 'bg-green-600' : 
                status === 'failed' ? 'bg-red-600' : 
                'bg-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <p className="text-gray-500">Actuel</p>
            <p className="font-medium text-gray-900">{formatAmount(currentAmount)}</p>
          </div>
          <div>
            <p className="text-gray-500">Cible</p>
            <p className="font-medium text-gray-900">{formatAmount(targetAmount)}</p>
          </div>
        </div>
        
        {deadline && (
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-600">
              {daysRemaining && daysRemaining > 0 
                ? `${daysRemaining} jours restants` 
                : 'Date limite dépassée'}
            </span>
          </div>
        )}
        
        {(onEdit || onDelete) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
            {onEdit && (
              <button 
                onClick={onEdit}
                className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800"
              >
                Modifier
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete}
                className="px-3 py-1 text-xs text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalProgressCard;