import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trophy, Target, Zap, Play, ChevronRight, Trash2, Building2, Code2, Flame, X, ArrowUpDown, History, Star, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentAd, setCurrentAd] = useState(0);
  const [isAdHidden, setIsAdHidden] = useState(sessionStorage.getItem('ad_dismissed') === 'true');
  const [sortBy, setSortBy] = useState('latest');

  const handleDismissAd = (e) => {
    e.stopPropagation();
    setIsAdHidden(true);
    sessionStorage.setItem('ad_dismissed', 'true');
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Auto-rotate ads every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get(`/analytics/summary?page=${currentPage}&limit=5&sortBy=${sortBy}&t=${Date.now()}`);
      setSessions(res.data.data.sessionHistory);
      setStats(res.data.data);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch sessions');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentPage, sortBy]);

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await api.delete(`/sessions/${sessionToDelete}`);
      setSessionToDelete(null);
      fetchSessions();
    } catch (err) {
      console.error('Failed to delete session');
    }
  };

  const formatJobTitle = (session) => {
    if (session.company) {
      const role = session.roleLevel ? `${session.roleLevel} ` : '';
      const round = session.interviewRound ? `(${session.interviewRound})` : '';
      return `${session.company} - ${role}Interview ${round}`.trim();
    }
    const title = session.parsedData?.developerTitle;
    if (!title) return 'Interview Session';
    let clean = title.replace(/\b(profile|summary|objective|india|i am a|i am an|i am|an experienced|experienced|passionate|dedicated|motivated)\b/gi, '').trim();
    clean = clean.replace(/^[^\w\s]+/, '').trim();
    if (clean) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      if (clean.length > 50) clean = clean.substring(0, 47) + '...';
      return `${clean} Interview`;
    }
    return 'Interview Session';
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8 font-['Outfit'] dark:text-zinc-100">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-50 dark:font-extrabold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground text-lg dark:text-zinc-400">Ready for your next interview?</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" onClick={() => navigate('/company-prep')} className="gap-2">
            <Building2 size={20} /> Targeted Practice
          </Button>
          <Button variant="outline" onClick={() => navigate('/peer-interview')} className="gap-2">
            <UsersRound size={20} /> Peer Interview
          </Button>
          <Button onClick={() => navigate('/upload')} className="gap-2">
            <Play size={20} fill="currentColor" /> Quick Start
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 border-border/50 dark:bg-[#0d1117] dark:border-zinc-800/90 group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Trophy size={120} />
          </div>
          <CardContent className="flex items-center gap-4 p-6 relative z-10">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider dark:text-zinc-400">Sessions Completed</p>
              <h3 className="text-3xl font-bold tracking-tight dark:text-zinc-100">{stats?.totalSessions || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-green-500/5 hover:-translate-y-1 hover:border-green-500/20 border-border/50 dark:bg-[#0d1117] dark:border-zinc-800/90 group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 text-green-500">
            <Target size={120} />
          </div>
          <CardContent className="flex items-center gap-4 p-6 relative z-10">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-600 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider dark:text-zinc-400">Average Score</p>
              <h3 className="text-3xl font-bold tracking-tight dark:text-zinc-100">{(stats?.avgOverallScore * 10).toFixed(0) || 0}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 hover:border-orange-500/20 border-border/50 dark:bg-[#0d1117] dark:border-zinc-800/90 group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 text-orange-500">
            <Flame size={120} />
          </div>
          <CardContent className="flex items-center gap-4 p-6 relative z-10">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <Flame size={24} fill="currentColor" className="animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider dark:text-zinc-400">Current Streak</p>
              <h3 className="text-3xl font-bold tracking-tight dark:text-zinc-100">{stats?.streak || 0} Days</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight dark:text-zinc-50 dark:font-extrabold">Recent Activity</h2>
          
          <Tabs value={sortBy} onValueChange={handleSortChange} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-9">
              <TabsTrigger value="latest" className="gap-2 text-xs font-bold">
                <History size={14} /> Latest
              </TabsTrigger>
              <TabsTrigger value="highestScore" className="gap-2 text-xs font-bold">
                <Star size={14} /> Top Scores
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Card className="border-border/50 dark:bg-[#0d1117] dark:border-zinc-800/90">
          <CardContent className="p-0">
            {sessions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg dark:text-zinc-400">No recent activity. Start an interview!</p>
                <Button variant="link" onClick={() => navigate('/upload')} className="mt-2">
                  Upload your resume to begin
                </Button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {sessions.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => navigate(`/feedback/${s._id}`)}
                      className="flex justify-between items-center p-6 hover:bg-card dark:hover:bg-zinc-900/70 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 group relative overflow-hidden hover:-translate-y-1 z-10"
                    >
                      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary to-primary/50 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                      <div className="space-y-1">
                        <p className="font-semibold group-hover:text-primary dark:text-zinc-100 transition-colors line-clamp-1">
                          {formatJobTitle(s)}
                        </p>
                        <p className="text-sm text-muted-foreground dark:text-zinc-400">
                          {new Date(s.completedAt || s.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Score Circular Progress */}
                        <div className="relative flex items-center justify-center w-14 h-14 group-hover:scale-110 transition-transform duration-300">
                          <svg className="transform -rotate-90 w-14 h-14">
                            <circle cx="28" cy="28" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                            <circle 
                              cx="28" cy="28" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" 
                              strokeDasharray="125.6" 
                              strokeDashoffset={125.6 - ((s.score * 10) / 100) * 125.6} 
                              className={`transition-all duration-1000 ease-out ${s.score >= 8 ? 'text-green-500 dark:text-emerald-400' : s.score >= 5 ? 'text-orange-500 dark:text-amber-400' : 'text-red-500 dark:text-rose-400'}`} 
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className={`absolute text-sm font-bold ${s.score >= 8 ? 'text-green-600 dark:text-emerald-300' : s.score >= 5 ? 'text-orange-600 dark:text-amber-300' : 'text-red-600 dark:text-rose-300'}`}>
                            {(s.score * 10).toFixed(0)}%
                          </span>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
                {sessions.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-muted/20 dark:bg-zinc-900/40 border-t border-border dark:border-zinc-800/90">
                    <p className="text-sm text-muted-foreground dark:text-zinc-400">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unified Floating Ad Carousel - Premium Aesthetic Upgrade */}
      {!isAdHidden && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 group animate-in slide-in-from-right-8 duration-1000">
        
        {/* Dynamic Background Glow */}
        <div className={`absolute inset-0 -z-10 blur-[80px] opacity-40 transition-all duration-1000 rounded-full ${currentAd === 0 ? 'bg-teal-500' : 'bg-primary'}`} />

        <div className="relative overflow-hidden w-[260px] h-[76px] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/30 border border-white/10 bg-black/40 backdrop-blur-3xl group/card">
          
          {/* Close Button */}
          <button 
            onClick={handleDismissAd}
            className="absolute top-2 right-2 z-[60] p-1 rounded-full bg-black/20 text-white/40 hover:text-white hover:bg-black/40 transition-all duration-300 opacity-0 group-hover/card:opacity-100"
            title="Hide for this session"
          >
            <X size={14} />
          </button>
          
          {/* Shine Sweep Animation overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -rotate-45 animate-[shimmer_4s_infinite] transition-transform" />
          </div>

          {/* Ad 1: Emotional Interview */}
          <div 
            onClick={() => navigate('/conversational-interview')}
            className={`absolute inset-0 w-full h-full cursor-pointer transition-all duration-700 transform px-4 flex items-center gap-3 bg-gradient-to-br from-teal-500/10 to-transparent ${currentAd === 0 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:scale-110 transition-transform duration-700">
              <Zap size={60} fill="#14b8a6" />
            </div>
            
            <div className="relative">
              <div className="p-2 rounded-xl bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)] group-hover/card:scale-110 group-hover/card:rotate-6 transition-all duration-500">
                <Zap size={18} fill="currentColor" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </div>
            </div>

            <div className="flex flex-col min-w-0 font-['Outfit']">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black text-teal-400 uppercase tracking-[0.2em]">Recommended</span>
                <span className="h-1 w-1 rounded-full bg-teal-500 animate-pulse"></span>
              </div>
              <h3 className="text-base font-black tracking-tight text-white/95 leading-none mb-1 text-shadow-sm">Emotional Interview</h3>
              <p className="text-[10px] text-zinc-400 font-medium truncate tracking-wide">Master soft skills with adaptive AI</p>
            </div>
          </div>

          {/* Ad 2: Code Playground */}
          <div 
            onClick={() => navigate('/playground')}
            className={`absolute inset-0 w-full h-full cursor-pointer transition-all duration-700 transform px-4 flex items-center gap-3 bg-gradient-to-br from-primary/10 to-transparent ${currentAd === 1 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:scale-110 transition-transform duration-700">
              <Code2 size={60} fill="#4d6bfe" />
            </div>

            <div className="relative">
              <div className="p-2 rounded-xl bg-primary text-white shadow-[0_0_15px_rgba(77,107,254,0.4)] group-hover/card:scale-110 group-hover/card:-rotate-6 transition-all duration-500">
                <Code2 size={18} />
              </div>
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </div>
            </div>

            <div className="flex flex-col min-w-0 font-['Outfit']">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black text-primary/90 uppercase tracking-[0.2em]">New Feature</span>
                <span className="h-1 w-1 rounded-full bg-primary animate-pulse"></span>
              </div>
              <h3 className="text-base font-black tracking-tight text-white/95 leading-none mb-1 text-shadow-sm">Code Playground</h3>
              <p className="text-[10px] text-zinc-400 font-medium truncate tracking-wide">Experiment with live coding tools</p>
            </div>
          </div>
        </div>

        {/* Premium Indicators */}
        <div className="flex gap-2 mr-6 transition-all duration-500">
          {[0, 1].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentAd(idx)}
              className={`h-1.5 rounded-full transition-all duration-700 shadow-sm ${currentAd === idx ? 'w-8 bg-primary shadow-primary/40' : 'w-2 bg-zinc-800 hover:bg-zinc-700'}`}
            />
          ))}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { transform: translateX(-150%) rotate(-45deg); }
            100% { transform: translateX(150%) rotate(-45deg); }
          }
        ` }} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
