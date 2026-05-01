import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, Phone, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { useLanguage } from '../contexts/LanguageContext';
import { login, register } from '../../api';
import logo from "../../assets/placeholder.png";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller' | 'landowner' | 'admin'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await register({ name, email, password, phone, role });
      } else {
        await login(email, password);
      }

      const storedUser = JSON.parse(localStorage.getItem('pg_user') || '{}');
      const userRole = storedUser.role || role;

      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'seller' || userRole === 'landowner') navigate('/seller');
      else navigate('/dashboard');

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'buyer', label: t('auth.buyer'), emoji: '🛒' },
    { value: 'seller', label: t('auth.seller'), emoji: '🌾' },
    { value: 'landowner', label: t('auth.landowner'), emoji: '🏔️' },
    { value: 'admin', label: t('auth.admin'), emoji: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-green-700 via-green-500 to-green-700" />

            <div className="p-8">
              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <img src={logo} alt="PahadGrow" className="h-16 w-auto object-contain mb-3" />
                <div className="text-center">
                  <h2 className="text-xl font-bold text-green-700">PahadGrow</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Cultivating Growth from the Hills</p>
                </div>
              </div>

              {/* Title */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignup ? 'signup' : 'login'}
                  initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center mb-6"
                >
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isSignup ? t('auth.createAccount') : t('auth.welcomeBack')}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {isSignup ? t('auth.joinToday') : t('auth.loginToContinue')}
                  </p>
                  {!isSignup && (
                    <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5 mt-2 border border-green-200">
                      Demo: buyer@demo.com / seller@demo.com / admin@demo.com · password: demo123
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Error */}
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

              {/* Role Selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.iAm')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value as any)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                        role === option.value
                          ? 'border-green-700 bg-green-700 text-white font-medium shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-green-600 hover:text-green-700'
                      }`}
                    >
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name - signup only */}
                {isSignup && (
                  <div>
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
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.email')}</label>
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
                </div>

                {/* Phone - signup only */}
                {isSignup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.phone')}</label>
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
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                {!isSignup && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded accent-green-700" />
                      <span className="text-sm text-gray-500">{t('auth.rememberMe')}</span>
                    </label>
                    <button type="button" className="text-sm text-green-700 hover:underline font-medium">
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-all font-semibold shadow-sm hover:shadow-md mt-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isSignup ? 'Creating Account...' : 'Logging in...'}
                    </>
                  ) : (
                    isSignup ? t('auth.signup') : t('auth.login')
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-400">{t('auth.continueWith')}</span>
                </div>
              </div>

              {/* Google */}
              <button
                type="button"
                className="w-full py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Toggle */}
              <p className="text-center text-sm text-gray-500 mt-5">
                {isSignup ? t('auth.alreadyAccount') : t('auth.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignup(!isSignup); setError(''); }}
                  className="text-green-700 hover:underline font-semibold"
                >
                  {isSignup ? t('auth.login') : t('auth.signup')}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}