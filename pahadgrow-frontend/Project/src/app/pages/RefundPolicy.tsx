import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowRight } from 'lucide-react';

const eligible = [
  'Item received significantly differs from the listing description',
  'Product arrived damaged or defective',
  'Order not delivered within the estimated timeframe',
  'Duplicate payment was charged',
  'Subscription charged after confirmed cancellation',
];

const notEligible = [
  'Fresh produce delivered in satisfactory condition',
  'Change of mind after dispatch',
  'Discounted or sale items (unless defective)',
  'Downloaded digital content',
];

const steps = [
  { num: '01', title: 'Raise a Request', desc: 'Navigate to Dashboard → Orders, select the order, and tap "Report Issue" within 48 hours of delivery.' },
  { num: '02', title: 'Review', desc: 'Our team reviews your request within 24 hours and may request supporting photographs or information.' },
  { num: '03', title: 'Decision', desc: 'You will receive our decision via email within 3 business days of receiving all required documentation.' },
  { num: '04', title: 'Refund Credited', desc: 'Approved refunds are credited to your original payment method within 5–7 business days.' },
];

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#031a0f] text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Jost', sans-serif; }
        .hero-bg { background: linear-gradient(160deg, #0d3d20 0%, #031a0f 60%); position: relative; }
        .hero-bg::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent); }
        .step-card { background: linear-gradient(135deg, rgba(13,50,28,0.7), rgba(5,22,13,0.9)); border: 1px solid rgba(201,168,76,0.1); border-radius: 16px; padding: 28px; display: flex; gap: 20px; transition: border-color 0.3s, transform 0.3s; }
        .step-card:hover { border-color: rgba(201,168,76,0.35); transform: translateX(4px); }
        .step-num { font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 300; color: rgba(201,168,76,0.2); line-height: 1; flex-shrink: 0; transition: color 0.3s; }
        .step-card:hover .step-num { color: rgba(201,168,76,0.5); }
        .check-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(26,74,46,0.5); }
        .check-item:last-child { border-bottom: none; }
        .dot-green { width: 6px; height: 6px; border-radius: 50%; background: #8fbe9a; flex-shrink: 0; margin-top: 6px; }
        .dot-red { width: 6px; height: 6px; border-radius: 50%; background: rgba(200,80,80,0.7); flex-shrink: 0; margin-top: 6px; }
        .panel { background: linear-gradient(135deg, rgba(13,50,28,0.6), rgba(5,22,13,0.8)); border: 1px solid rgba(201,168,76,0.1); border-radius: 16px; padding: 28px; }
        .gold-btn { background: linear-gradient(135deg, #c9a84c 0%, #e8d5a3 50%, #c9a84c 100%); color: #031a0f; font-weight: 600; letter-spacing: 0.05em; font-size: 0.75rem; text-transform: uppercase; transition: all 0.3s ease; }
        .gold-btn:hover { box-shadow: 0 4px 24px rgba(201,168,76,0.3); }
      `}</style>
      <Navbar />
      <div className="hero-bg py-20 px-6 text-center">
        <p className="font-body text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">Legal</p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-[#f5e6c0] mb-4 leading-tight">Refund <em>Policy</em></h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="block w-8 h-px bg-[#c9a84c] opacity-50" />
          <p className="font-body text-[#8fbe9a] text-xs tracking-widest uppercase">Last updated: 1 May 2025</p>
          <span className="block w-8 h-px bg-[#c9a84c] opacity-50" />
        </div>
      </div>
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <p className="font-body text-[#8fbe9a] text-sm leading-relaxed mb-14">
          Your satisfaction is central to everything we do. Should something not meet your expectations, we have designed a clear and fair refund process.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-14">
          <div className="panel">
            <p className="font-body text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-5">Eligible for Refund</p>
            {eligible.map(item => (
              <div key={item} className="check-item">
                <div className="dot-green" />
                <p className="font-body text-[#8fbe9a] text-sm leading-snug">{item}</p>
              </div>
            ))}
          </div>
          <div className="panel">
            <p className="font-body text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-5">Not Eligible</p>
            {notEligible.map(item => (
              <div key={item} className="check-item">
                <div className="dot-red" />
                <p className="font-body text-[#8fbe9a] text-sm leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="font-body text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-6">Refund Process</p>
        <div className="flex flex-col gap-4 mb-14">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="step-card">
              <div className="step-num">{num}</div>
              <div>
                <h3 className="font-display text-xl text-[#e8d5a3] mb-1">{title}</h3>
                <p className="font-body text-[#8fbe9a] text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="panel text-center">
          <p className="font-display text-2xl text-[#e8d5a3] mb-2">Need assistance?</p>
          <p className="font-body text-[#8fbe9a] text-sm mb-6">Our support team is ready to help resolve your concern.</p>
          <a href="mailto:support@pahadgrow.com" className="gold-btn inline-flex items-center gap-2 px-8 py-3 rounded-full">
            Contact Support <ArrowRight size={13} />
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
