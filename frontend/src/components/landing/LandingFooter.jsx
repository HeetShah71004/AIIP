import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="py-12 bg-background border-t border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
          <span className="text-xl font-bold tracking-tighter text-foreground">Interv</span>
          <div className="bg-foreground/10 px-2 py-0.5 rounded border border-foreground/5">
            <span className="text-sm font-bold text-foreground">AI</span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8">
          <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-4 h-4" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          &copy; {new Date().getFullYear()} Interv AI. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
