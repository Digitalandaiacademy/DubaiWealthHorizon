import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Menu, X, MessageCircle } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Investissements', href: '/investment' },
    { name: 'Parrainage', href: '/referral' },
    { name: 'Communauté', href: '/community' },
    { name: 'Témoignages', href: '/testimonials' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">DubaiWealth Horizon</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200"
            >
              Inscription
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/login"
              className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => setIsOpen(false)}
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="block bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200"
              onClick={() => setIsOpen(false)}
            >
              Inscription
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;