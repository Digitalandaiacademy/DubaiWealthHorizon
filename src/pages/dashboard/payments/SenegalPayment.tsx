import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInvestmentStore } from '../../../store/investment';
import { useAuthStore } from '../../../store/authStore';
import { ArrowLeft, Phone, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const SenegalPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan');
  
  const { plans, loadPlans, createInvestment } = useInvestmentStore();
  const { user, profile } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [showPaymentCode, setShowPaymentCode] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (plans.length && selectedPlanId) {
      const plan = plans.find(p => p.id === selectedPlanId);
      if (plan) {
        setSelectedPlan(plan);
        setAmount(plan.price);
      } else {
        toast.error('Plan d\'investissement non trouvé');
        navigate('/dashboard/investments');
      }
    }
  }, [plans, selectedPlanId, navigate]);

  const getOrangeMoneyInstructions = () => {
    return `
1. Composez *144#
2. Sélectionnez "Paiement de facture"
3. Entrez le numéro marchand : 777123456
4. Entrez le montant : ${amount} FCFA
5. Validez avec votre code secret
6. Conservez l'ID de transaction
    `;
  };

  const getWaveInstructions = () => {
    return `
1. Ouvrez votre application Wave
2. Scannez le QR code ou entrez le numéro : 77 456 78 90
3. Entrez le montant : ${amount} FCFA
4. Validez le paiement
5. Conservez l'ID de transaction
    `;
  };

  const getFreeMoneyInstructions = () => {
    return `
1. Ouvrez votre application Free Money
2. Sélectionnez "Paiement marchand"
3. Entrez le numéro : 77 789 01 23
4. Entrez le montant : ${amount} FCFA
5. Confirmez avec votre code PIN
6. Conservez l'ID de transaction
    `;
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setShowPaymentCode(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) {
      toast.error('Veuillez entrer l\'ID de la transaction');
      return;
    }
    
    try {
      await createInvestment({
        plan_id: selectedPlan.id,
        amount: amount,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        status: 'pending'
      });
      
      toast.success('Investissement créé avec succès ! Notre équipe va vérifier votre paiement.');
      navigate('/dashboard/investments');
    } catch (error) {
      toast.error('Une erreur est survenue lors de la création de l\'investissement');
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis ${profile?.full_name} (${user?.email}). Je viens d'effectuer un paiement de ${amount} FCFA via ${
        paymentMethod === 'orange' ? 'Orange Money' : 
        paymentMethod === 'wave' ? 'Wave' : 'Free Money'
      } pour mon investissement sur DubaiWealth Horizon. Et je vous envoie les captures d'écran des paiements.`
    );
    window.open(`https://wa.me/2348062450400?text=${message}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/select-payment-country')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Paiement au Sénégal
        </h1>

        {!showPaymentCode ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handlePaymentMethodSelect('orange')}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-orange-500" />
                <span>Orange Money</span>
              </span>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => handlePaymentMethodSelect('wave')}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-blue-500" />
                <span>Wave</span>
              </span>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => handlePaymentMethodSelect('free')}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-green-500" />
                <span>Free Money</span>
              </span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg mb-2">Instructions de paiement</p>
              <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left whitespace-pre-line">
                {paymentMethod === 'orange' ? getOrangeMoneyInstructions() :
                 paymentMethod === 'wave' ? getWaveInstructions() :
                 getFreeMoneyInstructions()}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de la transaction
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Entrez l'ID de la transaction"
                  required
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    Valider le paiement
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Contacter le support
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SenegalPayment;
