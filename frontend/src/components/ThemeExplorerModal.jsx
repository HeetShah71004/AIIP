import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  ScrollText,
  Blocks,
  Briefcase,
  Wand2,
  Gem,
  MoonStar
} from 'lucide-react';
import { fetchThemeCatalog } from '../api/resumeApi';

const THEME_VISUALS = {
  classic: {
    Icon: ScrollText,
    badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300',
    iconWrap: 'bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-300',
    selectedCard: 'border-teal-400/50 bg-teal-500/[0.06]',
    appliedButton: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-emerald-500/25'
  },
  modern: {
    Icon: Blocks,
    badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
    iconWrap: 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300',
    selectedCard: 'border-cyan-400/50 bg-cyan-500/[0.06]',
    appliedButton: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:shadow-cyan-500/25'
  },
  professional: {
    Icon: Briefcase,
    badge: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
    iconWrap: 'bg-slate-500/10 border border-slate-500/30 text-slate-700 dark:text-slate-300',
    selectedCard: 'border-slate-400/50 bg-slate-500/[0.05]',
    appliedButton: 'bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:shadow-slate-500/25'
  },
  creative: {
    Icon: Wand2,
    badge: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    iconWrap: 'bg-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-300',
    selectedCard: 'border-violet-400/50 bg-violet-500/[0.06]',
    appliedButton: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-violet-500/25'
  },
  elegant: {
    Icon: Gem,
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    iconWrap: 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300',
    selectedCard: 'border-rose-400/50 bg-rose-500/[0.06]',
    appliedButton: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-rose-500/25'
  },
  midnight: {
    Icon: MoonStar,
    badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
    iconWrap: 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300',
    selectedCard: 'border-indigo-400/50 bg-indigo-500/[0.08]',
    appliedButton: 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white hover:shadow-indigo-500/30'
  }
};

const DEFAULT_VISUAL = {
  Icon: Sparkles,
  badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  iconWrap: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
  selectedCard: 'border-emerald-400/50 bg-emerald-500/[0.06]',
  appliedButton: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-emerald-500/25'
};

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
              className="p-2 rounded-full bg-white/70 dark:bg-white/10 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:bg-rose-500/20 transition-all hover:rotate-90"
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
  const visual = THEME_VISUALS[theme.slug] || DEFAULT_VISUAL;
  const Icon = visual.Icon;

  return (
    <div
      className={`rounded-2xl border bg-white dark:bg-white/5 p-4 flex flex-col gap-3 transition-all ${
        isSelected
          ? `${visual.selectedCard} shadow-lg`
          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${visual.iconWrap}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
          <h5 className="text-base font-semibold text-slate-900 dark:text-white">{theme.name}</h5>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{theme.slug}</p>
          </div>
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${visual.badge}`}>
          Featured
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-white/60 min-h-[60px]">{theme.description}</p>

      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={() => onApplyTheme(theme)}
          className={`group flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-lg ${isSelected
            ? visual.appliedButton
            : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:shadow-slate-500/20'
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            {isSelected && <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            {isSelected ? 'Applied' : 'Apply Theme'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ThemeExplorerModal;
