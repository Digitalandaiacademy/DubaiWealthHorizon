import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import InstallPWA from './components/InstallPWA';
import SessionTracker from './components/SessionTracker';
import NetworkDetector from './components/NetworkDetector';
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
import AdminNotifications from './pages/admin/AdminNotifications';
import ResetPassword from './pages/ResetPassword';
import Analytics from './pages/dashboard/Analytics';
import ReferralPerformance from './pages/dashboard/ReferralPerformance';
import Goals from './pages/dashboard/Goals';
import toast from 'react-hot-toast';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';
import CacheManager from './components/CacheManager';
import SelectPaymentCountry from './pages/dashboard/SelectPaymentCountry';
import CamerounPayment from './pages/dashboard/payments/CamerounPayment';
import KenyaPayment from './pages/dashboard/payments/KenyaPayment';
import SenegalPayment from './pages/dashboard/payments/SenegalPayment';
import BeninPayment from './pages/dashboard/payments/BeninPayment';

function App() {
  const { initialize, profile } = useAuthStore();
  const [isStackBlitz, setIsStackBlitz] = useState(false);
  const [showCacheManager, setShowCacheManager] = useState(false);

  useEffect(() => {
    initialize();

    // Check if running in StackBlitz
    const isRunningInStackBlitz = window.location.hostname.includes('stackblitz') || 
                                 window.navigator.userAgent.includes('StackBlitz');
    setIsStackBlitz(isRunningInStackBlitz);

    // Only try to register service worker if not in StackBlitz
    if (!isRunningInStackBlitz) {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
              console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
              console.log('Service Worker registration failed:', error);
            });
        });
      }
    }
  }, []);

  return (
    <Router>
      <SessionTracker />
      <NetworkDetector />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        {!isStackBlitz && <InstallPWA />}
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
            <Route path="new-investment" element={<NewInvestment />} />
            <Route path="select-payment-country" element={<SelectPaymentCountry />} />
            <Route path="payment/cameroun" element={<CamerounPayment />} />
            <Route path="payment/kenya" element={<KenyaPayment />} />
            <Route path="payment/senegal" element={<SenegalPayment />} />
            <Route path="payment/benin" element={<BeninPayment />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="withdrawals" element={<Withdrawals />} />
            <Route path="referral" element={<ReferralDashboard />} />
            <Route path="verify-payment/:id" element={<VerifyPayment />} />
            <Route path="payment-verification" element={<PaymentVerification />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="referral-performance" element={<ReferralPerformance />} />
            <Route path="goals" element={<Goals />} />
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
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
        <NetworkStatusIndicator />
        {showCacheManager && <CacheManager onClearCache={() => setShowCacheManager(false)} />}
      </div>
    </Router>
  );
}

export default App;