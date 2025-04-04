import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface CacheManagerProps {
  onClearCache?: () => void;
}

const CacheManager: React.FC<CacheManagerProps> = ({ onClearCache }) => {
  const [isClearing, setIsClearing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Get last update time from localStorage
    const lastUpdate = localStorage.getItem('last_cache_update');
    if (lastUpdate) {
      setLastUpdated(lastUpdate);
    }
  }, []);

  const clearCache = async () => {
    setIsClearing(true);
    
    try {
      // Clear application cache
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }
      
      // Clear localStorage cache indicators
      const now = new Date().toISOString();
      localStorage.setItem('last_cache_update', now);
      setLastUpdated(now);
      
      // Call the callback if provided
      if (onClearCache) {
        onClearCache();
      }
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Jamais';
    
    const date = new Date(lastUpdated);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-start mb-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">Problème d'affichage ?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Si vous ne voyez pas les dernières mises à jour, essayez d'actualiser le cache.
            </p>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-3">
          Dernière actualisation : {formatLastUpdated()}
        </div>
        
        <button
          onClick={clearCache}
          disabled={isClearing}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isClearing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Actualisation...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser l'application
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CacheManager;