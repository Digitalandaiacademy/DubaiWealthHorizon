import React from 'react';
import { Phone, CreditCard, Banknote } from 'lucide-react';

const PaymentMethods = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Modes de Paiement</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start space-x-4">
          <Phone className="h-8 w-8 text-orange-500 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900">Mobile Money</h4>
            <p className="text-gray-600 text-sm mt-1">Orange Money Cameroun</p>
            <p className="text-gray-600 text-sm">MTN Mobile Money</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <Phone className="h-8 w-8 text-green-500 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900">WhatsApp</h4>
            <p className="text-gray-600 text-sm mt-1">Support direct 24/7</p>
            <p className="text-gray-600 text-sm">+237 XX XX XX XX</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <CreditCard className="h-8 w-8 text-blue-500 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900">Carte Bancaire</h4>
            <p className="text-gray-600 text-sm mt-1">Visa & Mastercard</p>
            <p className="text-gray-600 text-sm">Paiement sécurisé</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <Banknote className="h-8 w-8 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900">PayPal</h4>
            <p className="text-gray-600 text-sm mt-1">Paiement international</p>
            <p className="text-gray-600 text-sm">Protection acheteur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;