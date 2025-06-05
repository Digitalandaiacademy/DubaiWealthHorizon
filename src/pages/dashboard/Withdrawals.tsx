import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { useInvestmentStore } from '../../store/investmentStore';
import { useReferralStore } from '../../store/referralStore';
import { useSearchParams } from 'react-router-dom';
import PaymentMethods from '../../components/PaymentMethods';
import toast from 'react-hot-toast';

interface WithdrawalFormData {
  fullName: string;
  phoneNumber?: string;
  email: string;
  cryptoAddress?: string;
}

const Withdrawals = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const withdrawalType = searchParams.get('type');
  const { profile } = useAuthStore();
  const { userInvestments, loadUserInvestments } = useInvestmentStore();
  const { transactions, loadTransactions, createWithdrawal, availableBalance, totalWithdrawn } = useTransactionStore();
  const { totalCommission, loadReferrals } = useReferralStore();
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentCategory, setPaymentCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<WithdrawalFormData>({
    fullName: profile?.full_name || '',
    email: profile?.email || ''
  });

  useEffect(() => {
    loadUserInvestments();
    loadTransactions();
    if (withdrawalType === 'commission') {
      loadReferrals();
    }
  }, [withdrawalType]);

  const calculateAmounts = () => {
    // Deprecated: calculation moved to store
    return {
      availableBalance,
      totalWithdrawn
    };
  };

  const handlePaymentMethodSelect = (method: string, category: string) => {
    setPaymentMethod(method);
    setPaymentCategory(category);
    setShowForm(true);
    
    // Reset form data except name and email
    setFormData({
      fullName: profile?.full_name || '',
      email: profile?.email || '',
      ...(category === 'electronic' ? { phoneNumber: '' } : { cryptoAddress: '' })
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawalAmount = Math.floor(amount);
    const { availableBalance } = calculateAmounts();
    
    if (withdrawalType === 'commission') {
      if (withdrawalAmount < 500) {
        toast.error('Le montant minimum de retrait des commissions est de 500 FCFA');
        return;
      }
    } else {
      if (withdrawalAmount < 1000) {
        toast.error('Le montant minimum de retrait est de 1,000 FCFA');
        return;
      }
    }

    if (withdrawalAmount > availableBalance) {
      toast.error('Solde insuffisant');
      return;
    }

    if (!paymentMethod) {
      toast.error('Veuillez sélectionner une méthode de paiement');
      return;
    }

    const requiredFields = paymentCategory === 'electronic' 
      ? ['fullName', 'phoneNumber', 'email']
      : ['fullName', 'cryptoAddress', 'email'];

    const missingFields = requiredFields.filter(field => !formData[field as keyof WithdrawalFormData]);
    if (missingFields.length > 0) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setLoading(true);
      await createWithdrawal({
        amount: withdrawalAmount,
        paymentMethod,
        paymentCategory,
        type: withdrawalType === 'commission' ? 'commission_withdrawal' : 'withdrawal',
        paymentDetails: {
          ...formData
        }
      });
      toast.success('Demande de retrait envoyée avec succès');
      setShowForm(false);
      setAmount(0);
      setPaymentMethod('');
      
      // Rediriger vers le tableau de bord des parrainages si c'est un retrait de commission
      if (withdrawalType === 'commission') {
        navigate('/dashboard/referral?withdrawalSuccess=true');
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la demande de retrait');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {withdrawalType === 'commission' ? 'Retrait des Commissions' : 'Retraits'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Solde disponible</p>
            <p className="text-2xl font-bold">{availableBalance.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600">Total retiré</p>
            <p className="text-2xl font-bold">{totalWithdrawn.toLocaleString()} FCFA</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {withdrawalType === 'commission' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700">
              Vous pouvez retirer vos commissions de parrainage à partir de 500 FCFA.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant du retrait
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-lg"
              min="1000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement
            </label>
            <PaymentMethods onSelect={handlePaymentMethodSelect} />
            {paymentMethod && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-700">Méthode sélectionnée: {paymentMethod}</p>
              </div>
            )}
          </div>

          {showForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              {paymentCategory === 'electronic' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse {paymentMethod}
                  </label>
                  <input
                    type="text"
                    value={formData.cryptoAddress}
                    onChange={(e) => setFormData({ ...formData, cryptoAddress: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Traitement en cours...' : 'Demander le retrait'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdrawals;