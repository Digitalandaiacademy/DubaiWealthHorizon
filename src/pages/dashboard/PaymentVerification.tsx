import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { useInvestmentStore } from '../../store/investment';

interface PaymentVerification {
  id: string;
  transaction_id: string;
  verified_transaction_id: string | null;
  user_id: string;
  amount: number;
  status: string;
  investment_id: string;
  created_at: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const PaymentVerification = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { loadUserInvestments } = useInvestmentStore();
  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingPayments();
  }, [profile]);

  const loadPendingPayments = async () => {
    if (!profile?.id) return;

    try {
      console.log('Chargement des paiements en attente pour l\'utilisateur:', profile.id);
      const { data, error } = await supabase
        .from('payment_verifications')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Paiements en attente chargés:', data);
      setPayments(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des paiements:', error);
      toast.error('Erreur lors du chargement des paiements');
    }
  };

  const handleVerifyTransaction = async (paymentId: string) => {
    if (!transactionId) {
      toast.error('Veuillez entrer l\'ID de transaction');
      return;
    }

    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      toast.error('Paiement non trouvé');
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

      console.log('Appel de la fonction de vérification avec:', {
        payment_id: payment.id,
        transaction_id: transactionId,
        user_id: profile.id,
        plan_id: payment.investment_plan,
        amount: payment.amount
      });

      // Utiliser la fonction RPC pour vérifier le paiement et créer l'investissement
      const { data, error: transactionError } = await supabase.rpc(
        'verify_payment_and_create_investment',
        {
          p_payment_id: payment.id,
          p_transaction_id: transactionId,
          p_user_id: profile.id,
          p_plan_id: payment.investment_plan,
          p_amount: payment.amount
        }
      );

      if (transactionError) {
        console.error('Erreur lors de la transaction:', transactionError);
        throw transactionError;
      }

      if (!data.success) {
        console.error('Erreur retournée par la fonction:', data.error);
        throw new Error(data.error || 'Erreur lors de la vérification du paiement');
      }

      console.log('Transaction réussie:', data);

      // Recharger les données
      await loadUserInvestments();
      await loadPendingPayments();

      toast.success('Paiement vérifié avec succès! Votre investissement est maintenant actif.');
      setTransactionId('');
      setSelectedPayment(null);
    } catch (error: any) {
      console.error('Erreur lors de la vérification:', error);
      toast.error(error.message || 'Une erreur est survenue lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = async (paymentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce paiement ?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('payment_verifications')
        .update({ status: 'cancelled' })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Paiement annulé avec succès');
      await loadPendingPayments();
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error('Erreur lors de l\'annulation du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (payments.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Aucun paiement en attente de vérification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Vérification des Paiements</h2>
      <div className="space-y-6">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Montant: {payment.amount} USD</h3>
                <p className="text-sm text-gray-600">
                  Créé le {formatDate(payment.created_at)}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleCancelPayment(payment.id)}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </div>

            <div className="mt-4">
              {selectedPayment === payment.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Entrez l'ID de transaction"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerifyTransaction(payment.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      Vérifier
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPayment(null);
                        setTransactionId('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedPayment(payment.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  Entrer l'ID de transaction
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentVerification;
