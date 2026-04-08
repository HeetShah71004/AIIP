import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const LandingNavbar = ({ onLogin, onSignup }) => {
  const handleLogoClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (e, href) => {
    if (!href?.startsWith('#')) return;
    e.preventDefault();
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', href);
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
      className="sticky top-0 z-50 pointer-events-none"
    >
      <div
        className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 bg-background pointer-events-auto border-b border-border/70"
      >
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
        <div className="hidden md:flex items-center gap-7 lg:gap-9">
          {navLinks.map((link) => (
            <a 
              key={link.label}
              href={link.href} 
              onClick={(e) => handleNavClick(e, link.href)}
              className="relative group py-2 text-sm font-semibold text-foreground/80 hover:text-[#10b981] transition-all duration-300"
            >
              <span>{link.label}</span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#10b981] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <ThemeToggle />
          <button 
            onClick={onLogin}
            className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={onSignup}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_8px_20px_rgba(2,6,23,0.20)] hover:brightness-110 hover:-translate-y-[1px] transition-all duration-300 active:scale-95"
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
