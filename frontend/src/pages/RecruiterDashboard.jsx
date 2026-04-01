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
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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

const RecruiterDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');

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
      setCandidates(candidateRes.data.data);

      // Fetch cohort stats
      const statsRes = await api.get(`/analytics/recruiter/stats`);
      setStats(statsRes.data.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching recruiter data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/analytics/recruiter/export?format=csv`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidate-report.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreBadge = (score) => {
    if (score >= 8) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Elite</Badge>;
    if (score >= 6) return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Strong</Badge>;
    return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Average</Badge>;
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Recruiter Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your candidate pipeline and analyze performance trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download size={16} />
            Export CSV
          </Button>
          <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
            <LinkIcon size={16} />
            Invite Candidate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Composite Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.length > 0 
                ? (candidates.reduce((acc, c) => acc + c.bestScore, 0) / candidates.length).toFixed(1) 
                : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">Highest: 9.4 (Senior SE)</p>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Cohort</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Frontend Engineering</div>
            <p className="text-xs text-muted-foreground">Avg Score: 8.2</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Table */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Candidate Pipeline</CardTitle>
              <CardDescription>Track interview progress and scores for all active candidates.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-9 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter size={16} />
                    {filterRole}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterRole('All')}>All Roles</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('Senior')}>Senior</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('Mid-Level')}>Mid-Level</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('Junior')}>Junior</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Candidate</TableHead>
                <TableHead>Best Score</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Loading pipeline data...
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No candidates found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate._id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/50">
                          <AvatarImage src={candidate.avatar} />
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {candidate.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{candidate.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-lg">{candidate.bestScore}</span>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full" 
                            style={{ width: `${(candidate.bestScore / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {candidate.sessionCount} Sessions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={14} />
                        <span className="text-sm">
                          {new Date(candidate.lastAttempt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getScoreBadge(candidate.bestScore)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Mail size={14} /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <ExternalLink size={14} /> View Full Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-teal-500 gap-2 font-medium">
                            <ChevronRight size={14} /> Schedule Next
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
    </div>
  );
};

export default RecruiterDashboard;
