import { Link, useLocation } from 'react-router';
import { Home, ShoppingBag, Package, Heart, Users, UserCircle, LayoutDashboard, PlusCircle, DollarSign, Star, BarChart3, FileText, MapPin } from 'lucide-react';

interface SidebarProps {
  role: 'buyer' | 'seller' | 'admin';
}

export function Sidebar({ role }: SidebarProps) {
  const location = useLocation();

  const buyerLinks = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { path: '/orders', icon: Package, label: 'My Orders' },
    { path: '/wishlist', icon: Heart, label: 'Wishlist' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  const sellerLinks = [
    { path: '/seller', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/seller/add-product', icon: PlusCircle, label: 'Add Product' },
    { path: '/seller/products', icon: Package, label: 'My Products' },
    { path: '/seller/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/seller/earnings', icon: DollarSign, label: 'Earnings' },
    { path: '/seller/reviews', icon: Star, label: 'Reviews' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  const adminLinks = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/sellers', icon: UserCircle, label: 'Sellers' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const links = role === 'buyer' ? buyerLinks : role === 'seller' ? sellerLinks : adminLinks;

  const panelLabel = role === 'buyer' ? 'User Panel' : role === 'seller' ? 'Seller Panel' : 'Admin Panel';
  const panelColor = role === 'admin' ? 'text-purple-700 bg-purple-50' : 'text-green-700 bg-green-50';

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm flex-shrink-0">
      <div className="p-5">
        {/* Panel Label */}
        <div className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest mb-5 ${panelColor}`}>
          {panelLabel}
        </div>

        <nav className="space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-green-600'} />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Logout */}
        <div className="mt-8 pt-5 border-t border-gray-100">
          <Link to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
