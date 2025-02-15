import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const VerifyPayment = () => {
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { user } = useAuthStore();

  const verifyPayment = async () => {
    if (!transactionId) {
      toast.error('Veuillez entrer l\'ID de la transaction');
      return;
    }

    try {
      setVerifying(true);

      // Vérifier si l'ID de transaction correspond à celui enregistré par l'admin
      const { data: verifications, error: verificationError } = await supabase
        .from('payment_verifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'pending')
        .eq('verified_transaction_id', transactionId)
        .single();

      if (verificationError) throw verificationError;

      if (!verifications) {
        toast.error('ID de transaction invalide ou non vérifié par l\'administrateur');
        return;
      }

      // Créer l'investissement
      const { error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          user_id: user?.id,
          plan_id: verifications.investment_plan,
          amount: verifications.amount,
          status: 'active',
          transaction_id: transactionId
        });

      if (investmentError) throw investmentError;

      // Mettre à jour le statut de la vérification
      const { error: updateError } = await supabase
        .from('payment_verifications')
        .update({
          status: 'completed',
          transaction_id: transactionId
        })
        .eq('id', verifications.id);

      if (updateError) throw updateError;

      // Mettre à jour le profil utilisateur
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          payment_status: 'verified',
          last_payment_verified_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast.success('Paiement vérifié avec succès');
      navigate('/dashboard/investments');
    } catch (error: any) {
      console.error('Erreur lors de la vérification:', error);
      toast.error(error.message || 'Erreur lors de la vérification');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Vérification du Paiement
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID de la transaction
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Entrez l'ID de la transaction"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate('/dashboard/investments')}
              className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={verifyPayment}
              disabled={verifying}
              className={`
                px-4 py-2 rounded-md text-white
                ${verifying ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {verifying ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                  Vérification...
                </div>
              ) : (
                'Vérifier le paiement'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPayment;
