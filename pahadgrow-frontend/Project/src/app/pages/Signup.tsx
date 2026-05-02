import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Phone, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleLogin } from '@react-oauth/google';
import { Navbar } from '../components/Navbar';
import { register } from '../../api';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../assets/placeholder.png';

type PublicRole = 'buyer' | 'seller' | 'landowner';

export default function Signup() {
  const navigate = useNavigate();
  const { setUser, setToken, isLoggedIn, user } = useAuth();

  // ─── Already logged in? Redirect immediately ────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'seller' || user.role === 'landowner') navigate('/seller', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, user, navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<PublicRole>('buyer');

  const navigateByRole = (role: string) => {
    if (role === 'seller' || role === 'landowner') navigate('/seller');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      const data = await register({ name, email, password, phone, role });
      setToken(data.token);
      setUser(data.user);
      navigateByRole(data.user.role);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Login Handler ─────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setError('Google login failed. No credential received.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Google signup failed');
      setToken(data.token);
      setUser(data.user);
      navigateByRole(data.user.role);
    } catch (err: any) {
      setError(err.message || 'Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google signup was cancelled or failed. Please try again.');
  };

  const roleOptions: { value: PublicRole; label: string; emoji: string; desc: string }[] = [
    { value: 'buyer',     label: 'Buyer',          emoji: '🛒', desc: 'Want to buy products' },
    { value: 'seller',    label: 'Seller (Farmer)', emoji: '🌾', desc: 'Want to sell products' },
    { value: 'landowner', label: 'Land Owner',      emoji: '🏔️', desc: 'Want to rent land' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-green-700 via-green-500 to-green-700" />
            <div className="p-8">

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex flex-col items-center mb-6"
              >
                <img src={logo} alt="PahadGrow" className="h-16 w-auto object-contain mb-3" />
                <h2 className="text-xl font-bold text-green-700">PahadGrow</h2>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Cultivating Growth from the Hills</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="text-gray-500 text-sm mt-1">Join PahadGrow today</p>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              {/* ─── Google Signup Button ──────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="flex justify-center mb-5"
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  shape="rectangular"
                  size="large"
                  width="368"
                  text="signup_with"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}
                className="relative mb-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-400">or sign up with email</span>
                </div>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {roleOptions.map((option, i) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => setRole(option.value)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        className={`flex flex-col items-start px-3 py-2.5 rounded-lg border text-sm transition-all ${
                          role === option.value
                            ? 'border-green-700 bg-green-700 text-white font-medium shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-green-500 hover:text-green-700'
                        }`}
                      >
                        <span className="text-base mb-0.5">{option.emoji} {option.label}</span>
                        <span className={`text-xs ${role === option.value ? 'text-green-100' : 'text-gray-400'}`}>
                          {option.desc}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-all font-semibold shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : 'Create Account'}
                  </button>
                </motion.div>
              </form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="text-center text-sm text-gray-500 mt-5"
              >
                Already have an account?{' '}
                <Link to="/login" className="text-green-700 hover:underline font-semibold">
                  Login
                </Link>
              </motion.p>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
