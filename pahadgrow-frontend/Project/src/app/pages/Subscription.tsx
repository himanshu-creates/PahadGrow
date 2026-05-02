import { useState, useEffect } from 'react';
import { Check, Loader2, CheckCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { isLoggedIn, getCurrentUser } from '../../api';
import { useNavigate } from 'react-router';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_Sk3SKxj95myrWa';

declare global { interface Window { Razorpay: any; } }

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    amount: 0,
    period: 'forever',
    features: ['List up to 5 products','Basic marketplace access','Community forum access','Email support'],
    notIncluded: ['Featured listings','Analytics dashboard','Priority support','Video tutorials'],
    recommended: false,
  },
  {
    name: 'Starter',
    price: '₹49',
    amount: 4900,
    period: '/month',
    features: ['List up to 25 products','Featured listings (5/month)','Basic analytics','Community forum access','Email support','Video tutorials'],
    notIncluded: ['Unlimited listings','Advanced analytics','Priority support'],
    recommended: true,
  },
  {
    name: 'Professional',
    price: '₹99',
    amount: 9900,
    period: '/month',
    features: ['Unlimited product listings','Unlimited featured listings','Advanced analytics dashboard','Priority customer support','Video tutorials & courses','Land rental access','Premium badge','Marketing tools'],
    notIncluded: [],
    recommended: false,
  },
];

export default function Subscription() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const loggedIn = isLoggedIn();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!window.Razorpay) {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(s);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSubscribe = (plan: typeof PLANS[0]) => {
    if (plan.amount === 0) {
      if (!loggedIn) { navigate('/signup'); return; }
      showToast('You are already on the Free plan!');
      return;
    }
    if (!loggedIn) { navigate('/login'); return; }

    setLoading(plan.name);
    const options = {
      key: RAZORPAY_KEY,
      amount: plan.amount,
      currency: 'INR',
      name: 'PahadGrow',
      description: `${plan.name} Plan — ${plan.period}`,
      handler: (response: any) => {
        setSuccess(plan.name);
        showToast(`${plan.name} plan activated! Payment ID: ${response.razorpay_payment_id}`);
        setLoading(null);
      },
      prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
      theme: { color: '#166534' },
      modal: { ondismiss: () => setLoading(null) },
    };
    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      showToast('Payment gateway unavailable. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={loggedIn} userRole={user?.role ?? null} />

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan to grow your business. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${
                plan.recommended ? 'border-primary relative' : 'border-border'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-700 text-white rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="text-green-700" size={14} />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 opacity-40">
                      <div className="mt-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Check className="text-muted-foreground" size={14} />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                {success === plan.name ? (
                  <div className="w-full py-3 rounded-lg font-medium bg-green-50 text-green-700 border border-green-200 flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> Activated
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading === plan.name}
                    className={`w-full py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2 ${
                      plan.recommended
                        ? 'bg-primary text-primary-foreground hover:bg-green-800'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-green-700 hover:text-white hover:border-green-700'
                    }`}
                  >
                    {loading === plan.name && <Loader2 size={15} className="animate-spin" />}
                    {plan.amount === 0 ? 'Get Started' : 'Subscribe Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          🔒 Test mode — use card <span className="font-mono">4111 1111 1111 1111</span>, any CVV, any future date.
        </p>

        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I change my plan later?', a: 'Yes, you can upgrade or downgrade at any time. Changes reflect in your next billing cycle.' },
              { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and digital wallets via Razorpay.' },
              { q: 'Is there a refund policy?', a: "Yes, we offer a 7-day money-back guarantee if you're not satisfied with our service." },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
