import React from 'react';

const ClassicTemplate = ({ resumeData }) => {
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
        {resumeData.summary && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-2 text-slate-900">Professional Summary</h2>
            <p className="text-xs leading-relaxed text-slate-700">{resumeData.summary}</p>
          </section>
        )}

        {resumeData.experience?.length > 0 && (
          <section>
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
        )}

        {resumeData.education?.length > 0 && (
          <section>
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
        )}

        {resumeData.projects?.length > 0 && (
          <section>
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
        )}

        {resumeData.skills?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-2 text-slate-900">Skills</h2>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {resumeData.skills.join(' • ')}
            </p>
          </section>
        )}

        {resumeData.languages?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-2 text-slate-900">Languages</h2>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {resumeData.languages.join(' • ')}
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default ClassicTemplate;
