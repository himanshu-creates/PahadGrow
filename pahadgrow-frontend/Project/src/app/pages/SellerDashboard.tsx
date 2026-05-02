import { useState, useEffect } from 'react';
import {
  Package, ShoppingBag, TrendingUp, Clock, Plus, Loader2,
  Edit2, Trash2, X, Check, ChevronDown, IndianRupee,
  BarChart3, LayoutDashboard, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StatsCard } from '../components/StatsCard';
import { useAuth } from '../contexts/AuthContext';
import {
  getOrders, getProducts, updateOrderStatus, updateProduct,
  Order, Product
} from '../../api';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'products' | 'orders' | 'earnings';
type OrderStatus = 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface EditModal {
  product: Product;
  price: string;
  stock: string;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_ORDER: OrderStatus[] = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    delivered: 'bg-green-100 text-green-700 border-green-200',
    shipped: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-purple-100 text-purple-700 border-purple-200',
    processing: 'bg-amber-100 text-amber-700 border-amber-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[s] ?? 'bg-gray-100 text-gray-600 border-gray-200';
};

const productStatusColor = (s: string) =>
  s === 'active'
    ? 'bg-green-100 text-green-700'
    : s === 'inactive'
    ? 'bg-gray-100 text-gray-500'
    : 'bg-amber-100 text-amber-700';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

// ─── Component ────────────────────────────────────────────────────────────────
export default function SellerDashboard() {
  const { user } = useAuth();

  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [toast, setToast] = useState('');
  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, productsRes] = await Promise.all([
        getOrders(),
        getProducts({ sellerId: 'me' }),
      ]);
      setOrders(ordersRes.orders);
      setProducts(productsRes.products);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ─── Toast ──────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ─── Stats ──────────────────────────────────────────────────────────────
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + o.amount, 0);

  const pendingRevenue = orders
    .filter(o => ['processing', 'confirmed', 'shipped'].includes(o.status))
    .reduce((s, o) => s + o.amount, 0);

  const pendingCount = orders.filter(o =>
    ['processing', 'confirmed'].includes(o.status)
  ).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // ─── Order Status Update ─────────────────────────────────────────────────
  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId);
    try {
      const res = await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.order : o)));
      showToast(`Order status updated to "${status}" ✅`);
    } catch (e: any) {
      showToast('Failed to update status ❌');
    } finally {
      setUpdatingOrder(null);
    }
  };

  // ─── Product Edit ────────────────────────────────────────────────────────
  const openEdit = (product: Product) => {
    setEditModal({
      product,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      const res = await updateProduct(editModal.product.id, {
        price: Number(editModal.price),
        stock: Number(editModal.stock),
        status: editModal.status,
      });
      setProducts(prev =>
        prev.map(p => (p.id === editModal.product.id ? res.product : p))
      );
      setEditModal(null);
      showToast('Product updated ✅');
    } catch (e: any) {
      showToast('Failed to update product ❌');
    } finally {
      setSaving(false);
    }
  };

  // ─── Product Delete (soft: set status to inactive) ───────────────────────
  const handleDelete = async (productId: string) => {
    setSaving(true);
    try {
      const res = await updateProduct(productId, { status: 'inactive' });
      setProducts(prev => prev.map(p => (p.id === productId ? res.product : p)));
      setDeleteConfirm(null);
      showToast('Product deactivated ✅');
    } catch {
      showToast('Failed to deactivate product ❌');
    } finally {
      setSaving(false);
    }
  };

  // ─── Earnings chart data ──────────────────────────────────────────────────
  const monthlyEarnings = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleString('en-IN', { month: 'short' });
    const m = d.getMonth();
    const y = d.getFullYear();
    const earned = orders
      .filter(o => {
        const od = new Date(o.date);
        return (
          o.status === 'delivered' &&
          od.getMonth() === m &&
          od.getFullYear() === y
        );
      })
      .reduce((s, o) => s + o.amount, 0);
    return { month, earned };
  });

  const maxEarned = Math.max(...monthlyEarnings.map(m => m.earned), 1);

  // ─── Filtered orders ─────────────────────────────────────────────────────
  const filteredOrders =
    orderFilter === 'all'
      ? orders
      : orders.filter(o => o.status === orderFilter);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="seller" />

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

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setEditModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4 font-medium truncate">
                {editModal.product.name}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price (₹ per {editModal.product.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editModal.price}
                    onChange={e => setEditModal({ ...editModal, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Stock ({editModal.product.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editModal.stock}
                    onChange={e => setEditModal({ ...editModal, stock: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={editModal.status}
                    onChange={e => setEditModal({ ...editModal, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditModal(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Deactivate Product?</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                This product will be hidden from the marketplace. You can reactivate it later.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Processing...' : 'Deactivate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        <Sidebar role="seller" />

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Seller Dashboard
                </h1>
                <p className="text-gray-500 mt-0.5 text-sm">
                  Welcome back, <span className="font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>! 🌿
                </p>
              </div>
              <Link
                to="/seller/add-product"
                className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors font-medium shadow-md text-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Product</span>
              </Link>
            </motion.div>

            {/* Tab Nav */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
              {(
                [
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'products', label: 'My Products', icon: Package },
                  { id: 'orders', label: 'Orders', icon: ShoppingBag },
                  { id: 'earnings', label: 'Earnings', icon: BarChart3 },
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

                {/* ── OVERVIEW ────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {[
                        {
                          title: 'Total Products',
                          value: String(products.length),
                          icon: <Package size={20} />,
                          trend: `${products.filter(p => p.status === 'active').length} active`,
                        },
                        {
                          title: 'Total Orders',
                          value: String(orders.length),
                          icon: <ShoppingBag size={20} />,
                          trend: `${orders.filter(o => o.status === 'delivered').length} delivered`,
                          trendUp: true,
                        },
                        {
                          title: 'Revenue',
                          value: `₹${fmt(totalRevenue)}`,
                          icon: <IndianRupee size={20} />,
                          trend: 'from delivered orders',
                          trendUp: true,
                        },
                        {
                          title: 'Pending Orders',
                          value: String(pendingCount),
                          icon: <Clock size={20} />,
                          trend: 'awaiting action',
                          trendUp: pendingCount === 0,
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
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
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
                        <div className="py-12 text-center text-gray-400 text-sm">
                          No orders yet. Share your products to get started!
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                                {['Order ID', 'Product', 'Amount', 'Status', 'Date'].map(h => (
                                  <th key={h} className="px-6 py-3 font-medium">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {recentOrders.map(order => (
                                <tr
                                  key={order.id}
                                  className="hover:bg-gray-50/60 transition-colors"
                                >
                                  <td className="px-6 py-3.5 text-xs font-mono text-gray-400">
                                    #{order.id.slice(0, 8)}
                                  </td>
                                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900 max-w-[160px] truncate">
                                    {order.productName}
                                  </td>
                                  <td className="px-6 py-3.5 text-sm font-bold text-green-700">
                                    ₹{fmt(order.amount)}
                                  </td>
                                  <td className="px-6 py-3.5">
                                    <span
                                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColor(order.status)}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3.5 text-xs text-gray-400">
                                    {new Date(order.date).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── MY PRODUCTS ─────────────────────────────────────── */}
                {activeTab === 'products' && (
                  <motion.div
                    key="products"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-gray-900">
                        My Products{' '}
                        <span className="text-gray-400 font-normal">({products.length})</span>
                      </h2>
                      <Link
                        to="/seller/add-product"
                        className="flex items-center gap-1.5 text-sm text-green-700 font-medium hover:underline"
                      >
                        <Plus size={14} /> Add New
                      </Link>
                    </div>

                    {products.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-16 text-center">
                        <Package size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4 text-sm">No products listed yet</p>
                        <Link
                          to="/seller/add-product"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors"
                        >
                          <Plus size={15} /> Add Your First Product
                        </Link>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((p, i) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                          >
                            <div className="relative">
                              <img
                                src={
                                  p.images?.[0] ||
                                  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'
                                }
                                alt={p.name}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <span
                                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${productStatusColor(p.status)}`}
                              >
                                {p.status}
                              </span>
                            </div>

                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 truncate mb-1">
                                {p.name}
                              </h4>
                              <p className="text-xs text-gray-400 mb-3 capitalize">{p.category}</p>

                              <div className="flex items-center justify-between mb-3">
                                <span className="text-green-700 font-bold text-base">
                                  ₹{fmt(p.price)}
                                  <span className="text-xs font-normal text-gray-400">
                                    /{p.unit}
                                  </span>
                                </span>
                                <span className="text-xs text-gray-500">
                                  {p.stock} in stock
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                                <span>{p.sold} sold</span>
                                <span>⭐ {p.rating?.toFixed(1) || '0.0'} ({p.reviewCount})</span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEdit(p)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-50 transition-colors"
                                >
                                  <Edit2 size={12} /> Edit
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(p.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={12} /> Deactivate
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── ORDERS ──────────────────────────────────────────── */}
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
                      {['all', ...STATUS_ORDER].map(s => (
                        <button
                          key={s}
                          onClick={() => setOrderFilter(s)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all border ${
                            orderFilter === s
                              ? 'bg-green-700 text-white border-green-700'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                          }`}
                        >
                          {s === 'all' ? `All (${orders.length})` : s}
                          {s !== 'all' && (
                            <span className="ml-1 opacity-60">
                              ({orders.filter(o => o.status === s).length})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {filteredOrders.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">
                          No {orderFilter !== 'all' ? orderFilter : ''} orders found
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                {['Order ID', 'Product', 'Amount', 'Status', 'Date', 'Update Status'].map(
                                  h => (
                                    <th key={h} className="px-5 py-3.5 font-medium">
                                      {h}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {filteredOrders.map(order => (
                                <tr
                                  key={order.id}
                                  className="hover:bg-gray-50/60 transition-colors"
                                >
                                  <td className="px-5 py-4 text-xs font-mono text-gray-400">
                                    #{order.id.slice(0, 8)}
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="text-sm font-medium text-gray-900 max-w-[140px] truncate">
                                      {order.productName}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Qty: {order.quantity}
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-sm font-bold text-green-700">
                                    ₹{fmt(order.amount)}
                                  </td>
                                  <td className="px-5 py-4">
                                    <span
                                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColor(order.status)}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                                    {new Date(order.date).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </td>
                                  <td className="px-5 py-4">
                                    {order.status !== 'delivered' &&
                                    order.status !== 'cancelled' ? (
                                      <div className="relative">
                                        <select
                                          value={order.status}
                                          disabled={updatingOrder === order.id}
                                          onChange={e =>
                                            handleStatusUpdate(order.id, e.target.value)
                                          }
                                          className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer disabled:opacity-50"
                                        >
                                          {STATUS_ORDER.filter(
                                            s => s !== 'cancelled' || order.status === 'processing'
                                          ).map(s => (
                                            <option key={s} value={s} className="capitalize">
                                              {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </option>
                                          ))}
                                        </select>
                                        <ChevronDown
                                          size={12}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                        />
                                        {updatingOrder === order.id && (
                                          <Loader2
                                            size={12}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-green-700"
                                          />
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400 italic capitalize">
                                        {order.status}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── EARNINGS ────────────────────────────────────────── */}
                {activeTab === 'earnings' && (
                  <motion.div
                    key="earnings"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Summary cards */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <IndianRupee size={18} className="text-green-700" />
                          </div>
                          <span className="text-sm text-gray-500 font-medium">Total Earned</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-3">
                          ₹{fmt(totalRevenue)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          From {orders.filter(o => o.status === 'delivered').length} delivered orders
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <TrendingUp size={18} className="text-amber-600" />
                          </div>
                          <span className="text-sm text-gray-500 font-medium">Pending Amount</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-3">
                          ₹{fmt(pendingRevenue)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Across processing, confirmed & shipped orders
                        </p>
                      </div>
                    </div>

                    {/* Bar chart (CSS-only) */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                      <h2 className="font-semibold text-gray-900 mb-1">Monthly Earnings</h2>
                      <p className="text-xs text-gray-400 mb-6">Last 6 months — delivered orders only</p>

                      {monthlyEarnings.every(m => m.earned === 0) ? (
                        <div className="py-10 text-center text-gray-400 text-sm">
                          No earnings data yet. Complete some orders to see your chart!
                        </div>
                      ) : (
                        <div className="flex items-end gap-3 h-48">
                          {monthlyEarnings.map((m, i) => {
                            const pct = maxEarned > 0 ? (m.earned / maxEarned) * 100 : 0;
                            return (
                              <div
                                key={i}
                                className="flex-1 flex flex-col items-center gap-2 group"
                              >
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-gray-900 text-white px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
                                  ₹{fmt(m.earned)}
                                </div>
                                {/* Bar */}
                                <div className="w-full flex-1 flex items-end">
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
                                    transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                                    className={`w-full rounded-t-lg ${
                                      pct === 100
                                        ? 'bg-green-700'
                                        : pct > 50
                                        ? 'bg-green-500'
                                        : pct > 0
                                        ? 'bg-green-300'
                                        : 'bg-gray-100'
                                    } group-hover:brightness-90 transition-all`}
                                    style={{ minHeight: m.earned > 0 ? '6px' : '0' }}
                                  />
                                </div>
                                {/* Label */}
                                <span className="text-xs text-gray-400 font-medium">{m.month}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Y-axis hint */}
                      {maxEarned > 0 && (
                        <div className="flex justify-between mt-3 px-0">
                          <span className="text-xs text-gray-300">₹0</span>
                          <span className="text-xs text-gray-300">₹{fmt(maxEarned)}</span>
                        </div>
                      )}
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
