import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Menu, X, MessageCircle } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Accueil
            </Link>
            <Link to="/investment" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Investir
            </Link>
            <Link to="/referral" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Parrainage
            </Link>
            <Link to="/testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Témoignages
            </Link>
            <Link to="/community" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              Communauté
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              À Propos
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              FAQ
            </Link>
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
            <Link
              to="/"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/investment"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Investir
            </Link>
            <Link
              to="/referral"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Parrainage
            </Link>
            <Link
              to="/testimonials"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Témoignages
            </Link>
            <Link
              to="/community"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Communauté
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              À Propos
            </Link>
            <Link
              to="/faq"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </Link>
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