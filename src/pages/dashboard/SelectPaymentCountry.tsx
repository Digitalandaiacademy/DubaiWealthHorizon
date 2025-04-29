import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const countries = [
  { id: 'cameroun', name: 'Cameroun', flag: '🇨🇲' },
  { id: 'kenya', name: 'Kenya', flag: '🇰🇪' },
  { id: 'senegal', name: 'Sénégal', flag: '🇸🇳' },
  { id: 'benin', name: 'Bénin', flag: '🇧🇯' },
  { id: 'autres', name: 'Autres pays', flag: '🌍' }
];

const SelectPaymentCountry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan');

  const handleCountrySelect = (countryId: string) => {
    if (countryId === 'autres') {
      // Redirection vers la page de paiement izichange
      navigate(`/dashboard/new-investment?plan=${selectedPlanId}`);
    } else {
      // Redirection vers la page de paiement spécifique au pays
      navigate(`/dashboard/payment/${countryId}?plan=${selectedPlanId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/investments')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Sélectionnez votre pays de paiement
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {countries.map((country) => (
            <button
              key={country.id}
              onClick={() => handleCountrySelect(country.id)}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center">
                <span className="text-2xl mr-3">{country.flag}</span>
                <span className="text-lg">{country.name}</span>
              </span>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectPaymentCountry;
