import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, TrendingUp, Package, DollarSign, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StatsCard } from '../components/StatsCard';
import { getOrders, getCart, getWishlist, removeFromCart, addToCart, getCurrentUser, Order, Product } from '../../api';

const COLORS = ['#1B5E20', '#4CAF50', '#FF8F00', '#81C784'];

export default function Dashboard() {
  const user = getCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number; product: Product }>>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, cartRes, wishlistRes] = await Promise.all([
        getOrders(),
        getCart(),
        getWishlist(),
      ]);
      setOrders(ordersRes.orders);
      setCart(cartRes.cart);
      setWishlist(wishlistRes.wishlist);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleRemoveCart = async (productId: string) => {
    try {
      await removeFromCart(productId);
      setCart(prev => prev.filter(i => i.productId !== productId));
      showToast('Removed from cart');
    } catch {
      showToast('Failed to remove');
    }
  };

  const handleCartQty = async (productId: string, qty: number) => {
    if (qty < 1) return;
    try {
      await addToCart(productId, qty);
      setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
    } catch {}
  };

  const totalSpent = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.amount, 0);
  const cartTotal = cart.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);

  const spendingData = Object.entries(
    orders.reduce((acc, o) => {
      acc[o.productName] = (acc[o.productName] || 0) + o.amount;
      return acc;
    }, {} as Record<string, number>)
  ).slice(0, 4).map(([name, value]) => ({ name, value }));

  const orderTrendData = ['Jan','Feb','Mar','Apr','May','Jun'].map((month, i) => ({
    month,
    orders: orders.filter(o => new Date(o.date).getMonth() === i).length,
  }));

  const statusColor = (s: string) =>
    s === 'delivered' ? 'bg-green-100 text-green-700' :
    s === 'shipped' ? 'bg-blue-100 text-blue-700' :
    s === 'cancelled' ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="flex">
        <Sidebar role="buyer" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-muted-foreground mb-8">Here's your dashboard overview.</p>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { id: 'orders', title: 'Total Orders', value: String(orders.length), icon: <ShoppingBag size={24} />, trend: `${orders.filter(o=>o.status==='delivered').length} delivered` },
                    { id: 'saved', title: 'Wishlist Items', value: String(wishlist.length), icon: <Heart size={24} />, trend: 'saved products' },
                    { id: 'cart', title: 'Cart Total', value: `₹${cartTotal}`, icon: <Package size={24} />, trend: `${cart.length} items` },
                    { id: 'spent', title: 'Total Spent', value: `₹${totalSpent}`, icon: <DollarSign size={24} />, trend: 'on delivered orders', trendUp: true },
                  ].map((stat, i) => (
                    <motion.div key={stat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <StatsCard {...stat} />
                    </motion.div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">Order Trend</h2>
                      <TrendingUp size={20} className="text-primary" />
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={orderTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="orders" stroke="#1B5E20" strokeWidth={3} dot={{ fill: '#1B5E20', r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">Spending Breakdown</h2>
                      <DollarSign size={20} className="text-primary" />
                    </div>
                    {spendingData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={spendingData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                            label={({ name, percent }) => `${name.slice(0,10)} ${(percent * 100).toFixed(0)}%`}>
                            {spendingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => `₹${v}`} contentStyle={{ borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-48 text-muted-foreground">Place orders to see spending breakdown</div>
                    )}
                  </div>
                </div>

                {/* Cart */}
                <div className="bg-white rounded-xl shadow-lg border border-border p-6 mb-8">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold">Your Cart ({cart.length} items)</h2>
                    {cartTotal > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-primary">₹{cartTotal}</p>
                      </div>
                    )}
                  </div>
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Your cart is empty. <a href="/marketplace" className="text-primary hover:underline">Shop now</a></p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.productId} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                          <img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100'} alt={item.product?.name} className="w-16 h-16 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.product?.name || 'Product'}</h4>
                            <p className="text-sm text-muted-foreground">₹{item.product?.price} / {item.product?.unit}</p>
                          </div>
                          <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button onClick={() => handleCartQty(item.productId, item.quantity - 1)} className="px-2 py-1 hover:bg-muted text-sm font-bold">−</button>
                            <span className="px-3 py-1 text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => handleCartQty(item.productId, item.quantity + 1)} className="px-2 py-1 hover:bg-muted text-sm font-bold">+</button>
                          </div>
                          <p className="font-bold text-primary w-20 text-right">₹{(item.product?.price || 0) * item.quantity}</p>
                          <button onClick={() => handleRemoveCart(item.productId)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2">
                        <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-semibold shadow-md">
                          Checkout — ₹{cartTotal}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-lg border border-border p-6 mb-8">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold">Recent Orders</h2>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No orders yet. <a href="/marketplace" className="text-primary hover:underline">Start shopping</a></p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 10).map(order => (
                            <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4 text-sm font-mono text-muted-foreground">#{order.id.slice(0,8)}</td>
                              <td className="py-3 px-4 text-sm font-medium">{order.productName}</td>
                              <td className="py-3 px-4 text-sm font-bold text-primary">₹{order.amount}</td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${statusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Wishlist */}
                <div className="bg-white rounded-xl shadow-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold">Your Wishlist</h2>
                  </div>
                  {wishlist.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No saved items. <a href="/marketplace" className="text-primary hover:underline">Browse products</a></p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {wishlist.map(product => (
                        <motion.div key={product.id} whileHover={{ y: -4 }} className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                          <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300'} alt={product.name} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="p-4">
                            <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                            <p className="text-primary font-bold mb-3">₹{product.price}/{product.unit}</p>
                            <button
                              onClick={() => addToCart(product.id, 1).then(() => showToast('Added to cart! 🛒'))}
                              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-medium text-sm"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </motion.div>
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
