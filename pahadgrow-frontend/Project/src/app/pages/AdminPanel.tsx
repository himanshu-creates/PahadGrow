import { useState, useEffect, useCallback } from 'react';
import {
  Users, Package, ShoppingBag, TrendingUp,
  Trash2, Shield, ChevronLeft, ChevronRight, Search,
  LogOut, Menu, X, Home, AlertTriangle,
  RefreshCw, LayoutDashboard, Leaf, Bell, Settings,
  ArrowUpRight, ArrowDownRight, Eye, MoreHorizontal,
  Filter, Download, MapPin, Droplets, Zap,
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

interface LandRow {
  id: string; ownerName: string; village: string; district: string;
  area: string; price: number; priceUnit: string; status: string;
  suitableFor: string[]; water: boolean; electricity: boolean;
  description?: string; createdAt?: string;
}

// ─── PahadGrow SVG Logo ───────────────────────────────────────────────────────
function PahadLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left mountain - teal/green */}
      <path d="M8 72 L35 28 L62 72 Z" fill="#1D9E75" opacity="0.9" />
      {/* Right mountain - darker teal */}
      <path d="M38 72 L62 32 L86 72 Z" fill="#0F6E56" opacity="0.95" />
      {/* Overlap overlap area (darker) */}
      <path d="M38 72 L52 48 L62 72 Z" fill="#085041" />
      {/* Peak diamond accent - orange */}
      <path d="M62 20 L68 32 L62 38 L56 32 Z" fill="#E8890C" />
      {/* Small arrow up in diamond */}
      <path d="M62 25 L66 33 L62 30 L58 33 Z" fill="#fff" opacity="0.7" />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon, subtitle, color, trend }: {
  title: string; value: string | number; icon: React.ReactNode;
  subtitle?: string; color: string; trend?: { val: number; up: boolean };
}) {
  const colors: Record<string, { bg: string; accent: string; icon: string; light: string }> = {
    emerald: { bg: '#064E3B', accent: '#10B981', icon: '#A7F3D0', light: '#D1FAE5' },
    blue:    { bg: '#1E3A5F', accent: '#3B82F6', icon: '#BFDBFE', light: '#DBEAFE' },
    amber:   { bg: '#78350F', accent: '#F59E0B', icon: '#FDE68A', light: '#FEF3C7' },
    violet:  { bg: '#3B0764', accent: '#8B5CF6', icon: '#DDD6FE', light: '#EDE9FE' },
  };
  const c = colors[color] || colors.emerald;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${c.bg} 0%, ${c.bg}dd 100%)`,
      borderRadius: 16,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${c.accent}22`,
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -16, right: -16, width: 80, height: 80,
        borderRadius: '50%', background: `${c.accent}18`,
      }} />
      <div style={{
        position: 'absolute', bottom: -8, right: 24, width: 48, height: 48,
        borderRadius: '50%', background: `${c.accent}12`,
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${c.accent}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14, color: c.icon,
        }}>
          {icon}
        </div>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{value}</p>
        <p style={{ fontSize: 13, color: c.light, fontWeight: 600, marginBottom: 4 }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {subtitle && <p style={{ fontSize: 11, color: `${c.light}99` }}>{subtitle}</p>}
          {trend && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 2,
              fontSize: 11, fontWeight: 600,
              color: trend.up ? '#34D399' : '#F87171',
            }}>
              {trend.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend.val}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    active:     { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    inactive:   { bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
    sold_out:   { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    buyer:      { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
    seller:     { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    landowner:  { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    admin:      { bg: '#EDE9FE', color: '#5B21B6', dot: '#8B5CF6' },
    processing: { bg: '#FEF9C3', color: '#854D0E', dot: '#EAB308' },
    confirmed:  { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
    shipped:    { bg: '#E0E7FF', color: '#3730A3', dot: '#6366F1' },
    delivered:  { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    cancelled:  { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    available:  { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    rented:     { bg: '#E0E7FF', color: '#3730A3', dot: '#6366F1' },
    unavailable:{ bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
  };
  const s = map[status] || { bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status.replace('_', ' ')}
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} style={{
        padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
        background: page <= 1 ? '#F9FAFB' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151',
      }}>
        <ChevronLeft size={14} /> Prev
      </button>
      <span style={{ fontSize: 13, color: '#6B7280', padding: '0 8px' }}>
        Page <strong style={{ color: '#1a1a2e' }}>{page}</strong> of {totalPages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} style={{
        padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
        background: page >= totalPages ? '#F9FAFB' : '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151',
      }}>
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#111827', color: '#fff',
      padding: '12px 20px', borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 13, fontWeight: 500,
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      animation: 'slideUp 0.3s ease',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
      {message}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count, accent }: { title: string; count?: number; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ width: 4, height: 20, borderRadius: 4, background: accent }} />
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
        {title}
        {count !== undefined && (
          <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: '#9CA3AF' }}>({count})</span>
        )}
      </h3>
    </div>
  );
}

// ─── Table Wrapper ────────────────────────────────────────────────────────────
function TableCard({ children, header }: { children: React.ReactNode; header: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: '1px solid #F0F0F5', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {header}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          {children}
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 20px', textAlign: 'left',
  fontSize: 11, fontWeight: 700, color: '#9CA3AF',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  background: '#FAFAFA', borderBottom: '1px solid #F3F4F6',
};
const tdStyle: React.CSSProperties = {
  padding: '13px 20px', borderBottom: '1px solid #F9FAFB', verticalAlign: 'middle',
};

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const palettes = [
    { bg: '#D1FAE5', color: '#065F46' },
    { bg: '#DBEAFE', color: '#1E40AF' },
    { bg: '#EDE9FE', color: '#5B21B6' },
    { bg: '#FEF3C7', color: '#92400E' },
    { bg: '#FCE7F3', color: '#9D174D' },
  ];
  const p = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: p.bg, color: p.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: '1px solid #F0F0F5', padding: '14px 18px',
      display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
      marginBottom: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px 9px 36px',
  border: '1px solid #E5E7EB', borderRadius: 10,
  fontSize: 13, outline: 'none', background: '#FAFAFA', color: '#111827',
};
const selectStyle: React.CSSProperties = {
  padding: '9px 14px', border: '1px solid #E5E7EB', borderRadius: 10,
  fontSize: 13, outline: 'none', background: '#FAFAFA', color: '#111827', cursor: 'pointer',
};
const refreshBtnStyle: React.CSSProperties = {
  padding: '9px 16px', border: '1px solid #E5E7EB', borderRadius: 10,
  fontSize: 13, background: '#fff', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontWeight: 500,
};

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #D1FAE5', borderTopColor: '#059669',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: 14, color: '#9CA3AF' }}>Loading dashboard…</p>
    </div>
  );

  if (error) return (
    <div style={{ background: '#FEF2F2', borderRadius: 14, padding: 24, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #FCA5A5' }}>
      <AlertTriangle size={20} color="#EF4444" />
      <div>
        <p style={{ fontWeight: 700, color: '#991B1B', margin: 0 }}>Failed to load stats</p>
        <p style={{ fontSize: 13, color: '#B91C1C', margin: '4px 0 0' }}>{error}</p>
      </div>
      <button onClick={load} style={{ marginLeft: 'auto', padding: '8px 16px', background: '#FEE2E2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#991B1B', fontWeight: 600, fontSize: 13 }}>
        Retry
      </button>
    </div>
  );

  if (!stats) return null;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const maxSignups = Math.max(...(stats.monthlySignups.map(m => m.count)), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard title="Total Users" value={stats.users.total.toLocaleString()}
          icon={<Users size={20} />} subtitle={`${stats.users.sellers} sellers`} color="blue"
          trend={{ val: 12, up: true }} />
        <StatCard title="Products" value={stats.products.total.toLocaleString()}
          icon={<Package size={20} />} subtitle={`${stats.products.active} active`} color="emerald"
          trend={{ val: 8, up: true }} />
        <StatCard title="Orders" value={stats.orders.total.toLocaleString()}
          icon={<ShoppingBag size={20} />} subtitle={`${stats.orders.pending} pending`} color="amber"
          trend={{ val: 3, up: false }} />
        <StatCard title="Revenue" value={`₹${(stats.revenue.total / 100000).toFixed(1)}L`}
          icon={<TrendingUp size={20} />} subtitle="Total earnings" color="violet"
          trend={{ val: 18, up: true }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* User Breakdown */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <SectionHeader title="User Breakdown" accent="#8B5CF6" />
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Buyers',     count: stats.users.buyers,     bar: '#3B82F6', light: '#EFF6FF', text: '#1D4ED8' },
              { label: 'Sellers',    count: stats.users.sellers,    bar: '#10B981', light: '#ECFDF5', text: '#065F46' },
              { label: 'Landowners', count: stats.users.landowners, bar: '#F59E0B', light: '#FFFBEB', text: '#92400E' },
              { label: 'Admins',     count: stats.users.admins,     bar: '#8B5CF6', light: '#F5F3FF', text: '#5B21B6' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.text, background: item.light, padding: '2px 8px', borderRadius: 6 }}>{item.count}</span>
                </div>
                <div style={{ height: 6, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: item.bar,
                    width: `${stats.users.total ? (item.count / stats.users.total) * 100 : 0}%`,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Signups */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <SectionHeader title="Monthly Signups" accent="#3B82F6" />
          <div style={{ padding: '20px 24px' }}>
            {stats.monthlySignups.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: '#D1D5DB', fontSize: 13 }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 150 }}>
                {stats.monthlySignups.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>{m.count}</span>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: `linear-gradient(180deg, #10B981, #059669)`,
                      height: `${Math.max((m.count / maxSignups) * 110, 4)}px`,
                      transition: 'height 0.8s ease',
                      cursor: 'pointer',
                    }} title={`${monthNames[m._id.month - 1]}: ${m.count}`} />
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>{monthNames[m._id.month - 1]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <TableCard
        header={<SectionHeader title="Recent Signups" accent="#8B5CF6" />}
      >
        <thead>
          <tr>
            <th style={thStyle}>User</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {stats.recentUsers.map(u => (
            <tr key={u.id} style={{ transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAFFFE')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={u.name} />
                  <span style={{ fontWeight: 600, color: '#111827' }}>{u.name}</span>
                </div>
              </td>
              <td style={{ ...tdStyle, color: '#6B7280' }}>{u.email}</td>
              <td style={tdStyle}><Badge status={u.role} /></td>
              <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: 12 }}>{u.joinedDate || u.createdAt?.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
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
    <div>
      <Toast message={toast} />
      <FilterBar>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input type="text" placeholder="Search by name, email…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={inputStyle} />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="landowner">Landowner</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={load} style={refreshBtnStyle}>
          <RefreshCw size={13} /> Refresh
        </button>
      </FilterBar>

      <TableCard header={<SectionHeader title="Users" count={total} accent="#3B82F6" />}>
        <thead>
          <tr>
            <th style={thStyle}>User</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Joined</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
              <RefreshCw size={20} style={{ animation: 'spin 0.8s linear infinite', display: 'block', margin: '0 auto 8px' }} />
              Loading…
            </td></tr>
          ) : error ? (
            <tr><td colSpan={6} style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>{error}</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#D1D5DB' }}>No users found</td></tr>
          ) : users.map(u => (
            <tr key={u.id}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAFFFE')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={u.name} />
                  <span style={{ fontWeight: 600, color: '#111827' }}>{u.name}</span>
                </div>
              </td>
              <td style={{ ...tdStyle, color: '#6B7280' }}>{u.email}</td>
              <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: 12 }}>
                {[u.village, u.district].filter(Boolean).join(', ') || '—'}
              </td>
              <td style={tdStyle}><Badge status={u.role} /></td>
              <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: 12 }}>{u.joinedDate || u.createdAt?.slice(0, 10)}</td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={actionId === u.id}
                    style={{ ...selectStyle, padding: '5px 10px', fontSize: 12 }}>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="landowner">Landowner</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => deleteUser(u.id, u.name)} disabled={actionId === u.id}
                    style={{ padding: 6, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      {!loading && !error && (
        <div style={{ marginTop: 16 }}>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
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
    <div>
      <Toast message={toast} />
      <FilterBar>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input type="text" placeholder="Search products…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={inputStyle} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="sold_out">Sold Out</option>
        </select>
        <button onClick={load} style={refreshBtnStyle}><RefreshCw size={13} /> Refresh</button>
      </FilterBar>

      <TableCard header={<SectionHeader title="Products" count={total} accent="#10B981" />}>
        <thead>
          <tr>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Seller</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading…</td></tr>
          ) : error ? (
            <tr><td colSpan={7} style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>{error}</td></tr>
          ) : products.length === 0 ? (
            <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#D1D5DB' }}>No products found</td></tr>
          ) : products.map(p => (
            <tr key={p.id}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAFFFE')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td style={{ ...tdStyle, fontWeight: 600, color: '#111827', maxWidth: 180 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{p.name}</span>
              </td>
              <td style={{ ...tdStyle, color: '#6B7280', fontSize: 12 }}>{p.sellerName}</td>
              <td style={{ ...tdStyle, color: '#6B7280', textTransform: 'capitalize' }}>{p.category}</td>
              <td style={{ ...tdStyle, fontWeight: 700, color: '#059669' }}>₹{p.price}</td>
              <td style={{ ...tdStyle, color: '#374151' }}>{p.stock}</td>
              <td style={tdStyle}><Badge status={p.status} /></td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select value={p.status} onChange={e => changeStatus(p.id, e.target.value)} disabled={actionId === p.id}
                    style={{ ...selectStyle, padding: '5px 10px', fontSize: 12 }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                  <button onClick={() => deleteProduct(p.id, p.name)} disabled={actionId === p.id}
                    style={{ padding: 6, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      {!loading && !error && (
        <div style={{ marginTop: 16 }}>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
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
    <div>
      <Toast message={toast} />
      <FilterBar>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Status</option>
          <option value="processing">Processing</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={load} style={refreshBtnStyle}><RefreshCw size={13} /> Refresh</button>
      </FilterBar>

      <TableCard header={<SectionHeader title="Orders" count={total} accent="#F59E0B" />}>
        <thead>
          <tr>
            <th style={thStyle}>Order ID</th>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Update</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading…</td></tr>
          ) : error ? (
            <tr><td colSpan={6} style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>{error}</td></tr>
          ) : orders.length === 0 ? (
            <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#D1D5DB' }}>No orders found</td></tr>
          ) : orders.map(o => (
            <tr key={o.id}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAFFFE')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#9CA3AF', fontSize: 12 }}>
                <span style={{ background: '#F9FAFB', padding: '3px 8px', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                  #{o.id.slice(-8)}
                </span>
              </td>
              <td style={{ ...tdStyle, fontWeight: 600, color: '#111827', maxWidth: 160 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{o.productName}</span>
              </td>
              <td style={{ ...tdStyle, fontWeight: 700, color: '#059669' }}>₹{o.amount}</td>
              <td style={tdStyle}><Badge status={o.status} /></td>
              <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: 12 }}>{o.createdAt?.slice(0, 10)}</td>
              <td style={tdStyle}>
                <select value={o.status} onChange={e => changeStatus(o.id, e.target.value)} disabled={actionId === o.id}
                  style={{ ...selectStyle, padding: '5px 10px', fontSize: 12 }}>
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
      </TableCard>
      {!loading && !error && (
        <div style={{ marginTop: 16 }}>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

// ─── Lands Tab ────────────────────────────────────────────────────────────────
function LandsTab() {
  const [lands, setLands] = useState<LandRow[]>([]);
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
      const data = await adminRequest<any>(`/admin/lands?${params}`);
      const allLands: LandRow[] = data.lands;
      const filtered = statusFilter ? allLands.filter(l => l.status === statusFilter) : allLands;
      setLands(filtered); setTotal(data.total);
      setTotalPages(Math.ceil(data.total / 15));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const deleteLand = async (id: string) => {
    if (!confirm('Delete this land listing? This cannot be undone.')) return;
    try {
      setActionId(id);
      await adminRequest(`/admin/lands/${id}`, { method: 'DELETE' });
      showToast('Land listing deleted'); load();
    } catch (e: any) { showToast(`Error: ${e.message}`); }
    finally { setActionId(null); }
  };

  const statusCount = (s: string) => lands.filter(l => l.status === s).length;

  return (
    <div>
      <Toast message={toast} />

      {/* Quick stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Listings', value: total, color: '#3B82F6', bg: '#EFF6FF', icon: <MapPin size={18} /> },
          { label: 'Available', value: statusFilter === '' ? lands.filter(l => l.status === 'available').length : statusCount('available'), color: '#10B981', bg: '#ECFDF5', icon: <Leaf size={18} /> },
          { label: 'Rented', value: statusFilter === '' ? lands.filter(l => l.status === 'rented').length : statusCount('rented'), color: '#6366F1', bg: '#EEF2FF', icon: <Zap size={18} /> },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #F0F0F5', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1 }}>{c.value}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 0', fontWeight: 500 }}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <FilterBar>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <button onClick={load} style={refreshBtnStyle}><RefreshCw size={13} /> Refresh</button>
      </FilterBar>

      <TableCard header={<SectionHeader title="Land Listings" count={total} accent="#10B981" />}>
        <thead>
          <tr>
            <th style={thStyle}>Owner</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Area</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Amenities</th>
            <th style={thStyle}>Suitable For</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Listed</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
              <RefreshCw size={20} style={{ animation: 'spin 0.8s linear infinite', display: 'block', margin: '0 auto 8px' }} />
              Loading…
            </td></tr>
          ) : error ? (
            <tr><td colSpan={9} style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>{error}</td></tr>
          ) : lands.length === 0 ? (
            <tr><td colSpan={9}>
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <MapPin size={32} style={{ color: '#E5E7EB', display: 'block', margin: '0 auto 10px' }} />
                <p style={{ color: '#D1D5DB', fontSize: 14 }}>No land listings found</p>
              </div>
            </td></tr>
          ) : lands.map(l => (
            <tr key={l.id}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAFFFE')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Avatar name={l.ownerName} size={30} />
                  <span style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{l.ownerName}</span>
                </div>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6B7280' }}>
                  <MapPin size={12} color="#9CA3AF" />
                  <span style={{ fontSize: 12 }}>{l.village}, {l.district}</span>
                </div>
              </td>
              <td style={{ ...tdStyle, fontWeight: 600, color: '#374151' }}>{l.area}</td>
              <td style={{ ...tdStyle }}>
                <span style={{ fontWeight: 700, color: '#059669' }}>₹{l.price.toLocaleString()}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{l.priceUnit}</span>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span title="Water" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: l.water ? '#DBEAFE' : '#F3F4F6',
                    color: l.water ? '#1D4ED8' : '#9CA3AF',
                  }}>
                    <Droplets size={10} /> Water
                  </span>
                  <span title="Electricity" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: l.electricity ? '#FEF9C3' : '#F3F4F6',
                    color: l.electricity ? '#854D0E' : '#9CA3AF',
                  }}>
                    <Zap size={10} /> Power
                  </span>
                </div>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 160 }}>
                  {l.suitableFor.slice(0, 2).map(s => (
                    <span key={s} style={{ padding: '2px 7px', borderRadius: 5, background: '#F0FDF4', color: '#166534', fontSize: 11, fontWeight: 500 }}>
                      {s}
                    </span>
                  ))}
                  {l.suitableFor.length > 2 && (
                    <span style={{ padding: '2px 6px', borderRadius: 5, background: '#F3F4F6', color: '#6B7280', fontSize: 11 }}>
                      +{l.suitableFor.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td style={tdStyle}><Badge status={l.status} /></td>
              <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: 12 }}>{l.createdAt?.slice(0, 10)}</td>
              <td style={tdStyle}>
                <button onClick={() => deleteLand(l.id)} disabled={actionId === l.id}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
                  <Trash2 size={12} /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      {!loading && !error && (
        <div style={{ marginTop: 16 }}>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}


type Tab = 'dashboard' | 'users' | 'products' | 'orders' | 'lands';

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode; accent: string }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={17} />, accent: '#3B82F6' },
  { id: 'users',     label: 'Users',      icon: <Users size={17} />,           accent: '#8B5CF6' },
  { id: 'products',  label: 'Products',   icon: <Package size={17} />,         accent: '#10B981' },
  { id: 'orders',    label: 'Orders',     icon: <ShoppingBag size={17} />,     accent: '#F59E0B' },
  { id: 'lands',     label: 'Lands',      icon: <MapPin size={17} />,          accent: '#06B6D4' },
];

const PAGE_TITLES: Record<Tab, string> = {
  dashboard: 'Admin Dashboard',
  users:     'User Management',
  products:  'Product Management',
  orders:    'Order Management',
  lands:     'Land Listings',
};

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F6FA', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        select:focus, input:focus { outline: 2px solid #10B981 !important; outline-offset: 1px; }
      `}</style>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: 240, background: '#0F172A',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.2s ease',
      }}
        className="lg-sidebar">

        {/* Logo area */}
        <div style={{
          padding: '22px 20px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <PahadLogo size={42} />
          <div>
            <p style={{ color: '#F1F5F9', fontWeight: 800, fontSize: 16, margin: 0, letterSpacing: '-0.3px' }}>PahadGrow</p>
            <p style={{ color: '#64748B', fontSize: 11, margin: 0, fontWeight: 500 }}>Admin Console</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'none' }}>
            <X size={16} />
          </button>
        </div>

        {/* Section label */}
        <div style={{ padding: '20px 20px 8px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            Navigation
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                  padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: active ? `${item.accent}20` : 'transparent',
                  color: active ? item.accent : '#94A3B8',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                {item.label}
                {active && (
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: item.accent }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ margin: '0 12px', height: 1, background: 'rgba(255,255,255,0.05)' }} />

        {/* Bottom nav */}
        <div style={{ padding: '12px' }}>
          <button onClick={() => navigate('/')} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11,
            padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#64748B', fontSize: 13, fontWeight: 500, textAlign: 'left',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Home size={16} /> Back to Site
          </button>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11,
            padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#EF4444', fontSize: 13, fontWeight: 500, textAlign: 'left',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* User profile at bottom */}
        <div style={{
          margin: '8px 12px 16px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12, padding: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ color: '#475569', fontSize: 11, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 30,
          backdropFilter: 'blur(2px)',
        }} />
      )}

      {/* ── Main Content ─────────────────────────────── */}
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #F0F0F5',
          padding: '0 28px', height: 62,
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            display: 'none', padding: 8, borderRadius: 8, border: 'none',
            background: '#F9FAFB', cursor: 'pointer', color: '#374151',
          }}>
            <Menu size={18} />
          </button>

          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
              {PAGE_TITLES[tab]}
            </h1>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>PahadGrow Platform</p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Admin badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              background: '#ECFDF5', border: '1px solid #A7F3D0',
              fontSize: 12, fontWeight: 700, color: '#065F46',
            }}>
              <Shield size={12} /> Admin
            </div>

            {/* Notification bell */}
            <button style={{
              padding: 8, borderRadius: 10, border: '1px solid #E5E7EB',
              background: '#fff', cursor: 'pointer', color: '#6B7280',
              display: 'flex', alignItems: 'center', position: 'relative',
            }}>
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, borderRadius: '50%',
                background: '#EF4444', border: '1.5px solid #fff',
              }} />
            </button>

            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'users'     && <UsersTab />}
          {tab === 'products'  && <ProductsTab />}
          {tab === 'orders'    && <OrdersTab />}
          {tab === 'lands'     && <LandsTab />}
        </main>
      </div>
    </div>
  );
}
