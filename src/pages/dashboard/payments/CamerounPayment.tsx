import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInvestmentStore } from '../../../store/investment';
import { useAuthStore } from '../../../store/authStore';
import { ArrowLeft, Phone, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../../utils/supabaseClient';

const CamerounPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan');
  
  const { plans, loadPlans, createInvestment } = useInvestmentStore();
  const { user, profile } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [currentStep, setCurrentStep] = useState<'method' | 'details' | 'waiting'>('method');

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

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setCurrentStep('details');
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !fullName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      if (!selectedPlanId) {
        throw new Error('Plan non sélectionné');
      }

      const generatedTransactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const paymentInfo = {
        user_id: user.id,
        amount: amount,
        payment_method: `${paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'} (Cameroun) - ${phoneNumber}`,
        status: 'pending',
        transaction_id: generatedTransactionId,
        investment_plan: selectedPlanId,
        created_at: new Date().toISOString()
      };

      console.log('Données à envoyer:', paymentInfo);

      const { data, error } = await supabase
        .from('payment_verifications')
        .insert([paymentInfo])
        .select();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      console.log('Réponse Supabase:', data);
      setCurrentStep('waiting');
      toast.success('Paiement initié avec succès');
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'enregistrement du paiement');
    }
  };

  const getPaymentInstructions = () => {
    if (paymentMethod === 'orange') {
      return `Veuillez valider le paiement dès que le message de paiement s'affiche ou composez le #150*50# pour effectuer le paiement de ${amount} FCFA. \n Après avoir effectuer le paiement, retourner dans mes investissements en rechargeant la page. Merci!`;
    } else {
      return `Veuillez valider le paiement dès que le message de paiement s'affiche ou composez le *126# pour effectuer le paiement de ${amount} FCFA. \n Après avoir effectuer le paiement, retourner dans mes investissements en rechargeant la page. Merci!`;
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis ${fullName} (${phoneNumber}). Je souhaite effectuer un paiement de ${amount} FCFA via ${
        paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'
      } pour mon investissement sur DubaiWealth Horizon.`
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
          Paiement au Cameroun
        </h1>

        {currentStep === 'method' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              onClick={() => handlePaymentMethodSelect('mtn')}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-yellow-500" />
                <span>MTN Mobile Money</span>
              </span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        )}

        {currentStep === 'details' && (
          <form onSubmit={handleSubmitDetails} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Ex: 6XXXXXXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Votre nom complet"
                required
              />
            </div>

            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Initier le paiement
                </span>
              </button>
            </div>
          </form>
        )}

        {currentStep === 'waiting' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 font-medium mb-2">
                Paiement en attente
              </p>
              <p className="text-blue-600">
                {getPaymentInstructions()}
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={openWhatsApp}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Contacter le support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CamerounPayment;
