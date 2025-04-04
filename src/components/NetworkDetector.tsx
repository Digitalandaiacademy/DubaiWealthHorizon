import React, { useState, useEffect } from 'react';
import { WifiOff, ExternalLink } from 'lucide-react';

const NetworkDetector = () => {
  const [isOrangeCameroon, setIsOrangeCameroon] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Function to detect Orange Cameroon network
    const detectOrangeCameroon = async () => {
      try {
        // Check if we're in Cameroon and potentially on Orange network
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Check if the user is in Cameroon
        const isInCameroon = data.country_code === 'CM';
        
        // Check if the ISP contains "Orange" - this is an approximation
        const isOrangeISP = data.org?.toLowerCase().includes('orange') || 
                           data.isp?.toLowerCase().includes('orange');
        
        // Set state if both conditions are true
        if (isInCameroon && isOrangeISP) {
          setIsOrangeCameroon(true);
          setShowBanner(true);
          
          // Store in localStorage to remember this user is on Orange Cameroon
          localStorage.setItem('network_orange_cameroon', 'true');
        } else if (localStorage.getItem('network_orange_cameroon') === 'true') {
          // If user was previously detected as Orange Cameroon, show banner anyway
          // This helps in case the detection fails but user is still on Orange
          setIsOrangeCameroon(true);
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Error detecting network:', error);
        
        // If detection fails but user was previously on Orange Cameroon, show banner
        if (localStorage.getItem('network_orange_cameroon') === 'true') {
          setIsOrangeCameroon(true);
          setShowBanner(true);
        }
      }
    };

    // Run detection
    detectOrangeCameroon();
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-2 md:mb-0">
          <WifiOff className="h-5 w-5 mr-2" />
          <span className="font-medium">
            Problème de connexion détecté avec Orange Cameroun
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <a 
            href="https://1.1.1.1/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 bg-white text-orange-600 rounded-md text-sm font-medium hover:bg-orange-50"
          >
            Utiliser 1.1.1.1 <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          <button
            onClick={() => setShowBanner(false)}
            className="px-3 py-1 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
          >
            Ignorer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkDetector;