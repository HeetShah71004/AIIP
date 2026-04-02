import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Link as LinkIcon, 
  TrendingUp, 
  Award, 
  Clock,
  ChevronRight,
  MoreVertical,
  Mail,
  ExternalLink,
  Loader2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleMessage, setScheduleMessage] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterRole, filterCompany]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch top candidates
      let candidateUrl = `/analytics/recruiter/top-candidates?limit=20`;
      if (filterRole !== 'All') candidateUrl += `&roleLevel=${filterRole}`;
      if (filterCompany !== 'All') candidateUrl += `&company=${filterCompany}`;
      
      const candidateRes = await api.get(candidateUrl);
      setCandidates(candidateRes.data.data || []);

      // Fetch cohort stats
      const statsRes = await api.get(`/analytics/recruiter/stats`);
      setStats(statsRes.data.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching recruiter data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Preparing CSV export...', { id: 'export' });
      const response = await api.get(`/analytics/recruiter/export?format=csv`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recruiter-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success('Report exported successfully', { id: 'export' });
    } catch (error) {
      toast.error('Export failed', { id: 'export' });
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return toast.error('Please enter an email address');

    try {
      setIsInviting(true);
      await api.post('/auth/invite-candidate', {
        email: inviteEmail,
        customMessage: inviteMessage
      });
      
      toast.success(`Invitation sent to ${inviteEmail}`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteMessage('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleEmail || !scheduleDate || !scheduleTime) {
      return toast.error('Please fill in all required fields');
    }

    try {
      setIsScheduling(true);
      await api.post('/auth/schedule-mock', {
        email: scheduleEmail,
        date: scheduleDate,
        time: scheduleTime,
        message: scheduleMessage
      });
      
      toast.success(`Interview scheduled for ${scheduleEmail}`);
      setIsScheduleModalOpen(false);
      setScheduleEmail('');
      setScheduleDate('');
      setScheduleTime('');
      setScheduleMessage('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to schedule interview');
    } finally {
      setIsScheduling(false);
    }
  };

  const openInviteWithEmail = (email) => {
    setInviteEmail(email);
    setIsInviteModalOpen(true);
  };

  const openScheduleWithEmail = (email) => {
    setScheduleEmail(email);
    setIsScheduleModalOpen(true);
  };

  const filteredCandidates = candidates.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmailSuggestions = inviteEmail.length > 0
    ? candidates.filter(c => 
        c.email.toLowerCase().startsWith(inviteEmail.toLowerCase()) && 
        c.email.toLowerCase() !== inviteEmail.toLowerCase()
      ).slice(0, 5)
    : [];

  const getScoreBadge = (score) => {
    if (score >= 8) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Elite</Badge>;
    if (score >= 6) return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Strong</Badge>;
    return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Average</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mt-8 sm:mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
            Recruiter Dashboard
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Manage your candidate pipeline and evaluate performance trends.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleExport} 
            className="h-11 px-6 gap-2 border-teal-500/20 hover:bg-teal-50 hover:text-teal-600 transition-all font-bold rounded-xl"
          >
            <Download size={18} />
            Export CSV
          </Button>
          <Button 
            onClick={() => setIsInviteModalOpen(true)}
            className="h-11 px-6 gap-2 bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all font-bold rounded-xl"
          >
            <LinkIcon size={18} />
            Invite Candidate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Candidates', value: candidates.length, desc: '+12% from last month', icon: <Users className="h-5 w-5 text-teal-600" />, trend: 'text-green-500' },
          { 
            title: 'Avg. Composite Score', 
            value: candidates.length > 0 
              ? (candidates.reduce((acc, c) => acc + (c.bestScore || 0), 0) / candidates.length).toFixed(1) 
              : '0.0',
            desc: 'Highest: 9.4 (Senior SE)',
            icon: <TrendingUp className="h-5 w-5 text-teal-600" />,
            trend: 'text-teal-600'
          },
          { title: 'Top Cohort', value: 'Frontend Engineering', desc: 'Avg Score: 8.2', icon: <Award className="h-5 w-5 text-teal-600" />, trend: 'text-teal-600' }
        ].map((stat, i) => (
          <Card key={i} className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">{stat.value}</div>
              <p className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${stat.trend}`}>
                {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Table */}
      <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border-border/40 shadow-2xl rounded-3xl overflow-hidden border-none ring-1 ring-border/50">
        <CardHeader className="bg-muted/5 p-6 sm:p-8 border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">Candidate Pipeline</CardTitle>
              <CardDescription className="font-medium">Track interview progress and scores for all active candidates.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10 h-11 bg-background/50 border-border/50 focus:ring-teal-500 rounded-xl font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 px-5 gap-2 border-border/50 rounded-xl font-bold hover:bg-muted/50 transition-colors">
                    <Filter size={18} />
                    {filterRole}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                  <DropdownMenuItem className="font-bold cursor-pointer" onClick={() => setFilterRole('All')}>All Roles</DropdownMenuItem>
                  <DropdownMenuItem className="font-bold cursor-pointer" onClick={() => setFilterRole('Senior')}>Senior</DropdownMenuItem>
                  <DropdownMenuItem className="font-bold cursor-pointer" onClick={() => setFilterRole('Mid-Level')}>Mid-Level</DropdownMenuItem>
                  <DropdownMenuItem className="font-bold cursor-pointer" onClick={() => setFilterRole('Junior')}>Junior</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="h-14 pl-8 text-xs font-black uppercase tracking-widest text-muted-foreground">Candidate</TableHead>
                <TableHead className="h-14 text-xs font-black uppercase tracking-widest text-muted-foreground">Best Score</TableHead>
                <TableHead className="h-14 text-xs font-black uppercase tracking-widest text-muted-foreground">Sessions</TableHead>
                <TableHead className="h-14 text-xs font-black uppercase tracking-widest text-muted-foreground">Last Activity</TableHead>
                <TableHead className="h-14 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="h-14 text-right pr-8 text-xs font-black uppercase tracking-widest text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-32 text-muted-foreground">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                      <p className="font-bold tracking-tight text-lg">Loading pipeline data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-32 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                       <Search size={40} className="opacity-20 mb-2" />
                       <p className="font-bold text-xl tracking-tight">No candidates found</p>
                       <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate._id} className="group hover:bg-teal-50/30 dark:hover:bg-teal-500/5 transition-colors border-border/40">
                    <TableCell className="pl-8 py-5">
                      <div 
                        className="flex items-center gap-4 cursor-pointer group/item"
                        onClick={() => navigate('/profile', { state: { candidateId: candidate._id } })}
                      >
                        <Avatar className="h-12 w-12 border-2 border-background shadow-lg ring-1 ring-border/50 group-hover:scale-110 transition-transform duration-300">
                          <AvatarImage src={candidate.avatar} />
                          <AvatarFallback className="bg-teal-100 text-teal-800 font-black text-lg">
                            {(candidate.name || 'C').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-0.5">
                          <span className="font-bold text-base text-foreground group-hover/item:text-teal-600 transition-colors tracking-tight">
                            {candidate.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold font-mono tracking-tighter opacity-70 italic">{candidate.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 w-36">
                        <div className="flex items-center justify-between px-0.5">
                          <span className="font-black text-xl leading-none text-teal-600">{candidate.bestScore || 0}</span>
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Composite</span>
                        </div>
                        <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-teal-500/50" 
                            style={{ width: `${((candidate.bestScore || 0) / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-black px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-none rounded-lg shadow-sm">
                        {candidate.sessionCount || 0} Sessions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground font-bold">
                        <div className="p-1.5 bg-muted/40 rounded-lg">
                          <Clock size={14} className="text-teal-600/70" />
                        </div>
                        <span className="text-sm">
                          {candidate.lastAttempt ? new Date(candidate.lastAttempt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getScoreBadge(candidate.bestScore || 0)}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all active:scale-95 shadow-sm">
                            <MoreVertical size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-1 rounded-2xl shadow-2xl border border-border/40">
                          <DropdownMenuItem 
                            onClick={() => openInviteWithEmail(candidate.email)}
                            className="gap-3 px-4 py-3 focus:bg-teal-50 focus:text-teal-600 cursor-pointer rounded-xl font-bold"
                          >
                            <Mail size={18} /> Send Invitation
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigate('/profile', { state: { candidateId: candidate._id } })}
                            className="gap-3 px-4 py-3 cursor-pointer rounded-xl font-bold"
                          >
                            <ExternalLink size={18} /> View Full Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openScheduleWithEmail(candidate.email)}
                            className="text-teal-600 gap-3 px-4 py-3 focus:bg-teal-50 cursor-pointer rounded-xl font-bold"
                          >
                            <CalendarIcon size={18} /> Schedule Next
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invitation Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-3xl font-black text-teal-600 tracking-tight">Invite Candidate</DialogTitle>
            <DialogDescription className="text-sm font-medium mt-2">
              Send a personalized invitation to join Interv AI and start their interview journey.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="p-8 pt-6 space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Candidate Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="candidate@example.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="h-12 bg-muted/30 border-none focus:ring-2 focus:ring-teal-500 rounded-xl font-bold"
                required
                autoComplete="off"
              />
              
              {showSuggestions && filteredEmailSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-border/50 rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                  {filteredEmailSuggestions.map((candidate) => (
                    <button
                      key={candidate._id}
                      type="button"
                      onClick={() => {
                        setInviteEmail(candidate.email);
                        setShowSuggestions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors group"
                    >
                      <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback className="text-[10px] bg-teal-100 text-teal-800 font-bold">
                          {(candidate.name || 'C').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate group-hover:text-teal-600 transition-colors">
                          {candidate.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate italic">
                          {candidate.email}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Personal Message (Optional)</Label>
              <textarea
                id="message"
                className="flex min-h-[120px] w-full rounded-xl border-none bg-muted/30 px-4 py-3 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-outfit"
                placeholder="Hi! We'd like you to practice some mock sessions before our formal technical round."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-3 sm:gap-0">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsInviteModalOpen(false)}
                disabled={isInviting}
                className="h-12 px-6 rounded-xl font-bold hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="h-12 px-8 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/20 text-white rounded-xl font-black tracking-tight flex-1 ml-2"
                disabled={isInviting}
              >
                {isInviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-3xl font-black text-teal-600 tracking-tight flex items-center gap-3">
              <CalendarIcon size={28} />
              Schedule Session
            </DialogTitle>
            <DialogDescription className="text-sm font-medium mt-2">
              Set a date and time for the candidate's next evaluation round.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSchedule} className="p-8 pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="s-email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Candidate</Label>
              <Input
                id="s-email"
                type="email"
                value={scheduleEmail}
                readOnly
                className="h-12 bg-muted/50 border-none cursor-not-allowed rounded-xl font-bold italic opacity-70"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-12 bg-muted/30 border-none focus:ring-2 focus:ring-teal-500 rounded-xl font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="h-12 bg-muted/30 border-none focus:ring-2 focus:ring-teal-500 rounded-xl font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-message" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Round Instructions (Optional)</Label>
              <textarea
                id="s-message"
                className="flex min-h-[100px] w-full rounded-xl border-none bg-muted/30 px-4 py-3 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 font-outfit"
                placeholder="e.g. Round 2: Focused on Advanced System Design and Scalability."
                value={scheduleMessage}
                onChange={(e) => setScheduleMessage(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2 gap-3 sm:gap-0">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsScheduleModalOpen(false)}
                disabled={isScheduling}
                className="h-12 px-6 rounded-xl font-bold hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="h-12 px-8 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/20 text-white rounded-xl font-black tracking-tight flex-1 ml-2"
                disabled={isScheduling}
              >
                {isScheduling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Confirm Schedule"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruiterDashboard;
