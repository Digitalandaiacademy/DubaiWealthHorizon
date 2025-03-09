import React from 'react';
import { X, CheckCircle, Hourglass, XCircle } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  type: 'investment' | 'return' | 'withdrawal' | 'referral' | 'commission_withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  description?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, transaction, onClose }) => {
  if (!isOpen || !transaction) return null;

  const statusIcons = {
    completed: <CheckCircle className="h-6 w-6 text-green-600" />, 
    pending: <Hourglass className="h-6 w-6 text-yellow-600" />, 
    failed: <XCircle className="h-6 w-6 text-red-600" />
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      withdrawal: 'Retrait standard',
      commission_withdrawal: 'Retrait de commission',
      investment: 'Investissement',
      return: 'Rendement',
      referral: 'Commission parrainage'
    };
    return types[type] || 'Transaction';
  };

  const amountColor = transaction.type.includes('withdrawal') ? 'text-red-600' : 'text-green-600';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-96">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Détails de la Transaction</h2>
          <div className="flex items-center justify-center space-x-2 text-gray-700">
            {statusIcons[transaction.status]}
            <span className="font-medium text-lg capitalize">{transaction.status === 'completed' ? 'Complété' : transaction.status === 'pending' ? 'En attente' : 'Échoué'}</span>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <p className="text-gray-600"><strong>ID :</strong> {transaction.id}</p>
          <p className="text-gray-600"><strong>Type :</strong> {getTypeLabel(transaction.type)}</p>
          <p className={`${amountColor} text-lg font-semibold`}>
            <strong>Montant :</strong> {transaction.amount.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-gray-600"><strong>Date :</strong> {new Date(transaction.created_at).toLocaleString('fr-FR', { hour12: false })}</p>
          {transaction.description && <p className="text-gray-600"><strong>Description :</strong> {transaction.description}</p>}
        </div>
        
        <div className="mt-6 text-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
