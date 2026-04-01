import React from 'react';

const DEFAULT_SECTION_ORDER = ['experience', 'projects', 'education', 'skills', 'languages'];

const ElegantTemplate = ({ resumeData = {}, sectionOrder = DEFAULT_SECTION_ORDER }) => {
  const { personalInfo = {}, summary = '', experience = [], education = [], skills = [], projects = [], languages = [] } = resumeData;

  const summarySection = summary ? (
    <section key="summary" className="text-center max-w-2xl mx-auto">
      <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-4 flex items-center justify-center gap-3">
        <span className="w-8 h-[1px] bg-rose-200"></span>
        Profile
        <span className="w-8 h-[1px] bg-rose-200"></span>
      </h2>
      <p className="text-xs leading-relaxed text-slate-500 italic px-4 font-sans">{summary}</p>
    </section>
  ) : null;

  const leftColumnSections = {
    experience: experience.length > 0 ? (
      <section key="experience">
        <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-6 flex items-center gap-3">
          Experience
          <span className="flex-1 h-[1px] bg-rose-100"></span>
        </h2>
        <div className="space-y-8">
          {experience.map((exp, idx) => (
            <div key={idx} className="relative pl-6 border-l border-rose-100">
              <div className="absolute w-2 h-2 bg-rose-200 rounded-full -left-[4.5px] top-1"></div>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{exp.role}</h3>
                <span className="text-[10px] font-bold text-rose-300 uppercase">{exp.startDate} - {exp.endDate}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 italic mb-3 uppercase tracking-wider">{exp.company}</div>
              <p className="text-[11px] leading-relaxed text-slate-500 font-sans whitespace-pre-line pl-4 border-l border-slate-50">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    projects: projects.length > 0 ? (
      <section key="projects">
        <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-6 flex items-center gap-3">
          Projects
          <span className="flex-1 h-[1px] bg-rose-100"></span>
        </h2>
        <div className="space-y-6">
          {projects.map((proj, idx) => (
            <div key={idx} className="pl-6 border-l border-rose-50">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase">{proj.name}</h3>
                <span className="text-[10px] font-bold text-rose-300">{proj.link}</span>
              </div>
              <div className="text-[10px] font-bold text-rose-400/50 tracking-wider mb-2 uppercase">{proj.technologies?.join(' • ')}</div>
              <p className="text-[11px] leading-relaxed text-slate-500 font-sans border-l-2 border-rose-50 pl-4">{proj.description}</p>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    ...(resumeData.customSections || []).reduce((acc, section) => ({
      ...acc,
      [section.id]: section.items?.length > 0 ? (
        <section key={section.id}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-6 flex items-center gap-3">
            {section.title}
            <span className="flex-1 h-[1px] bg-rose-100"></span>
          </h2>
          <div className="space-y-8">
            {section.items.map((item, idx) => (
              <div key={idx} className="relative pl-6 border-l border-rose-100">
                <div className="absolute w-2 h-2 bg-rose-200 rounded-full -left-[4.5px] top-1"></div>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{item.title}</h3>
                  <span className="text-[10px] font-bold text-rose-300 uppercase">{item.date}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-400 italic mb-3 uppercase tracking-wider">{item.subtitle}</div>
                {item.description && (
                  <p className="text-[11px] leading-relaxed text-slate-500 font-sans whitespace-pre-line pl-4 border-l border-slate-50">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null
    }), {})
  };

  const rightColumnSections = {
    skills: skills.length > 0 ? (
      <section key="skills">
        <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-4 border-b border-rose-100 pb-2">Expertise</h2>
        <ul className="space-y-2">
          {skills.map((skill, idx) => (
            <li key={idx} className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <span className="w-1 h-1 bg-rose-200 rounded-full"></span>
              {skill}
            </li>
          ))}
        </ul>
      </section>
    ) : null,
    education: education.length > 0 ? (
      <section key="education">
        <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-4 border-b border-rose-100 pb-2">Education</h2>
        <div className="space-y-5">
          {education.map((edu, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-[11px] font-bold text-slate-800 uppercase leading-tight">{edu.degree}</h3>
              <div className="text-[10px] font-bold text-rose-300 leading-tight">{edu.school}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">{edu.startDate} - {edu.endDate}</div>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    languages: languages.length > 0 ? (
      <section key="languages">
        <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-4 border-b border-rose-100 pb-2">Languages</h2>
        <div className="flex flex-col gap-1.5 overflow-hidden">
          {languages.map((lang, idx) => (
            <span key={idx} className="text-[10px] font-bold text-slate-600 bg-rose-50/70 border border-rose-100 px-3 py-1.5 rounded uppercase flex items-center gap-2">
              {lang}
            </span>
          ))}
        </div>
      </section>
    ) : null
  };

  const orderedLeftSections = sectionOrder.map((sectionKey) => leftColumnSections[sectionKey]).filter(Boolean);
  const orderedRightSections = sectionOrder.map((sectionKey) => rightColumnSections[sectionKey]).filter(Boolean);

  return (
    <div className="bg-white text-slate-800 font-serif p-12 flex flex-col gap-10 shadow-lg" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
      
      {/* Header - Soft Rose Background */}
      <header className="bg-rose-50/50 -mx-12 -mt-12 p-12 text-center flex flex-col items-center border-b border-rose-100">
        <h1 className="text-4xl font-extrabold text-rose-900 tracking-tight mb-4 uppercase italic">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-rose-800/60 uppercase tracking-widest">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-rose-400 mt-4 font-bold border-t border-rose-100 pt-4">
          {personalInfo.linkedIn && <span className="hover:text-rose-600 cursor-pointer">{personalInfo.linkedIn.replace('https://', '')}</span>}
          {personalInfo.github && <span className="hover:text-rose-600 cursor-pointer">{personalInfo.github.replace('https://', '')}</span>}
          {personalInfo.leetcode && <span className="hover:text-rose-600 cursor-pointer">{personalInfo.leetcode.replace('https://', '')}</span>}
        </div>
      </header>

      {summarySection}

      <div className="grid grid-cols-12 gap-10">
        
        {/* Left Column - Main Details */}
        <div className="col-span-8 flex flex-col gap-10">
          
          {orderedLeftSections}
        </div>

        {/* Right Column - Secondary Details */}
        <div className="col-span-4 flex flex-col gap-10">
          
          {orderedRightSections}
        </div>
      </div>

    </div>
  );
};

export default ElegantTemplate;
