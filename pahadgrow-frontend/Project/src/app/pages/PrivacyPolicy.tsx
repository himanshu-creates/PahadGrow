import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const sections = [
  { title: 'Information We Collect', content: 'We collect information you provide directly — your name, email, phone number, delivery address, and payment details when you register or transact on PahadGrow. We also automatically gather technical data such as IP address, browser type, and usage patterns to improve our platform.' },
  { title: 'How We Use Your Information', content: 'Your information powers our platform — processing transactions, sending order updates, personalising your experience, detecting fraud, and complying with legal obligations. We send promotional communications only with your explicit consent.' },
  { title: 'Sharing of Information', content: 'We do not sell your personal data. We share information only with trusted service providers (payment processors, delivery partners, cloud hosting) under strict confidentiality agreements, or when required by law.' },
  { title: 'Cookies and Tracking', content: 'We use cookies to remember preferences, analyse traffic, and enhance your experience. You may manage cookie settings through your browser. See our Cookie Policy for detailed information.' },
  { title: 'Data Security', content: 'We employ industry-standard security measures including encryption, secure servers, and access controls. While we strive for maximum protection, no internet transmission is entirely risk-free.' },
  { title: 'Data Retention', content: 'We retain your data as long as your account is active or as required by law. You may request deletion of your account and associated data at any time by contacting us.' },
  { title: 'Your Rights', content: 'You have the right to access, correct, delete, or export your personal data. You may object to certain processing or request restrictions. Contact privacy@pahadgrow.com to exercise these rights.' },
  { title: "Children's Privacy", content: 'PahadGrow is not intended for users under 13. We do not knowingly collect data from children. If you believe we have done so inadvertently, contact us for immediate deletion.' },
  { title: 'Changes to This Policy', content: 'We may update this Policy periodically. Significant changes will be communicated via email or a prominent site notice. Continued use of PahadGrow constitutes acceptance of the revised policy.' },
  { title: 'Contact Us', content: 'For questions regarding this Privacy Policy, write to privacy@pahadgrow.com or: PahadGrow, Dehradun, Uttarakhand, India.' },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#031a0f] text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Jost', sans-serif; }
        .luxury-section { border-left: 1px solid rgba(201,168,76,0.25); padding-left: 28px; transition: border-color 0.3s; }
        .luxury-section:hover { border-color: rgba(201,168,76,0.6); }
        .hero-bg { background: linear-gradient(160deg, #0d3d20 0%, #031a0f 60%); position: relative; overflow: hidden; }
        .hero-bg::before { content: ''; position: absolute; top: -40%; right: -10%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%); pointer-events: none; }
        .number { font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 300; color: rgba(201,168,76,0.12); line-height: 1; margin-bottom: 4px; }
      `}</style>
      <Navbar />
      <div className="hero-bg py-20 px-6 text-center">
        <p className="font-body text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">Legal</p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-[#f5e6c0] mb-4 leading-tight">Privacy <em>Policy</em></h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="block w-8 h-px bg-[#c9a84c] opacity-50" />
          <p className="font-body text-[#8fbe9a] text-xs tracking-widest uppercase">Last updated: 1 May 2025</p>
          <span className="block w-8 h-px bg-[#c9a84c] opacity-50" />
        </div>
      </div>
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <p className="font-body text-[#8fbe9a] text-sm leading-relaxed mb-16 pb-10 border-b border-[#1a4a2e]">
          At PahadGrow, your privacy is not a formality — it is a commitment. This Policy explains with full transparency how we handle the information you entrust to us.
        </p>
        <div className="flex flex-col gap-12">
          {sections.map(({ title, content }, i) => (
            <div key={title} className="luxury-section">
              <div className="number">{String(i + 1).padStart(2, '0')}</div>
              <h2 className="font-display text-2xl text-[#e8d5a3] mb-3">{title}</h2>
              <p className="font-body text-[#8fbe9a] text-sm leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
