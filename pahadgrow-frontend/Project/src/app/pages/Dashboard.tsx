import { ShoppingBag, Heart, MessageCircle, Bell, TrendingUp, Package, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StatsCard } from '../components/StatsCard';

export default function Dashboard() {
  const recentOrders = [
    { id: '1', product: 'Organic Honey', seller: 'Ramesh Negi', status: 'Shipped', date: '2026-03-24' },
    { id: '2', product: 'Himalayan Apples', seller: 'Sunita Rawat', status: 'Delivered', date: '2026-03-22' },
    { id: '3', product: 'Turmeric Powder', seller: 'Vijay Singh', status: 'Processing', date: '2026-03-25' },
  ];

  const savedProducts = [
    { id: '1', name: 'Pure Honey', price: '₹450', image: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=400' },
    { id: '2', name: 'Fresh Apples', price: '₹120/kg', image: 'https://images.unsplash.com/photo-1587418756582-0c3b4fe798b2?w=400' },
    { id: '3', name: 'Turmeric', price: '₹200', image: 'https://images.unsplash.com/photo-1698556735172-1b5b3cd9d2ce?w=400' },
  ];

  // Chart data
  const orderTrendData = [
    { month: 'Jan', orders: 5 },
    { month: 'Feb', orders: 8 },
    { month: 'Mar', orders: 12 },
    { month: 'Apr', orders: 15 },
    { month: 'May', orders: 18 },
    { month: 'Jun', orders: 22 },
  ];

  const spendingData = [
    { category: 'Honey', value: 3200 },
    { category: 'Fruits', value: 2800 },
    { category: 'Herbs', value: 1500 },
    { category: 'Vegetables', value: 1200 },
  ];

  const COLORS = ['#1B5E20', '#4CAF50', '#FF8F00', '#81C784'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />
      <div className="flex">
        <Sidebar role="buyer" />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back!</h1>
              <p className="text-muted-foreground mb-8">Here's what's happening with your orders today.</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { id: 'orders', title: 'Total Orders', value: '12', icon: <ShoppingBag size={24} />, trend: '+3 this month', trendUp: true },
                { id: 'saved', title: 'Saved Products', value: '24', icon: <Heart size={24} />, trend: '+5 this week' },
                { id: 'messages', title: 'Messages', value: '5', icon: <MessageCircle size={24} />, trend: '2 unread' },
                { id: 'notifications', title: 'Notifications', value: '8', icon: <Bell size={24} />, trend: '3 new' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <StatsCard {...stat} />
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Order Trend Chart */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Order Trend</h2>
                  <div className="flex items-center gap-2 text-secondary text-sm">
                    <TrendingUp size={16} />
                    <span className="font-medium">+35% growth</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={orderTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#1B5E20" 
                      strokeWidth={3}
                      dot={{ fill: '#1B5E20', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Spending by Category */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Spending by Category</h2>
                  <DollarSign size={20} className="text-primary" />
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`spending-cell-${entry.category}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹${value}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg border border-border p-6 mb-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <button className="text-primary hover:underline text-sm font-medium">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Seller</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <motion.tr 
                        key={order.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium">#{order.id}</td>
                        <td className="py-3 px-4 text-sm font-medium">{order.product}</td>
                        <td className="py-3 px-4 text-sm">{order.seller}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            order.status === 'Delivered' ? 'bg-secondary/10 text-secondary' :
                            order.status === 'Shipped' ? 'bg-accent/10 text-accent' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Saved Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Wishlist</h2>
                <button className="text-primary hover:underline text-sm font-medium">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {savedProducts.map((product, index) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="border border-border rounded-xl p-4 hover:shadow-lg transition-all group"
                  >
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-primary font-bold mb-3">{product.price}</p>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-md transition-all font-medium"
                    >
                      Add to Cart
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}