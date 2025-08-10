import React from 'react';
import { X, CheckCircle, Hourglass, XCircle, Calendar, DollarSign, Tag, Info, Phone } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  type: 'investment' | 'return' | 'withdrawal' | 'referral' | 'commission_withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  description?: string;
  payment_details?: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    cryptoAddress?: string;
    paymentMethod?: string;
    paymentCategory?: string;
  };
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Détails de la Transaction</h2>
          <div className="flex items-center justify-center space-x-2 text-gray-700">
            {statusIcons[transaction.status]}
            <span className="font-medium text-lg capitalize">{transaction.status === 'completed' ? 'Complété' : transaction.status === 'pending' ? 'En attente' : 'Échoué'}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Tag className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{getTypeLabel(transaction.type)}</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Montant</p>
              <p className={`font-medium ${amountColor}`}>
                {transaction.amount.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
          
          {(transaction.type === 'withdrawal' || transaction.type === 'commission_withdrawal') && (
            <>
              {transaction.payment_details?.fullName && (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Tag className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium">{transaction.payment_details.fullName}</p>
                  </div>
                </div>
              )}
              
              {transaction.payment_details?.phoneNumber && (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Numéro de téléphone</p>
                    <p className="font-medium">{transaction.payment_details.phoneNumber}</p>
                  </div>
                </div>
              )}
              
              {transaction.payment_details?.email && (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Tag className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-sm break-all">{transaction.payment_details.email}</p>
                  </div>
                </div>
              )}
              
              {transaction.payment_details?.cryptoAddress && (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Tag className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Adresse crypto</p>
                    <p className="font-medium text-sm break-all">{transaction.payment_details.cryptoAddress}</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(transaction.created_at)}</p>
            </div>
          </div>
          
          {transaction.description && (
            <div className="flex items-start p-4 bg-gray-50 rounded-lg">
              <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium break-words">{transaction.description}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="h-5 w-5 text-gray-500 mr-3">#</div>
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium text-sm break-all">{transaction.id}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" 
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
