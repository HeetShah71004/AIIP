import React from 'react';

const SocialProof = () => {
  const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Airbnb', 'Stripe'];
  const allCompanies = [...companies, ...companies]; // Duplicate for seamless looping
  
  return (
    <section className="py-12 border-y border-border bg-foreground/[0.01] transition-colors duration-300 overflow-hidden relative">
      {/* Fade Masks */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-foreground/40 font-bold mb-10">
          Trusted by candidates preparing for
        </p>
        
        <div className="pause-marquee overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-x-16 items-center">
            {allCompanies.map((company, index) => (
              <span 
                key={`${company}-${index}`} 
                className="text-2xl font-black text-foreground/20 tracking-tighter hover:text-foreground hover:scale-110 transition-all duration-500 cursor-default"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
