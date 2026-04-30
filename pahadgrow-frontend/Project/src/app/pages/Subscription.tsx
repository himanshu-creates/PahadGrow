import { Check, X, Zap, Star, Crown } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function Subscription() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: [
        'List up to 5 products',
        'Basic marketplace access',
        'Community forum access',
        'Email support',
      ],
      notIncluded: [
        'Featured listings',
        'Analytics dashboard',
        'Priority support',
        'Video tutorials',
      ],
      recommended: false,
    },
    {
      name: 'Starter',
      price: '₹49',
      period: '/month',
      features: [
        'List up to 25 products',
        'Featured listings (5/month)',
        'Basic analytics',
        'Community forum access',
        'Email support',
        'Video tutorials',
      ],
      notIncluded: [
        'Unlimited listings',
        'Advanced analytics',
        'Priority support',
      ],
      recommended: true,
    },
    {
      name: 'Professional',
      price: '₹99',
      period: '/month',
      features: [
        'Unlimited product listings',
        'Unlimited featured listings',
        'Advanced analytics dashboard',
        'Priority customer support',
        'Video tutorials & courses',
        'Land rental access',
        'Premium badge',
        'Marketing tools',
      ],
      notIncluded: [],
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan to grow your business. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${
                plan.recommended ? 'border-primary relative' : 'border-border'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                {/* Plan Header */}
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="text-secondary" size={14} />
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

                {/* CTA Button */}
                <button 
                  className={`w-full py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md ${
                    plan.recommended
                      ? 'bg-primary text-primary-foreground hover:bg-[#2E7D32]'
                      : 'bg-white border border-[#D1D5DB] text-[#374151] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32]'
                  }`}
                >
                  {plan.price === '₹0' ? 'Get Started' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I change my plan later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept UPI, credit/debit cards, net banking, and digital wallets.',
              },
              {
                q: 'Is there a refund policy?',
                a: 'Yes, we offer a 7-day money-back guarantee if you\'re not satisfied with our service.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-border">
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