import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInvestmentStore } from '../../store/investmentStore';
import { useAuthStore } from '../../store/authStore';
import { Phone, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const NewInvestment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan');
  
  const { plans, loadPlans, createInvestment, loading } = useInvestmentStore();
  const { user, profile } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [showPaymentCode, setShowPaymentCode] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (plans.length > 0 && selectedPlanId) {
      const plan = plans.find(p => p.id === selectedPlanId);
      if (plan) {
        setSelectedPlan(plan);
        setAmount(plan.price);
      }
    }
  }, [plans, selectedPlanId]);

  const getPaymentCode = () => {
    if (paymentMethod === 'orange') {
      return `#150*1*1*695265626*${amount}*2#`;
    } else if (paymentMethod === 'mtn') {
      return `*126*1*1*651245847*${amount}#`;
    }
    return '';
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setShowPaymentCode(true);
    setShowVerification(false);
  };

  const copyPaymentCode = () => {
    const code = getPaymentCode();
    navigator.clipboard.writeText(code);
    toast.success('Code de paiement copié !');
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis ${profile?.full_name} (${user?.email}). Je viens d'effectuer un paiement de ${amount} FCFA via ${
        paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'
      } pour mon investissement sur DubaiWealth Horizon.`
    );
    window.open(`https://wa.me/237695265626?text=${message}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowVerification(true);

    // Mettre à jour le statut de paiement de l'utilisateur
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          payment_status: 'pending',
          payment_pending_since: new Date().toISOString(),
          last_payment_attempt: new Date().toISOString(),
          last_investment_amount: amount
        })
        .eq('id', user?.id);

      if (error) throw error;
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const verifyPayment = async () => {
    if (!transactionId) {
      toast.error('Veuillez entrer l\'ID de la transaction');
      return;
    }

    try {
      setVerifying(true);
      
      const { data: verification, error: verificationError } = await supabase
        .from('payment_verifications')
        .select('status')
        .eq('transaction_id', transactionId)
        .maybeSingle();

      if (verificationError) throw verificationError;

      if (verification?.status === 'verified') {
        toast.success('Paiement vérifié avec succès');
        navigate('/dashboard/investments');
      } else {
        toast.error('Paiement non vérifié. Veuillez patienter ou contacter le support.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la vérification');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bouton de retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour
      </button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-bold text-gray-900">Nouvel Investissement</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sélection du plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan d&apos;investissement
            </label>
            <select
              value={selectedPlan?.id || ''}
              onChange={(e) => {
                const plan = plans.find(p => p.id === e.target.value);
                setSelectedPlan(plan);
                setAmount(plan?.price || 0);
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Sélectionnez un plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.price.toLocaleString('fr-FR')} FCFA
                </option>
              ))}
            </select>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (FCFA)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={selectedPlan?.price || 0}
              step="1000"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            />
            {selectedPlan && (
              <p className="mt-2 text-sm text-gray-500">
                Montant minimum : {selectedPlan.price.toLocaleString('fr-FR')} FCFA
              </p>
            )}
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'orange', name: 'Orange Money', icon: '🔸', number: '695265626' },
                { id: 'mtn', name: 'MTN Mobile Money', icon: '💛', number: '651245847' }
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handlePaymentMethodSelect(method.id)}
                  className={`
                    flex items-center p-4 border rounded-lg
                    ${paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                    }
                  `}
                >
                  <span className="text-xl mr-2">{method.icon}</span>
                  <div className="text-left">
                    <span className="text-sm font-medium text-gray-900 block">{method.name}</span>
                    <span className="text-sm text-gray-500">{method.number}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Code de paiement */}
          {showPaymentCode && !showVerification && (
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Instructions de paiement {paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    1. Composez le code suivant sur votre téléphone :<br />
                    <code className="bg-white px-3 py-1 rounded-md text-blue-600 font-mono mt-2 block">
                      {getPaymentCode()}
                    </code>
                  </p>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={copyPaymentCode}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Copier le code
                    </button>
                    <button
                      type="button"
                      onClick={openWhatsApp}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Contacter sur WhatsApp
                    </button>
                  </div>
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <AlertCircle className="inline-block h-4 w-4 mr-2" />
                      Important : Après avoir effectué le paiement, envoyez une capture d'écran 
                      de la confirmation de paiement via WhatsApp au +237 695 265 626
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vérification du paiement */}
          {showVerification && (
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Vérification du paiement
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de la transaction
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Entrez l'ID de la transaction"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={verifyPayment}
                  disabled={verifying}
                  className={`
                    w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md
                    ${verifying ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}
                    text-white font-medium focus:outline-none
                  `}
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Vérifier le paiement
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bouton de soumission */}
          {!showVerification && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !paymentMethod}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white
                  ${loading || !paymentMethod
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                    Traitement en cours...
                  </>
                ) : (
                  "Confirmer l'investissement"
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewInvestment;