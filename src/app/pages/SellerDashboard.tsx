import { DollarSign, Package, Star, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StatsCard } from '../components/StatsCard';

export default function SellerDashboard() {
  const recentOrders = [
    { id: '101', product: 'Organic Honey', buyer: 'Priya Sharma', amount: '₹900', status: 'Shipped', date: '2026-03-24' },
    { id: '102', product: 'Himalayan Apples', buyer: 'Rahul Kumar', amount: '₹600', status: 'Delivered', date: '2026-03-22' },
    { id: '103', product: 'Turmeric Powder', buyer: 'Anjali Verma', amount: '₹400', status: 'Processing', date: '2026-03-25' },
  ];

  const topProducts = [
    { name: 'Organic Honey', sales: 45, revenue: '₹20,250' },
    { name: 'Himalayan Apples', sales: 120, revenue: '₹14,400' },
    { name: 'Turmeric Powder', sales: 67, revenue: '₹13,400' },
  ];

  // Enhanced chart data
  const salesData = [
    { month: 'Jan', sales: 15000, orders: 45 },
    { month: 'Feb', sales: 22000, orders: 67 },
    { month: 'Mar', sales: 18000, orders: 52 },
    { month: 'Apr', sales: 28000, orders: 78 },
    { month: 'May', sales: 35000, orders: 88 },
    { month: 'Jun', sales: 42000, orders: 95 },
    { month: 'Jul', sales: 48050, orders: 105 },
  ];

  const productPerformance = [
    { product: 'Honey', sales: 20250 },
    { product: 'Apples', sales: 14400 },
    { product: 'Turmeric', sales: 13400 },
    { product: 'Herbs', sales: 8500 },
    { product: 'Others', sales: 6200 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="seller" />
      <div className="flex">
        <Sidebar role="seller" />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">Seller Dashboard</h1>
              <p className="text-muted-foreground mb-8">Track your sales, orders, and business growth</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { id: 'sales', title: 'Total Sales', value: '₹48,050', icon: <DollarSign size={24} />, trend: '+12% this month', trendUp: true },
                { id: 'products', title: 'Products Listed', value: '18', icon: <Package size={24} />, trend: '+3 new', trendUp: true },
                { id: 'rating', title: 'Avg Rating', value: '4.7', icon: <Star size={24} />, trend: '86 reviews' },
                { id: 'orders', title: 'Active Orders', value: '7', icon: <ShoppingBag size={24} />, trend: '2 pending' },
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

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sales & Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Revenue Overview</h2>
                  <div className="flex items-center gap-2 text-secondary text-sm">
                    <TrendingUp size={16} />
                    <span className="font-medium">+42% growth</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1B5E20" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `₹${value}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#1B5E20" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Product Performance Chart */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Product Performance</h2>
                  <Package size={20} className="text-primary" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="product" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `₹${value}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Bar dataKey="sales" fill="#1B5E20" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Top Selling Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg border border-border p-6 mb-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Top Selling Products</h2>
                <button className="text-primary hover:underline text-sm font-medium">View Analytics</button>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {topProducts.map((product, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="border-2 border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{product.revenue}</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{product.sales}</span> units sold
                    </p>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-secondary text-sm">
                        <TrendingUp size={16} />
                        <span className="font-medium">Top performer</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <button className="text-primary hover:underline text-sm font-medium">View All Orders</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Buyer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
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
                        <td className="py-3 px-4 text-sm">{order.buyer}</td>
                        <td className="py-3 px-4 text-sm font-bold text-primary">{order.amount}</td>
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
          </div>
        </main>
      </div>
    </div>
  );
}