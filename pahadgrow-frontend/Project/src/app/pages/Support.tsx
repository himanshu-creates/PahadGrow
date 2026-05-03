import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Mail, Phone, MessageCircle, ChevronDown, Search, ArrowRight } from 'lucide-react';

const faqs = [
  { q: 'How do I create a seller account on PahadGrow?', a: 'Sign up as a regular user, then go to Dashboard → Profile and request a seller role upgrade. Our team verifies your details and activates your seller account within 24–48 hours.' },
  { q: 'How do I place an order on the marketplace?', a: 'Browse the Marketplace, add items to your cart, and proceed to checkout. Pay via UPI, net banking, or cash on delivery where available.' },
  { q: 'What payment methods are accepted?', a: 'We accept UPI (Google Pay, PhonePe, Paytm), net banking, credit/debit cards, and cash on delivery in select areas.' },
  { q: 'How can I track my order?', a: 'Visit Dashboard → Orders after placing an order to see real-time status including processing, shipped, and delivered stages.' },
  { q: 'What is the refund policy?', a: 'Refunds are processed within 5–7 business days for eligible items. Perishable goods are evaluated case-by-case. See our Refund Policy for full details.' },
  { q: 'How does Land Rental work?', a: 'Landowners list agricultural land for rent. Interested farmers browse listings, contact the owner, and finalise terms directly through our platform.' },
  { q: 'Can I cancel my subscription?', a: 'Yes, cancel anytime from Dashboard → Subscription. Your plan remains active until the end of the current billing period.' },
  { q: 'How do I report a problem with a product?', a: 'Go to Dashboard → Orders, select the order, and click "Report Issue". Our support team responds within 24 hours.' },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} className="group cursor-pointer border-b border-[#1a4a2e] last:border-0">
      <div className="flex items-center justify-between py-5 px-1 gap-4">
        <span className="text-[#e8d5a3] font-medium text-sm leading-snug group-hover:text-[#f5e6c0] transition-colors duration-200">{q}</span>
        <ChevronDown size={16} className={`shrink-0 text-[#8fbe9a] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-[#8fbe9a] text-sm leading-relaxed px-1">{a}</p>
      </div>
    </div>
  );
}

export default function Support() {
  const [search, setSearch] = useState('');
  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#031a0f] text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Jost', sans-serif; }
        .luxury-card { background: linear-gradient(135deg, rgba(15,50,30,0.8) 0%, rgba(8,30,18,0.9) 100%); border: 1px solid rgba(201,168,76,0.15); backdrop-filter: blur(12px); transition: all 0.3s ease; }
        .luxury-card:hover { border-color: rgba(201,168,76,0.4); transform: translateY(-2px); }
        .shimmer { background: linear-gradient(135deg, #0d3d20 0%, #0a2d17 50%, #0d3d20 100%); position: relative; overflow: hidden; }
        .shimmer::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.06) 0%, transparent 60%); pointer-events: none; }
        .gold-btn { background: linear-gradient(135deg, #c9a84c 0%, #e8d5a3 50%, #c9a84c 100%); color: #031a0f; font-weight: 600; letter-spacing: 0.05em; font-size: 0.75rem; text-transform: uppercase; transition: all 0.3s ease; }
        .gold-btn:hover { background: linear-gradient(135deg, #e8d5a3 0%, #c9a84c 50%, #e8d5a3 100%); box-shadow: 0 4px 24px rgba(201,168,76,0.3); }
        .search-input { background: rgba(15,50,30,0.6); border: 1px solid rgba(201,168,76,0.2); color: #e8d5a3; transition: border-color 0.3s; }
        .search-input:focus { outline: none; border-color: rgba(201,168,76,0.6); }
        .search-input::placeholder { color: rgba(143,190,154,0.5); }
      `}</style>
      <Navbar />
      <div className="shimmer pt-20 pb-24 px-6 text-center relative">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(201,168,76,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(15,180,80,0.04) 0%, transparent 50%)' }} />
        <p className="font-body text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">PahadGrow Support</p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-[#f5e6c0] mb-5 leading-tight">How May We<br /><em>Assist You?</em></h1>
        <p className="font-body text-[#8fbe9a] text-sm tracking-wide max-w-md mx-auto mb-10">Our dedicated team is here to ensure your experience is seamless and exceptional.</p>
        <div className="relative max-w-lg mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a84c]" />
          <input type="text" placeholder="Search for answers..." value={search} onChange={e => setSearch(e.target.value)} className="search-input font-body w-full pl-11 pr-5 py-3.5 rounded-full text-sm" />
        </div>
      </div>
      <div className="container mx-auto px-6 -mt-8 mb-20 max-w-5xl">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: <Mail size={20} />, title: 'Email Us', sub: 'Response within 24 hours', cta: 'support@pahadgrow.com', href: 'mailto:support@pahadgrow.com' },
            { icon: <Phone size={20} />, title: 'Call Us', sub: 'Mon – Sat, 9 AM – 6 PM', cta: '+91 12345 67890', href: 'tel:+911234567890' },
            { icon: <MessageCircle size={20} />, title: 'WhatsApp', sub: 'Instant messaging support', cta: 'Start a conversation', href: 'https://wa.me/911234567890' },
          ].map(({ icon, title, sub, cta, href }) => (
            <a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="luxury-card rounded-2xl p-7 group block">
              <div className="text-[#c9a84c] mb-4">{icon}</div>
              <h3 className="font-display text-xl text-[#f5e6c0] mb-1">{title}</h3>
              <p className="font-body text-[#8fbe9a] text-xs tracking-wide mb-4">{sub}</p>
              <span className="font-body text-[#c9a84c] text-xs flex items-center gap-2 group-hover:gap-3 transition-all">{cta} <ArrowRight size={12} /></span>
            </a>
          ))}
        </div>
      </div>
      <div className="container mx-auto px-6 pb-24 max-w-2xl">
        <div className="text-center mb-12">
          <p className="font-body text-[#c9a84c] text-xs tracking-[0.25em] uppercase mb-3">Knowledge Base</p>
          <h2 className="font-display text-4xl font-light text-[#f5e6c0]">Frequently Asked<br /><em>Questions</em></h2>
        </div>
        <div className="luxury-card rounded-2xl px-8 py-2">
          {filtered.length === 0
            ? <p className="text-[#8fbe9a] text-sm text-center py-10">No results found.</p>
            : filtered.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} index={i} />)
          }
        </div>
        <div className="text-center mt-14">
          <p className="font-body text-[#8fbe9a] text-sm mb-5">Still need assistance?</p>
          <a href="mailto:support@pahadgrow.com" className="gold-btn inline-flex items-center gap-2 px-8 py-3 rounded-full">Contact Our Team <ArrowRight size={13} /></a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
