import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trophy, Target, Zap, Play, ChevronRight, Trash2, Building2 } from 'lucide-react';
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

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const res = await api.get(`/analytics/summary?page=${currentPage}&limit=5&t=${Date.now()}`);
      setSessions(res.data.data.sessionHistory);
      setStats(res.data.data);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch sessions');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentPage]);

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
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground text-lg">Ready for your next interview?</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" onClick={() => navigate('/company-prep')} className="gap-2">
            <Building2 size={20} /> Targeted Practice
          </Button>
          <Button onClick={() => navigate('/upload')} className="gap-2">
            <Play size={20} fill="currentColor" /> Quick Start
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 border-border/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sessions Completed</p>
              <h3 className="text-3xl font-bold tracking-tight">{stats?.totalSessions || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 border-border/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Average Score</p>
              <h3 className="text-3xl font-bold tracking-tight">{(stats?.avgOverallScore * 10).toFixed(0) || 0}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 border-border/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-600">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Streak</p>
              <h3 className="text-3xl font-bold tracking-tight">{stats?.streak || 0} Days</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
        <Card className="border-border/50">
          <CardContent className="p-0">
            {sessions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No recent activity. Start an interview!</p>
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
                      className="flex justify-between items-center p-6 hover:bg-card hover:shadow-2xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 group relative overflow-hidden hover:-translate-y-1 z-10"
                    >
                      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary to-primary/50 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                      <div className="space-y-1">
                        <p className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {formatJobTitle(s)}
                        </p>
                        <p className="text-sm text-muted-foreground">
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
                              className={`transition-all duration-1000 ease-out ${s.score >= 8 ? 'text-green-500' : s.score >= 5 ? 'text-orange-500' : 'text-red-500'}`} 
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className={`absolute text-sm font-bold ${s.score >= 8 ? 'text-green-600' : s.score >= 5 ? 'text-orange-600' : 'text-red-600'}`}>
                            {(s.score * 10).toFixed(0)}%
                          </span>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
                {sessions.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border">
                    <p className="text-sm text-muted-foreground">
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
    </div>
  );
};

export default Dashboard;
