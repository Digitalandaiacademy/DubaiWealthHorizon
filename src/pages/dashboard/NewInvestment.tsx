import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInvestmentStore } from '../../store/investmentStore';
import { useAuthStore } from '../../store/authStore';
import { Phone, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface InvestmentProcedureProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvestmentProcedure: React.FC<InvestmentProcedureProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="fixed inset-10 bg-white rounded-lg shadow-xl overflow-auto z-50 p-6 max-w-3xl mx-auto"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Procédure d'Investissement</h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-2xl font-semibold text-blue-600 mb-4">A- Création de compte et premier dépôt</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <p className="text-lg">1. <a href="https://home.izichange.com/sign-up?ref=369845" target="_blank" className="text-blue-500 hover:text-blue-700 underline">Créez un compte Izichange</a></p>
                        <img src="/src/img/img1.jpeg" alt="Création compte" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <p className="text-lg">2. Vérifiez votre profil et effectuez votre premier paiement en utilisant l'un des moyens de paiement disponibles.</p>
                        <img src="/src/img/img2.jpeg" alt="Vérification profil" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <p className="text-lg">3. Attendez environ 10 minutes, puis rechargez la page.</p>
                        <img src="/src/img/img3.jpeg" alt="Rechargement" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold text-blue-600 mb-4">B- Configuration de votre compte</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <p className="text-lg">4. Accédez à "Mes adresses" pour configurer vos portefeuilles de facturation et de réception.</p>
                        <img src="/src/img/img4.jpeg" alt="Accès adresses" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg">5. Ajoutez un portefeuille de facturation :</p>
                      <ul className="list-disc pl-8 space-y-4">
                        <li>Cliquez sur "Ajouter".<br/>
                          <img src="/src/img/img5.jpeg" alt="Ajout portefeuille" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                        </li>
                        <li>Choisissez le mode de paiement (ex. Orange Money), entrez un nom (pseudo) et le numéro de téléphone qui effectuera les paiements.<br/>
                          <img src="/src/img/img6.jpeg" alt="Configuration portefeuille" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg">6. Ajoutez un portefeuille de réception :</p>
                      <ul className="list-disc pl-8 space-y-4">
                        <li>Cliquez sur "Ajouter".<br/>
                          <img src="/src/img/img7.jpeg" alt="Ajout réception" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                        </li>
                        <li>Renseignez les informations suivantes :<br/>
                          <img src="/src/img/img8.jpeg" alt="Configuration réception" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                          <ul className="list-disc pl-8 mt-2">
                            <li>Portefeuille : Payeer USD</li>
                            <li>Pseudo : Payeer USD</li>
                            <li>Adresse : P1052009976</li>
                            <li>Confirmez l'adresse : P1052009976</li>
                          </ul>
                        </li>
                        <li>Validez la configuration de votre compte.<br/>
                          <img src="/src/img/img9.jpeg" alt="Validation configuration" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold text-blue-600 mb-4">C- Rechargement de votre compte d'investissement</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <p className="text-lg">7. Accédez à "Achat et Vente".</p>
                        <img src="/src/img/img10.jpeg" alt="Achat et Vente" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg">8. Cliquez sur "JE DONNE" et sélectionnez le moyen de paiement.</p>
                      <img src="/src/img/img11.jpeg" alt="Sélection paiement" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg">9. Entrez le montant que vous souhaitez investir.</p>
                      <img src="/src/img/img12.jpeg" alt="Montant investissement" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg">10. Cliquez sur "JE REÇOIS".</p>
                      <img src="/src/img/img13.jpeg" alt="Je reçois" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg">11. Sélectionnez l'adresse de réception que vous avez configurée.</p>
                      <img src="/src/img/img14.jpeg" alt="Sélection adresse" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg">12. Choisissez le numéro qui effectuera le paiement et cliquez sur "Payer".</p>
                      <img src="/src/img/img15.jpeg" alt="Paiement final" className="mt-2 rounded-lg shadow-md w-96 mx-auto"/>
                    </div>
                  </div>
                </section>

                <div className="mt-8 text-center">
                  <p className="text-xl font-semibold text-green-600 mb-6">
                    ✅ Après quelques minutes, rechargez la page et votre compte sera mis à jour. Vous commencerez alors à générer des bénéfices ! 🚀
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

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
  const [isProcedureOpen, setIsProcedureOpen] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (!plans.length) {
      return;
    }

    if (selectedPlanId) {
      const plan = plans.find(p => p.id === selectedPlanId);
      if (plan) {
        setSelectedPlan(plan);
        setAmount(plan.price);
      } else {
        toast.error('Plan d\'investissement non trouvé');
        navigate('/dashboard/investments');
      }
    } else {
      // Si aucun plan n'est sélectionné, utiliser le premier plan par défaut
      setSelectedPlan(plans[0]);
      setAmount(plans[0].price);
    }
  }, [plans, selectedPlanId, navigate]);

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
    
    if (!selectedPlan) {
      toast.error('Veuillez sélectionner un plan d\'investissement');
      return;
    }

    try {
      // Créer une vérification de paiement
      const { data: verificationData, error: verificationError } = await supabase
        .from('payment_verifications')
        .insert([
          {
            user_id: user?.id,
            amount: amount,
            investment_plan: selectedPlan.id,
            status: 'pending',
            payment_method: 'izichange', // Ajout de la méthode de paiement par défaut
            transaction_id: null,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (verificationError) {
        throw verificationError;
      }

      if (verificationData) {
        toast.success('Demande d\'investissement créée avec succès');
        navigate('/dashboard/payment-verification');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la création de la demande d\'investissement');
      console.error('Erreur:', error.message);
    }
  };

  const verifyPayment = async () => {
    if (!transactionId) {
      toast.error('Veuillez entrer l\'ID de la transaction');
      return;
    }

    if (!selectedPlan) {
      toast.error('Plan d\'investissement non trouvé');
      return;
    }

    try {
      setVerifying(true);
      
      await createInvestment(
        selectedPlan.id,
        amount,
        transactionId,
        paymentMethod
      );
      
      toast.success('Paiement vérifié avec succès');
      navigate('/dashboard/investments');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la vérification');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      <InvestmentProcedure isOpen={isProcedureOpen} onClose={() => setIsProcedureOpen(false)} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nouvel Investissement</h1>
        <button
          onClick={() => navigate('/dashboard/investments')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : !selectedPlan ? (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun plan sélectionné</h3>
          <p className="mt-1 text-sm text-gray-500">
            Veuillez sélectionner un plan d'investissement.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard/investments"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Voir les plans
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">Nouvel Investissement</h1>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!selectedPlan) return;
            handleSubmit(e);
          }}>
            {/* Sélection du plan */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan d'investissement
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

              {/* Bouton Procédure d'investissement */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsProcedureOpen(true)}
                  className="w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
                >
                  Procédure d'Investissement
                </button>
              </div>

              {/* Boutons d'action sur une ligne */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Bouton Effectuer le paiement */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText('P1052009976');
                        setShowPaymentInstructions(!showPaymentInstructions);
                      }}
                      className="relative w-full px-6 py-3 bg-white border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                      <span className="relative z-10">Effectuer le paiement</span>
                      <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300"></div>
                    </button>
                    
                    {/* Instructions de paiement animées */}
                    <AnimatePresence>
                      {showPaymentInstructions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-full left-0 w-[300%] mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                        >
                          <div className="space-y-2">
                            <p className="font-semibold">Instructions de paiement :</p>
                            <ol className="list-decimal pl-4">
                              <li>Adresse P1052009976 copiée</li>
                              <li>Effectuez le paiement</li>
                              <li>Revenez dans le site</li>
                              <li>Envoyez la capture d'écran du paiement OM, MoMo, Moov etc ou celui de Izichange par WhatsApp</li>
                              <li>Revenez cliquer sur Confirmer l'investissement</li>
                            </ol>
                            <p className="text-sm italic mt-2">Le bouton Confirmer l'investissement s'active après avoir cliqué sur les boutons précédents</p>
                            <p className="text-sm text-green-600 mt-2">Patientez 10-15 minutes pour voir votre compte investi. (Rechargez la page si besoin)</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bouton WhatsApp */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const message = `Bonjour, je suis ${profile?.full_name}\nNuméro: ${profile?.phone_number}\nEmail: ${profile?.email}\nMontant: ${selectedPlan?.price.toLocaleString('fr-FR')} FCFA\nPlan: ${selectedPlan?.name}\n\nVoici la capture du paiement/transaction.`;
                      window.open(`https://wa.me/2348062450400?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="relative px-6 py-3 bg-white border-2 border-green-500 text-green-500 rounded-lg hover:bg-green-50 transition-all duration-300 flex items-center justify-center space-x-2 group"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="relative z-10">WhatsApp</span>
                    <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300"></div>
                  </button>

                  {/* Bouton Telegram */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const message = `Bonjour, je suis ${profile?.full_name}\nNuméro: ${profile?.phone_number}\nEmail: ${profile?.email}\nMontant: ${selectedPlan?.price.toLocaleString('fr-FR')} FCFA\nPlan: ${selectedPlan?.name}\n\nVoici la capture du paiement/transaction.`;
                      window.open(`https://t.me/2348062450400?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="relative px-6 py-3 bg-white border-2 border-[#0088cc] text-[#0088cc] rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-2 group"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="relative z-10">Telegram</span>
                    <div className="absolute inset-0 bg-[#0088cc] opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300"></div>
                  </button>
                </div>

                {/* Bouton Confirmer l'investissement en bas à droite */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={!selectedPlan}
                    className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                      selectedPlan 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="relative z-10">Confirmer l'investissement</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NewInvestment;