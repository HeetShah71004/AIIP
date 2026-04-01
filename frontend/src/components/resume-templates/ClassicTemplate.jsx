import React from 'react';

const DEFAULT_SECTION_ORDER = ['experience', 'projects', 'education', 'skills', 'languages'];

const ClassicTemplate = ({ resumeData, sectionOrder = DEFAULT_SECTION_ORDER }) => {
  const summarySection = resumeData.summary ? (
    <section>
      <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-2 text-slate-900">Professional Summary</h2>
      <p className="text-xs leading-relaxed text-slate-700">{resumeData.summary}</p>
    </section>
  ) : null;

  const sections = {
    experience: resumeData.experience?.length > 0 ? (
      <section key="experience">
        <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 text-slate-900">Experience</h2>
        <div className="space-y-6">
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="relative">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-slate-800">{exp.role}</h3>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">{exp.startDate} - {exp.endDate}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-600 mb-2 italic">{exp.company}</div>
              <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    projects: resumeData.projects?.length > 0 ? (
      <section key="projects">
        <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 text-slate-900">Projects</h2>
        <div className="space-y-4">
          {resumeData.projects.map((proj, idx) => (
            <div key={idx} className="relative">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-slate-800">{proj.name}</h3>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">{proj.link}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-600 italic mb-1">{proj.technologies?.join(', ')}</div>
              <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">{proj.description}</p>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    education: resumeData.education?.length > 0 ? (
      <section key="education">
        <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 text-slate-900">Education</h2>
        <div className="space-y-4">
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="relative">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-bold text-slate-800">{edu.degree}</h3>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-600 italic">{edu.school}</div>
            </div>
          ))}
        </div>
      </section>
    ) : null,
    skills: resumeData.skills?.length > 0 ? (
      <section key="skills">
        <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-2 text-slate-900">Skills</h2>
        <p className="text-[11px] text-slate-700 leading-relaxed">
          {resumeData.skills.join(' • ')}
        </p>
      </section>
    ) : null,
    languages: resumeData.languages?.length > 0 ? (
      <section key="languages">
        <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-2 text-slate-900">Languages</h2>
        <p className="text-[11px] text-slate-700 leading-relaxed">
          {resumeData.languages.join(' • ')}
        </p>
      </section>
    ) : null,
    ...(resumeData.customSections || []).reduce((acc, section) => ({
      ...acc,
      [section.id]: section.items?.length > 0 ? (
        <section key={section.id}>
          <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 text-slate-900">{section.title}</h2>
          <div className="space-y-4">
            {section.items.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">{item.date}</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 italic mb-1">{item.subtitle}</div>
                {item.description && <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ) : null
    }), {})
  };

  const orderedSections = sectionOrder
    .filter((sectionKey) => Object.prototype.hasOwnProperty.call(sections, sectionKey))
    .map((sectionKey) => sections[sectionKey])
    .filter(Boolean);

  return (
    <div className="p-10 text-slate-800 bg-white" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
      <header className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">{resumeData.personalInfo?.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-600">
          {resumeData.personalInfo?.email && <span>{resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo?.phone && <span>{resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo?.location && <span>{resumeData.personalInfo.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-slate-400 mt-2">
          {resumeData.personalInfo?.linkedIn && <span>{resumeData.personalInfo.linkedIn}</span>}
          {resumeData.personalInfo?.github && <span>{resumeData.personalInfo.github}</span>}
          {resumeData.personalInfo?.leetcode && <span>{resumeData.personalInfo.leetcode}</span>}
        </div>
      </header>

      <main className="space-y-8">
        {summarySection}
        {orderedSections}
      </main>
    </div>
  );
};

export default ClassicTemplate;
