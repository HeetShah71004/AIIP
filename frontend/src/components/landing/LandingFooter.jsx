import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Linkedin, Github, Send } from 'lucide-react';

const LandingFooter = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-[#0a0a0a] text-white pt-24 pb-12 border-t border-white/[0.05] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#14b8a6]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Column */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
              <span className="text-2xl font-bold tracking-tighter text-[#14b8a6]">Interv</span>
              <div className="bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-white/[0.08] shadow-sm">
                <span className="text-lg font-bold text-white">AI</span>
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-[260px] font-light">
              Master your next interview with AI-powered mock sessions and real-time feedback.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Linkedin, href: "https://www.linkedin.com/in/heet-shah-049a98316/" },
                { icon: Github, href: "https://github.com/HeetShah71004" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-[#14b8a6] hover:border-[#14b8a6] group transition-all duration-500"
                >
                  <social.icon className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 mb-10">
              Product
            </h4>
            <ul className="space-y-5">
              {['Features', 'Career Preparation', 'Mock Interviews', 'Resume Review', 'Practice Library'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-[14px] text-white/50 hover:text-[#14b8a6] transition-colors duration-300 font-light">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 mb-10">
              Company
            </h4>
            <ul className="space-y-5">
              {['About Us', 'Careers', 'Blog', 'Press Kit', 'Contact'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-[14px] text-white/50 hover:text-[#14b8a6] transition-colors duration-300 font-light">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="max-w-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 mb-10">
              Newsletter
            </h4>
            <p className="text-white/40 text-sm mb-8 font-light leading-relaxed">
              Get the latest interview tips and AI updates directly in your inbox.
            </p>
            <form 
              className="flex items-center gap-2 p-1 rounded-[2rem] bg-white/[0.02] border border-white/[0.05]"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="email@example.com"
                className="flex-grow bg-transparent border border-white/20 rounded-2xl py-3 px-5 text-sm text-white focus:outline-none focus:border-white transition-all placeholder:text-white/20 font-light"
              />
              <button
                type="submit"
                className="bg-white text-black px-6 py-3 rounded-2xl text-sm font-bold hover:bg-white/90 transition-all duration-300 shadow-xl whitespace-nowrap active:scale-95"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <span className="text-[12px] text-white/25 font-light">
              &copy; {new Date().getFullYear()} Interv AI. All rights reserved.
            </span>
            <div className="flex gap-8">
              {['Privacy', 'Terms', 'Cookie Policy'].map((link) => (
                <Link key={link} to="#" className="text-[12px] text-white/30 hover:text-[#14b8a6] transition-colors duration-300 font-light">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] font-semibold text-white/50 tracking-wide uppercase">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

