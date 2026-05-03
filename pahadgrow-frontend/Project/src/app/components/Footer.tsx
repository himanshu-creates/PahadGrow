import { Link } from 'react-router';
import { useState } from 'react';
import logo from "../../assets/placeholder.png";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${BASE_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setEmail('');
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch {
      setError('Server se connection nahi ho raha. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { Icon: Facebook, href: 'https://facebook.com/pahadgrow', label: 'Facebook' },
    { Icon: Instagram, href: 'https://instagram.com/pahadgrow', label: 'Instagram' },
    { Icon: Youtube, href: 'https://youtube.com/@pahadgrow', label: 'YouTube' },
    { Icon: MessageCircle, href: 'https://wa.me/911234567890', label: 'WhatsApp' },
  ];

  const quickLinks = [
    { label: 'Marketplace', to: '/marketplace' },
    { label: 'Knowledge', to: '/knowledge' },
    { label: 'Land Rental', to: '/land-rental' },
    { label: 'Community', to: '/community' },
    { label: 'Subscription', to: '/subscription' },
  ];

  const supportLinks = [
    { label: 'Help Center', to: '/support' },
    { label: 'Contact Us', href: 'mailto:support@pahadgrow.com' },
    { label: 'FAQs', to: '/support' },
    { label: 'Pricing', to: '/subscription' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Service', to: '/terms-of-service' },
    { label: 'Refund Policy', to: '/refund-policy' },
    { label: 'Cookie Policy', to: '/cookie-policy' },
  ];

  return (
    <footer className="bg-gradient-to-b from-[#052e1c] to-[#031e13] text-white pt-12">

      {/* Newsletter */}
      <div className="container mx-auto px-6 mb-12">
        <div className="bg-[#0b3d2a] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Stay Updated with PahadGrow</h3>
            <p className="text-gray-300 text-sm">Get the latest updates on crops, farming tips, and community stories</p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            {subscribed ? (
              <p className="text-green-400 font-medium text-sm text-center px-4 py-2">
                Thank you for subscribing!
              </p>
            ) : (
              <>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    placeholder="Enter your email"
                    className="px-4 py-2 rounded-lg bg-[#0f4a33] border border-green-700 outline-none focus:border-green-400 transition-colors w-full md:w-[260px] text-white placeholder-gray-400"
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-500 active:scale-95 transition-all px-5 py-2 rounded-lg font-medium whitespace-nowrap disabled:opacity-60"
                  >
                    {loading ? 'Sending...' : 'Subscribe'}
                  </button>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8 pb-8">

        {/* Logo & About */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <img src={logo} alt="PahadGrow" className="h-8 w-auto object-contain" />
            <div>
              <h2 className="font-bold text-lg">PahadGrow</h2>
              <p className="text-xs text-gray-400">CULTIVATING GROWTH</p>
            </div>
          </Link>
          <p className="text-gray-300 text-sm leading-relaxed">
            Cultivating Growth from the Hills. Empowering Uttarakhand villages
            through technology and connecting farmers to opportunities.
          </p>
          <div className="flex gap-3 mt-4">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
          <div className="flex flex-col gap-2.5 text-gray-300 text-sm">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-white hover:translate-x-1 transition-all inline-block"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Support</h3>
          <div className="flex flex-col gap-2.5 text-gray-300 text-sm">
            {supportLinks.map((item) =>
              'href' in item ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Legal</h3>
          <div className="flex flex-col gap-2.5 text-gray-300 text-sm">
            {legalLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="hover:text-white hover:translate-x-1 transition-all inline-block"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Line */}
      <div className="border-t border-green-900">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-gray-400 text-sm">
          <span>© {new Date().getFullYear()} PahadGrow. All rights reserved.</span>
          <span className="text-gray-500">Made with love for Uttarakhand</span>
        </div>
      </div>

    </footer>
  );
}
