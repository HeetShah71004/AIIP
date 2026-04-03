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

  const handleLogoClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Career Preparation', href: '#career-preparation' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contact Us', href: '#contact-us' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 backdrop-blur-md bg-white/85 dark:bg-black/50 border-b border-black/5 dark:border-white/[0.08] shadow-sm' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
        >
          <span className="text-2xl font-bold tracking-tighter text-[#14b8a6]">Interv</span>
          <div className="bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-white/[0.08]">
            <span className="text-lg font-bold text-white">AI</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.label}
              href={link.href} 
              className="relative group py-2 text-sm font-semibold text-foreground/70 hover:text-[#10b981] transition-all duration-300"
            >
              <span>{link.label}</span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#10b981] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <button 
            onClick={onLogin}
            className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={onSignup}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 active:scale-95"
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
