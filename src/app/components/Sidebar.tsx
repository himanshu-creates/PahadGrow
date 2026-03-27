import { Link, useLocation } from 'react-router';
import { Home, ShoppingBag, Package, Heart, Users, UserCircle, LayoutDashboard, PlusCircle, DollarSign, Star, BarChart3, FileText, MapPin } from 'lucide-react';
import logo from "/src/assets/placeholder.png";git add .

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

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen shadow-sm">
      <div className="p-6">
        {/* Compact Logo */}
        <Link to="/" className="flex justify-center mb-6 pb-4 border-b border-border">
          <img 
            src={logo} 
            alt="PahadGrow" 
            className="h-12 w-auto object-contain hover:scale-105 transition-transform"
          />
        </Link>

        <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-3">
          {role === 'buyer' ? 'User Panel' : role === 'seller' ? 'Seller Panel' : 'Admin Panel'}
        </h2>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-muted hover:text-primary'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}