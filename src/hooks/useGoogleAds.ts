declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useGoogleAds = () => {
  const trackConversion = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-16907459916/ePXMCIjr-6UaEMy6jf4-'
      });
    }
  };

  return { trackConversion };
};
