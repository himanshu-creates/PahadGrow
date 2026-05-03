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
    if (password.length < 6) { setError('Password must be at least 6 characters long'); return; }
    setLoading(true);
    try {
      const data = await register({ name, email, password, phone, role });
      setToken(data.token); setUser(data.user); navigateByRole(data.user.role);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) { setError('Google login failed. No credential received.'); return; }
    setError(''); setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Google signup failed');
      setToken(data.token); setUser(data.user); navigateByRole(data.user.role);
    } catch (err: any) {
      setError(err.message || 'Google signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogleError = () => setError('Google signup was cancelled or failed. Please try again.');

  const roleOptions: { value: PublicRole; label: string; emoji: string; desc: string }[] = [
    { value: 'buyer',     label: 'Buyer',          emoji: '🛒', desc: 'Buy products' },
    { value: 'seller',    label: 'Farmer',          emoji: '🌾', desc: 'Sell products' },
    { value: 'landowner', label: 'Land Owner',      emoji: '🏔️', desc: 'Rent land' },
  ];

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#e8d5a3] placeholder-[#4a7a5a] outline-none transition-all duration-200";

  return (
    <div className="min-h-screen bg-[#031a0f] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Jost', sans-serif; }
        .signup-card {
          background: linear-gradient(160deg, rgba(13,50,28,0.95) 0%, rgba(5,22,13,0.98) 100%);
          border: 1px solid rgba(201,168,76,0.15);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.1);
        }
        .luxury-input {
          background: rgba(5,22,13,0.8);
          border: 1px solid rgba(201,168,76,0.15);
        }
        .luxury-input:focus {
          border-color: rgba(201,168,76,0.5);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.06);
        }
        .role-btn {
          background: rgba(5,22,13,0.6);
          border: 1px solid rgba(201,168,76,0.12);
          transition: all 0.25s ease;
        }
        .role-btn:hover {
          border-color: rgba(201,168,76,0.35);
          background: rgba(13,50,28,0.8);
        }
        .role-btn.active {
          background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.08));
          border-color: rgba(201,168,76,0.6);
          box-shadow: 0 0 20px rgba(201,168,76,0.08);
        }
        .gold-btn {
          background: linear-gradient(135deg, #c9a84c 0%, #e8d5a3 50%, #c9a84c 100%);
          background-size: 200% 100%;
          background-position: 100% 0;
          transition: background-position 0.4s ease, box-shadow 0.3s ease;
          color: #031a0f;
        }
        .gold-btn:hover {
          background-position: 0% 0;
          box-shadow: 0 8px 30px rgba(201,168,76,0.35);
        }
        .gold-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .divider-line { background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent); }
        .page-bg {
          background: radial-gradient(ellipse at 20% 50%, rgba(13,60,30,0.4) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.03) 0%, transparent 50%),
                      #031a0f;
        }
        .google-wrap > div { border-radius: 12px !important; overflow: hidden; }
      `}</style>

      <Navbar />

      <div className="page-bg flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="signup-card font-body rounded-3xl w-full max-w-md p-8 md:p-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <img src={logo} alt="PahadGrow" className="h-12 w-auto object-contain mx-auto mb-4 opacity-90" />
            <p className="text-[#c9a84c] text-xs tracking-[0.25em] uppercase mb-2">PahadGrow</p>
            <h1 className="font-display text-4xl font-light text-[#f5e6c0] leading-tight">
              Create <em>Account</em>
            </h1>
            <p className="text-[#4a7a5a] text-xs tracking-wide mt-2">Join the hills farming community</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-red-300"
              style={{ background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.25)' }}
            >
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Google */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="google-wrap flex justify-center mb-5">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
              useOneTap={false} shape="rectangular" size="large" width="368" text="signup_with" />
          </motion.div>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-1 h-px divider-line" />
            <span className="px-4 text-[#4a7a5a] text-xs tracking-widest uppercase">or continue with email</span>
            <div className="flex-1 h-px divider-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role Selector */}
            <div>
              <label className="block text-[#8fbe9a] text-xs tracking-[0.15em] uppercase mb-3">I am a</label>
              <div className="grid grid-cols-3 gap-2.5">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`role-btn rounded-xl p-3 text-center ${role === opt.value ? 'active' : ''}`}
                  >
                    <span className="text-xl block mb-1">{opt.emoji}</span>
                    <span className={`font-body text-xs font-medium block ${role === opt.value ? 'text-[#e8d5a3]' : 'text-[#6a9a7a]'}`}>{opt.label}</span>
                    <span className={`font-body text-[10px] block mt-0.5 ${role === opt.value ? 'text-[#c9a84c]' : 'text-[#3a5a4a]'}`}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[#8fbe9a] text-xs tracking-[0.15em] uppercase mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a7a5a]" size={16} />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your full name" required
                  className={`${inputClass} luxury-input`} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#8fbe9a] text-xs tracking-[0.15em] uppercase mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a7a5a]" size={16} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className={`${inputClass} luxury-input`} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[#8fbe9a] text-xs tracking-[0.15em] uppercase mb-2">
                Phone <span className="text-[#3a5a4a] normal-case tracking-normal">— optional</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a7a5a]" size={16} />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`${inputClass} luxury-input`} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#8fbe9a] text-xs tracking-[0.15em] uppercase mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a7a5a]" size={16} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters" required minLength={6}
                  className={`${inputClass} luxury-input pr-11`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a7a5a] hover:text-[#c9a84c] transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="gold-btn w-full py-3.5 rounded-xl font-body font-semibold text-sm tracking-wider flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-[#031a0f]/30 border-t-[#031a0f] rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-xs text-[#4a7a5a] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#c9a84c] hover:text-[#e8d5a3] transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
