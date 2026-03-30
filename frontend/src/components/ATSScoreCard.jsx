import React from 'react';
import { CheckCircle, AlertCircle, Search } from 'lucide-react';

const ATSScoreCard = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-slate-100 dark:bg-white/10 rounded w-1/4 mb-4"></div>
        <div className="h-12 bg-slate-100 dark:bg-white/10 rounded-full w-24 mb-6"></div>
        <div className="space-y-3">
          <div className="h-3 bg-slate-100 dark:bg-white/10 rounded w-full"></div>
          <div className="h-3 bg-slate-100 dark:bg-white/10 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-500 dark:text-white/40">Complete your resume to see your ATS score</p>
      </div>
    );
  }

  const { score, feedback, missingKeywords } = analysis;
  const ringRadius = 30;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (Math.max(0, Math.min(100, score)) / 100) * ringCircumference;

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const recommendationItems = (feedback && feedback.length > 0)
    ? feedback.map((item) => ({
      text: item,
      tone: /great|good|strong|excellent|well|solid|present|clear|optimized/i.test(item) ? 'good' : 'fix'
    }))
    : [
      {
        text: score >= 80
          ? 'Strong ATS alignment detected. Keep this structure and keyword balance.'
          : 'Add measurable impact and role-specific phrasing to improve ATS confidence.',
        tone: score >= 80 ? 'good' : 'fix'
      },
      {
        text: missingKeywords?.length
          ? `Consider weaving these keywords naturally: ${missingKeywords.slice(0, 4).join(', ')}.`
          : 'Keyword coverage looks healthy for this draft.',
        tone: missingKeywords?.length ? 'fix' : 'good'
      }
    ];

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">ATS Analysis</h3>
        <div className="relative w-[74px] h-[74px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
            <circle cx="36" cy="36" r={ringRadius} className="fill-none stroke-slate-200 dark:stroke-white/10" strokeWidth="7" />
            <circle
              cx="36"
              cy="36"
              r={ringRadius}
              className="fill-none stroke-emerald-500"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-bold leading-none ${getScoreColor(score)}`}>{score}%</span>
            <span className="text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-widest mt-0.5">Match</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Feedback Section */}
        <div>
          <h4 className="text-sm font-medium text-slate-600 dark:text-white/60 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-500" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {recommendationItems.map((item, idx) => (
              <li key={idx} className="text-sm text-slate-700 dark:text-white/80 flex items-start gap-2.5">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    item.tone === 'good' ? 'bg-emerald-500/80' : 'bg-amber-500/85'
                  }`}
                />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Keywords Section */}
        {missingKeywords && missingKeywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-600 dark:text-white/60 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              Missing Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-md text-xs text-slate-600 dark:text-white/70"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
        <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wider text-center">
          AI-Powered Insights by Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
};

export default ATSScoreCard;
