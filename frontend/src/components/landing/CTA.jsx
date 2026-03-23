import React from 'react';
import { Link } from 'react-router-dom';

const CTA = ({ onSignup }) => {
  return (
    <section className="py-32 border-y border-border relative overflow-hidden bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8">
          Start practicing today.
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto font-light">
          Join 10k+ candidates who have landed their dream jobs using Interv AI.
        </p>
        <button 
          onClick={onSignup}
          className="inline-block px-12 py-5 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 transition-all transform hover:scale-[1.05] shadow-xl"
        >
          Get Started
        </button>
      </div>

      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#a8f54a]/5 blur-[120px] rounded-full -z-10" />
    </section>
  );
};

export default CTA;
