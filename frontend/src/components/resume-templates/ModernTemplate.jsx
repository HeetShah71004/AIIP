import React from 'react';

const DEFAULT_SECTION_ORDER = ['experience', 'projects', 'education', 'skills', 'languages'];

const ModernTemplate = ({ resumeData, sectionOrder = DEFAULT_SECTION_ORDER }) => {
  const summarySection = resumeData.summary ? (
    <section>
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-teal-600 mb-3 flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-teal-100 text-teal-600 flex items-center justify-center text-[10px]">❖</span>
        Profile
      </h2>
      <p className="text-xs leading-relaxed text-slate-600">{resumeData.summary}</p>
    </section>
  ) : null;

  const sidebarSections = {
    skills: resumeData.skills?.length > 0 ? (
      <div key="skills">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 border-b-2 border-slate-200 pb-1">Skills</h2>
        <div className="flex flex-wrap gap-1.5">
          {resumeData.skills.map((skill, idx) => (
            <span key={idx} className="bg-white text-slate-700 text-[10px] px-2 py-1 rounded border border-slate-200 shadow-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    ) : null,
    languages: resumeData.languages?.length > 0 ? (
      <div key="languages">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 border-b-2 border-slate-200 pb-1">Languages</h2>
        <div className="flex flex-wrap gap-1.5">
          {resumeData.languages.map((lang, idx) => (
            <span key={idx} className="text-slate-600 text-xs font-medium">
              • {lang}
            </span>
          ))}
        </div>
      </div>
    ) : null
  };

  const contentSections = {
    experience: resumeData.experience?.length > 0 ? (
      <section key="experience">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-teal-600 mb-4 flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-teal-100 text-teal-600 flex items-center justify-center text-[10px]">❖</span>
          Experience
        </h2>
        <div className="space-y-6">
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="relative pl-4 border-l-2 border-slate-100">
              <div className="absolute w-2 h-2 bg-teal-400 rounded-full -left-[5px] top-1"></div>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-slate-800">{exp.role}</h3>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-semibold text-slate-600">{exp.company}</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase">{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    projects: resumeData.projects?.length > 0 ? (
      <section key="projects">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-teal-600 mb-4 flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-teal-100 text-teal-600 flex items-center justify-center text-[10px]">❖</span>
          Projects
        </h2>
        <div className="space-y-5">
          {resumeData.projects.map((proj, idx) => (
            <div key={idx} className="relative pl-4 border-l-2 border-slate-100">
              <div className="absolute w-2 h-2 bg-slate-300 rounded-full -left-[5px] top-1"></div>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-slate-800">{proj.name}</h3>
                <span className="text-[10px] font-medium text-teal-500">{proj.link}</span>
              </div>
              <div className="text-[10px] font-medium text-slate-400 mb-1.5">{proj.technologies?.join(' • ')}</div>
              <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line">{proj.description}</p>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    education: resumeData.education?.length > 0 ? (
      <section key="education">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-teal-600 mb-4 flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-teal-100 text-teal-600 flex items-center justify-center text-[10px]">❖</span>
          Education
        </h2>
        <div className="space-y-4">
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="relative pl-4">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-sm font-bold text-slate-800">{edu.degree}</h3>
                <span className="text-[10px] font-medium text-slate-400">{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className="text-[11px] font-medium text-slate-600">{edu.school}</div>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    ...(resumeData.customSections || []).reduce((acc, section) => ({
      ...acc,
      [section.id]: section.items?.length > 0 ? (
        <section key={section.id}>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-teal-600 mb-4 flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-teal-100 text-teal-600 flex items-center justify-center text-[10px]">❖</span>
            {section.title}
          </h2>
          <div className="space-y-5">
            {section.items.map((item, idx) => (
              <div key={idx} className="relative pl-4 border-l-2 border-slate-100">
                <div className="absolute w-2 h-2 bg-slate-300 rounded-full -left-[5px] top-1"></div>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">{item.date}</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 italic mb-1.5">{item.subtitle}</div>
                {item.description && <p className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ) : null
    }), {})
  };

  const orderedSidebarSections = sectionOrder.map((sectionKey) => sidebarSections[sectionKey]).filter(Boolean);
  const orderedContentSections = sectionOrder.map((sectionKey) => contentSections[sectionKey]).filter(Boolean);

  return (
    <div className="flex bg-white text-slate-800" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
      
      {/* Left Sidebar */}
      <div className="w-[35%] bg-slate-100 p-8 flex flex-col gap-8 border-r border-slate-200">
        
        {/* Name & Contact */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            {resumeData.personalInfo?.fullName || 'Your Name'}
          </h1>
          <div className="w-12 h-1 bg-teal-500 rounded-full"></div>
          
          <div className="space-y-2 text-xs text-slate-600 mt-6">
            {resumeData.personalInfo?.email && <p className="break-all">📧 {resumeData.personalInfo.email}</p>}
            {resumeData.personalInfo?.phone && <p>📱 {resumeData.personalInfo.phone}</p>}
            {resumeData.personalInfo?.location && <p>📍 {resumeData.personalInfo.location}</p>}
            {resumeData.personalInfo?.linkedIn && <p className="break-all pt-2">in/ {resumeData.personalInfo.linkedIn.split('/').pop()}</p>}
            {resumeData.personalInfo?.github && <p className="break-all">git/ {resumeData.personalInfo.github.split('/').pop()}</p>}
            {resumeData.personalInfo?.leetcode && <p className="break-all">lc/ {resumeData.personalInfo.leetcode.split('/').pop()}</p>}
          </div>
        </div>

        {orderedSidebarSections}
      </div>

      {/* Right Content */}
      <div className="w-[65%] p-8 bg-white flex flex-col gap-8">
        {summarySection}
        {orderedContentSections}

      </div>
    </div>
  );
};

export default ModernTemplate;
