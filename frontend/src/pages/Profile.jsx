import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Calendar, LogOut, Zap, Trophy, Target,
  Star, Flame, TrendingUp, BookOpen, ChevronRight, Award,
  GitFork, Link2, MapPin, FileText, ExternalLink
} from 'lucide-react';

import ClassicTemplate from '../components/resume-templates/ClassicTemplate';
import ModernTemplate from '../components/resume-templates/ModernTemplate';
import ProfessionalTemplate from '../components/resume-templates/ProfessionalTemplate';
import CreativeTemplate from '../components/resume-templates/CreativeTemplate';
import ElegantTemplate from '../components/resume-templates/ElegantTemplate';
import MidnightTemplate from '../components/resume-templates/MidnightTemplate';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── XP / Level ──────────────────────────────────────────────────────────────
const XP_PER_LEVEL = 500;
const computeXP      = (s) => s ? (s.totalSessions || 0) * 100 + (s.totalQuestionsAnswered || 0) * 10 : 0;
const computeLevel   = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
const computePct     = (xp) => ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

// ─── Milestones ───────────────────────────────────────────────────────────────
const buildBadges = (s) => [
  { id: 'first',   icon: <Trophy   size={18} />, label: 'First Interview', desc: 'Complete 1 session',    color: 'text-yellow-500', bg: 'bg-yellow-500/10', earned: (s?.totalSessions || 0) >= 1  },
  { id: 'five',    icon: <Star     size={18} />, label: 'Veteran',         desc: 'Complete 5 sessions',   color: 'text-purple-500', bg: 'bg-purple-500/10', earned: (s?.totalSessions || 0) >= 5  },
  { id: 'ten',     icon: <Award    size={18} />, label: 'Expert',          desc: 'Complete 10 sessions',  color: 'text-blue-500',   bg: 'bg-blue-500/10',   earned: (s?.totalSessions || 0) >= 10 },
  { id: 'streak',  icon: <Flame    size={18} />, label: 'On Fire',         desc: '7-day streak',          color: 'text-orange-500', bg: 'bg-orange-500/10', earned: (s?.streak || 0) >= 7         },
  { id: 'score',   icon: <TrendingUp size={18}/>,label: 'Top Scorer',      desc: 'Score 90%+ in a session',color:'text-green-500', bg: 'bg-green-500/10',  earned: (s?.highestScore || 0) >= 9   },
  { id: 'q50',     icon: <Target   size={18} />, label: 'Q Crusher',       desc: 'Answer 50 questions',   color: 'text-rose-500',   bg: 'bg-rose-500/10',   earned: (s?.totalQuestionsAnswered || 0) >= 50 },
];

// ─── Heatmap ──────────────────────────────────────────────────────────────────
const WEEKS = 53;
const buildGrid = (sessions) => {
  const counts = {};
  sessions.forEach(s => {
    const key = new Date(s.completedAt || s.createdAt).toISOString().split('T')[0];
    counts[key] = (counts[key] || 0) + 1;
  });

  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Start from Jan 1st of the current year
  const startDate = new Date(currentYear, 0, 1);
  // Align start to the first Sunday of the year or just start at Jan 1st
  // To keep it consistent with the week-based grid, let's align to the previous Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const grid = [];
  // For a full year, we need approx 53 weeks
  for (let w = 0; w < 53; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const key = date.toISOString().split('T')[0];
      // Only include if it's within the current year or slightly outside for padding
      week.push({ date: key, count: counts[key] || 0 });
    }
    grid.push(week);
  }
  return grid;
};

const cellColor = (count) => {
  if (count === 0) return 'bg-muted/40 border border-border/30';
  if (count === 1) return 'bg-primary/30';
  if (count === 2) return 'bg-primary/55';
  if (count >= 3)  return 'bg-primary shadow-sm shadow-primary/30';
  return 'bg-primary';
};

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS   = ['','Mon','','Wed','','Fri',''];

const getMonthLabels = (grid) => {
  const labels = [];
  let lastMonth = -1;
  const currentYear = new Date().getFullYear();
  grid.forEach((week, wi) => {
    const date = new Date(week[0].date);
    const monthOfFirstDay = date.getMonth();
    if (monthOfFirstDay !== lastMonth && date.getFullYear() === currentYear) {
      labels.push({ wi, label: MONTH_LABELS[monthOfFirstDay] });
      lastMonth = monthOfFirstDay;
    }
  });
  return labels;
};

// ─── Skill strength colour ────────────────────────────────────────────────────
const sc = (pct) =>
  pct >= 70 ? { bar: 'bg-green-500',  text: 'text-green-600',  ring: 'ring-green-500/30'  } :
  pct >= 40 ? { bar: 'bg-amber-500',  text: 'text-amber-600',  ring: 'ring-amber-500/30'  } :
              { bar: 'bg-red-500',    text: 'text-red-600',    ring: 'ring-red-500/30'    };

// ─── Component ────────────────────────────────────────────────────────────────
const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [savedResume, setSavedResume] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sumRes, gapRes, resumeRes] = await Promise.all([
          api.get('/analytics/summary?limit=100'),
          api.get('/analytics/skill-gap'),
          api.get('/resume')
        ]);
        setStats(sumRes.data.data);
        setSessions(sumRes.data.data.sessionHistory || []);
        setSkillGaps(gapRes.data.data.skillGaps || []);
        setSavedResume(resumeRes.data.data);
      } catch { /* fail silently */ }
      finally  { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;
  if (loading) return <LoadingSpinner fullPage message="Loading your profile..." />;

  const xp         = computeXP(stats);
  const level      = computeLevel(xp);
  const pct        = computePct(xp);
  const xpInLevel  = xp % XP_PER_LEVEL;
  const badges     = buildBadges(stats);
  const grid       = buildGrid(sessions);
  const monthLabels = getMonthLabels(grid);
  const totalContribs = sessions.length;
  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  // Calculate dynamic span text
  const getTimeSpanText = () => {
    if (sessions.length === 0) return "yet";
    
    const dates = sessions.map(s => new Date(s.completedAt || s.createdAt).getTime());
    const minDate = new Date(Math.min(...dates));
    const today = new Date();
    
    // Difference in days
    const diffDays = Math.ceil((today - minDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) return "in the last year";
    
    const currentYear = today.getFullYear();
    const firstYear = minDate.getFullYear();
    if (currentYear === firstYear && diffDays > 30) {
        return `in ${currentYear}`;
    }
    
    if (diffDays > 30) {
        const months = Math.ceil(diffDays / 30);
        return `in the last ${months} month${months > 1 ? 's' : ''}`;
    }
    
    if (diffDays > 7) {
        const weeks = Math.ceil(diffDays / 7);
        return `in the last ${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    
    return "recently";
  };

  const spanText = getTimeSpanText();

  return (
    <div className="min-h-screen bg-background font-['Outfit'] dark:text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ════ LEFT SIDEBAR ════ */}
          <aside className="w-full lg:w-[296px] shrink-0 space-y-4">

            {/* Avatar + Name */}
            <div className="space-y-3">
              <Avatar className="h-[230px] w-[230px] rounded-full border-2 border-border dark:border-zinc-800 shadow-lg ring-4 ring-background dark:ring-zinc-900 mx-auto lg:mx-0">
                <AvatarImage src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-7xl rounded-full bg-muted dark:bg-zinc-800 dark:text-zinc-100">
                  {user.name?.charAt(0).toUpperCase() || <User size={60} />}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-0.5">
                <h1 className="text-2xl font-bold tracking-tight leading-tight dark:text-zinc-50">{user.name}</h1>
                <p className="text-lg text-muted-foreground dark:text-zinc-400 font-light leading-none">
                  {user.name?.toLowerCase().replace(/\s+/g, '')}
                </p>
              </div>

              {/* Level pill */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 dark:bg-zinc-900/60 border border-border/60 dark:border-zinc-800/90">
                <Zap size={14} className="text-primary" />
                <span className="text-xs font-semibold">Level {level}</span>
                <div className="flex-1 mx-1">
                  <Progress value={pct} className="h-1.5" />
                </div>
                <span className="text-[10px] text-muted-foreground dark:text-zinc-400">{xpInLevel}/{XP_PER_LEVEL}</span>
              </div>

              <Button variant="outline" className="w-full h-9 text-sm gap-1.5" onClick={handleLogout}>
                <LogOut size={14} /> Sign out
              </Button>
            </div>

            <Separator className="bg-border/50" />

            {/* Bio / Meta */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground dark:text-zinc-400">
                <Mail size={16} className="shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground dark:text-zinc-400">
                <Calendar size={16} className="shrink-0" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Stats summary */}
            {stats && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground dark:text-zinc-400 uppercase tracking-widest mb-3">Overview</p>
                {[
                  { label: 'Sessions completed', value: stats.totalSessions || 0, icon: <Trophy size={14} className="text-primary" /> },
                  { label: 'Avg score',           value: `${((stats.avgOverallScore || 0) * 10).toFixed(0)}%`, icon: <TrendingUp size={14} className="text-green-500" /> },
                  { label: 'Best score',           value: `${((stats.highestScore || 0) * 10).toFixed(0)}%`, icon: <Star size={14} className="text-yellow-500" /> },
                  { label: 'Current streak',       value: `${stats.streak || 0} days`, icon: <Flame size={14} className="text-orange-500" /> },
                  { label: 'Questions answered',   value: stats.totalQuestionsAnswered || 0, icon: <Target size={14} className="text-blue-500" /> },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground dark:text-zinc-400">{item.icon}{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            <Separator className="bg-border/50" />

            <Separator className="bg-border/50" />

            {/* Resume Preview Sidebar Sidebar */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground dark:text-zinc-400 uppercase tracking-widest">Resume Draft</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[10px] font-bold uppercase tracking-widest gap-1 hover:bg-primary/10 hover:text-primary"
                    onClick={() => navigate('/resume-builder')}
                  >
                    Edit <ChevronRight size={10} />
                  </Button>
                </div>

                {savedResume ? (
                  <div 
                    className="relative rounded-xl border border-border/60 dark:border-zinc-800/90 bg-card dark:bg-[#0d1117] overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all"
                    onClick={() => navigate('/resume-builder')}
                  >
                     {/* Mini Preview Wrapper */}
                     <div className="h-[200px] w-full overflow-hidden flex justify-center bg-zinc-50 dark:bg-black/40 p-3 pt-6">
                        <div 
                          className="bg-white origin-top shadow-2xl transition-transform duration-500 group-hover:scale-[0.27]" 
                          style={{ 
                            width: '210mm', 
                            minHeight: '297mm', 
                            transform: 'scale(0.25)', 
                            transformOrigin: 'top center' 
                          }}
                        >
                          {savedResume.selectedTemplate === 'classic' && <ClassicTemplate resumeData={savedResume} />}
                          {(!savedResume.selectedTemplate || savedResume.selectedTemplate === 'modern') && <ModernTemplate resumeData={savedResume} />}
                          {savedResume.selectedTemplate === 'professional' && <ProfessionalTemplate resumeData={savedResume} />}
                          {savedResume.selectedTemplate === 'creative' && <CreativeTemplate resumeData={savedResume} />}
                          {savedResume.selectedTemplate === 'elegant' && <ElegantTemplate resumeData={savedResume} />}
                          {savedResume.selectedTemplate === 'midnight' && <MidnightTemplate resumeData={savedResume} />}
                        </div>
                     </div>
                     
                     {/* Overlay info */}
                     <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all flex items-end justify-between">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-white uppercase tracking-tighter truncate">{savedResume.selectedTemplate || 'Classic'} Theme</p>
                            <p className="text-[9px] text-white/50 truncate">Saved {formatDate(savedResume.updatedAt)}</p>
                        </div>
                        <div className="p-1.5 bg-primary rounded-full text-white shadow-lg">
                            <ExternalLink size={12} />
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/50 dark:border-zinc-800/90 p-6 text-center space-y-3">
                    <div className="w-10 h-10 bg-muted dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-muted-foreground opacity-50">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">No draft</p>
                      <p className="text-[10px] text-muted-foreground">Build your resume now.</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-[10px]" onClick={() => navigate('/resume-builder')}>Start</Button>
                  </div>
                )}
            </div>
          </aside>

          {/* ════ MAIN CONTENT ════ */}
          <main className="flex-1 min-w-0 space-y-6">
              <>
                {/* ── Contribution Graph (GitHub-style) ── */}
                <section className="rounded-lg border border-border/60 dark:border-zinc-800/90 bg-card dark:bg-[#0d1117] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      <span className="font-bold">{totalContribs} interview{totalContribs !== 1 ? 's' : ''}</span>
                      <span className="text-muted-foreground dark:text-zinc-400 font-normal"> {spanText}</span>
                    </p>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Flame size={10} className="text-orange-500" />
                      {stats?.streak || 0} day streak
                    </Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-max">
                      {/* Month labels row */}
                      <div className="flex pl-8 mb-1">
                        {(() => {
                          const items = [];
                          let lastWi = 0;
                          monthLabels.forEach(({ wi, label }) => {
                            const gap = wi - lastWi;
                            if (gap > 0) items.push(<div key={`g-${wi}`} style={{ width: gap * 14 }} />);
                            items.push(
                              <span key={`m-${wi}`} className="text-[10px] text-muted-foreground dark:text-zinc-500 font-medium" style={{ width: 28 }}>
                                {label}
                              </span>
                            );
                            lastWi = wi + 2;
                          });
                          return items;
                        })()}
                      </div>

                      <div className="flex gap-0.5">
                        {/* Day labels */}
                        <div className="flex flex-col gap-0.5 mr-1.5">
                          {DAY_LABELS.map((d, i) => (
                            <div key={i} className="h-[11px] text-[9px] text-muted-foreground dark:text-zinc-500 leading-none flex items-center justify-end w-6">
                              {d}
                            </div>
                          ))}
                        </div>

                        {/* Grid */}
                        {grid.map((week, wi) => (
                          <div key={wi} className="flex flex-col gap-0.5">
                            {week.map((cell, di) => (
                              <div
                                key={di}
                                title={`${cell.date}${cell.count ? ` — ${cell.count} session${cell.count > 1 ? 's' : ''}` : ''}`}
                                className={`h-[11px] w-[11px] rounded-sm transition-all duration-200 hover:ring-2 hover:ring-primary/40 cursor-default ${cellColor(cell.count)}`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-end gap-1.5 mt-2">
                        <span className="text-[10px] text-muted-foreground dark:text-zinc-400">Less</span>
                        {[0, 1, 2, 3].map(c => (
                          <div key={c} className={`h-[11px] w-[11px] rounded-sm ${cellColor(c)}`} />
                        ))}
                        <span className="text-[10px] text-muted-foreground dark:text-zinc-400">More</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Pinned Achievements ── */}
                <section className="space-y-3">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <GitFork size={16} className="text-muted-foreground" />
                    Achievements
                    <span className="text-xs text-muted-foreground dark:text-zinc-400 font-normal">
                      {badges.filter(b => b.earned).length}/{badges.length} earned
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {badges.map(b => (
                      <div
                        key={b.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          b.earned
                            ? 'border-border/60 dark:border-zinc-800/90 bg-card dark:bg-[#0d1117] hover:shadow-md hover:border-border'
                            : 'border-border/25 dark:border-zinc-800 bg-muted/10 dark:bg-zinc-900/30 opacity-40 grayscale'
                        }`}
                      >
                        <div className={`p-2 rounded-full shrink-0 ${b.earned ? `${b.bg} ${b.color}` : 'bg-muted dark:bg-zinc-800 text-muted-foreground dark:text-zinc-400'}`}>
                          {b.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-tight truncate">{b.label}</p>
                          <p className="text-[11px] text-muted-foreground dark:text-zinc-400">{b.desc}</p>
                        </div>
                        {b.earned && (
                          <div className="ml-auto shrink-0">
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow shadow-green-500/50" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── Skill Gap Analysis ── */}
                <section className="space-y-3">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen size={16} className="text-muted-foreground" />
                    Skill Gap Analysis
                    <span className="text-xs text-muted-foreground dark:text-zinc-400 font-normal">Top 3 areas to improve</span>
                  </h2>

                  {skillGaps.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/50 dark:border-zinc-800/90 p-8 text-center text-muted-foreground dark:text-zinc-400 text-sm">
                      Complete sessions using the question bank to see skill insights.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {skillGaps.map((gap, i) => {
                        const c = sc(gap.strengthPct);
                        return (
                          <div key={gap.category} className="rounded-lg border border-border/60 dark:border-zinc-800/90 bg-card dark:bg-[#0d1117] p-4 space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ${c.ring} ${c.text}`}>{i + 1}</span>
                                <div>
                                  <p className="font-semibold text-sm">{gap.category}</p>
                                  <p className="text-[11px] text-muted-foreground dark:text-zinc-400">{gap.count} questions answered</p>
                                </div>
                              </div>
                              <span className={`text-sm font-bold ${c.text}`}>{gap.avgScore}<span className="text-xs text-muted-foreground dark:text-zinc-400 font-normal">/10</span></span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-muted-foreground dark:text-zinc-400">
                                <span>{gap.strengthPct}% strength</span>
                                <span>Gap: {gap.gap.toFixed(1)} pts</span>
                              </div>
                              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${gap.strengthPct}%` }} />
                              </div>
                            </div>

                            {gap.recommendedTopics?.length > 0 && (
                              <div className="space-y-1 pt-0.5">
                                <p className="text-[10px] font-semibold text-muted-foreground dark:text-zinc-400 uppercase tracking-widest">Recommended</p>
                                {gap.recommendedTopics.map(t => (
                                  <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-zinc-400">
                                    <ChevronRight size={10} className="text-primary shrink-0" />{t}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* ── XP Timeline ── */}
                <section className="rounded-lg border border-border/60 dark:border-zinc-800/90 bg-card dark:bg-[#0d1117] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Zap size={14} className="text-primary" /> XP Progress
                    </h2>
                    <span className="text-xs text-muted-foreground dark:text-zinc-400">{xp.toLocaleString()} XP total</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground dark:text-zinc-400">
                      <span className="font-semibold text-foreground dark:text-zinc-100">Level {level}</span>
                      <span>Level {level + 1} — {XP_PER_LEVEL - xpInLevel} XP away</span>
                    </div>
                    <Progress value={pct} className="h-2.5" />
                    <div className="flex justify-between text-[10px] text-muted-foreground dark:text-zinc-400">
                      <span>{xpInLevel} XP</span>
                      <span>{XP_PER_LEVEL} XP</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground dark:text-zinc-400">
                    <span>📋 Completed session <span className="font-semibold text-foreground dark:text-zinc-100">+100 XP</span></span>
                    <span>✅ Answered question <span className="font-semibold text-foreground dark:text-zinc-100">+10 XP</span></span>
                  </div>
                </section>
              </>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
