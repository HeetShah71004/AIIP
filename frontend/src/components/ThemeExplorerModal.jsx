import React, { useEffect, useMemo, useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { fetchThemeCatalog } from '../api/resumeApi';

const ThemeExplorerModal = ({ isOpen, onClose, selectedTheme, onApplyTheme }) => {
  const [catalog, setCatalog] = useState({ featuredThemes: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const data = await fetchThemeCatalog({ page: 1, limit: 100 });
        if (!cancelled) {
          const featured = Array.isArray(data?.featuredThemes) ? data.featuredThemes : [];
          setCatalog({
            featuredThemes: featured,
            total: featured.length
          });
        }
      } catch {
        if (!cancelled) {
          setCatalog({ featuredThemes: [], total: 0 });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const featured = useMemo(() => catalog.featuredThemes || [], [catalog]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/70 backdrop-blur-sm p-4 md:p-8 flex items-start md:items-center justify-center">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200/20 bg-white dark:bg-[#0c1117] shadow-2xl flex flex-col">
        <div className="px-6 md:px-8 py-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/50 font-semibold">Featured Themes</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Theme Explorer</h3>
              <p className="text-sm text-slate-600 dark:text-white/60 mt-1">Only featured templates are available.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/70 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">Available Templates</h4>
            </div>
            <span className="text-xs text-slate-500 dark:text-white/40">{catalog.total || 0} themes</span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-slate-500 dark:text-white/50">Loading featured themes...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {featured.map((theme) => (
                <ThemeCard
                  key={theme.slug}
                  theme={theme}
                  selectedTheme={selectedTheme}
                  onApplyTheme={onApplyTheme}
                />
              ))}
              {featured.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-white/40">No featured themes configured.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ThemeCard = ({ theme, selectedTheme, onApplyTheme }) => {
  const isSelected = selectedTheme === theme.slug;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h5 className="text-base font-semibold text-slate-900 dark:text-white">{theme.name}</h5>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{theme.slug}</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          Featured
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-white/60 min-h-[60px]">{theme.description}</p>

      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={() => onApplyTheme(theme)}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isSelected
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90'
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            {isSelected && <Check className="w-4 h-4" />}
            {isSelected ? 'Applied' : 'Apply Theme'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ThemeExplorerModal;
