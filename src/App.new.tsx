import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import SessionTracker from './components/SessionTracker';
import AdminRoutes from './components/AdminRoutes';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import About from './pages/About';
import Privacy from './pages/Privacy';

const App = () => {
  const { profile } = useAuthStore();

  return (
    <Router>
      <SessionTracker />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        <Routes>
          {/* Routes publiques avec Navbar et Footer */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />

          {/* Routes d'administration */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
};

export default App;
