import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const sections = [
  { title: 'Acceptance of Terms', content: 'By accessing or using PahadGrow, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree, you must refrain from using the platform.' },
  { title: 'Use of the Platform', content: 'PahadGrow provides an online marketplace connecting farmers, landowners, and buyers across Uttarakhand. You agree to use it only for lawful purposes — no false listings, fraudulent transactions, harassment of users, or violations of applicable law.' },
  { title: 'Account Registration', content: 'You must provide accurate, current, and complete information during registration. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.' },
  { title: 'Seller Responsibilities', content: 'Sellers are accountable for the accuracy of product listings, timely fulfilment of orders, and maintaining quality standards as described. PahadGrow reserves the right to remove non-compliant listings or suspend seller accounts.' },
  { title: 'Buyer Responsibilities', content: 'Buyers agree to pay for products ordered and provide accurate delivery information. Circumventing the platform payment system or initiating fraudulent chargebacks is strictly prohibited.' },
  { title: 'Payments and Fees', content: 'PahadGrow may charge a commission on transactions. All applicable fees are disclosed to sellers at the time of listing. Payments are processed by third-party providers subject to their own terms.' },
  { title: 'Intellectual Property', content: 'All platform content — logos, graphics, text, software — is owned by PahadGrow or its content suppliers and protected by intellectual property laws. Reproduction or distribution without written permission is prohibited.' },
  { title: 'Limitation of Liability', content: 'To the maximum extent permitted by law, PahadGrow shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the platform.' },
  { title: 'Termination', content: 'PahadGrow may suspend or terminate your account at its sole discretion, without notice, for conduct deemed harmful to users, the platform, or third parties.' },
  { title: 'Governing Law', content: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Dehradun, Uttarakhand.' },
  { title: 'Changes to Terms', content: 'We reserve the right to modify these Terms at any time. Significant changes will be communicated. Continued use of PahadGrow following changes constitutes acceptance.' },
  { title: 'Contact', content: 'For questions about these Terms, write to legal@pahadgrow.com.' },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#031a0f] text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Jost', sans-serif; }
        .term-row { display: grid; grid-template-columns: 56px 1fr; gap: 24px; padding: 28px 0; border-bottom: 1px solid rgba(26,74,46,0.8); transition: background 0.2s; }
        .term-row:last-child { border-bottom: none; }
        .term-row:hover .term-num { color: rgba(201,168,76,0.6); }
        .term-num { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-weight: 300; color: rgba(201,168,76,0.15); line-height: 1; padding-top: 4px; transition: color 0.3s; }
        .hero-bg { background: linear-gradient(160deg, #0d3d20 0%, #031a0f 60%); position: relative; overflow: hidden; }
        .hero-bg::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent); }
        .outer-card { background: linear-gradient(135deg, rgba(13,45,24,0.7), rgba(5,22,13,0.9)); border: 1px solid rgba(201,168,76,0.1); border-radius: 20px; padding: 0 40px; }
      `}</style>
      <Navbar />
      <div className="hero-bg py-20 px-6 text-center">
        <p className="font-body text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">Legal</p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-[#f5e6c0] mb-4 leading-tight">Terms of <em>Service</em></h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="block w-8 h-px bg-[#c9a84c] opacity-50" />
          <p className="font-body text-[#8fbe9a] text-xs tracking-widest uppercase">Last updated: 1 May 2025</p>
          <span className="block w-8 h-px bg-[#c9a84c] opacity-50" />
        </div>
      </div>
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <p className="font-body text-[#8fbe9a] text-sm leading-relaxed mb-12">
          These Terms govern your relationship with PahadGrow. Please read them carefully — by using our platform, you agree to be bound by every provision herein.
        </p>
        <div className="outer-card">
          {sections.map(({ title, content }, i) => (
            <div key={title} className="term-row">
              <div className="term-num">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <h2 className="font-display text-xl text-[#e8d5a3] mb-2">{title}</h2>
                <p className="font-body text-[#8fbe9a] text-sm leading-relaxed">{content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
