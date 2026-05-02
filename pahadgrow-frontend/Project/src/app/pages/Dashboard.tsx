import { useState, useEffect } from 'react';
import {
  ShoppingBag, Heart, Package, IndianRupee, Loader2, Trash2,
  LayoutDashboard, User, ShoppingCart, AlertTriangle, Plus, Minus,
  MapPin, Phone, CheckCircle2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StatsCard } from '../components/StatsCard';
import { useAuth } from '../contexts/AuthContext';
import {
  getOrders, getCart, getWishlist, removeFromCart,
  addToCart, toggleWishlist, updateOrderStatus, updateProfile,
  Order, Product
} from '../../api';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'orders' | 'wishlist' | 'cart' | 'profile';
type OrderFilter = 'all' | 'processing' | 'delivered' | 'cancelled';

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    processing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[s] ?? 'bg-gray-100 text-gray-600 border-gray-200';
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [toast, setToast] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [removingWishId, setRemovingWishId] = useState<string | null>(null);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  const [removingCartId, setRemovingCartId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    village: user?.village || '',
    district: user?.district || '',
  });

  // ─── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => { fetchAll(); }, []);

  // Sync profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        village: user.village || '',
        district: user.district || '',
      });
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, cartRes, wishlistRes] = await Promise.all([
        getOrders(),
        getCart(),
        getWishlist(),
      ]);
      setOrders(ordersRes.orders);
      setCart(cartRes.cart);
      setWishlist(wishlistRes.wishlist);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ─── Stats ──────────────────────────────────────────────────────────────
  const totalSpent = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + o.amount, 0);

  const cartTotal = cart.reduce(
    (s, i) => s + (i.product?.price || 0) * i.quantity, 0
  );

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // ─── Orders ─────────────────────────────────────────────────────────────
  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter(o => o.status === orderFilter);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, 'cancelled');
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      showToast('Order cancelled ✅');
    } catch {
      showToast('Failed to cancel order ❌');
    } finally {
      setCancellingId(null);
    }
  };

  // ─── Wishlist ────────────────────────────────────────────────────────────
  const handleRemoveWishlist = async (productId: string) => {
    setRemovingWishId(productId);
    try {
      await toggleWishlist(productId);
      setWishlist(prev => prev.filter(p => p.id !== productId));
      showToast('Removed from wishlist');
    } catch {
      showToast('Failed to remove ❌');
    } finally {
      setRemovingWishId(null);
    }
  };

  const handleAddToCartFromWishlist = async (productId: string) => {
    setAddingCartId(productId);
    try {
      await addToCart(productId, 1);
      // Refresh cart
      const cartRes = await getCart();
      setCart(cartRes.cart);
      showToast('Added to cart 🛒');
    } catch {
      showToast('Failed to add to cart ❌');
    } finally {
      setAddingCartId(null);
    }
  };

  // ─── Cart ────────────────────────────────────────────────────────────────
  const handleRemoveCart = async (productId: string) => {
    setRemovingCartId(productId);
    try {
      await removeFromCart(productId);
      setCart(prev => prev.filter(i => i.productId !== productId));
      showToast('Removed from cart');
    } catch {
      showToast('Failed to remove ❌');
    } finally {
      setRemovingCartId(null);
    }
  };

  const handleCartQty = async (productId: string, qty: number) => {
    if (qty < 1) return;
    try {
      await addToCart(productId, qty);
      setCart(prev =>
        prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i)
      );
    } catch {}
  };

  // ─── Profile ─────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      // Update localStorage + context
      localStorage.setItem('pg_user', JSON.stringify(res.user));
      setUser(res.user);
      showToast('Profile updated ✅');
    } catch {
      showToast('Failed to save profile ❌');
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        <Sidebar role="buyer" />

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                My Dashboard
              </h1>
              <p className="text-gray-500 mt-0.5 text-sm">
                Welcome back, <span className="font-medium text-gray-700">{user?.name?.split(' ')[0] || 'there'}</span>! 👋
              </p>
            </motion.div>

            {/* Tab Nav */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit flex-wrap">
              {(
                [
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'orders', label: 'Orders', icon: ShoppingBag },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'cart', label: 'Cart', icon: ShoppingCart },
                  { id: 'profile', label: 'Profile', icon: User },
                ] as { id: Tab; label: string; icon: any }[]
              ).map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-white text-green-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {/* Badges */}
                    {tab.id === 'cart' && cart.length > 0 && (
                      <span className="bg-green-700 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                        {cart.length}
                      </span>
                    )}
                    {tab.id === 'wishlist' && wishlist.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Loading / Error */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-green-700" size={36} />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <AlertTriangle size={36} className="text-red-500" />
                <p className="text-gray-600 text-sm">{error}</p>
                <button
                  onClick={fetchAll}
                  className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">

                {/* ── OVERVIEW ──────────────────────────────────────── */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Welcome card */}
                    <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 mb-6 text-white flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-green-100 text-sm">Welcome back</p>
                        <h2 className="text-xl font-bold">{user?.name}</h2>
                        <p className="text-green-100 text-sm mt-0.5">{user?.email}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {[
                        {
                          title: 'Total Orders',
                          value: String(orders.length),
                          icon: <ShoppingBag size={20} />,
                          trend: `${orders.filter(o => o.status === 'delivered').length} delivered`,
                          trendUp: true,
                        },
                        {
                          title: 'Wishlist Items',
                          value: String(wishlist.length),
                          icon: <Heart size={20} />,
                          trend: 'saved products',
                        },
                        {
                          title: 'Cart Items',
                          value: String(cart.length),
                          icon: <Package size={20} />,
                          trend: cart.length > 0 ? `₹${fmt(cartTotal)} total` : 'empty',
                        },
                        {
                          title: 'Total Spent',
                          value: `₹${fmt(totalSpent)}`,
                          icon: <IndianRupee size={20} />,
                          trend: 'on delivered orders',
                          trendUp: totalSpent > 0,
                        },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.title}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <StatsCard {...stat} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-sm text-green-700 font-medium hover:underline"
                        >
                          View all →
                        </button>
                      </div>

                      {recentOrders.length === 0 ? (
                        <div className="py-10 text-center text-gray-400 text-sm">
                          No orders yet.{' '}
                          <Link to="/marketplace" className="text-green-700 hover:underline font-medium">
                            Start shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{order.productName}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  #{order.id.slice(0, 8)} · {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-green-700">₹{fmt(order.amount)}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick links */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Link
                        to="/marketplace"
                        className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl hover:bg-green-100 transition-colors group"
                      >
                        <div className="p-2 bg-green-700 rounded-lg text-white group-hover:bg-green-800 transition-colors">
                          <ShoppingBag size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Browse Marketplace</p>
                          <p className="text-xs text-gray-500">Discover fresh products</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => setActiveTab('cart')}
                        className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors group text-left"
                      >
                        <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                          <ShoppingCart size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">View Cart</p>
                          <p className="text-xs text-gray-500">{cart.length} items · ₹{fmt(cartTotal)}</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── ORDERS ────────────────────────────────────────── */}
                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Filter tabs */}
                    <div className="flex gap-2 flex-wrap mb-4">
                      {(['all', 'processing', 'delivered', 'cancelled'] as OrderFilter[]).map(f => (
                        <button
                          key={f}
                          onClick={() => setOrderFilter(f)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all border ${
                            orderFilter === f
                              ? 'bg-green-700 text-white border-green-700'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                          }`}
                        >
                          {f === 'all' ? `All (${orders.length})` : f}
                          {f !== 'all' && (
                            <span className="ml-1 opacity-60">
                              ({orders.filter(o => o.status === f).length})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {filteredOrders.length === 0 ? (
                        <div className="py-14 text-center text-gray-400 text-sm">
                          <ShoppingBag size={32} className="mx-auto mb-3 text-gray-300" />
                          No {orderFilter !== 'all' ? orderFilter : ''} orders found.
                          {orderFilter === 'all' && (
                            <span> <Link to="/marketplace" className="text-green-700 hover:underline font-medium">Shop now</Link></span>
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {filteredOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{order.productName}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  #{order.id.slice(0, 8)} · {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                                <span className="text-sm font-bold text-green-700">₹{fmt(order.amount)}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColor(order.status)}`}>
                                  {order.status}
                                </span>
                                {order.status === 'processing' && (
                                  <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={cancellingId === order.id}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    {cancellingId === order.id
                                      ? <Loader2 size={11} className="animate-spin" />
                                      : <X size={11} />
                                    }
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── WISHLIST ──────────────────────────────────────── */}
                {activeTab === 'wishlist' && (
                  <motion.div
                    key="wishlist"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-gray-900">
                        Wishlist <span className="text-gray-400 font-normal">({wishlist.length})</span>
                      </h2>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-16 text-center">
                        <Heart size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4 text-sm">No saved items yet</p>
                        <Link
                          to="/marketplace"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors"
                        >
                          Browse Marketplace
                        </Link>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlist.map((product, i) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                          >
                            <div className="relative">
                              <img
                                src={product.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'}
                                alt={product.name}
                                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={() => handleRemoveWishlist(product.id)}
                                disabled={removingWishId === product.id}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                              >
                                {removingWishId === product.id
                                  ? <Loader2 size={14} className="animate-spin text-gray-400" />
                                  : <Trash2 size={14} className="text-gray-500" />
                                }
                              </button>
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 truncate mb-1">{product.name}</h4>
                              <p className="text-green-700 font-bold mb-3">
                                ₹{fmt(product.price)}
                                <span className="text-xs font-normal text-gray-400">/{product.unit}</span>
                              </p>
                              <button
                                onClick={() => handleAddToCartFromWishlist(product.id)}
                                disabled={addingCartId === product.id}
                                className="w-full py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                              >
                                {addingCartId === product.id
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : <ShoppingCart size={14} />
                                }
                                Add to Cart
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── CART ──────────────────────────────────────────── */}
                {activeTab === 'cart' && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-gray-900">
                        Cart <span className="text-gray-400 font-normal">({cart.length} items)</span>
                      </h2>
                      {cartTotal > 0 && (
                        <span className="text-green-700 font-bold">Total: ₹{fmt(cartTotal)}</span>
                      )}
                    </div>

                    {cart.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-16 text-center">
                        <ShoppingCart size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4 text-sm">Your cart is empty</p>
                        <Link
                          to="/marketplace"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors"
                        >
                          Browse Marketplace
                        </Link>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-50">
                          {cart.map(item => (
                            <div key={item.productId} className="flex items-center gap-4 px-5 py-4">
                              <img
                                src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100'}
                                alt={item.product?.name}
                                className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {item.product?.name || 'Product'}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  ₹{fmt(item.product?.price || 0)} / {item.product?.unit}
                                </p>
                              </div>

                              {/* Qty controls */}
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => handleCartQty(item.productId, item.quantity - 1)}
                                  className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => handleCartQty(item.productId, item.quantity + 1)}
                                  className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <span className="text-sm font-bold text-green-700 w-16 text-right">
                                ₹{fmt((item.product?.price || 0) * item.quantity)}
                              </span>

                              <button
                                onClick={() => handleRemoveCart(item.productId)}
                                disabled={removingCartId === item.productId}
                                className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-1"
                              >
                                {removingCartId === item.productId
                                  ? <Loader2 size={16} className="animate-spin" />
                                  : <Trash2 size={16} />
                                }
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-xl font-bold text-gray-900">₹{fmt(cartTotal)}</p>
                          </div>
                          <button
                            onClick={() => navigate('/cart')}
                            className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors shadow-md"
                          >
                            <ShoppingCart size={16} />
                            Go to Checkout
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── PROFILE ───────────────────────────────────────── */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Profile header */}
                      <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-8 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{user?.name}</p>
                          <p className="text-green-100 text-sm">{user?.email}</p>
                          <p className="text-green-100 text-xs mt-0.5 capitalize">{user?.role}</p>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-5">Edit Profile</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Full Name
                            </label>
                            <div className="relative">
                              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                value={profileForm.name}
                                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                placeholder="Your full name"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                placeholder="+91 98765 43210"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Village
                            </label>
                            <div className="relative">
                              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                value={profileForm.village}
                                onChange={e => setProfileForm({ ...profileForm, village: e.target.value })}
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                placeholder="Your village"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              District
                            </label>
                            <div className="relative">
                              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                value={profileForm.district}
                                onChange={e => setProfileForm({ ...profileForm, district: e.target.value })}
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                placeholder="Your district"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition-colors disabled:opacity-60 shadow-md"
                          >
                            {savingProfile
                              ? <Loader2 size={15} className="animate-spin" />
                              : <CheckCircle2 size={15} />
                            }
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
