import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import InstallPWA from './components/InstallPWA';
import SessionTracker from './components/SessionTracker';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import About from './pages/About';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import Investment from './pages/Investment';
import Testimonials from './pages/Testimonials';
import Community from './pages/Community';
import Simulator from './pages/Simulator';
import Dashboard from './pages/dashboard/Dashboard';
import Investments from './pages/dashboard/Investments';
import NewInvestment from './pages/dashboard/NewInvestment';
import Transactions from './pages/dashboard/Transactions';
import Profile from './pages/dashboard/Profile';
import Withdrawals from './pages/dashboard/Withdrawals';
import Referral from './pages/Referral';
import ReferralDashboard from './pages/dashboard/ReferralDashboard';
import VerifyPayment from './pages/dashboard/VerifyPayment';
import PaymentVerification from './pages/dashboard/PaymentVerification';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminInvestments from './pages/admin/AdminInvestments';
import AdminSettings from './pages/admin/AdminSettings';
import ConditionsGenerales from './pages/legal/ConditionsGenerales';
import MentionsLegales from './pages/legal/MentionsLegales';
import PolitiqueConfidentialite from './pages/legal/PolitiqueConfidentialite';
import Cookies from './pages/legal/Cookies';
import Lexique from './pages/legal/Lexique';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import UserActivity from './pages/admin/UserActivity';
import UserTracking from './pages/admin/UserTracking';
import ResetPassword from './pages/ResetPassword';
import toast from 'react-hot-toast';

function App() {
  const { initialize, profile } = useAuthStore();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if running in StackBlitz
  const isStackBlitz = window.location.hostname.includes('stackblitz') || 
                      window.navigator.userAgent.includes('StackBlitz');

  useEffect(() => {
    initialize();

    // Register service worker only if not in StackBlitz and browser supports it
    if ('serviceWorker' in navigator && !isStackBlitz) {
      try {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
              console.log('Service Worker registered successfully:', registration);
              setServiceWorkerRegistration(registration);
              
              // Check for updates
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      setUpdateAvailable(true);
                    }
                  });
                }
              });
            })
            .catch(error => {
              // Don't show error toast in StackBlitz since SW is not supported
              if (!isStackBlitz) {
                console.error('Service Worker registration failed:', error);
              }
            });
          
          // Handle controller change (when a new service worker takes over)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New service worker controller, page will reload');
            // Wait a moment before reloading to ensure the new service worker is fully active
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          });
        });
      } catch (error) {
        console.error('Error setting up service worker:', error);
      }
    }
    
    // Check for app version changes
    const appVersion = localStorage.getItem('app_version');
    const currentVersion = '1.0.1'; // Update this when deploying new versions
    
    if (appVersion !== currentVersion) {
      // Clear cache and reload if version changed
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }
      
      localStorage.setItem('app_version', currentVersion);
      
      // Only show update message if not first visit
      if (appVersion) {
        toast.success('Application mise à jour avec succès !', {
          duration: 3000,
          position: 'top-center',
          icon: '🚀'
        });
      }
    }
  }, []);

  // Function to update the service worker
  const updateServiceWorker = () => {
    if (serviceWorkerRegistration && serviceWorkerRegistration.waiting) {
      // Send message to service worker to skip waiting
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  // Function to clear cache manually
  const clearCache = () => {
    if (serviceWorkerRegistration) {
      navigator.serviceWorker.controller?.postMessage({
        type: 'CLEAR_CACHE'
      }, [new MessageChannel().port2]);
      
      toast.success('Cache effacé avec succès !', {
        duration: 2000,
        position: 'top-center'
      });
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <Router>
      <SessionTracker />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        {!isStackBlitz && <InstallPWA />}
        
        {/* Update notification */}
        {updateAvailable && !isStackBlitz && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <span className="mr-2">Nouvelle version disponible !</span>
            <button 
              onClick={updateServiceWorker}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
            >
              Mettre à jour
            </button>
          </div>
        )}
        
        {/* Debug button for clearing cache (only in development) */}
        {import.meta.env.DEV && !isStackBlitz && (
          <button 
            onClick={clearCache}
            className="fixed bottom-20 right-6 z-50 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
          >
            Effacer le cache
          </button>
        )}
        
        <Routes>
          {/* Routes publiques avec Navbar et Footer */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
          <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout showTelegram={false}><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout showTelegram={false}><Register /></PublicLayout>} />
          <Route path="/reset-password" element={<PublicLayout showTelegram={false}><ResetPassword /></PublicLayout>} />
          <Route path="/investment" element={<PublicLayout><Investment /></PublicLayout>} />
          <Route path="/testimonials" element={<PublicLayout><Testimonials /></PublicLayout>} />
          <Route path="/community" element={<PublicLayout><Community /></PublicLayout>} />
          <Route path="/simulator" element={<PublicLayout><Simulator /></PublicLayout>} />
          <Route path="/referral" element={<PublicLayout><Referral /></PublicLayout>} />
          <Route path="/legal/conditions-generales" element={<PublicLayout><ConditionsGenerales /></PublicLayout>} />
          <Route path="/legal/mentions-legales" element={<PublicLayout><MentionsLegales /></PublicLayout>} />
          <Route path="/legal/politique-confidentialite" element={<PublicLayout><PolitiqueConfidentialite /></PublicLayout>} />
          <Route path="/legal/cookies" element={<PublicLayout><Cookies /></PublicLayout>} />
          <Route path="/legal/lexique" element={<PublicLayout><Lexique /></PublicLayout>} />

          {/* Routes du tableau de bord utilisateur */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="investments" element={<Investments />} />
            <Route path="invest" element={<NewInvestment />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="withdrawals" element={<Withdrawals />} />
            <Route path="referral" element={<ReferralDashboard />} />
            <Route path="verify-payment/:id" element={<VerifyPayment />} />
            <Route path="payment-verification" element={<PaymentVerification />} />
          </Route>

          {/* Routes du tableau de bord administrateur */}
          <Route path="/admin" element={
            <PrivateRoute>
              {profile?.is_admin ? <AdminLayout /> : <Navigate to="/dashboard" />}
            </PrivateRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="investments" element={<AdminInvestments />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="user-activity" element={<UserActivity />} />
            <Route path="user-tracking" element={<UserTracking />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;