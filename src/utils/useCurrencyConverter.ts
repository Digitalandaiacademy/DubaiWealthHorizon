import { useState, useEffect } from 'react';
import currency from 'currency.js';
import geoip from 'geoip-lite';
import { useCookies } from 'react-cookie';

// Taux de change (à mettre à jour régulièrement)
const EXCHANGE_RATES = {
  FCFA: 1,
  EUR: 0.00152, // 1 FCFA = 0.00152 EUR
  USD: 0.00165  // 1 FCFA = 0.00165 USD
};

export const useCurrencyConverter = () => {
  const [cookies, setCookie] = useCookies(['userCurrency']);
  const [currentCurrency, setCurrentCurrency] = useState('FCFA');

  useEffect(() => {
    // Détecter la localisation côté client
    const detectLocation = () => {
      try {
        const ip = ''; // À remplacer par l'IP réelle du client
        const geo = geoip.lookup(ip);
        
        if (geo) {
          switch(geo.country) {
            case 'FR':
            case 'DE':
            case 'IT':
              return 'EUR';
            case 'US':
            case 'CA':
              return 'USD';
            default:
              return 'FCFA';
          }
        }
      } catch (error) {
        console.error('Erreur de détection de localisation', error);
      }
      return 'FCFA';
    };

    const detectedCurrency = detectLocation();
    
    // Utiliser la devise détectée ou celle en cookie
    const currency = cookies.userCurrency || detectedCurrency;
    
    setCurrentCurrency(currency);
    setCookie('userCurrency', currency, { path: '/' });
  }, []);

  const convertCurrency = (amount: number, to?: string) => {
    const convertTo = to || currentCurrency;
    
    const convertedAmount = currency(amount, { 
      symbol: '', 
      precision: 2 
    }).multiply(EXCHANGE_RATES[convertTo]).value;

    return {
      amount: Math.round(convertedAmount),
      currency: convertTo
    };
  };

  const formatCurrency = (amount: number) => {
    const { amount: converted, currency } = convertCurrency(amount);
    
    const currencySymbols = {
      FCFA: 'FCFA',
      EUR: '€',
      USD: '$'
    };

    return `${converted} ${currencySymbols[currency]}`;
  };

  const changeCurrency = (newCurrency: string) => {
    setCurrentCurrency(newCurrency);
    setCookie('userCurrency', newCurrency, { path: '/' });
  };

  return {
    currentCurrency,
    convertCurrency,
    formatCurrency,
    changeCurrency
  };
};