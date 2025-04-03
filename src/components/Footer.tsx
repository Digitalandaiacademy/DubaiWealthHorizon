import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">DubaiWealth Horizon</span>
            </div>
            <p className="text-gray-400">
              Votre passerelle vers l'investissement immobilier à Dubai.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Investissement</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/investment" className="text-gray-400 hover:text-white">
                  Plans d'Investissement
                </Link>
              </li>
              <li>
                <Link to="/simulator" className="text-gray-400 hover:text-white">
                  Simulateur
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-gray-400 hover:text-white">
                  Témoignages
                </Link>
              </li>
              <li>
                <Link to="/referral" className="text-gray-400 hover:text-white">
                  Programme de Parrainage
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                Dubai, Émirats Arabes Unis
              </li>
              <li>
                <a href="tel:+971XXXXXXXX" className="text-gray-400 hover:text-white">
                  +971 XX XXX XXXX
                </a>
              </li>
              <li>
                <a href="mailto:contact@dubaiwealthhorizon.com" className="text-gray-400 hover:text-white">
                  contact@dubaiwealthhorizon.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Informations Légales</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/legal/conditions-generales" className="text-gray-400 hover:text-white">
                  Conditions Générales
                </Link>
              </li>
              <li>
                <Link to="/legal/mentions-legales" className="text-gray-400 hover:text-white">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link to="/legal/politique-confidentialite" className="text-gray-400 hover:text-white">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link to="/legal/cookies" className="text-gray-400 hover:text-white">
                  Cookies
                </Link>
              </li>
              <li>
                <Link to="/legal/lexique" className="text-gray-400 hover:text-white">
                  Lexique
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p> 2023-2025 DubaiWealth Horizon. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;