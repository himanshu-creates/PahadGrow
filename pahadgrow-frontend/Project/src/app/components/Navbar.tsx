import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, ShoppingCart, User, X, Heart, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { NotificationBell } from './NotificationBell';
import { getCart, getWishlist, isLoggedIn, logout, getCurrentUser } from '../../api';
import logo from '../../assets/placeholder.png';

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: 'buyer' | 'seller' | 'landowner' | 'admin' | null;
}

export function Navbar({ isLoggedIn: isLoggedInProp = false, userRole = null }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const loggedIn = isLoggedInProp || isLoggedIn();
  const user = getCurrentUser();

  useEffect(() => {
    if (loggedIn) {
      getCart().then(r => setCartCount(r.cart.length)).catch(() => {});
      getWishlist().then(r => setWishlistCount(r.wishlist.length)).catch(() => {});
    }
  }, [loggedIn, location.pathname]);

  const navLinks = [
    { to: '/marketplace', label: t('nav.marketplace') },
    { to: '/knowledge', label: t('nav.knowledge') },
    { to: '/land-rental', label: t('nav.landRental') },
    { to: '/community', label: t('nav.community') },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'seller' || user?.role === 'landowner' ? '/seller' :
    '/dashboard';

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
            {navLinks.map(link => (
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
          <div className="flex items-center gap-2">
            <LanguageSelector />

            {!loggedIn ? (
              <>
                <Link to="/login" className="hidden md:block text-green-700 font-medium hover:text-green-800 transition-colors px-3 py-2">
                  {t('nav.login')}
                </Link>
                {/* ✅ FIX: /login → /signup */}
                <Link to="/signup" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium text-sm">
                  {t('nav.signup')}
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <NotificationBell />

                <Link
                  to="/dashboard"
                  className="relative p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Wishlist"
                >
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                  title="Cart"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-green-700 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-green-50 transition-all"
                  >
                    <div className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-border z-50 py-2 overflow-hidden">
                      <Link to={dashboardPath} onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 transition-colors text-sm">
                        <User size={16} className="text-primary" />
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 transition-colors text-sm">
                        <User size={16} className="text-primary" />
                        <span>{t('nav.profile')}</span>
                      </Link>
                      <Link to="/cart" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 transition-colors text-sm">
                        <ShoppingCart size={16} className="text-primary" />
                        <span>{t('nav.cart')}</span>
                        {cartCount > 0 && <span className="ml-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
                      </Link>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => { setShowUserMenu(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors text-sm"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
            >
              {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive(link.to) ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!loggedIn ? (
              <div className="pt-2 flex gap-2">
                <Link to="/login" onClick={() => setShowMobileMenu(false)}
                  className="flex-1 text-center py-2.5 border border-green-700 text-green-700 rounded-lg font-medium">
                  {t('nav.login')}
                </Link>
                {/* ✅ FIX: /login → /signup */}
                <Link to="/signup" onClick={() => setShowMobileMenu(false)}
                  className="flex-1 text-center py-2.5 bg-green-700 text-white rounded-lg font-medium">
                  {t('nav.signup')}
                </Link>
              </div>
            ) : (
              <button onClick={handleLogout}
                className="w-full mt-2 py-2.5 text-red-600 border border-red-200 rounded-lg font-medium flex items-center justify-center gap-2">
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}