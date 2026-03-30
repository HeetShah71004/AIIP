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

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">ATS Analysis</h3>
        <div className="flex flex-col items-end">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}%</span>
          <span className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest">Match Score</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Feedback Section */}
        <div>
          <h4 className="text-sm font-medium text-slate-600 dark:text-white/60 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {feedback && feedback.length > 0 ? (
              feedback.map((item, idx) => (
                <li key={idx} className="text-sm text-slate-700 dark:text-white/80 flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 dark:bg-white/30 shrink-0" />
                  {item}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500 dark:text-white/40 italic">No specific recommendations</li>
            )}
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
