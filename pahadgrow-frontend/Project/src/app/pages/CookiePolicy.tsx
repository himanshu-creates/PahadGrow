import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const cookieTypes = [
  { tag: 'Required', name: 'Essential Cookies', desc: 'Necessary for the platform to function — authentication, cart, security. Cannot be disabled.', examples: 'Session token, CSRF protection, cart data', required: true },
  { tag: 'Optional', name: 'Analytics Cookies', desc: 'Help us understand how visitors interact with PahadGrow so we can improve the platform.', examples: 'Google Analytics (anonymised), page view counters', required: false },
  { tag: 'Optional', name: 'Preference Cookies', desc: 'Remember your settings — language, display options — so you do not need to re-enter them.', examples: 'Language preference, notification settings', required: false },
  { tag: 'Optional', name: 'Marketing Cookies', desc: 'Track activity to surface relevant content and promotions. We do not share this with advertisers.', examples: 'Campaign attribution, email engagement', required: false },
];

const sections = [
  { title: 'What Are Cookies?', content: 'Cookies are small text files placed on your device when you visit a website. They allow sites to remember your preferences and activity, improving functionality and user experience without containing personally identifiable information on their own.' },
  { title: 'How We Use Cookies', content: 'PahadGrow uses cookies to keep you logged in, remember preferences, understand platform usage, and occasionally surface relevant content. We do not use cookies to serve third-party advertisements.' },
  { title: 'Managing Your Preferences', content: 'You may control and delete cookies through your browser settings. Note that disabling certain cookies may affect platform functionality — for example, staying logged in or using your cart. Refer to your browser documentation for instructions.' },
  { title: 'Third-Party Cookies', content: 'Limited third-party services such as Google Analytics may place their own cookies on your device. These are governed by their own policies. We require all third parties to treat your data in accordance with applicable law.' },
  { title: 'Changes to This Policy', content: 'We may update this Cookie Policy to reflect changes in technology or regulations. Significant changes will be communicated via site notice or email.' },
  { title: 'Contact', content: 'Questions about our cookie practices? Write to privacy@pahadgrow.com.' },
];

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#031a0f] text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Jost', sans-serif; }
        .hero-bg { background: linear-gradient(160deg, #0d3d20 0%, #031a0f 60%); position: relative; }
        .hero-bg::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent); }
        .cookie-card { background: linear-gradient(135deg, rgba(13,50,28,0.65), rgba(5,22,13,0.85)); border: 1px solid rgba(201,168,76,0.1); border-radius: 16px; padding: 28px; transition: border-color 0.3s, transform 0.3s; }
        .cookie-card:hover { border-color: rgba(201,168,76,0.35); transform: translateY(-3px); }
        .tag-required { background: rgba(201,168,76,0.15); color: #c9a84c; border: 1px solid rgba(201,168,76,0.25); font-size: 0.65rem; padding: 2px 10px; border-radius: 999px; letter-spacing: 0.1em; text-transform: uppercase; }
        .tag-optional { background: rgba(143,190,154,0.1); color: #8fbe9a; border: 1px solid rgba(143,190,154,0.2); font-size: 0.65rem; padding: 2px 10px; border-radius: 999px; letter-spacing: 0.1em; text-transform: uppercase; }
        .info-section { border-left: 1px solid rgba(201,168,76,0.2); padding-left: 24px; transition: border-color 0.3s; }
        .info-section:hover { border-color: rgba(201,168,76,0.5); }
      `}</style>
      <Navbar />
      <div className="hero-bg py-20 px-6 text-center">
        <p className="font-body text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-4">Legal</p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-[#f5e6c0] mb-4 leading-tight">Cookie <em>Policy</em></h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="block w-8 h-px bg-[#c9a84c] opacity-50" />
          <p className="font-body text-[#8fbe9a] text-xs tracking-widest uppercase">Last updated: 1 May 2025</p>
          <span className="block w-8 h-px bg-[#c9a84c] opacity-50" />
        </div>
      </div>
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <p className="font-body text-[#8fbe9a] text-sm leading-relaxed mb-14">
          This Policy explains how PahadGrow uses cookies and similar technologies. By continuing to use our platform, you consent to our use of cookies as described below.
        </p>

        <p className="font-body text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-6">Types of Cookies We Use</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {cookieTypes.map(({ tag, name, desc, examples, required }) => (
            <div key={name} className="cookie-card">
              <div className="flex items-center justify-between mb-4">
                <span className={required ? 'tag-required font-body' : 'tag-optional font-body'}>{tag}</span>
              </div>
              <h3 className="font-display text-xl text-[#e8d5a3] mb-2">{name}</h3>
              <p className="font-body text-[#8fbe9a] text-xs leading-relaxed mb-3">{desc}</p>
              <p className="font-body text-[#5a8a68] text-xs"><span className="text-[#8fbe9a]">Examples: </span>{examples}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-10">
          {sections.map(({ title, content }) => (
            <div key={title} className="info-section">
              <h2 className="font-display text-2xl text-[#e8d5a3] mb-2">{title}</h2>
              <p className="font-body text-[#8fbe9a] text-sm leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
