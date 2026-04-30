import { Users, Package, ShoppingBag, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StatsCard } from '../components/StatsCard';

export default function AdminPanel() {
  const pendingSellers = [
    { id: '1', name: 'Ramesh Negi', village: 'Mukteshwar', products: 5, date: '2026-03-24' },
    { id: '2', name: 'Sunita Rawat', village: 'Almora', products: 8, date: '2026-03-25' },
    { id: '3', name: 'Vijay Singh', village: 'Pithoragarh', products: 3, date: '2026-03-26' },
  ];

  const recentActivity = [
    { user: 'Priya Sharma', action: 'Placed order', item: 'Organic Honey', time: '5 mins ago' },
    { user: 'Ramesh Negi', action: 'Added product', item: 'Fresh Apples', time: '12 mins ago' },
    { user: 'Anjali Verma', action: 'Left review', item: 'Turmeric Powder', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="admin" />
      <div className="flex">
        <Sidebar role="admin" />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Users"
                value="5,234"
                icon={<Users size={24} />}
                trend="+342 this month"
                trendUp
              />
              <StatsCard
                title="Active Sellers"
                value="487"
                icon={<Users size={24} />}
                trend="+23 pending"
              />
              <StatsCard
                title="Total Products"
                value="2,145"
                icon={<Package size={24} />}
                trend="+156 this week"
                trendUp
              />
              <StatsCard
                title="Total Revenue"
                value="₹12.4L"
                icon={<TrendingUp size={24} />}
                trend="+18% this month"
                trendUp
              />
            </div>

            {/* Platform Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Growth Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">User Growth</h2>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[320, 450, 580, 720, 890, 1050, 1280].map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${(value / 1280) * 100}%` }}
                      ></div>
                      <span className="text-xs text-muted-foreground mt-2">
                        {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
                <div className="space-y-4 mt-6">
                  {[
                    { category: 'Fruits', percentage: 35, color: 'bg-primary' },
                    { category: 'Honey', percentage: 25, color: 'bg-secondary' },
                    { category: 'Herbs', percentage: 20, color: 'bg-accent' },
                    { category: 'Dairy', percentage: 15, color: 'bg-muted' },
                    { category: 'Others', percentage: 5, color: 'bg-muted-foreground' },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full transition-all`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Seller Approvals */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Pending Seller Approvals</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Village</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Products</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applied</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSellers.map((seller) => (
                      <tr key={seller.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">#{seller.id}</td>
                        <td className="py-3 px-4 text-sm font-medium">{seller.name}</td>
                        <td className="py-3 px-4 text-sm">{seller.village}</td>
                        <td className="py-3 px-4 text-sm">{seller.products} items</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{seller.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors">
                              <CheckCircle size={18} />
                            </button>
                            <button className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action} • {activity.item}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
