import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, ShoppingCart, User, Bell, X } from 'lucide-react';
import { useState } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import logo from "../../assets/placeholder.png";

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: 'buyer' | 'seller' | 'landowner' | 'admin' | null;
}

export function Navbar({ isLoggedIn = false, userRole = null }: NavbarProps) {
  const location = useLocation();
  const { t } = useLanguage();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navLinks = [
    { to: '/marketplace', label: t('nav.marketplace') },
    { to: '/knowledge', label: t('nav.knowledge') },
    { to: '/land-rental', label: t('nav.landRental') },
    { to: '/community', label: t('nav.community') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="PahadGrow" className="h-10 w-auto object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-green-700">PahadGrow</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Cultivating Growth</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive(link.to)
                    ? 'text-green-700 bg-green-50 font-semibold'
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <LanguageSelector />

            {!isLoggedIn ? (
              <>
                <Link to="/login" className="hidden md:block text-green-700 font-medium hover:text-green-800 transition-colors">
                  {t('nav.login')}
                </Link>
                <Link to="/login" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium text-sm">
                  {t('nav.signup')}
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button className="relative p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="relative p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all">
                  <ShoppingCart size={20} />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-green-700 text-white text-[9px] rounded-full flex items-center justify-center font-bold">3</span>
                </button>
                <Link to="/profile" className={`p-2 rounded-lg transition-all ${isActive('/profile') ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}>
                  <User size={20} />
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setShowMobileMenu(false)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive(link.to)
                    ? 'text-green-700 bg-green-50 font-semibold'
                    : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <div className="flex gap-3 pt-3 border-t border-gray-100 mt-2">
                <Link to="/login" onClick={() => setShowMobileMenu(false)}
                  className="flex-1 text-center py-2.5 border border-green-700 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors">
                  {t('nav.login')}
                </Link>
                <Link to="/login" onClick={() => setShowMobileMenu(false)}
                  className="flex-1 text-center py-2.5 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors">
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
