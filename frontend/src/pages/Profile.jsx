import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Calendar, LogOut, Zap, Trophy, Target,
  Star, Flame, TrendingUp, BookOpen, ChevronRight, Award,
  GitFork, Link2, MapPin, FileText, ExternalLink, UsersRound,
  ArrowLeft, X, Download, Eye
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
import toast from 'react-hot-toast';

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
const buildGrid = (sessions) => {
  const counts = {};
  sessions.forEach(s => {
    const key = new Date(s.completedAt || s.createdAt).toISOString().split('T')[0];
    counts[key] = (counts[key] || 0) + 1;
  });

  const today = new Date();
  const currentYear = today.getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const grid = [];
  for (let w = 0; w < 53; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const key = date.toISOString().split('T')[0];
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
  const location = useLocation();
  const candidateIdFromState = location.state?.candidateId;

  const [viewedUser, setViewedUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [savedResume, setSavedResume] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const resumeRef = React.useRef(null);

  const isViewingCandidate = Boolean(candidateIdFromState && candidateIdFromState !== user?.id);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        // Define user IDs for queries
        const queryUserId = candidateIdFromState || user?.id;

        // 1. Fetch user profile if viewing another user
        if (isViewingCandidate) {
          try {
            const userRes = await api.get(`/auth/user/${candidateIdFromState}`);
            setViewedUser(userRes.data.data);
          } catch (err) {
            console.error('Error fetching candidate profile:', err);
            toast.error('Could not fetch candidate details');
            navigate('/recruiter-dashboard');
            return;
          }
        } else {
          setViewedUser(user);
        }

        // 2. Fetch stats and resume
        const [sumRes, gapRes, resumeRes] = await Promise.all([
          api.get(`/analytics/summary?limit=100${isViewingCandidate ? `&userId=${candidateIdFromState}` : ''}`),
          api.get(`/analytics/skill-gap${isViewingCandidate ? `?userId=${candidateIdFromState}` : ''}`),
          api.get(`/resume${isViewingCandidate ? `?candidateId=${candidateIdFromState}` : ''}`)
        ]);

        setStats(sumRes.data.data);
        setSessions(sumRes.data.data.sessionHistory || []);
        setSkillGaps(gapRes.data.data.skillGaps || []);
        setSavedResume(resumeRes.data.data);

      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user || candidateIdFromState) {
        fetchAll();
    }
  }, [user, candidateIdFromState]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const exportPDF = async () => {
    if (!resumeRef.current) return;
    try {
      toast.loading('Generating PDF...', { id: 'pdf-toast' });
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.35,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.82);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pgHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      let heightLeft = imgHeight - pgHeight;
      let position = -pgHeight;
      while (heightLeft > 2) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pgHeight;
        position -= pgHeight;
      }
      pdf.save(`${savedResume.personalInfo?.fullName || 'Resume'}.pdf`);
      toast.success('Resume downloaded!', { id: 'pdf-toast' });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-toast' });
    }
  };

  const renderSelectedTemplate = (data) => {
    if (!data) return null;
    const template = data.selectedTemplate || 'classic';
    const props = { resumeData: data, sectionOrder: data.previewSectionOrder };
    
    switch (template) {
      case 'modern': return <ModernTemplate {...props} />;
      case 'professional': return <ProfessionalTemplate {...props} />;
      case 'creative': return <CreativeTemplate {...props} />;
      case 'elegant': return <ElegantTemplate {...props} />;
      case 'midnight': return <MidnightTemplate {...props} />;
      default: return <ClassicTemplate {...props} />;
    }
  };

  if (loading) return <LoadingSpinner fullPage message={isViewingCandidate ? "Loading candidate profile..." : "Loading your profile..."} />;
  if (!viewedUser) return null;

  const xp         = computeXP(stats);
  const level      = computeLevel(xp);
  const pct        = computePct(xp);
  const xpInLevel  = xp % XP_PER_LEVEL;
  const badges     = buildBadges(stats);
  const grid       = buildGrid(sessions);
  const monthLabels = getMonthLabels(grid);
  const totalContribs = sessions.length;
  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const getTimeSpanText = () => {
    if (sessions.length === 0) return "yet";
    const dates = sessions.map(s => new Date(s.completedAt || s.createdAt).getTime());
    const minDate = new Date(Math.min(...dates));
    const today = new Date();
    const diffDays = Math.ceil((today - minDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) return "in the last year";
    const currentYear = today.getFullYear();
    const firstYear = minDate.getFullYear();
    if (currentYear === firstYear && diffDays > 30) return `in ${currentYear}`;
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
    <div className="min-h-screen bg-background font-['Outfit'] dark:text-zinc-100 animate-in fade-in duration-500">
      
      {/* Top Banner for Recruiter View */}
      {isViewingCandidate && (
        <div className="bg-teal-600 text-white py-2 px-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/10 gap-2"
                onClick={() => navigate('/recruiter-dashboard')}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            <span className="text-sm font-medium">Viewing Candidate Profile</span>
          </div>
          <Badge variant="outline" className="text-white border-white/40">Recruiter Mode</Badge>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ════ LEFT SIDEBAR ════ */}
          <aside className="w-full lg:w-[296px] shrink-0 space-y-4">

            {/* Avatar + Name */}
            <div className="space-y-3">
              <Avatar className="h-[230px] w-[230px] rounded-full border-2 border-border dark:border-zinc-800 shadow-lg ring-4 ring-background dark:ring-zinc-900 mx-auto lg:mx-0">
                <AvatarImage src={viewedUser.avatar} alt={viewedUser.name} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-7xl rounded-full bg-muted dark:bg-zinc-800 dark:text-zinc-100 font-bold text-teal-600">
                  {viewedUser.name?.charAt(0).toUpperCase() || <User size={60} />}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight leading-tight dark:text-zinc-50">{viewedUser.name}</h1>
                  {viewedUser.role === 'recruiter' && (
                    <Badge className="bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase px-2 py-0">Recruiter</Badge>
                  )}
                  {isViewingCandidate && (
                    <Badge variant="outline" className="text-teal-600 border-teal-600/20 bg-teal-50">Candidate</Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground dark:text-zinc-400 font-light leading-none">
                  {viewedUser.name?.toLowerCase().replace(/\s+/g, '')}
                </p>
              </div>

              {/* Level pill (Only for candidates or viewing candidates) */}
              {(viewedUser.role === 'candidate' || isViewingCandidate) && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 dark:bg-zinc-900/60 border border-border/60 dark:border-zinc-800/90">
                  <Zap size={14} className="text-primary fill-primary" />
                  <span className="text-xs font-semibold">Level {level}</span>
                  <div className="flex-1 mx-1">
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  <span className="text-[10px] text-muted-foreground dark:text-zinc-400">{xpInLevel}/{XP_PER_LEVEL}</span>
                </div>
              )}

              {!isViewingCandidate ? (
                <Button variant="outline" className="w-full h-9 text-sm gap-1.5 border-red-500/20 text-red-600 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut size={14} /> Sign out
                </Button>
              ) : (
                <Button 
                    className="w-full h-9 text-sm gap-1.5 bg-teal-600 hover:bg-teal-700" 
                    onClick={() => navigate('/recruiter-dashboard')}
                >
                  <ArrowLeft size={14} /> Back to Dashboard
                </Button>
              )}
            </div>

            <Separator className="bg-border/50" />

            {/* Bio / Meta */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground dark:text-zinc-400">
                <Mail size={16} className="shrink-0" />
                <span className="truncate">{viewedUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground dark:text-zinc-400">
                <Calendar size={16} className="shrink-0" />
                <span>Joined {formatDate(viewedUser.createdAt)}</span>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Stats summary (For candidate view) */}
            {(viewedUser.role === 'candidate' || isViewingCandidate) && stats && (
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

            {/* Recruiter specific cards (Only if viewing self as recruiter) */}
            {viewedUser.role === 'recruiter' && !isViewingCandidate && (
              <div className="space-y-4">
                 <p className="text-xs font-semibold text-muted-foreground dark:text-zinc-400 uppercase tracking-widest mb-3">Account Status</p>
                 <div className="rounded-xl border border-border/50 dark:border-zinc-800 p-4 bg-muted/10">
                    <div className="flex items-center justify-between text-sm mb-2">
                       <span className="text-muted-foreground">Status</span>
                       <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">Active Account</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">Access</span>
                       <span className="font-bold">Enterprise</span>
                    </div>
                 </div>
                 <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => navigate('/recruiter-dashboard')}>Return to Dashboard</Button>
              </div>
            )}

            <Separator className="bg-border/50" />

            {/* Resume Preview */}
            {(viewedUser.role === 'candidate' || isViewingCandidate) && (
              <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground dark:text-zinc-400 uppercase tracking-widest">
                        {isViewingCandidate ? "Candidate Resume" : "Resume Draft"}
                    </p>
                    {!isViewingCandidate && (
                        <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-[10px] font-bold uppercase tracking-widest gap-1 hover:bg-primary/10 hover:text-primary"
                        onClick={() => navigate('/resume-builder')}
                        >
                        Edit <ChevronRight size={10} />
                        </Button>
                    )}
                  </div>

                  {savedResume ? (
                    <div 
                      className="relative rounded-xl border border-border/60 dark:border-zinc-800/90 bg-card dark:bg-[#0d1117] overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all"
                      onClick={() => setIsPreviewOpen(true)}
                    >
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
                            {renderSelectedTemplate(savedResume)}
                          </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all flex items-end justify-between">
                          <div className="min-w-0">
                              <p className="text-[10px] font-bold text-white uppercase tracking-tighter truncate">{savedResume.selectedTemplate || 'Classic'} Theme</p>
                              <p className="text-[9px] text-white/50 truncate">Saved {formatDate(savedResume.updatedAt)}</p>
                          </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/50 dark:border-zinc-800/90 p-8 text-center space-y-3 bg-muted/20">
                      <div className="w-10 h-10 bg-muted dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-muted-foreground opacity-50">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">No resume found</p>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </aside>

          {/* ════ MAIN CONTENT ════ */}
          <main className="flex-1 min-w-0 space-y-6">
              {(viewedUser.role === 'candidate' || isViewingCandidate) ? (
                <>
                  {/* ── Contribution Graph ── */}
                  <section className="rounded-xl border border-border/60 dark:border-zinc-800/90 bg-card dark:bg-[#0d1117] p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        <span className="font-bold text-teal-600">{totalContribs} interview{totalContribs !== 1 ? 's' : ''}</span>
                        <span className="text-muted-foreground dark:text-zinc-400 font-normal"> {spanText}</span>
                      </p>
                      <Badge variant="secondary" className="text-[10px] gap-1 bg-orange-50 text-orange-600 border-none">
                        <Flame size={10} className="fill-orange-600" />
                        {stats?.streak || 0} day streak
                      </Badge>
                    </div>

                    <div className="overflow-x-auto pb-2 scrollbar-hide">
                      <div className="min-w-max">
                        <div className="flex pl-8 mb-2">
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
                          <div className="flex flex-col gap-0.5 mr-2">
                            {DAY_LABELS.map((d, i) => (
                              <div key={i} className="h-[11px] text-[9px] text-muted-foreground dark:text-zinc-500 leading-none flex items-center justify-end w-6">
                                {d}
                              </div>
                            ))}
                          </div>
                          {grid.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-0.5">
                              {week.map((cell, di) => (
                                <div
                                  key={di}
                                  title={`${cell.date}${cell.count ? ` — ${cell.count} session${cell.count > 1 ? 's' : ''}` : ''}`}
                                  className={`h-[11px] w-[11px] rounded-[2px] transition-all duration-300 hover:scale-125 cursor-default ${cellColor(cell.count)}`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-4 pr-1">
                          <span className="text-[10px] text-muted-foreground dark:text-zinc-400">Quiet</span>
                          {[0, 1, 2, 3].map(c => (
                            <div key={c} className={`h-[10px] w-[10px] rounded-[2px] ${cellColor(c)}`} />
                          ))}
                          <span className="text-[10px] text-muted-foreground dark:text-zinc-400">Busy</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ── Achievements ── */}
                  <section className="space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-muted-foreground">
                      <Award size={16} className="text-teal-600" />
                      Achievements
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold ml-1">
                        {badges.filter(b => b.earned).length}/{badges.length}
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {badges.map(b => (
                        <div
                          key={b.id}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                            b.earned
                              ? 'border-border/60 bg-card shadow-sm hover:shadow-md hover:border-teal-500/30'
                              : 'border-border/25 bg-muted/10 opacity-40 grayscale'
                          }`}
                        >
                          <div className={`p-2.5 rounded-2xl shrink-0 ${b.earned ? `${b.bg} ${b.color}` : 'bg-muted text-muted-foreground'}`}>
                            {b.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{b.label}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{b.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ── Skill Gap ── */}
                  <section className="space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-muted-foreground">
                      <BookOpen size={16} className="text-teal-600" />
                      Areas for Improvement
                    </h2>

                    {skillGaps.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-border/50 p-10 text-center text-muted-foreground text-sm bg-muted/5">
                        No skill insights available yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {skillGaps.map((gap, i) => {
                          const c = sc(gap.strengthPct);
                          return (
                            <div key={gap.category} className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold ring-1 ${c.ring} ${c.text} bg-white shadow-sm`}>{i + 1}</span>
                                  <div>
                                    <p className="font-bold text-sm">{gap.category}</p>
                                    <p className="text-[11px] text-muted-foreground">{gap.count} questions analyzed</p>
                                  </div>
                                </div>
                                <span className={`text-base font-bold ${c.text}`}>{gap.avgScore}<span className="text-xs text-muted-foreground font-normal">/10</span></span>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className={c.text}>{gap.strengthPct}% Proficiency</span>
                                  <span className="text-muted-foreground">Gap: {gap.gap.toFixed(1)}</span>
                                </div>
                                <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${c.bar} transition-all duration-1000 ease-out`} style={{ width: `${gap.strengthPct}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                   <section className="rounded-2xl border border-border/60 bg-card p-8 space-y-6 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-teal-50 text-teal-600 shadow-sm">
                          <UsersRound size={28} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black tracking-tight">Recruiter Dashboard</h2>
                          <p className="text-sm text-muted-foreground font-medium">Enterprise Recruiting Access</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-2 group hover:bg-white hover:shadow-md transition-all">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-teal-600">Account Type</p>
                           <p className="text-base font-bold">Organization Admin</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 space-y-2 group hover:bg-white hover:shadow-md transition-all">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-teal-600">Active Postings</p>
                           <p className="text-base font-bold">Unlimited License</p>
                        </div>
                     </div>

                     <div className="p-10 rounded-3xl border-2 border-dashed border-teal-600/20 text-center space-y-5 bg-teal-50/10">
                        <div className="p-5 rounded-full bg-teal-50 text-teal-600 w-fit mx-auto shadow-inner">
                           <TrendingUp size={28} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-black">Ready to scale your hiring?</h3>
                          <p className="text-sm text-muted-foreground max-w-[320px] mx-auto leading-relaxed">Access candidate screening, AI performance metrics, and automated scheduling from your control center.</p>
                        </div>
                        <Button onClick={() => navigate('/recruiter-dashboard')} className="rounded-2xl h-12 px-8 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-500/20 font-bold transition-all hover:scale-105 active:scale-95">
                            Launch Recruiter Dashboard
                        </Button>
                     </div>
                   </section>

                   <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        Account Verification
                      </h3>
                      <div className="flex items-center gap-4 p-5 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                        <div className="h-12 w-12 rounded-2xl bg-green-500 border border-green-400 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                          <Award size={24} />
                        </div>
                        <div>
                           <p className="text-base font-bold">Verified Professional</p>
                           <p className="text-xs text-muted-foreground">Your recruiter credentials have been successfully verified by the Interv AI platform.</p>
                        </div>
                      </div>
                   </section>
                </div>
              )}
          </main>
        </div>
      </div>

      {/* Live Resume Preview Modal */}
      {isPreviewOpen && savedResume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-100 dark:bg-[#0a0a0a] w-full max-w-5xl h-full md:h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Eye className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {isViewingCandidate ? "Candidate Resume Preview" : "Resume Draft Preview"}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-slate-900 dark:text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                {!isViewingCandidate && (
                  <button
                    onClick={() => navigate('/resume-builder')}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white font-semibold text-sm hover:bg-slate-50 transition-all"
                  >
                    Edit in Builder
                  </button>
                )}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:bg-rose-500/20 bg-slate-100 dark:bg-white/5 rounded-full transition-all hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scaled A4 Container */}
            <div className="flex-1 overflow-auto p-4 md:p-12 flex justify-center bg-slate-200/50 dark:bg-black/50 scrollbar-hide">
              <div className="shadow-2xl ring-1 ring-slate-900/5 bg-white origin-top" style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.9)', transformOrigin: 'top center', marginBottom: '-10%' }}>
                {renderSelectedTemplate(savedResume)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Preview Area for PDF Export */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={resumeRef}>
          {renderSelectedTemplate(savedResume)}
        </div>
      </div>
    </div>
  );
};

export default Profile;
