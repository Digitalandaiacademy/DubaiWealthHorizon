import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
      setIsPopupVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Application installée avec succès');
      } else {
        console.log('Installation refusée');
      }
      
      setDeferredPrompt(null);
      setShowInstallButton(false);
      setIsPopupVisible(false);
    } catch (err) {
      console.error('Erreur lors de l\'installation:', err);
    }
  };

  const handleCloseClick = () => {
    setIsPopupVisible(false);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!showInstallButton && !isIOS) return null;
  if (!isPopupVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 w-11/12 max-w-md mx-auto">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Installer l'application
        </h3>
        <button
          onClick={handleCloseClick}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Fermer"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      
      {isIOS ? (
        <div>
          <p className="text-gray-800 mb-3">
            Pour installer l'application sur votre iPhone/iPad :
          </p>
          <ol className="list-decimal pl-5 mb-3 text-gray-700">
            <li>Appuyez sur le bouton "Partager" (📤) en bas de votre navigateur</li>
            <li>Faites défiler et sélectionnez "Sur l'écran d'accueil"</li>
            <li>Appuyez sur "Ajouter" en haut à droite</li>
          </ol>
        </div>
      ) : (
        <>
          <p className="text-gray-800 mb-3">
            Installez notre application pour un accès rapide depuis votre écran d'accueil !
          </p>
          <button
            onClick={handleInstallClick}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Installer l'application
          </button>
        </>
      )}
    </div>
  );
};

export default InstallPWA;
