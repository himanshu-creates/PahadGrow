import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, Phone, User } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useLanguage } from '../contexts/LanguageContext';
import logo from "../../assets/placeholder.png";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller' | 'landowner' | 'admin'>('buyer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - redirect based on role
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'seller' || role === 'landowner') {
      navigate('/seller');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Logo at Top Center */}
            <div className="flex flex-col items-center mb-6">
              <img 
                src={logo} 
                alt="PahadGrow" 
                className="h-20 w-auto object-contain mb-3"
              />
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary">PahadGrow</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Cultivating Growth from the Hills</p>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isSignup ? t('auth.createAccount') : t('auth.welcomeBack')}
              </h1>
              <p className="text-muted-foreground">
                {isSignup ? t('auth.joinToday') : t('auth.loginToContinue')}
              </p>
            </div>

            {/* Role Selection */}
            {isSignup && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  {t('auth.iAm')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'buyer', label: t('auth.buyer') },
                    { value: 'seller', label: t('auth.seller') },
                    { value: 'landowner', label: t('auth.landowner') },
                    { value: 'admin', label: t('auth.admin') },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value as any)}
                      className={`px-4 py-3 rounded-lg border transition-all shadow-sm ${
                        role === option.value
                          ? 'border-primary bg-primary text-white'
                          : 'border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone Input (Signup only) */}
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('auth.phone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Remember Me / Forgot Password */}
              {!isSignup && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-muted-foreground">{t('auth.rememberMe')}</span>
                  </label>
                  <button type="button" className="text-sm text-primary hover:underline">
                    {t('auth.forgotPassword')}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                {isSignup ? t('auth.signup') : t('auth.login')}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">{t('auth.continueWith')}</span>
              </div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="w-full py-3 border-2 border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>

            {/* Toggle Login/Signup */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignup ? t('auth.alreadyAccount') : t('auth.noAccount')}{' '}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary hover:underline font-medium"
              >
                {isSignup ? t('auth.login') : t('auth.signup')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}