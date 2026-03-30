import React from 'react';

const MidnightTemplate = ({ resumeData = {} }) => {
  const { personalInfo = {}, summary = '', experience = [], education = [], skills = [], projects = [], languages = [] } = resumeData;

  return (
    <div className="bg-slate-900 text-slate-100 font-sans p-10 flex flex-col gap-10 min-h-[297mm] shadow-2xl relative overflow-hidden" style={{ width: '210mm', boxSizing: 'border-box' }}>
      
      {/* Dynamic Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Header - Centered Tech Look */}
      <header className="relative z-10 text-center border-b border-white/10 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 italic">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-4 opacity-80">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] font-semibold text-white/40 border-t border-white/5 pt-4">
          {personalInfo.linkedIn && <span className="hover:text-emerald-400 cursor-pointer">{personalInfo.linkedIn.replace('https://', '')}</span>}
          {personalInfo.github && <span className="hover:text-emerald-400 cursor-pointer">{personalInfo.github.replace('https://', '')}</span>}
          {personalInfo.leetcode && <span className="hover:text-emerald-400 cursor-pointer">{personalInfo.leetcode.replace('https://', '')}</span>}
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-12 gap-10">
        
        {/* Sidebar - Skills & More */}
        <div className="col-span-4 flex flex-col gap-10">
          
          {/* Summary/Profile */}
          {summary && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500"></span>
                Terminal Summary
              </h2>
              <p className="text-[11px] leading-relaxed text-slate-400 font-mono italic opacity-90">{summary}</p>
            </section>
          )}

          {/* Skills - Tag style */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-teal-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-sm bg-teal-500"></span>
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-white/5 text-[10px] font-bold text-white/70 px-2 py-1 rounded border border-white/10 hover:border-emerald-500/50 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500"></span>
                Locales
              </h2>
              <div className="space-y-2">
                {languages.map((lang, idx) => (
                   <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/50 w-[85%]"></div>
                      </div>
                      <span className="text-[10px] font-bold text-white/50 lowercase">{lang}</span>
                   </div>
                ))}
              </div>
            </section>
          )}

           {/* Education */}
           {education.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-teal-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-sm bg-teal-500"></span>
                Education
              </h2>
              <div className="space-y-5">
                {education.map((edu, idx) => (
                  <div key={idx} className="border-l border-white/5 pl-3">
                    <h3 className="text-[11px] font-bold text-white leading-tight uppercase mb-1">{edu.degree}</h3>
                    <div className="text-[10px] font-bold text-emerald-400/60 leading-tight mb-1">{edu.school}</div>
                    <div className="text-[9px] font-bold text-white/20 uppercase">{edu.startDate} - {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Main Section - Experience & Projects */}
        <div className="col-span-8 flex flex-col gap-10">
          
          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center justify-between border-b border-white/10 pb-2">
                Execution History
                <span className="text-[10px] font-mono text-white/20">cat logs --all</span>
              </h2>
              <div className="space-y-8">
                {experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute w-[2px] h-full bg-white/5 left-0 top-2 after:content-[''] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-emerald-500 after:rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">{exp.role}</h3>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded italic">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-white/40 mb-3 uppercase tracking-wider">{exp.company}</div>
                    <p className="text-[11px] leading-relaxed text-slate-400 font-mono whitespace-pre-line bg-white/5 p-4 rounded border border-white/5">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-teal-400 mb-6 flex items-center justify-between border-b border-white/10 pb-2">
                Deployments
                <span className="text-[10px] font-mono text-white/20">ls ./projects</span>
              </h2>
              <div className="space-y-6">
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white/5 to-transparent p-4 rounded border border-white/5 hover:border-teal-500/30 transition-all group">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-bold text-white uppercase group-hover:text-teal-400 transition-colors underline decoration-white/10 underline-offset-4">{proj.name}</h3>
                      <span className="text-[10px] font-bold text-white/20 hover:text-emerald-400 cursor-pointer">{proj.link}</span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400/50 tracking-wider mb-2 uppercase italic">{proj.technologies?.join(' • ')}</div>
                    <p className="text-[11px] leading-relaxed text-slate-400 font-mono pl-3 border-l-2 border-emerald-500/20">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Footer Branding Area */}
      <footer className="mt-auto pt-10 text-center opacity-20 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">System: AI Compiled</p>
      </footer>

    </div>
  );
};

export default MidnightTemplate;
