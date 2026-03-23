import React from 'react';
import { Link } from 'react-router-dom';

const Hero = ({ onSignup, onLogin }) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-[1.1]">
          Master your next interview with <span className="text-[#14b8a6] dark:text-[#14b8a6]">AI precision.</span>
        </h1>
        
        {/* Subtext */}
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light">
          The all-in-one platform for realistic AI-powered mock interviews, instant feedback, and personalized skill tracking.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button 
            onClick={onSignup}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
          >
            Get started for free
          </button>
          <button 
            onClick={onLogin}
            className="w-full sm:w-auto px-8 py-4 bg-transparent text-foreground border border-border rounded-full font-bold text-lg hover:bg-foreground/5 transition-all"
          >
            View live demo
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 max-w-5xl mx-auto py-12 border-y border-border">
          {[
            { label: 'Top Companies', val: '50+' },
            { label: 'Mock Sessions', val: '10k+' },
            { label: 'AI Availability', val: '24/7' },
            { label: 'Success Rate', val: '98%' },
            { label: 'User Rating', val: '4.9/5' }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{stat.val}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Background radial fade for depth (subtle) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(168,245,74,0.03)_0%,transparent_70%)] pointer-events-none" />
    </section>
  );
};

export default Hero;
