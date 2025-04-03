import React from 'react';
import { Wallet, CreditCard } from 'lucide-react';

interface PaymentMethodsProps {
  onSelect: (method: string, category: string) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ onSelect }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const paymentCategories = {
    'electronic': {
      title: 'Paiement électronique et mobile',
      methods: [
        'Orange Money',
        'MTN Mobile Money',
        'Moov',
        'Wave',
        'Airtel',
        'YAS',
        'MPESA',
        'Safari',
        'Volet USD',
        'Volet Euro',
        'MoneyGO USD',
        'MoneyGO EURO'
      ]
    },
    'crypto': {
      title: 'Paiement en cryptomonnaie',
      methods: [
        'Payeer USD',
        'Payeer EUR',
        'BTC Bep20',
        'USDT (TRC20)',
        'ETH (ERC20)',
        'Doge',
        'Shiba ERC20'
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedCategory === 'electronic'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300'
          }`}
          onClick={() => setSelectedCategory('electronic')}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-orange-500" />
            <h3 className="font-semibold">{paymentCategories.electronic.title}</h3>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedCategory === 'crypto'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'
          }`}
          onClick={() => setSelectedCategory('crypto')}
        >
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-purple-500" />
            <h3 className="font-semibold">{paymentCategories.crypto.title}</h3>
          </div>
        </div>
      </div>

      {/* Methods */}
      {selectedCategory && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4">
            Sélectionnez votre méthode de paiement
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {paymentCategories[selectedCategory as keyof typeof paymentCategories].methods.map(
              (method) => (
                <button
                  key={method}
                  className="p-3 text-sm border rounded-lg hover:bg-gray-50 transition-colors text-left"
                  onClick={() => onSelect(method, selectedCategory)}
                >
                  {method}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;