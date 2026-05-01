import { useState, useEffect } from 'react';
import { DollarSign, Package, Star, ShoppingBag, TrendingUp, Plus, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StatsCard } from '../components/StatsCard';
import { getOrders, getProducts, updateOrderStatus, getCurrentUser, Order, Product } from '../../api';

export default function SellerDashboard() {
  const user = getCurrentUser();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        getOrders(),
        getProducts({ sellerId: user?.id }),
      ]);
      setOrders(ordersRes.orders);
      setProducts(productsRes.products);
    } catch {}
    finally { setLoading(false); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      showToast(`Order marked as ${status} ✅`);
    } catch {
      showToast('Failed to update status');
    }
  };

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0);
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  const avgRating = products.length > 0
    ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1)
    : '0.0';

  const salesData = ['Jan','Feb','Mar','Apr','May','Jun','Jul'].map((month, i) => ({
    month,
    sales: orders.filter(o => new Date(o.date).getMonth() === i).reduce((s, o) => s + o.amount, 0),
    orders: orders.filter(o => new Date(o.date).getMonth() === i).length,
  }));

  const productPerformance = products.slice(0, 5).map(p => ({
    product: p.name.slice(0, 12),
    sales: p.sold * p.price,
  }));

  const statusColor = (s: string) =>
    s === 'delivered' ? 'bg-green-100 text-green-700' :
    s === 'shipped' ? 'bg-blue-100 text-blue-700' :
    s === 'confirmed' ? 'bg-purple-100 text-purple-700' :
    s === 'cancelled' ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-600';

  const nextStatus: Record<string, string> = {
    processing: 'confirmed',
    confirmed: 'shipped',
    shipped: 'delivered',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="seller" />

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="flex">
        <Sidebar role="seller" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back, {user?.name?.split(' ')[0]}! 👋</p>
                </div>
                <Link
                  to="/seller/add-product"
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-medium shadow-md"
                >
                  <Plus size={18} />
                  Add Product
                </Link>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 mb-8">
                  {[
                    { id: 'rev', title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, trend: 'all time', trendUp: true },
                    { id: 'prod', title: 'Products Listed', value: String(products.length), icon: <Package size={24} />, trend: `${products.filter(p=>p.status==='active').length} active` },
                    { id: 'rating', title: 'Avg Rating', value: avgRating, icon: <Star size={24} />, trend: `${products.reduce((s,p)=>s+p.reviewCount,0)} reviews` },
                    { id: 'orders', title: 'Active Orders', value: String(activeOrders), icon: <ShoppingBag size={24} />, trend: `${orders.length} total` },
                  ].map((stat, i) => (
                    <motion.div key={stat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <StatsCard {...stat} />
                    </motion.div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-semibold">Revenue Overview</h2>
                      <TrendingUp size={20} className="text-primary" />
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip formatter={(v) => `₹${v}`} contentStyle={{ borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="sales" stroke="#1B5E20" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-border p-6">
                    <h2 className="text-xl font-semibold mb-5">Product Performance</h2>
                    {productPerformance.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={productPerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="product" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip formatter={(v) => `₹${v}`} contentStyle={{ borderRadius: '8px' }} />
                          <Bar dataKey="sales" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-48 text-muted-foreground">Add products to see performance</div>
                    )}
                  </div>
                </div>

                {/* Orders Management */}
                <div className="bg-white rounded-xl shadow-lg border border-border p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-5">Manage Orders</h2>
                  {orders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            {['Order ID', 'Product', 'Qty', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                              <th key={h} className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-3 text-sm font-mono text-muted-foreground">#{order.id.slice(0,8)}</td>
                              <td className="py-3 px-3 text-sm font-medium">{order.productName}</td>
                              <td className="py-3 px-3 text-sm">{order.quantity}</td>
                              <td className="py-3 px-3 text-sm font-bold text-primary">₹{order.amount}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${statusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString('en-IN')}</td>
                              <td className="py-3 px-3">
                                {nextStatus[order.status] && (
                                  <button
                                    onClick={() => handleStatusUpdate(order.id, nextStatus[order.status])}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-xs font-medium"
                                  >
                                    <CheckCircle size={12} />
                                    Mark {nextStatus[order.status]}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* My Products */}
                <div className="bg-white rounded-xl shadow-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold">My Products ({products.length})</h2>
                    <Link to="/seller/add-product" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                      <Plus size={14} /> Add New
                    </Link>
                  </div>
                  {products.length === 0 ? (
                    <div className="text-center py-10">
                      <Package size={36} className="text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-3">No products yet</p>
                      <Link to="/seller/add-product" className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-medium inline-flex items-center gap-2">
                        <Plus size={16} /> Add Your First Product
                      </Link>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map(p => (
                        <div key={p.id} className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
                          <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300'} alt={p.name} className="w-full h-36 object-cover" />
                          <div className="p-4">
                            <h4 className="font-semibold truncate">{p.name}</h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-primary font-bold">₹{p.price}/{p.unit}</span>
                              <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {p.status}
                              </span>
                              <span className="text-xs text-muted-foreground">{p.sold} sold</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
