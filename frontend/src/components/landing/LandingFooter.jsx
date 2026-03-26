import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Github, Send } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-20 pb-10 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
              <span className="text-2xl font-bold tracking-tighter text-[#14b8a6]">Interv</span>
              <div className="bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-white/[0.08]">
                <span className="text-lg font-bold text-white">AI</span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-[240px] font-dm-sans">
              Master your next interview with AI-powered mock sessions and real-time feedback.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Linkedin, href: "https://www.linkedin.com/in/heet-shah-049a98316/" },
                { icon: Github, href: "https://github.com/HeetShah71004" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
                >
                  <social.icon className="w-4 h-4 text-white/70" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35 mb-8 font-syne">
              Product
            </h4>
            <ul className="space-y-4">
              {['Features', 'Pricing', 'Mock Interviews', 'Resume Review', 'Practice Library'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-[14px] text-white/60 hover:text-white transition-colors font-dm-sans">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35 mb-8 font-syne">
              Company
            </h4>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Blog', 'Press Kit', 'Contact'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-[14px] text-white/60 hover:text-white transition-colors font-dm-sans">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35 mb-8 font-syne">
              Newsletter
            </h4>
            <p className="text-white/50 text-sm mb-6 font-dm-sans">
              Get the latest interview tips and AI updates.
            </p>
            <form className="relative group" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-white/30 transition-all font-dm-sans placeholder:text-white/20"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-white text-[#0a0a0a] px-4 rounded-md text-xs font-bold hover:bg-white/90 transition-colors flex items-center gap-2 group/btn"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <span className="text-[12px] text-white/35 font-dm-sans">
              &copy; {new Date().getFullYear()} Interv AI.
            </span>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Cookie Policy'].map((link) => (
                <Link key={link} to="#" className="text-[12px] text-white/40 hover:text-white transition-colors font-dm-sans">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-white/60 font-dm-sans">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

