declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useGoogleAds = () => {
  const trackConversion = (url?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      const callback = () => {
        if (typeof url !== 'undefined') {
          window.location.href = url;
        }
      };

      window.gtag('event', 'conversion', {
        'send_to': 'AW-16907459916/ePXMCIjr-6UaEMy6jf4-',
        'event_callback': callback
      });
    }
    return false;
  };

  return { trackConversion };
};
