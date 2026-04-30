import { Link } from 'react-router';
import logo from "../../assets/placeholder.png";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#052e1c] to-[#031e13] text-white pt-12">

      {/* Newsletter */}
      <div className="container mx-auto px-6 mb-12">
        <div className="bg-[#0b3d2a] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Stay Updated with PahadGrow</h3>
            <p className="text-gray-300 text-sm">Get the latest updates on crops, farming tips, and community stories</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg bg-[#0f4a33] border border-green-700 outline-none focus:border-green-400 transition-colors w-full md:w-[300px] text-white placeholder-gray-400"
            />
            <button className="bg-green-600 hover:bg-green-500 transition-colors px-5 py-2 rounded-lg font-medium whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8 pb-8">

        {/* Logo & About */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="PahadGrow" className="h-8 w-auto object-contain" />
            <div>
              <h2 className="font-bold text-lg">PahadGrow</h2>
              <p className="text-xs text-gray-400">CULTIVATING GROWTH</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Cultivating Growth from the Hills. Empowering Uttarakhand villages
            through technology and connecting farmers to opportunities.
          </p>
          <div className="flex gap-3 mt-4">
            {[Facebook, Instagram, Youtube, MessageCircle].map((Icon, i) => (
              <button key={i} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
          <div className="flex flex-col gap-2.5 text-gray-300 text-sm">
            {[
              { label: 'Marketplace', to: '/marketplace' },
              { label: 'Knowledge', to: '/knowledge' },
              { label: 'Land Rental', to: '/land-rental' },
              { label: 'Community', to: '/community' },
            ].map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-white hover:translate-x-1 transition-all inline-block">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Support</h3>
          <div className="flex flex-col gap-2.5 text-gray-300 text-sm">
            {['Help Center', 'Contact Us', 'FAQs', 'Pricing'].map((item) => (
              <button key={item} className="text-left hover:text-white hover:translate-x-1 transition-all">{item}</button>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Legal</h3>
          <div className="flex flex-col gap-2.5 text-gray-300 text-sm">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Cookie Policy'].map((item) => (
              <button key={item} className="text-left hover:text-white hover:translate-x-1 transition-all">{item}</button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Line */}
      <div className="border-t border-green-900">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-gray-400 text-sm">
          <span>© {new Date().getFullYear()} PahadGrow. All rights reserved.</span>
          <span className="text-gray-500">Made with ❤️ for Uttarakhand</span>
        </div>
      </div>

    </footer>
  );
}
