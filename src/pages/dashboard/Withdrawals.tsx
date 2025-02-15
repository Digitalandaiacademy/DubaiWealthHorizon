import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { useInvestmentStore } from '../../store/investmentStore';
import toast from 'react-hot-toast';

interface WithdrawalFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
}

const Withdrawals = () => {
  const { profile } = useAuthStore();
  const { userInvestments, loadUserInvestments } = useInvestmentStore();
  const { transactions, totalWithdrawn, loadTransactions, createWithdrawal } = useTransactionStore();
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<WithdrawalFormData>({
    fullName: profile?.full_name || '',
    phoneNumber: '',
    email: profile?.email || ''
  });

  // Calculer le solde disponible et le total des retraits
  const calculateAmounts = () => {
    // Calculer le solde disponible à partir des investissements actifs
    let totalEarnings = 0;
    
    userInvestments.forEach(investment => {
      if (investment.status === 'active') {
        const startDate = new Date(investment.created_at);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Calcul des gains pour cet investissement
        const dailyEarning = (investment.amount * investment.plan.daily_roi) / 100;
        const currentEarnings = dailyEarning * diffDays;
        
        totalEarnings += currentEarnings;
      }
    });

    // Calculer le total des retraits (complétés + en attente)
    const completedWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = completedWithdrawals + pendingWithdrawals;
    const availableBalance = Math.floor(totalEarnings - totalWithdrawals); // Arrondir au nombre entier inférieur

    console.log('Debug - Calcul des montants:', {
      totalEarnings,
      completedWithdrawals,
      pendingWithdrawals,
      availableBalance
    });

    return {
      availableBalance,
      totalWithdrawn: totalWithdrawals
    };
  };

  useEffect(() => {
    loadUserInvestments();
    loadTransactions();
  }, []);

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawalAmount = Math.floor(amount); // Arrondir au nombre entier inférieur
    const { availableBalance } = calculateAmounts();

    console.log('Debug - Vérification du montant:', {
      withdrawalAmount,
      availableBalance,
      comparison: withdrawalAmount > availableBalance
    });
    
    if (withdrawalAmount < 1000) {
      toast.error('Le montant minimum de retrait est de 1,000 FCFA');
      return;
    }

    if (withdrawalAmount > availableBalance) {
      toast.error('Solde insuffisant');
      return;
    }

    if (!paymentMethod) {
      toast.error('Veuillez sélectionner une méthode de paiement');
      return;
    }

    // Validation du numéro de téléphone
    const phoneRegex = /^(237|00237|\+237)?[67][0-9]{8}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      toast.error('Numéro de téléphone invalide');
      return;
    }

    try {
      setLoading(true);
      await createWithdrawal(withdrawalAmount, paymentMethod, formData);
      toast.success('Demande de retrait envoyée avec succès');
      setAmount(0);
      setPaymentMethod('');
      setShowForm(false);
      loadTransactions();
      loadUserInvestments();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const amounts = calculateAmounts();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Retrait de Fonds</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Solde Disponible</h3>
          <p className="text-2xl font-bold text-blue-600">
            {amounts.availableBalance.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Total Retiré</h3>
          <p className="text-2xl font-bold text-green-600">
            {amounts.totalWithdrawn.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600">Retrait Minimum</h3>
          <p className="text-2xl font-bold text-yellow-600">1,000 FCFA</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant (FCFA)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1000}
            max={amounts.availableBalance}
            step="1000"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Montant minimum : 1,000 FCFA
          </p>
        </div>

        {/* Méthode de paiement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Méthode de paiement
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'orange', name: 'Orange Money', icon: '🔸' },
              { id: 'mtn', name: 'MTN Mobile Money', icon: '💛' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handlePaymentMethodSelect(method.id)}
                className={`flex items-center justify-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors ${
                  paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <span className="mr-2 text-xl">{method.icon}</span>
                <span className="font-medium">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire de retrait */}
        {showForm && (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-900">
              Informations de paiement - {paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Ex: 677123456"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Format: 6XXXXXXXX ou +2376XXXXXXXX
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !paymentMethod || !showForm}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Traitement...' : 'Soumettre la demande'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Withdrawals;