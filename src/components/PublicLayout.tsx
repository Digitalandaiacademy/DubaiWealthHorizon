import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
  showTelegram?: boolean;
}

const PublicLayout = ({ children, showTelegram = true }: PublicLayoutProps) => {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
        {showTelegram && (
          <a
            href="https://t.me/dubaiwealthhorizon"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 animate-pulse hover:animate-none group"
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              background: 'linear-gradient(45deg, #0088cc, #005f8c)'
            }}
          >
            <svg 
              className="w-6 h-6 animate-bounce group-hover:animate-none"
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-3.737 15.475-3.737 15.475-.23.928-.907 1.151-1.471.731 0 0-4.172-3.09-5.931-4.525-.39-.318-.145-.783.085-.928 1.229-.763 11.025-10.203 11.286-10.373.509-.339.339-.205-.169.134-8.716 5.695-11.223 7.338-11.699 7.659-.445.299-1.332.092-1.332.092L1.875 15.6c-.882-.271-.929-.883-.203-1.334 0 0 14.693-5.931 15.349-6.188.656-.257 1.542-.104 1.542.083z"/>
            </svg>
            <span className="font-medium">
              Rejoignez notre canal Telegram !
            </span>
          </a>
        )}
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
