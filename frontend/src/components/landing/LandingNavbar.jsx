import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const LandingNavbar = ({ onLogin, onSignup }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 backdrop-blur-md bg-black/50 border-b border-white/[0.08]' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
          <span className="text-2xl font-bold tracking-tighter text-[#14b8a6]">Interv</span>
          <div className="bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-white/[0.08]">
            <span className="text-lg font-bold text-white">AI</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">How it works</a>
          <a href="#features" className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">Pricing</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <button 
            onClick={onLogin}
            className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={onSignup}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
