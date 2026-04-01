import React from 'react';

const DEFAULT_SECTION_ORDER = ['experience', 'projects', 'education', 'skills', 'languages'];

const CreativeTemplate = ({ resumeData = {}, sectionOrder = DEFAULT_SECTION_ORDER }) => {
  const { personalInfo = {}, summary = '', experience = [], education = [], skills = [], projects = [], languages = [] } = resumeData;

  const summarySection = summary ? (
    <section>
      <h2 className="text-lg font-bold text-violet-700 mb-3 border-l-4 border-violet-700 pl-4 uppercase tracking-wider">About Me</h2>
      <p className="text-xs leading-relaxed text-slate-600 pl-5">{summary}</p>
    </section>
  ) : null;

  const sidebarSections = {
    skills: skills.length > 0 ? (
      <div key="skills">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-3 border-b border-white/20 pb-1">Skills</h2>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {skills.map((skill, idx) => (
            <span key={idx} className="bg-white/10 px-2 py-1 rounded border border-white/10">{skill}</span>
          ))}
        </div>
      </div>
    ) : null,
    languages: languages.length > 0 ? (
      <div key="languages">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-3 border-b border-white/20 pb-1">Languages</h2>
        <ul className="text-xs space-y-1">
          {languages.map((lang, idx) => (
            <li key={idx} className="flex items-center gap-2 underline decoration-white/20 underline-offset-2">• {lang}</li>
          ))}
        </ul>
      </div>
    ) : null
  };

  const mainSections = {
    experience: experience.length > 0 ? (
      <section key="experience">
        <h2 className="text-lg font-bold text-violet-700 mb-6 border-l-4 border-violet-700 pl-4 uppercase tracking-wider">Experience</h2>
        <div className="space-y-8 pl-5">
          {experience.map((exp, idx) => (
            <div key={idx} className="relative">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{exp.role}</h3>
                <span className="text-[10px] font-bold text-violet-500 uppercase shrink-0">{exp.startDate} - {exp.endDate}</span>
              </div>
              <div className="text-xs font-semibold text-slate-500 mb-3">{exp.company}</div>
              <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line border-l-2 border-slate-100 pl-4">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    projects: projects.length > 0 ? (
      <section key="projects">
        <h2 className="text-lg font-bold text-violet-700 mb-6 border-l-4 border-violet-700 pl-4 uppercase tracking-wider">Top Projects</h2>
        <div className="space-y-6 pl-5">
          {projects.map((proj, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-bold text-slate-900">{proj.name}</h3>
                <span className="text-[10px] font-semibold text-violet-500">{proj.link}</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{proj.technologies?.join(' • ')}</div>
              <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line border-l-2 border-slate-100 pl-4">{proj.description}</p>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    education: education.length > 0 ? (
      <section key="education">
        <h2 className="text-lg font-bold text-violet-700 mb-6 border-l-4 border-violet-700 pl-4 uppercase tracking-wider">Education</h2>
        <div className="space-y-6 pl-5">
          {education.map((edu, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                <span className="text-[10px] font-bold text-violet-500 uppercase">{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className="text-xs font-semibold text-slate-500">{edu.school}</div>
              {edu.description && <p className="text-[10px] text-slate-400 mt-2 italic">{edu.description}</p>}
            </div>
          ))}
        </div>
      </section>
    ) : null,
    ...(resumeData.customSections || []).reduce((acc, section) => ({
      ...acc,
      [section.id]: section.items?.length > 0 ? (
        <section key={section.id}>
          <h2 className="text-lg font-bold text-violet-700 mb-6 border-l-4 border-violet-700 pl-4 uppercase tracking-wider">{section.title}</h2>
          <div className="space-y-6 pl-5">
            {section.items.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{item.title}</h3>
                  <span className="text-[10px] font-bold text-violet-500 uppercase shrink-0">{item.date}</span>
                </div>
                <div className="text-xs font-semibold text-slate-500 mb-3">{item.subtitle}</div>
                {item.description && (
                  <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line border-l-2 border-slate-100 pl-4">
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

  const orderedSidebarSections = sectionOrder.map((sectionKey) => sidebarSections[sectionKey]).filter(Boolean);
  const orderedMainSections = sectionOrder.map((sectionKey) => mainSections[sectionKey]).filter(Boolean);

  return (
    <div className="flex bg-white text-slate-800 font-sans" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
      
      {/* Left Sidebar - Deep Violet Background */}
      <div className="w-1/3 bg-violet-700 text-white p-8 flex flex-col gap-8">
        
        {/* Name & Title */}
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-tighter">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="w-8 h-1 bg-white/30 mt-4 rounded-full"></div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 text-xs font-medium">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2 border-b border-white/20 pb-1">Contact</h2>
          {personalInfo.email && <div className="flex items-center gap-2"><span>{personalInfo.email}</span></div>}
          {personalInfo.phone && <div className="flex items-center gap-2"><span>{personalInfo.phone}</span></div>}
          {personalInfo.location && <div className="flex items-center gap-2"><span>{personalInfo.location}</span></div>}
          {personalInfo.linkedIn && <div className="flex items-center gap-2 break-all"><span>{personalInfo.linkedIn.replace('https://', '')}</span></div>}
          {personalInfo.github && <div className="flex items-center gap-2 break-all"><span>{personalInfo.github.replace('https://', '')}</span></div>}
          {personalInfo.leetcode && <div className="flex items-center gap-2 break-all"><span>{personalInfo.leetcode.replace('https://', '')}</span></div>}
        </div>

        {orderedSidebarSections}
      </div>

      {/* Right Column - White Background */}
      <div className="w-2/3 p-10 flex flex-col gap-10">
        {summarySection}
        {orderedMainSections}

      </div>
    </div>
  );
};

export default CreativeTemplate;
