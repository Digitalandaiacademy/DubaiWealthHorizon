import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  payment_method: string;
  withdrawal_info: {
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('pending');

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      console.log('Loading withdrawals...');
      
      // Récupérer les retraits
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false });

      console.log('Withdrawals query result:', { data: withdrawalsData, error: withdrawalsError });

      if (withdrawalsError) {
        console.error('Error loading withdrawals:', withdrawalsError);
        throw withdrawalsError;
      }

      // Afficher les détails des retraits en attente
      const pendingWithdrawals = withdrawalsData?.filter(w => w.status === 'pending') || [];
      console.log('Pending withdrawals:', {
        count: pendingWithdrawals.length,
        details: pendingWithdrawals
      });

      setWithdrawals(withdrawalsData || []);
    } catch (error: any) {
      console.error('Error in loadWithdrawals:', error);
      toast.error('Erreur lors du chargement des retraits: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id: string, status: 'completed' | 'failed') => {
    try {
      console.log('Starting withdrawal status update:', { id, status });

      // Vérifier d'abord si l'utilisateur est admin
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single();

      console.log('Admin check:', { user, profileData });
      
      // Mise à jour du statut
      const { data: updateData, error: updateError } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id)
        .select();

      console.log('Update response:', { updateData, updateError });

      if (updateError) {
        console.error('Error updating withdrawal:', updateError);
        throw updateError;
      }

      // Attendre un peu pour laisser le temps à la base de données de se mettre à jour
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier la mise à jour
      const { data: verifyData, error: verifyError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('id', id)
        .single();

      console.log('Verify response:', { 
        verifyData, 
        verifyError,
        expectedStatus: status,
        actualStatus: verifyData?.status,
        matches: verifyData?.status === status
      });

      if (verifyError) {
        console.error('Error verifying update:', verifyError);
        throw verifyError;
      }

      if (verifyData.status !== status) {
        console.error('Status mismatch:', {
          expected: status,
          actual: verifyData.status,
          fullData: verifyData
        });
        throw new Error('La mise à jour n\'a pas été effectuée correctement');
      }

      toast.success(`Retrait ${status === 'completed' ? 'validé' : 'refusé'} avec succès`);
      
      // Recharger immédiatement les retraits
      await loadWithdrawals();
    } catch (error: any) {
      console.error('Error in updateWithdrawalStatus:', error);
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    }
  };

  useEffect(() => {
    loadWithdrawals();
    // Mettre à jour toutes les 30 secondes
    const interval = setInterval(loadWithdrawals, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredWithdrawals = withdrawals.filter(w => 
    selectedStatus === 'all' ? true : w.status === selectedStatus
  );

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Retraits en Attente ({pendingCount})
        </h1>
        <p className="text-gray-600">
          {pendingCount === 0 ? 'Aucun retrait à traiter' : 
           pendingCount === 1 ? '1 retrait à traiter' : 
           `${pendingCount} retraits à traiter`}
        </p>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-md ${
              selectedStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-2 rounded-md ${
              selectedStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-4 py-2 rounded-md ${
              selectedStatus === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Validés
          </button>
          <button
            onClick={() => setSelectedStatus('failed')}
            className={`px-4 py-2 rounded-md ${
              selectedStatus === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Refusés
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun retrait</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucun retrait {selectedStatus === 'pending' ? 'en attente' : 
                          selectedStatus === 'completed' ? 'validé' : 
                          selectedStatus === 'failed' ? 'refusé' : ''} pour le moment.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredWithdrawals.map((withdrawal) => (
              <li key={withdrawal.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {withdrawal.profiles?.full_name || 'Utilisateur inconnu'}
                        </h3>
                        <p className="text-sm text-gray-500">{withdrawal.profiles?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          {formatAmount(withdrawal.amount)} FCFA
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(withdrawal.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Méthode de paiement: {withdrawal.payment_method === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Numéro: {withdrawal.withdrawal_info?.phoneNumber}
                      </p>
                    </div>
                  </div>
                  {withdrawal.status === 'pending' && (
                    <div className="ml-4 flex space-x-3">
                      <button
                        onClick={() => updateWithdrawalStatus(withdrawal.id, 'completed')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="-ml-0.5 mr-2 h-4 w-4" /> Valider
                      </button>
                      <button
                        onClick={() => updateWithdrawalStatus(withdrawal.id, 'failed')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="-ml-0.5 mr-2 h-4 w-4" /> Refuser
                      </button>
                    </div>
                  )}
                  {withdrawal.status === 'completed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="mr-2 h-4 w-4" /> Validé
                    </span>
                  )}
                  {withdrawal.status === 'failed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <XCircle className="mr-2 h-4 w-4" /> Refusé
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;