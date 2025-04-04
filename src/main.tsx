import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register a function to handle network status changes
const updateNetworkStatus = () => {
  const isOnline = navigator.onLine;
  document.body.classList.toggle('offline-mode', !isOnline);
  
  if (!isOnline) {
    console.log('Application is offline. Using cached resources.');
  } else {
    console.log('Application is online. Using network resources.');
  }
};

// Initial check
updateNetworkStatus();

// Listen for online/offline events
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// Add a global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // If the error is related to network connectivity, we can handle it gracefully
  if (event.reason instanceof TypeError && 
      event.reason.message.includes('Failed to fetch')) {
    console.log('Network error detected. Check your connection.');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);