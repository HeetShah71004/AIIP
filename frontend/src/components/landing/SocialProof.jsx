import React from 'react';

const SocialProof = () => {
  const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Airbnb', 'Stripe'];
  
  return (
    <section className="py-12 border-y border-border bg-foreground/[0.01] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-foreground/40 font-bold mb-8">
          Trusted by candidates preparing for
        </p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-40 grayscale hover:opacity-100 transition-all duration-700">
          {companies.map((company) => (
            <span key={company} className="text-xl font-bold text-foreground tracking-tight">{company}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
