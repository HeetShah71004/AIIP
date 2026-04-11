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
    if (session.interviewRound === 'Behavioral') {
      return 'Emotional Interview Session';
    }
    const title = session.parsedData?.developerTitle;
    if (!title) return session.interviewRound === 'Behavioral' ? 'Emotional Interview Session' : 'Interview Session';
    let clean = title.replace(/\b(profile|summary|objective|india|i am a|i am an|i am|an experienced|experienced|passionate|dedicated|motivated)\b/gi, '').trim();
    clean = clean.replace(/^[^\w\s]+/, '').trim();
    if (clean) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      if (clean.length > 50) clean = clean.substring(0, 47) + '...';
      return `${clean} Interview`;
    }
    return session.interviewRound === 'Behavioral' ? 'Emotional Interview Session' : 'Interview Session';
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
                      className="flex justify-between items-center p-6 hover:bg-muted/20 dark:hover:bg-zinc-900/45 cursor-pointer transition-colors duration-200 group relative"
                    >
                      <div className="absolute left-0 top-0 h-full w-1 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
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
                        <div className="relative flex items-center justify-center w-14 h-14">
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
        <div className="fixed bottom-8 right-6 z-50 group">
          <div
            onClick={() => navigate(currentAd === 0 ? '/conversational-interview' : '/playground')}
            className="h-14 w-14 hover:w-56 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/15 text-white shadow-[0_10px_24px_rgba(2,6,23,0.35)] hover:shadow-[0_14px_30px_rgba(2,6,23,0.45)] transition-all duration-300 flex items-center gap-3 px-2.5 cursor-pointer overflow-hidden"
            title={currentAd === 0 ? 'Emotional Interview' : 'Code Playground'}
          >
            <div className={`relative shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${
              currentAd === 0
                ? 'bg-gradient-to-br from-teal-400 to-cyan-500 shadow-[0_0_0_2px_rgba(255,255,255,0.14)]'
                : 'bg-gradient-to-br from-indigo-400 to-blue-500 shadow-[0_0_0_2px_rgba(255,255,255,0.14)]'
            }`}>
              {currentAd === 0 ? <Zap size={16} fill="currentColor" className="text-white" /> : <Code2 size={16} className="text-white" />}
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-900" />
            </div>
            <span className="text-sm font-bold whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
              {currentAd === 0 ? 'Emotional Interview' : 'Code Playground'}
            </span>
          </div>

          <button
            onClick={handleDismissAd}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-zinc-900/80 text-white/70 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Hide for this session"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
