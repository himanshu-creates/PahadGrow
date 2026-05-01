import { useState, useEffect, useCallback } from 'react';
import {
  Users, Package, ShoppingBag, TrendingUp,
  Trash2, Shield, ChevronLeft, ChevronRight, Search,
  LogOut, Menu, X, Home, AlertTriangle,
  RefreshCw, LayoutDashboard, Leaf,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('pg_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

interface Stats {
  users: { total: number; buyers: number; sellers: number; landowners: number; admins: number };
  products: { total: number; active: number };
  orders: { total: number; pending: number; delivered: number };
  lands: { total: number };
  community: { posts: number; reviews: number };
  revenue: { total: number };
  monthlySignups: { _id: { year: number; month: number }; count: number }[];
  recentUsers: UserRow[];
  recentOrders: OrderRow[];
}

interface UserRow {
  id: string; name: string; email: string; role: string;
  village?: string; district?: string; joinedDate?: string; createdAt?: string;
}

interface ProductRow {
  id: string; name: string; category: string; price: number;
  stock: number; status: string; sellerName: string; location?: string; createdAt?: string;
}

interface OrderRow {
  id: string; productName: string; amount: number; status: string;
  buyerId: string; createdAt?: string;
}

function StatCard({ title, value, icon, subtitle, gradient }: {
  title: string; value: string | number; icon: React.ReactNode; subtitle?: string; gradient: string;
}) {
  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg ${gradient} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -mr-6 -mt-6" />
      <div className="absolute bottom-0 right-8 w-16 h-16 rounded-full bg-white/10 -mb-4" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">{icon}</div>
        </div>
        <p className="text-3xl font-bold mb-0.5">{value}</p>
        <p className="text-sm font-medium opacity-90">{title}</p>
        {subtitle && <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
    sold_out: 'bg-red-100 text-red-700 border border-red-200',
    buyer: 'bg-blue-100 text-blue-700 border border-blue-200',
    seller: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    landowner: 'bg-amber-100 text-amber-700 border border-amber-200',
    admin: 'bg-purple-100 text-purple-700 border border-purple-200',
    processing: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-700 border border-blue-200',
    shipped: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    delivered: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border border-red-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 mt-4 justify-end">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-600 px-2">Page {page} of {totalPages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm flex items-center gap-2 animate-in">
      <div className="w-2 h-2 bg-green-400 rounded-full" />
      {message}
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await adminRequest<{ success: boolean; stats: Stats }>('/admin/stats');
      setStats(data.stats);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3">
      <AlertTriangle size={20} />
      <div>
        <p className="font-semibold">Failed to load stats</p>
        <p className="text-sm opacity-80 mt-0.5">{error}</p>
      </div>
      <button onClick={load} className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl text-sm font-medium transition-colors">
        Retry
      </button>
    </div>
  );

  if (!stats) return null;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const maxSignups = Math.max(...(stats.monthlySignups.map(m => m.count)), 1);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.users.total.toLocaleString()}
          icon={<Users size={20} className="text-white" />}
          subtitle={`${stats.users.sellers} sellers`}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Products" value={stats.products.total.toLocaleString()}
          icon={<Package size={20} className="text-white" />}
          subtitle={`${stats.products.active} active`}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600" />
        <StatCard title="Orders" value={stats.orders.total.toLocaleString()}
          icon={<ShoppingBag size={20} className="text-white" />}
          subtitle={`${stats.orders.pending} pending`}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
        <StatCard title="Revenue" value={`₹${(stats.revenue.total / 100000).toFixed(1)}L`}
          icon={<TrendingUp size={20} className="text-white" />}
          subtitle="Total earnings"
          gradient="bg-gradient-to-br from-purple-500 to-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-green-500 rounded-full" />
            User Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Buyers', count: stats.users.buyers, color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
              { label: 'Sellers', count: stats.users.sellers, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
              { label: 'Landowners', count: stats.users.landowners, color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
              { label: 'Admins', count: stats.users.admins, color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className={`font-bold ${item.text}`}>{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`${item.color} h-2.5 rounded-full transition-all duration-700`}
                    style={{ width: `${stats.users.total ? (item.count / stats.users.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Signups Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            Monthly Signups
          </h3>
          {stats.monthlySignups.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-44">
              {stats.monthlySignups.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">{m.count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-lg transition-all hover:from-green-500 hover:to-emerald-300 cursor-pointer"
                    style={{ height: `${Math.max((m.count / maxSignups) * 100, 6)}%` }}
                    title={`${monthNames[m._id.month - 1]}: ${m.count} signups`}
                  />
                  <span className="text-xs text-gray-400 truncate w-full text-center">
                    {monthNames[m._id.month - 1]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-1 h-5 bg-purple-500 rounded-full" />
            Recent Signups
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="text-left py-3 px-5 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-5 text-gray-500 font-medium">Email</th>
                <th className="text-left py-3 px-5 text-gray-500 font-medium">Role</th>
                <th className="text-left py-3 px-5 text-gray-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map(u => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-green-50/30 transition-colors">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-gray-500">{u.email}</td>
                  <td className="py-3 px-5"><Badge status={u.role} /></td>
                  <td className="py-3 px-5 text-gray-400">{u.joinedDate || u.createdAt?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const data = await adminRequest<any>(`/admin/users?${params}`);
      setUsers(data.users); setTotal(data.total); setTotalPages(data.totalPages);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      setActionId(id);
      await adminRequest(`/admin/users/${id}`, { method: 'DELETE' });
      showToast('User deleted successfully'); load();
    } catch (e: any) { showToast(`Error: ${e.message}`); }
    finally { setActionId(null); }
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      setActionId(id);
      await adminRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
      showToast(`Role updated to ${newRole}`); load();
    } catch (e: any) { showToast(`Error: ${e.message}`); }
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-4">
      <Toast message={toast} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, email…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="landowner">Landowner</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={load} className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-500 rounded-full" />
          <h3 className="font-semibold text-gray-800">Users <span className="text-gray-400 text-sm font-normal">({total})</span></h3>
        </div>
        {error ? (
          <div className="p-6 text-red-600 text-sm flex items-center gap-2"><AlertTriangle size={16} />{error}</div>
        ) : loading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-green-600" size={24} /></div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Location</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Role</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Joined</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-green-50/30 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-gray-500">{u.email}</td>
                    <td className="py-3 px-5 text-gray-400 text-xs">{[u.village, u.district].filter(Boolean).join(', ') || '—'}</td>
                    <td className="py-3 px-5"><Badge status={u.role} /></td>
                    <td className="py-3 px-5 text-gray-400 text-xs">{u.joinedDate || u.createdAt?.slice(0, 10)}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={actionId === u.id}
                          className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50 bg-white">
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="landowner">Landowner</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={() => deleteUser(u.id, u.name)} disabled={actionId === u.id}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete user">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && (
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const data = await adminRequest<any>(`/admin/products?${params}`);
      setProducts(data.products); setTotal(data.total); setTotalPages(data.totalPages);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      setActionId(id);
      await adminRequest(`/admin/products/${id}`, { method: 'DELETE' });
      showToast('Product deleted'); load();
    } catch (e: any) { showToast(`Error: ${e.message}`); }
    finally { setActionId(null); }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      setActionId(id);
      await adminRequest(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showToast(`Status → ${status}`); load();
    } catch (e: any) { showToast(`Error: ${e.message}`); }
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-4">
      <Toast message={toast} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="sold_out">Sold Out</option>
        </select>
        <button onClick={load} className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-1 h-5 bg-emerald-500 rounded-full" />
          <h3 className="font-semibold text-gray-800">Products <span className="text-gray-400 text-sm font-normal">({total})</span></h3>
        </div>
        {error ? (
          <div className="p-6 text-red-600 text-sm flex items-center gap-2"><AlertTriangle size={16} />{error}</div>
        ) : loading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-green-600" size={24} /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Product</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Seller</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Category</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Price</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Stock</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-green-50/30 transition-colors">
                    <td className="py-3 px-5 font-medium text-gray-900 max-w-48 truncate">{p.name}</td>
                    <td className="py-3 px-5 text-gray-500 text-xs">{p.sellerName}</td>
                    <td className="py-3 px-5 text-gray-500 capitalize">{p.category}</td>
                    <td className="py-3 px-5 font-semibold text-gray-800">₹{p.price}</td>
                    <td className="py-3 px-5 text-gray-500">{p.stock}</td>
                    <td className="py-3 px-5"><Badge status={p.status} /></td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <select value={p.status} onChange={e => changeStatus(p.id, e.target.value)} disabled={actionId === p.id}
                          className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50 bg-white">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="sold_out">Sold Out</option>
                        </select>
                        <button onClick={() => deleteProduct(p.id, p.name)} disabled={actionId === p.id}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && (
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (statusFilter) params.set('status', statusFilter);
      const data = await adminRequest<any>(`/admin/orders?${params}`);
      setOrders(data.orders); setTotal(data.total); setTotalPages(data.totalPages);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: string) => {
    try {
      setActionId(id);
      await adminRequest(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showToast('Order updated'); load();
    } catch (e: any) { showToast(`Error: ${e.message}`); }
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-4">
      <Toast message={toast} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Status</option>
          <option value="processing">Processing</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={load} className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-1 h-5 bg-amber-500 rounded-full" />
          <h3 className="font-semibold text-gray-800">Orders <span className="text-gray-400 text-sm font-normal">({total})</span></h3>
        </div>
        {error ? (
          <div className="p-6 text-red-600 text-sm flex items-center gap-2"><AlertTriangle size={16} />{error}</div>
        ) : loading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-green-600" size={24} /></div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Order ID</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Product</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-gray-50 hover:bg-green-50/30 transition-colors">
                    <td className="py-3 px-5 text-gray-400 text-xs font-mono">#{o.id.slice(-8)}</td>
                    <td className="py-3 px-5 font-medium max-w-48 truncate">{o.productName}</td>
                    <td className="py-3 px-5 font-semibold text-gray-800">₹{o.amount}</td>
                    <td className="py-3 px-5"><Badge status={o.status} /></td>
                    <td className="py-3 px-5 text-gray-400 text-xs">{o.createdAt?.slice(0, 10)}</td>
                    <td className="py-3 px-5">
                      <select value={o.status} onChange={e => changeStatus(o.id, e.target.value)} disabled={actionId === o.id}
                        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50 bg-white">
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && (
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'users' | 'products' | 'orders';

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, color: 'text-blue-500' },
  { id: 'users',     label: 'Users',     icon: <Users size={18} />,           color: 'text-purple-500' },
  { id: 'products',  label: 'Products',  icon: <Package size={18} />,         color: 'text-emerald-500' },
  { id: 'orders',    label: 'Orders',    icon: <ShoppingBag size={18} />,     color: 'text-amber-500' },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 shadow-sm
        flex flex-col transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-tight">PahadGrow</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${tab === item.id
                  ? 'bg-green-50 text-green-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
              `}
            >
              <span className={tab === item.id ? 'text-green-600' : item.color}>{item.icon}</span>
              {item.label}
              {tab === item.id && <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full" />}
            </button>
          ))}
        </nav>

        {/* User info + actions */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
            <Home size={15} /> Back to Site
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {tab === 'dashboard' ? 'Admin Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1) + ' Management'}
            </h1>
            <p className="text-xs text-gray-400">PahadGrow Platform</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-semibold">
              <Shield size={12} /> Admin
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'orders' && <OrdersTab />}
        </main>
      </div>
    </div>
  );
}