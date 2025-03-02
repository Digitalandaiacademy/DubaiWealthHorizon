import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

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
    } catch (err) {
      console.error('Erreur lors de l\'installation:', err);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!showInstallButton && !isIOS) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 md:w-96 md:left-4 md:right-auto">
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
