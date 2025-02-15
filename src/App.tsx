import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import Referral from './pages/dashboard/Referral';
import VerifyPayment from './pages/dashboard/VerifyPayment';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminInvestments from './pages/admin/AdminInvestments';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  const { initialize, profile } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        <Routes>
          {/* Routes publiques avec Navbar et Footer */}
          <Route path="/" element={<><Navbar /><main className="flex-grow"><Home /></main><Footer /></>} />
          <Route path="/about" element={<><Navbar /><main className="flex-grow"><About /></main><Footer /></>} />
          <Route path="/privacy" element={<><Navbar /><main className="flex-grow"><Privacy /></main><Footer /></>} />
          <Route path="/faq" element={<><Navbar /><main className="flex-grow"><FAQ /></main><Footer /></>} />
          <Route path="/login" element={<><Navbar /><main className="flex-grow"><Login /></main><Footer /></>} />
          <Route path="/register" element={<><Navbar /><main className="flex-grow"><Register /></main><Footer /></>} />
          <Route path="/investment" element={<><Navbar /><main className="flex-grow"><Investment /></main><Footer /></>} />
          <Route path="/testimonials" element={<><Navbar /><main className="flex-grow"><Testimonials /></main><Footer /></>} />
          <Route path="/community" element={<><Navbar /><main className="flex-grow"><Community /></main><Footer /></>} />
          <Route path="/simulator" element={<><Navbar /><main className="flex-grow"><Simulator /></main><Footer /></>} />

          {/* Routes du tableau de bord utilisateur */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="investments" element={<Investments />} />
            <Route path="invest" element={<NewInvestment />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="withdrawals" element={<Withdrawals />} />
            <Route path="referral" element={<Referral />} />
            <Route path="verify-payment/:id" element={<VerifyPayment />} />
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
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;