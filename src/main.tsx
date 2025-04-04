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
  
  // Show connection status indicator
  const statusElement = document.createElement('div');
  statusElement.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
  statusElement.textContent = isOnline ? 'Connecté' : 'Hors ligne';
  
  // Remove any existing status indicators
  document.querySelectorAll('.connection-status').forEach(el => el.remove());
  
  // Add the new indicator
  document.body.appendChild(statusElement);
  
  // Remove the indicator after 3 seconds
  setTimeout(() => {
    statusElement.style.opacity = '0';
    setTimeout(() => statusElement.remove(), 300);
  }, 3000);
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

// Global error boundary
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Prevent the error from bubbling up if it's a network error
  if (event.error instanceof TypeError && 
      event.error.message.includes('Failed to fetch')) {
    event.preventDefault();
    console.log('Network error detected and handled.');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);