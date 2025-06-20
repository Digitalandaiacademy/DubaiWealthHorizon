import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  Wallet, 
  History, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  UserCircle,
  ArrowDownCircle,
  Shield,
  CheckCircle2,
  RefreshCw,
  BarChart2,
  Target,
  Award
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import NotificationDropdown from './NotificationDropdown';
import CacheManager from './CacheManager';

import { useInvestmentStore } from '../store/investmentStore';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showCacheManager, setShowCacheManager] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuthStore();
  const { getHighestActivePlan } = useInvestmentStore();

  const highestPlan = getHighestActivePlan();

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mes investissements', href: '/dashboard/investments', icon: Wallet },
    { name: 'Vérification des Paiements', href: '/dashboard/payment-verification', icon: CheckCircle2 },
    { name: 'Transactions', href: '/dashboard/transactions', icon: History },
    { name: 'Retraits', href: '/dashboard/withdrawals', icon: ArrowDownCircle },
    { name: 'Parrainage', href: '/dashboard/referral', icon: Users },
    { name: 'Analyse', href: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Performance Parrainage', href: '/dashboard/referral-performance', icon: Award },
    { name: 'Objectifs', href: '/dashboard/goals', icon: Target },
    { name: 'Mon profil', href: '/dashboard/profile', icon: UserCircle },
  ];

  // Add admin link if user is admin
  if (profile?.is_admin) {
    navigation.push({
      name: 'Administration',
      href: '/admin',
      icon: Shield
    });
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Handle manual cache clearing
  const handleClearCache = () => {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
    
    // Store last update time
    localStorage.setItem('last_cache_update', new Date().toISOString());
    
    // Hide cache manager after use
    setTimeout(() => {
      setShowCacheManager(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Mobile */}
      <div className="lg:hidden">
        {/* Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">DWH</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-4 py-2 text-sm font-medium rounded-md
                      ${location.pathname === item.href
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
          <div>
            {highestPlan && highestPlan.icon ? (
              <span
                className="inline-block text-2xl mr-2"
                style={{ color: highestPlan.color || 'inherit' }}
                aria-label={highestPlan.name}
                title={highestPlan.name}
              >
                {highestPlan.icon}
              </span>
            ) : (
              <UserCircle className="inline-block h-9 w-9 rounded-full" />
            )}
          </div>
          <div className="ml-3">
            <p
              className="text-sm font-medium group-hover:text-gray-900"
              style={{ color: highestPlan?.color || '#4B5563' }} // fallback gray-700
            >
              {profile?.full_name}
            </p>
            <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
              {profile?.email}
            </p>
          </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <Link to="/" className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold">DWH</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-2 text-sm font-medium rounded-md
                    ${location.pathname === item.href
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  {highestPlan && highestPlan.icon ? (
                    <span
                      className="inline-block text-2xl mr-2"
                      style={{ color: highestPlan.color || 'inherit' }}
                      aria-label={highestPlan.name}
                      title={highestPlan.name}
                    >
                      {highestPlan.icon}
                    </span>
                  ) : (
                    <UserCircle className="inline-block h-9 w-9 rounded-full" />
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className="text-sm font-medium group-hover:text-gray-900"
                    style={{ color: highestPlan?.color || '#4B5563' }} // fallback gray-700
                  >
                    {profile?.full_name}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    {profile?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              {/* Search bar if needed */}
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <NotificationDropdown />
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Déconnexion
              </button>

              {/* Refresh Button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setShowCacheManager(true)} 
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                </button>
                <span className="text-xs text-gray-500">Actualiser</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        
        {/* Cache Manager */}
        {showCacheManager && <CacheManager onClearCache={handleClearCache} />}
      </div>
    </div>
  );
};

export default DashboardLayout;