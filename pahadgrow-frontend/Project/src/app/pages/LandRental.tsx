import { useState, useEffect, useRef } from 'react';
import {
  MapPin, Search, Ruler, Droplet, Zap, Loader2, Phone,
  Plus, X, ChevronDown, Mountain, CheckCircle, AlertCircle,
  Pencil, Trash2, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  getLandListings, isLoggedIn, getCurrentUser, LandListing
} from '../../api';

// ─── API helpers for land CRUD ─────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function authHeaders() {
  const token = localStorage.getItem('pg_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function createLandListing(body: object) {
  const res = await fetch(`${BASE_URL}/users/land`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create listing');
  return data;
}

async function updateLandListing(id: string, body: object) {
  const res = await fetch(`${BASE_URL}/users/land/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update listing');
  return data;
}

async function deleteLandListing(id: string) {
  const res = await fetch(`${BASE_URL}/users/land/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete listing');
  return data;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DISTRICTS = [
  'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun',
  'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh',
  'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi',
];

const CROP_OPTIONS = [
  'Wheat', 'Rice', 'Vegetables', 'Fruits', 'Herbs', 'Potato',
  'Maize', 'Millets', 'Mustard', 'Soybean', 'Garlic', 'Ginger',
];

const PRICE_UNITS = ['/month', '/season', '/year', '/bigha'];

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80';

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastState { msg: string; type: 'success' | 'error' | 'info' }

// ─── Form initial state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  village: '',
  district: '',
  area: '',
  price: '',
  priceUnit: '/month',
  suitableFor: [] as string[],
  water: false,
  electricity: false,
  description: '',
  image: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandRental() {
  const user = getCurrentUser();
  const loggedIn = isLoggedIn();
  const isLandowner = loggedIn && (user?.role === 'landowner' || user?.role === 'admin');

  // Listings state
  const [lands, setLands] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [filterWater, setFilterWater] = useState(false);
  const [filterElec, setFilterElec] = useState(false);
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editLand, setEditLand] = useState<LandListing | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  // Contact reveal
  const [revealedContact, setRevealedContact] = useState<Set<string>>(new Set());

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = (msg: string, type: ToastState['type'] = 'info') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // Debounced search
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchLands(val, district), 400);
  };

  const fetchLands = async (s = search, d = district) => {
    setLoading(true);
    try {
      const res = await getLandListings({
        district: d && d !== '' ? d : undefined,
        search: s || undefined,
      });
      setLands(res.lands);
    } catch (e: any) {
      showToast(e.message || 'Could not load listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [district]);

  // ─── Filtered display ──────────────────────────────────────────────────────
  const displayed = lands.filter(l => {
    if (filterWater && !l.water) return false;
    if (filterElec && !l.electricity) return false;
    if (priceMax && l.price > Number(priceMax)) return false;
    return true;
  });

  // ─── Modal helpers ─────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditLand(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEditModal = (land: LandListing) => {
    setEditLand(land);
    setForm({
      village: land.village,
      district: land.district,
      area: land.area,
      price: String(land.price),
      priceUnit: land.priceUnit || '/month',
      suitableFor: land.suitableFor || [],
      water: land.water,
      electricity: land.electricity,
      description: land.description || '',
      image: land.image || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditLand(null);
  };

  const toggleCrop = (crop: string) => {
    setForm(f => ({
      ...f,
      suitableFor: f.suitableFor.includes(crop)
        ? f.suitableFor.filter(c => c !== crop)
        : [...f.suitableFor, crop],
    }));
  };

  const handleSubmit = async () => {
    if (!form.village.trim() || !form.district || !form.area.trim() || !form.price) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
      };
      if (editLand) {
        await updateLandListing(editLand.id, payload);
        showToast('Listing updated successfully!', 'success');
      } else {
        await createLandListing(payload);
        showToast('Land listed successfully!', 'success');
      }
      closeModal();
      fetchLands();
    } catch (e: any) {
      showToast(e.message || 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLandListing(id);
      showToast('Listing deleted', 'success');
      setLands(prev => prev.filter(l => l.id !== id));
    } catch (e: any) {
      showToast(e.message || 'Failed to delete', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleContact = (land: LandListing) => {
    if (!loggedIn) {
      showToast('Please login to contact the land owner', 'info');
      return;
    }
    setRevealedContact(prev => new Set([...prev, land.id]));
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #f7fee7 100%)' }}>
      <Navbar isLoggedIn={loggedIn} userRole={user?.role ?? null} />

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium"
            style={{
              background: toast.type === 'success' ? '#166534' : toast.type === 'error' ? '#991b1b' : '#1e3a5f',
              color: 'white',
              minWidth: 220,
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : toast.type === 'error' ? <AlertCircle size={16} /> : <Phone size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)' }}>
        {/* Decorative mountain silhouette */}
        <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 L150,10 L300,50 L450,0 L600,40 L750,5 L900,45 L1050,15 L1200,55 L1200,120 L0,120 Z" fill="white" />
        </svg>

        <div className="relative max-w-5xl mx-auto px-4 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-center mb-4">
              <span className="flex items-center gap-2 bg-white/10 text-green-100 border border-white/20 text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
                <Mountain size={13} /> Uttarakhand Land Marketplace
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              Rent Fertile <span className="text-green-300">Himalayan Land</span>
            </h1>
            <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
              Connect with landowners across Uttarakhand — grow wheat, vegetables, herbs and more on beautiful mountain terrain.
            </p>

            {/* Search bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search village, crop, district..."
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-2xl text-gray-800 text-base shadow-xl outline-none focus:ring-2 focus:ring-green-400 bg-white"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* District picker */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 border border-green-200 rounded-xl bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-green-500 outline-none shadow-sm cursor-pointer"
              >
                <option value="">All Districts</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm ${showFilters ? 'bg-green-700 text-white border-green-700' : 'bg-white border-green-200 text-gray-700 hover:border-green-400'}`}
            >
              <Filter size={15} /> Filters
              {(filterWater || filterElec || priceMax) && (
                <span className="ml-1 bg-orange-400 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {[filterWater, filterElec, priceMax].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{displayed.length} listing{displayed.length !== 1 ? 's' : ''}</span>
            {isLandowner && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl shadow-md text-sm transition-colors"
              >
                <Plus size={17} /> List Your Land
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Expanded filters ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm flex flex-wrap gap-6 items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterWater}
                    onChange={e => setFilterWater(e.target.checked)}
                    className="w-4 h-4 accent-green-700 rounded"
                  />
                  <Droplet size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Water available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterElec}
                    onChange={e => setFilterElec(e.target.checked)}
                    className="w-4 h-4 accent-green-700 rounded"
                  />
                  <Zap size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-gray-700">Electricity available</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Max price ₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>

                {(filterWater || filterElec || priceMax) && (
                  <button
                    onClick={() => { setFilterWater(false); setFilterElec(false); setPriceMax(''); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Listings ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-green-700">
            <Loader2 className="animate-spin" size={44} />
            <span className="text-sm text-gray-500">Loading land listings...</span>
          </div>
        ) : displayed.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-green-100 shadow-sm text-center"
          >
            <Mountain size={52} className="text-green-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No listings found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {displayed.map((land, i) => (
              <LandCard
                key={land.id}
                land={land}
                index={i}
                isOwn={loggedIn && user?.id === land.ownerId}
                contactRevealed={revealedContact.has(land.id)}
                onContact={() => handleContact(land)}
                onEdit={() => openEditModal(land)}
                onDelete={() => setDeleteId(land.id)}
                ownerPhone={user?.id === land.ownerId ? user?.phone : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* ── Add/Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <LandModal
            form={form}
            setForm={setForm}
            isEdit={!!editLand}
            submitting={submitting}
            onClose={closeModal}
            onSubmit={handleSubmit}
            toggleCrop={toggleCrop}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={26} className="text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-center text-gray-800 mb-2">Delete Listing?</h3>
              <p className="text-center text-gray-500 text-sm mb-6">This action cannot be undone. Your land listing will be permanently removed.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Land Card ─────────────────────────────────────────────────────────────────
function LandCard({
  land, index, isOwn, contactRevealed, onContact, onEdit, onDelete, ownerPhone
}: {
  land: LandListing;
  index: number;
  isOwn: boolean;
  contactRevealed: boolean;
  onContact: () => void;
  onEdit: () => void;
  onDelete: () => void;
  ownerPhone?: string;
}) {
  const available = land.status === 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-green-50 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={land.image || PLACEHOLDER_IMG}
          alt={land.village}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
            available ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-100'
          }`}>
            {land.status}
          </span>
        </div>

        {/* Owner actions */}
        {isOwn && (
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow text-gray-700 hover:text-green-700 transition-colors"
              title="Edit listing"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow text-gray-700 hover:text-red-600 transition-colors"
              title="Delete listing"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}

        {/* Price overlay at bottom */}
        <div className="absolute bottom-3 right-3 bg-white/95 rounded-xl px-3 py-1.5 shadow-lg">
          <span className="text-green-700 font-extrabold text-lg leading-none">₹{land.price.toLocaleString()}</span>
          <span className="text-gray-500 text-xs ml-1">{land.priceUnit || '/month'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-lg leading-snug">{land.village}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={13} className="text-green-600 flex-shrink-0" />
            {land.district}, Uttarakhand
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Ruler size={14} className="text-gray-400" />
            {land.area}
          </span>
          <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium ${
            land.water ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'
          }`}>
            <Droplet size={14} />
            Water {land.water ? '✓' : '✗'}
          </span>
          <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium ${
            land.electricity ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-400'
          }`}>
            <Zap size={14} />
            Power {land.electricity ? '✓' : '✗'}
          </span>
        </div>

        {/* Suitable for chips */}
        {land.suitableFor?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {land.suitableFor.map((crop, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-green-50 text-green-800 text-xs rounded-full font-medium border border-green-100">
                {crop}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {land.description && (
          <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{land.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-xs text-gray-400">Land owner</p>
            <p className="text-sm font-semibold text-gray-800">{land.ownerName}</p>
          </div>

          {available && (
            <div>
              {contactRevealed ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                  <Phone size={14} className="text-green-700" />
                  <span className="text-green-800 font-bold text-sm">
                    {ownerPhone || 'Contact via profile'}
                  </span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onContact}
                  className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  <Phone size={14} />
                  Contact Owner
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Land Modal ────────────────────────────────────────────────────────────────
function LandModal({
  form, setForm, isEdit, submitting, onClose, onSubmit, toggleCrop
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  isEdit: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  toggleCrop: (c: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Listing' : 'List Your Land'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in details about your land</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Village + District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Village *</label>
              <input
                type="text"
                placeholder="e.g. Munsiari"
                value={form.village}
                onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">District *</label>
              <div className="relative">
                <select
                  value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none bg-white"
                >
                  <option value="">Select...</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Area *</label>
            <input
              type="text"
              placeholder="e.g. 2 bigha, 1 acre"
              value={form.area}
              onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* Price + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Per</label>
              <div className="relative">
                <select
                  value={form.priceUnit}
                  onChange={e => setForm(f => ({ ...f, priceUnit: e.target.value }))}
                  className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none bg-white"
                >
                  {PRICE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Amenities</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.water ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <input type="checkbox" checked={form.water} onChange={e => setForm(f => ({ ...f, water: e.target.checked }))} className="sr-only" />
                <Droplet size={18} className={form.water ? 'text-blue-600' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${form.water ? 'text-blue-800' : 'text-gray-500'}`}>Water</span>
                {form.water && <CheckCircle size={15} className="text-blue-600 ml-auto" />}
              </label>
              <label className={`flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.electricity ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                <input type="checkbox" checked={form.electricity} onChange={e => setForm(f => ({ ...f, electricity: e.target.checked }))} className="sr-only" />
                <Zap size={18} className={form.electricity ? 'text-amber-600' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${form.electricity ? 'text-amber-800' : 'text-gray-500'}`}>Electricity</span>
                {form.electricity && <CheckCircle size={15} className="text-amber-600 ml-auto" />}
              </label>
            </div>
          </div>

          {/* Suitable for */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Suitable For</label>
            <div className="flex flex-wrap gap-2">
              {CROP_OPTIONS.map(crop => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleCrop(crop)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.suitableFor.includes(crop)
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label>
            <textarea
              rows={3}
              placeholder="Describe your land, soil type, access road, nearby facilities..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Image URL <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="url"
              placeholder="https://..."
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : isEdit ? 'Update Listing' : 'List Land'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
