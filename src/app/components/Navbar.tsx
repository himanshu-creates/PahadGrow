import { Link, useNavigate } from 'react-router';
import { Menu, ShoppingCart, User, Search, Bell } from 'lucide-react';
import { useState } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import logo from "../../assets/placeholder.png";

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: 'buyer' | 'seller' | 'landowner' | 'admin' | null;
}

export function Navbar({ isLoggedIn = false, userRole = null }: NavbarProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="PahadGrow" 
              className="h-10 w-auto object-contain"
            />

            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-green-700">
                PahadGrow
              </span>
              <span className="text-[10px] text-gray-500 uppercase">
                Cultivating Growth
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/marketplace" className="hover:text-green-700 transition">
              {t('nav.marketplace')}
            </Link>
            <Link to="/knowledge" className="hover:text-green-700 transition">
              {t('nav.knowledge')}
            </Link>
            <Link to="/land-rental" className="hover:text-green-700 transition">
              {t('nav.landRental')}
            </Link>
            <Link to="/community" className="hover:text-green-700 transition">
              {t('nav.community')}
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <LanguageSelector />

            {!isLoggedIn ? (
              <>
                <Link 
                  to="/login"
                  className="text-green-700 font-medium"
                >
                  {t('nav.login')}
                </Link>

                <Link 
                  to="/login"
                  className="bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  {t('nav.signup')}
                </Link>
              </>
            ) : (
              <>
                <Search size={20}/>
                <Bell size={20}/>
                <ShoppingCart size={20}/>
                <User size={20}/>
              </>
            )}

            <button 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu size={24}/>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}