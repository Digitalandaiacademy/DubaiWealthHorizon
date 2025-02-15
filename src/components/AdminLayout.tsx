import React, { useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  TrendingUp
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/dashboard');
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Tableau de Bord',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin'
    },
    {
      title: 'Utilisateurs',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/users'
    },
    {
      title: 'Paiements',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/admin/payments'
    },
    {
      title: 'Investissements',
      icon: <TrendingUp className="h-5 w-5" />,
      path: '/admin/investments'
    },
    {
      title: 'Paramètres',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <p className="text-xs text-gray-400">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-800 transition-colors text-red-400"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
