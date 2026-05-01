import { useState, useEffect, useCallback } from 'react';
import {
  Users, Package, ShoppingBag, TrendingUp, BarChart2,
  Trash2, Shield, ChevronLeft, ChevronRight, Search,
  LogOut, Menu, X, Home, AlertTriangle, CheckCircle,
  RefreshCw, Eye, EyeOff, Filter, MapPin, Calendar,
  ArrowUp, ArrowDown, Minus, LayoutDashboard, Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

// ─── API ────────────────────────────────────────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────────────
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
  id: string;
  name: string;
  email: string;
  role: string;
  village?: string;
  district?: string;
  joinedDate?: string;
  createdAt?: string;
}

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  sellerName: string;
  location?: string;
  createdAt?: string;
}

interface OrderRow {
  id: string;
  productName: string;
  amount: number;
  status: string;
  buyerId: string;
  createdAt?: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ title, value, icon, subtitle, color }: {
  title: string; value: string | number; icon: React.ReactNode;
  subtitle?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    sold_out: 'bg-red-100 text-red-700',
    buyer: 'bg-blue-100 text-blue-700',
    seller: 'bg-green-100 text-green-700',
    landowner: 'bg-amber-100 text-amber-700',
    admin: 'bg-purple-100 text-purple-700',
    processing: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    available: 'bg-green-100 text-green-700',
    rented: 'bg-blue-100 text-blue-700',
    unavailable: 'bg-gray-100 text-gray-600',
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
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
      >
        <ChevronRight size={16} />
      </button>
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
      setLoading(true);
      setError('');
      const data = await adminRequest<{ success: boolean; stats: Stats }>('/admin/stats');
      setStats(data.stats);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin text-green-600" size={28} /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700"><AlertTriangle size={20} className="inline mr-2" />{error}</div>;
  if (!stats) return null;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const maxSignups = Math.max(...(stats.monthlySignups.map(m => m.count)), 1);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.users.total.toLocaleString()} icon={<Users size={22} className="text-blue-600" />} subtitle={`${stats.users.sellers} sellers`} color="bg-blue-50" />
        <StatCard title="Products" value={stats.products.total.toLocaleString()} icon={<Package size={22} className="text-green-600" />} subtitle={`${stats.products.active} active`} color="bg-green-50" />
        <StatCard title="Orders" value={stats.orders.total.toLocaleString()} icon={<ShoppingBag size={22} className="text-amber-600" />} subtitle={`${stats.orders.pending} pending`} color="bg-amber-50" />
        <StatCard title="Revenue" value={`₹${(stats.revenue.total / 100000).toFixed(1)}L`} icon={<TrendingUp size={22} className="text-purple-600" />} subtitle="From delivered orders" color="bg-purple-50" />
      </div>

      {/* Role Breakdown + Monthly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">User Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Buyers', count: stats.users.buyers, color: 'bg-blue-500', pct: stats.users.total ? (stats.users.buyers / stats.users.total) * 100 : 0 },
              { label: 'Sellers', count: stats.users.sellers, color: 'bg-green-500', pct: stats.users.total ? (stats.users.sellers / stats.users.total) * 100 : 0 },
              { label: 'Landowners', count: stats.users.landowners, color: 'bg-amber-500', pct: stats.users.total ? (stats.users.landowners / stats.users.total) * 100 : 0 },
              { label: 'Admins', count: stats.users.admins, color: 'bg-purple-500', pct: stats.users.total ? (stats.users.admins / stats.users.total) * 100 : 0 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Signups */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Signups</h3>
          {stats.monthlySignups.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {stats.monthlySignups.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-700">{m.count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm transition-all hover:opacity-80"
                    style={{ height: `${Math.max((m.count / maxSignups) * 100, 4)}%` }}
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Signups</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Name</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Email</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Role</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium">{u.name}</td>
                  <td className="py-2.5 px-3 text-gray-500">{u.email}</td>
                  <td className="py-2.5 px-3"><Badge status={u.role} /></td>
                  <td className="py-2.5 px-3 text-gray-400">{u.joinedDate || u.createdAt?.slice(0, 10)}</td>
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const data = await adminRequest<any>(`/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      setActionId(id);
      await adminRequest(`/admin/users/${id}`, { method: 'DELETE' });
      showToast('User deleted successfully');
      load();
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setActionId(null);
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      setActionId(id);
      await adminRequest(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      showToast(`Role updated to ${newRole}`);
      load();
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, village…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="landowner">Landowner</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={load} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Users <span className="text-gray-400 text-sm font-normal">({total})</span></h3>
        </div>

        {error ? (
          <div className="p-6 text-red-600 text-sm"><AlertTriangle size={16} className="inline mr-2" />{error}</div>
        ) : loading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-green-600" size={24} /></div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Location</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 px-4 text-gray-500">{u.email}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{[u.village, u.district].filter(Boolean).join(', ') || '—'}</td>
                    <td className="py-3 px-4"><Badge status={u.role} /></td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{u.joinedDate || u.createdAt?.slice(0, 10)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* Role change dropdown */}
                        <select
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          disabled={actionId === u.id}
                          className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50"
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="landowner">Landowner</option>
                          <option value="admin">Admin</option>
                        </select>
                        {/* Delete */}
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          disabled={actionId === u.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete user"
                        >
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
          <div className="px-4 py-3 border-t border-gray-100">
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
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const data = await adminRequest<any>(`/admin/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      setActionId(id);
      await adminRequest(`/admin/products/${id}`, { method: 'DELETE' });
      showToast('Product deleted');
      load();
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setActionId(null);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      setActionId(id);
      await adminRequest(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showToast(`Status changed to ${status}`);
      load();
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg text-sm">{toast}</div>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="sold_out">Sold Out</option>
        </select>
        <button onClick={load} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Products <span className="text-gray-400 text-sm font-normal">({total})</span></h3>
        </div>

        {error ? (
          <div className="p-6 text-red-600 text-sm"><AlertTriangle size={16} className="inline mr-2" />{error}</div>
        ) : loading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-green-600" size={24} /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Product</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Seller</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Price</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-48 truncate">{p.name}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{p.sellerName}</td>
                    <td className="py-3 px-4 text-gray-500 capitalize">{p.category}</td>
                    <td className="py-3 px-4 font-medium">₹{p.price}</td>
                    <td className="py-3 px-4 text-gray-500">{p.stock}</td>
                    <td className="py-3 px-4"><Badge status={p.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={p.status}
                          onChange={e => changeStatus(p.id, e.target.value)}
                          disabled={actionId === p.id}
                          className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="sold_out">Sold Out</option>
                        </select>
                        <button
                          onClick={() => deleteProduct(p.id, p.name)}
                          disabled={actionId === p.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
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
          <div className="px-4 py-3 border-t border-gray-100">
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
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (statusFilter) params.set('status', statusFilter);
      const data = await adminRequest<any>(`/admin/orders?${params}`);
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: string) => {
    try {
      setActionId(id);
      await adminRequest(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showToast('Order status updated');
      load();
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg text-sm">{toast}</div>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Status</option>
          <option value="processing">Processing</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={load} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Orders <span className="text-gray-400 text-sm font-normal">({total})</span></h3>
        </div>

        {error ? (
          <div className="p-6 text-red-600 text-sm"><AlertTriangle size={16} className="inline mr-2" />{error}</div>
        ) : loading ? (
          <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-green-600" size={24} /></div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Product</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-400 text-xs font-mono">#{o.id.slice(-8)}</td>
                    <td className="py-3 px-4 font-medium max-w-48 truncate">{o.productName}</td>
                    <td className="py-3 px-4 font-medium">₹{o.amount}</td>
                    <td className="py-3 px-4"><Badge status={o.status} /></td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{o.createdAt?.slice(0, 10)}</td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={e => changeStatus(o.id, e.target.value)}
                        disabled={actionId === o.id}
                        className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50"
                      >
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
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'users' | 'products' | 'orders';

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'users',     label: 'Users',     icon: <Users size={18} /> },
  { id: 'products',  label: 'Products',  icon: <Package size={18} /> },
  { id: 'orders',    label: 'Orders',    icon: <ShoppingBag size={18} /> },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-400 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">PahadGrow</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === item.id
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-xl mb-1 transition-colors"
          >
            <Home size={15} /> Back to Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 capitalize">
              {tab === 'dashboard' ? 'Admin Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1) + ' Management'}
            </h1>
            <p className="text-xs text-gray-400">PahadGrow Platform</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full font-medium">
              <Shield size={12} /> Admin
            </span>
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
