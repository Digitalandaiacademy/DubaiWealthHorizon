import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInvestmentStore } from '../../store/investment';
import { useAuthStore } from '../../store/authStore';
import { Phone, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { sendPaymentNotificationEmail } from '../../services/emailService';

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
  const [hasClickedIzichange, setHasClickedIzichange] = useState(false);
  const [hasClickedPayment, setHasClickedPayment] = useState(false);

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
    if (method === 'izichange') {
      setHasClickedIzichange(true);
    } else if (method === 'payment') {
      setHasClickedPayment(true);
    }
  };

  const copyPaymentCode = () => {
    const code = getPaymentCode();
    navigator.clipboard.writeText(code);
    toast.success('Code de paiement copié !');
  };

  const openTelegram = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis ${profile?.full_name} (${user?.email}). Je viens d'effectuer un paiement de ${amount} FCFA pour mon investissement sur DubaiWealth Horizon. Et je vous envoie les captures d'écran des paiements.`
    );
    window.open(`https://t.me/Dubaiwealthinvest_supports?text=${message}`, '_blank');
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis ${profile?.full_name} (${user?.email}). Je viens d'effectuer un paiement de ${amount} FCFA via ${
        paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'
      } pour mon investissement sur DubaiWealth Horizon. Et je vous envoie les captures d'écran des paiements.`
    );
    window.open(`https://wa.me/2348062450400?text=${message}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      toast.error('Veuillez sélectionner un plan');
      return;
    }

    if (amount < selectedPlan.min_amount) {
      toast.error(`Le montant minimum pour le plan ${selectedPlan.name} est de ${selectedPlan.min_amount.toLocaleString()} FCFA`);
      return;
    }

    const isValidAmount = amount >= selectedPlan.min_amount;

    setShowVerification(true);

    try {
      // Générer un ID de transaction unique
      const generatedTransactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Créer une vérification de paiement
      const { error: verificationError } = await supabase
        .from('payment_verifications')
        .insert({
          user_id: user?.id,
          amount: amount,
          payment_method: paymentMethod,
          status: 'pending',
          investment_plan: selectedPlan.id,
          transaction_id: generatedTransactionId,
          created_at: new Date().toISOString()
        });

      if (verificationError) throw verificationError;

      // Envoyer l'email de notification à l'administrateur
      try {
        await sendPaymentNotificationEmail({
          userFullName: profile?.full_name || '',
          userEmail: user?.email || '',
          amount: amount,
          paymentMethod: paymentMethod,
          transactionId: generatedTransactionId,
          planName: selectedPlan.name
        });
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        // Ne pas bloquer le processus si l'envoi d'email échoue
      }

      // Mettre à jour le statut de paiement de l'utilisateur
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          payment_status: 'pending',
          payment_pending_since: new Date().toISOString(),
          last_payment_attempt: new Date().toISOString(),
          last_investment_amount: amount
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast.success('Demande de paiement envoyée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la création de la vérification:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
      setShowVerification(false);
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
              {selectedPlan && selectedPlan.min_amount && (
                <span className="text-sm text-gray-600">
                  Montant minimum : {selectedPlan.min_amount.toLocaleString()} FCFA
                </span>
              )}
              {selectedPlan && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-red-600 animate-pulse">
                      ⚠️ LIRE ATTENTIVEMENT ⚠️
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    🔒 <span className="font-semibold">Paiement Sécurisé via Izichange</span><br/>
                    Nous utilisons Izichange comme plateforme de paiement sécurisée pour garantir la sécurité de vos transactions. Ce système offre plusieurs avantages :
                    <ul className="list-disc ml-5 mt-2">
                      <li>Protection contre les pertes de fonds</li>
                      <li>Système de réclamation efficace en cas de complications</li>
                      <li>Traçabilité complète des transactions</li>
                      <li>Vérification d'identité pour sécuriser vos réclamations</li>
                    </ul>
                    <p className="mt-2">
                      Pour assurer la protection de vos investissements, veuillez compléter votre vérification d'identité sur Izichange. Cela garantira vos droits de réclamation en cas de besoin.
                    </p>
                    <p className="mt-2 font-medium">
                      ⚠️ Veuillez suivre attentivement les étapes ci-dessous pour compléter votre investissement en toute sécurité.
                    </p>
                  </p>
                </div>
              )}
            </div>

            {/* Méthode de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procédure de paiement
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'izichange', name: 'Créer un compte Izichange', icon: '🔸' },
                  { id: 'payment', name: 'Effectuez le paiement si déjà inscrit', icon: '💳' }
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
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Code de paiement */}
            {showPaymentCode && !showVerification && (
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {paymentMethod === 'izichange' 
                        ? "Instructions de création de compte de paiement Izichange"
                        : "Instructions pour effectuer le paiement"
                      }
                    </h3>
                    
                    {paymentMethod === 'izichange' ? (
                      <div className="space-y-6">
                        <h2 className="text-xl font-bold">Procédure d'Investissement</h2>
                        
                        <section>
                          <h3 className="text-lg font-semibold text-blue-600 mb-2">A- Création de compte et premier dépôt</h3>
                          <ol className="list-decimal pl-5 space-y-2">
                            <li>Créez un compte Izichange via ce lien : <a href="https://home.izichange.com/sign-up?ref=369845" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Créer un compte</a></li>
                            <li>Vérifiez votre profil et effectuez votre premier paiement en utilisant l'un des moyens de paiement disponibles.</li>
                            <li>Attendez environ 10 minutes, puis rechargez la page.</li>
                          </ol>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold text-blue-600 mb-2">B- Configuration de votre compte</h3>
                          <ol className="list-decimal pl-5 space-y-2" start={4}>
                            <li>Accédez à "Mes adresses" pour configurer vos portefeuilles de facturation et de réception.</li>
                            <li>
                              Ajoutez un portefeuille de facturation :
                              <ul className="list-disc pl-5 mt-1">
                                <li>Cliquez sur "Ajouter".</li>
                                <li>Choisissez le mode de paiement (ex. Orange Money), entrez un nom (pseudo) et le numéro de téléphone qui effectuera les paiements.</li>
                              </ul>
                            </li>
                            <li>
                              Ajoutez un portefeuille de réception :
                              <ul className="list-disc pl-5 mt-1">
                                <li>Cliquez sur "Ajouter".</li>
                                <li>Renseignez les informations suivantes :
                                  <ul className="list-none pl-5 mt-1">
                                    <li>- Portefeuille : Payeer USD</li>
                                    <li>- Pseudo : Payeer USD</li>
                                    <li>- Adresse : P1052009976</li>
                                    <li>- Confirmez l'adresse : P1052009976</li>
                                  </ul>
                                </li>
                                <li>Validez la configuration de votre compte.</li>
                              </ul>
                            </li>
                          </ol>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold text-blue-600 mb-2">C- Rechargement de votre compte d'investissement</h3>
                          <ol className="list-decimal pl-5 space-y-2" start={7}>
                            <li>Accédez à "Achat et Vente".</li>
                            <li>Cliquez sur "JE DONNE" et sélectionnez le moyen de paiement.</li>
                            <li>Entrez le montant que vous souhaitez investir.</li>
                            <li>Cliquez sur "JE REÇOIS".</li>
                            <li>Sélectionnez l'adresse de réception que vous avez configurée.</li>
                            <li>Choisissez le numéro qui effectuera le paiement et cliquez sur "Payer".</li>
                          </ol>
                        </section>

                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                          <p className="text-green-800">
                            ✅ Après quelques minutes, rechargez la page et votre compte sera mis à jour. Vous commencerez alors à générer des bénéfices ! 🚀
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Copiez l'adresse <span className="font-medium">P1052009976</span></li>
                          <li>Effectuez le paiement sur Izichange avec <span className="font-medium">Payeer USD P1052009976</span> sur <a href="https://izichange.com/dashboard/pu_echange" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">effectué le paiement</a></li>
                          <li>Revenez dans le site</li>
                          <li>Envoyez la capture d'écran du paiement OM, MoMo, Moov etc ou celui de Izichange par WhatsApp ou telegram</li>
                          <li>Revenez cliquer sur Confirmer l'investissement</li>
                        </ol>

                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                          <p className="text-yellow-800">
                            Le bouton Confirmer l'investissement s'active lorsque vous cliquez sur les deux boutons précédents
                          </p>
                          <p className="text-yellow-800 mt-2">
                            Patientez pendant 10 à 15 minutes pour voir votre compte investi. (rechargez la page si besoin)
                          </p>
                        </div>

                        <div className="flex space-x-4 mt-4">
                          <button
                            type="button"
                            onClick={openWhatsApp}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                          >
                            Envoyez les captures sur WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={openTelegram}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                          >
                            Envoyez les captures sur Telegram
                          </button>
                        </div>
                      </div>
                    )}
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
                  disabled={!hasClickedIzichange || !hasClickedPayment || amount < selectedPlan.min_amount}
                  className={`
                    inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white
                    ${!hasClickedIzichange || !hasClickedPayment || amount < selectedPlan.min_amount
                      ? 'bg-gray-400 cursor-not-allowed'
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
                {(!hasClickedIzichange || !hasClickedPayment || amount < selectedPlan.min_amount) && (
                  <p className="text-sm text-gray-500 mt-2">
                    {!hasClickedIzichange && !hasClickedPayment 
                      ? "Veuillez cliquer sur les deux boutons ci-dessus"
                      : !hasClickedIzichange 
                        ? "Veuillez cliquer sur 'Créer un compte Izichange'"
                        : !hasClickedPayment 
                          ? "Veuillez cliquer sur 'Effectuez le paiement si déjà inscrit'"
                          : `Le montant minimum pour le plan ${selectedPlan.name} est de ${selectedPlan.min_amount.toLocaleString()} FCFA`
                    }
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default NewInvestment;
