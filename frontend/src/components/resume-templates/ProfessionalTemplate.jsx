import React from 'react';

const ProfessionalTemplate = ({ resumeData }) => {
  return (
    <div className="bg-white text-slate-800 flex flex-col" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
      
      {/* Dark Header Banner */}
      <header className="bg-slate-900 text-white px-10 py-8 text-center flex flex-col items-center">
        <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-3">
          {resumeData.personalInfo?.fullName || 'Your Name'}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-300 font-medium">
          {resumeData.personalInfo?.email && <span>{resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo?.phone && <span>{resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo?.location && <span>{resumeData.personalInfo.location}</span>}
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] text-teal-400 mt-3 font-semibold tracking-wider">
          {resumeData.personalInfo?.linkedIn && <span>{resumeData.personalInfo.linkedIn.replace('https://www.', '')}</span>}
          {resumeData.personalInfo?.github && <span>{resumeData.personalInfo.github.replace('https://', '')}</span>}
          {resumeData.personalInfo?.leetcode && <span>{resumeData.personalInfo.leetcode.replace('https://', '')}</span>}
        </div>
      </header>

      {/* Main Body */}
      <main className="p-10 space-y-7 flex-1">
        
        {/* Summary */}
        {resumeData.summary && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b-2 border-teal-500 pb-2 mb-3">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">{resumeData.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resumeData.experience?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b-2 border-teal-500 pb-2 mb-4">
              Professional Experience
            </h2>
            <div className="space-y-6">
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-bold text-slate-800">{exp.role}</h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <div className="text-[12px] font-bold text-teal-600 mb-2">{exp.company}</div>
                  <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line pl-2 border-l-2 border-slate-200">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resumeData.projects?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b-2 border-teal-500 pb-2 mb-4">
              Key Projects
            </h2>
            <div className="space-y-5">
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-bold text-slate-800">{proj.name}</h3>
                    <span className="text-[10px] font-semibold text-teal-600">{proj.link}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {proj.technologies?.join(' | ')}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line pl-2 border-l-2 border-slate-200">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-8">
          {/* Skills */}
          {resumeData.skills?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b-2 border-teal-500 pb-2 mb-3">
                Core Competencies
              </h2>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-700">
                {resumeData.skills.map((skill, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-sm"></span> {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Education & Languages */}
          <div className="space-y-6">
            {resumeData.education?.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b-2 border-teal-500 pb-2 mb-3">
                  Education
                </h2>
                <div className="space-y-4">
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="relative">
                      <div className="text-[12px] font-bold text-slate-800">{edu.degree}</div>
                      <div className="text-[11px] font-medium text-slate-600 my-0.5">{edu.school}</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        {edu.startDate} - {edu.endDate}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {resumeData.languages?.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b-2 border-teal-500 pb-2 mb-3">
                  Languages
                </h2>
                <p className="text-[11px] font-semibold text-slate-700">
                  {resumeData.languages.join(' • ')}
                </p>
              </section>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default ProfessionalTemplate;
