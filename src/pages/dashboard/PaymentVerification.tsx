import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { useInvestmentStore } from '../../store/investmentStore';

interface PaymentVerification {
  id: string;
  transaction_id: string;
  verified_transaction_id: string | null;
  user_id: string;
  amount: number;
  status: string;
  investment_id: string;
}

const PaymentVerification = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { loadUserInvestments } = useInvestmentStore();
  const [transactionId, setTransactionId] = useState('');
  const [payment, setPayment] = useState<PaymentVerification | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingPayment();
  }, [profile]);

  const loadPendingPayment = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('payment_verifications')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .single();

      if (error) throw error;
      setPayment(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement du paiement:', error);
    }
  };

  const handleVerifyTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment || !transactionId) {
      toast.error('Veuillez entrer l\'ID de transaction');
      return;
    }

    try {
      setLoading(true);

      // Vérifier si l'ID de transaction correspond à celui vérifié par l'admin
      const { data: verifiedPayment, error: verificationError } = await supabase
        .from('payment_verifications')
        .select('verified_transaction_id')
        .eq('id', payment.id)
        .single();

      if (verificationError) throw verificationError;

      if (!verifiedPayment?.verified_transaction_id) {
        toast.error('L\'administrateur n\'a pas encore vérifié votre paiement');
        return;
      }

      if (verifiedPayment.verified_transaction_id !== transactionId) {
        toast.error('L\'ID de transaction ne correspond pas');
        return;
      }

      // Mettre à jour le statut du paiement
      const { error: updateError } = await supabase
        .from('payment_verifications')
        .update({
          status: 'verified',
          transaction_id: transactionId
        })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      // Activer l'investissement
      const { error: investmentError } = await supabase
        .from('user_investments')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.investment_id);

      if (investmentError) throw investmentError;

      // Recharger les investissements
      await loadUserInvestments();

      toast.success('Paiement vérifié avec succès! Votre investissement est maintenant actif.');
      navigate('/dashboard/investments');
    } catch (error: any) {
      console.error('Erreur lors de la vérification:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!payment) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Aucun paiement en attente de vérification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Vérification du Paiement</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Montant du paiement:</p>
          <p className="text-xl font-semibold">{payment.amount.toLocaleString('fr-FR')} FCFA</p>
        </div>

        <form onSubmit={handleVerifyTransaction} className="space-y-4">
          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
              ID de Transaction
            </label>
            <input
              type="text"
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Entrez l'ID de transaction"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Vérifier le Paiement'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          <p>Instructions:</p>
          <ol className="list-decimal pl-4 mt-2 space-y-1">
            <li>Assurez-vous que l'administrateur a reçu votre capture d'écran de paiement</li>
            <li>Entrez l'ID de transaction exactement comme il apparaît sur votre reçu de paiement</li>
            <li>Cliquez sur "Vérifier le Paiement" pour activer votre investissement</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;
