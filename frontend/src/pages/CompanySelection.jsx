import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Search, Building2, Briefcase, Users, Play, Loader2, ChevronRight, Check, Code2, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from 'react-hot-toast';

const TOP_COMPANIES = [
  "Google", "Meta", "Amazon", "Apple", "Netflix", 
  "Microsoft", "Uber", "Airbnb", "Stripe", "Palantir", 
  "Databricks", "Snowflake", "Robinhood", "Coinbase", 
  "ByteDance", "LinkedIn", "X (Twitter)", "Snap"
];

const ROLE_LEVELS = ["Junior", "Mid", "Senior", "Staff"];
const INTERVIEW_ROUNDS = ["Phone Screen", "Technical", "System Design", "Behavioral", "Coding"];

const CompanySelection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRound, setSelectedRound] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'unset';
  }, []);

  const filteredCompanies = TOP_COMPANIES.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartInterview = async () => {
    if (!selectedCompany || !selectedRole || !selectedRound) {
        toast.error("Please select a company, role level, and interview round.");
        return;
    }
    
    setStarting(true);
    try {
      const res = await api.post('/sessions/start', {
        useResume: false,
        totalQuestions: selectedRound === 'Coding' ? 2 : 5,
        company: selectedCompany,
        roleLevel: selectedRole,
        interviewRound: selectedRound
      });
      navigate(`/interview/${res.data.data._id}`);
    } catch (err) {
      toast.error('Failed to start interview');
      setStarting(false);
    }
  };

  const getDifficultyForCompany = (company) => {
    if (["Google", "Meta", "Stripe", "Netflix", "Databricks"].includes(company)) return "Hard";
    if (["Amazon", "Apple", "Microsoft", "Uber", "Airbnb"].includes(company)) return "Medium-Hard";
    return "Medium";
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Targeted Company Practice</h1>
        <p className="text-muted-foreground text-lg">
          Prepare for specific companies and roles with tailored questions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Company Search */}
        <Card className="border-border/50 shadow-md flex flex-col h-[600px]">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="text-primary" size={24} />
              Select Company
            </CardTitle>
            <CardDescription>Search from top tech companies</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden pt-0">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search companies..."
                className="w-full bg-muted/30 border border-border/50 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2 pb-4">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map(company => (
                    <div
                      key={company}
                      onClick={() => setSelectedCompany(company)}
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all ${
                        selectedCompany === company 
                          ? "bg-primary/10 border-primary ring-1 ring-primary/30" 
                          : "bg-card border-border/50 hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                           selectedCompany === company ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {company.charAt(0)}
                        </div>
                        <span className="font-semibold text-foreground">{company}</span>
                      </div>
                      {selectedCompany === company && <Check className="text-primary" size={20} />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No companies found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: Configuration & Action */}
        <div className="space-y-6 flex flex-col h-full">
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="text-primary" size={24} />
                Role Level
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {ROLE_LEVELS.map(role => (
                   <Button
                     key={role}
                     variant={selectedRole === role ? "default" : "outline"}
                     onClick={() => setSelectedRole(role)}
                     className={`h-12 w-full justify-start px-4 font-medium transition-all ${selectedRole === role ? 'shadow-md shadow-primary/20 bg-primary hover:bg-primary/90' : 'hover:bg-muted/50'}`}
                   >
                     {role}
                   </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="text-primary" size={24} />
                Interview Round
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {INTERVIEW_ROUNDS.map(round => {
                  const isCoding = ["Technical", "Coding"].includes(round);
                  return (
                    <Button
                      key={round}
                      variant={selectedRound === round ? "default" : "outline"}
                      onClick={() => setSelectedRound(round)}
                      className={`h-16 w-full flex flex-col items-start justify-center px-4 gap-1 transition-all ${selectedRound === round ? 'shadow-md shadow-primary/30 bg-primary hover:bg-primary/90' : 'hover:bg-muted/50'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold">{round}</span>
                        {isCoding ? <Code2 size={14} className="opacity-60" /> : <MessageSquare size={14} className="opacity-60" />}
                      </div>
                      <Badge variant="secondary" className={`text-[10px] uppercase font-black tracking-widest px-2 py-0 h-4 border-none ${selectedRound === round ? 'bg-white/20 text-white' : 'bg-muted/50 text-muted-foreground'}`}>
                        {isCoding ? "IDE-Based" : "Conversational"}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Target Summary */}
          {selectedCompany && (
            <Card className="border-border/50 shadow-md bg-gradient-to-br from-primary/5 to-transparent flex-1 flex flex-col justify-center">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Target Company</h3>
                    <p className="text-2xl font-bold text-foreground">{selectedCompany}</p>
                  </div>
                  <Badge variant="outline" className={`text-sm px-3 py-1 font-bold ${getDifficultyForCompany(selectedCompany).includes('Hard') ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`}>
                     {getDifficultyForCompany(selectedCompany)}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                   <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Configuration</p>
                   <p className="font-medium text-foreground">
                      {selectedRole ? selectedRole : "Any Role"} • {selectedRound ? selectedRound : "Any Round"}
                   </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
             className="w-full text-lg h-14 gap-2 shadow-lg hover:shadow-xl transition-all font-bold"
             disabled={starting || !selectedCompany || !selectedRole || !selectedRound}
             onClick={handleStartInterview}
          >
             {starting ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
             {starting ? "Generating Session..." : "Start Company Interview"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanySelection;
