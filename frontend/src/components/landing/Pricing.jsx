import React from 'react';
import { Check, Zap } from 'lucide-react';

const Pricing = ({ onSignup }) => {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started and exploring AI interviews.',
      features: [
        '2 Mock sessions per month',
        'Standard AI feedback',
        'Basic skill tracking',
        'Community support'
      ],
      cta: 'Start for Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      description: 'The complete toolkit for serious job seekers.',
      features: [
        'Unlimited mock sessions',
        'Advanced AI analysis (Audio & Text)',
        'Full skill tracking radar',
        'Resume-based custom sessions',
        'Priority email support'
      ],
      cta: 'Get Pro Access',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For teams and organizations looking for a custom solution.',
      features: [
        'Team analytics dashboard',
        'Custom company question sets',
        'Unlimited users',
        'Dedicated account manager',
        'SSO & Advanced Security'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-background relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Simple, transparent pricing.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">
            Choose the plan that fits your career goals. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div 
              key={i}
              className={`relative p-8 rounded-[2rem] border transition-all duration-500 flex flex-col ${
                tier.popular 
                  ? 'bg-card border-primary/50 shadow-2xl shadow-primary/10 scale-105 z-10' 
                  : 'bg-card/50 border-border hover:border-foreground/20'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Zap size={12} fill="currentColor" /> MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-foreground">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-muted-foreground font-medium">/month</span>}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {tier.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check size={10} className="text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-foreground/80 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onSignup}
                className={`w-full py-4 rounded-2xl font-bold transition-all transform active:scale-[0.98] ${
                  tier.popular
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90'
                    : 'bg-foreground/5 text-foreground hover:bg-foreground/10 border border-foreground/5'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Background glow for Pro tier */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
    </section>
  );
};

export default Pricing;
