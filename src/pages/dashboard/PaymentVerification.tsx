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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Vérification des Paiements</h2>
        </div>
        <div className="flex flex-col items-center">
          <button 
            onClick={() => window.location.reload()} 
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
          </button>
          <span className="text-center text-sm text-gray-500 mt-1">Rechargez la page</span>
        </div>
      </div>


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
      {/* Bouton d'assistance WhatsApp */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center space-y-2">
        <span className="text-gray-700 text-sm bg-white px-2 py-1 rounded-md shadow-md">
          Besoin d'aide ?
        </span>
        <a 
          href="https://wa.me/2348062450400?text=Besoin%20d'assistance" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 12.3a9.8 9.8 0 0 1-1.1 4.5c-.7 1.5-2.2 3.3-3.7 4.2a10.2 10.2 0 0 1-4.5 1.1 9.8 9.8 0 0 1-4.5-1.1L2 22l1.1-5.3a9.8 9.8 0 0 1-1.1-4.5 10.2 10.2 0 0 1 1.1-4.5 9.8 9.8 0 0 1 4.5-3.7 10.2 10.2 0 0 1 4.5-1.1h.5a9.8 9.8 0 0 1 4.5 1.1 10.2 10.2 0 0 1 3.7 3.7 9.8 9.8 0 0 1 1.1 4.5z"/>
            <path d="M16.2 14.7c-.3 1-1.6 1.6-2.7 1.2-1.2-.5-4.3-2.6-5.4-5.5-.4-1 .1-2.4 1.2-2.7.6-.2 1.3 0 1.7.6l.8 1.2c.3.4.3.9 0 1.3l-.6.8c.5 1.1 1.3 1.9 2.4 2.4l.8-.6c.4-.3.9-.3 1.3 0l1.2.8c.6.4.8 1.1.6 1.7z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default PaymentVerification;
