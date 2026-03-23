import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Lightbulb, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Star, Trash2, Code2 } from 'lucide-react';
import { getSession } from '../api/interviewApi';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartTooltip,
  Legend
);
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const InterviewFeedback = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getSession(sessionId);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                toast.error('Failed to load feedback');
                navigate('/');
            }
        };
        fetchData();
    }, [sessionId, navigate]);

    if (loading) return <LoadingSpinner fullPage message="Fetching your performance report..." />;

    const { session, questions } = data;
    const totalQuestions = questions.length;

    const answeredQs = questions.filter(q => q.answer !== '__SKIPPED__' && q.feedback);
    const avgClarity = answeredQs.length ? answeredQs.reduce((acc, q) => acc + (q.feedback.clarity || 0), 0) / answeredQs.length : 0;
    const avgDepth = answeredQs.length ? answeredQs.reduce((acc, q) => acc + (q.feedback.depth || 0), 0) / answeredQs.length : 0;
    const avgRelevance = answeredQs.length ? answeredQs.reduce((acc, q) => acc + (q.feedback.relevance || 0), 0) / answeredQs.length : 0;

    const avgCommunication = (avgClarity * 0.5 + avgRelevance * 0.5);
    const avgStructure = (avgClarity * 0.7 + avgDepth * 0.3);

    const radarData = {
        labels: ['Clarity', 'Depth', 'Relevance', 'Structure', 'Communication'],
        datasets: [{
            label: 'Skill Score',
            data: [avgClarity, avgDepth, avgRelevance, avgStructure, avgCommunication],
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 1)',
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
        }]
    };

    const radarOptions = {
        scales: {
            r: {
                beginAtZero: true,
                max: 10,
                ticks: { display: false, stepSize: 2 },
                grid: { color: 'rgba(15, 23, 42, 0.1)' },
                angleLines: { color: 'rgba(15, 23, 42, 0.1)' },
                pointLabels: {
                    color: '#475569',
                    font: { size: 12, weight: 'bold' }
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                displayColors: false
            }
        },
        maintainAspectRatio: false
    };

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % totalQuestions);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + totalQuestions) % totalQuestions);

    const getScoreColor = (score) => {
        if (score >= 7) return "text-green-600";
        if (score >= 4) return "text-amber-600";
        return "text-destructive";
    };

    const getScoreBg = (score) => {
        if (score >= 7) return "bg-green-500/10";
        if (score >= 4) return "bg-amber-500/10";
        return "bg-destructive/10";
    };

    const formatJobTitle = (title) => {
        if (!title) return 'Interview Performance';
        let clean = title.replace(/\b(profile|summary|objective|india|i am a|i am an|i am|an experienced|experienced|passionate|dedicated|motivated)\b/gi, '').trim();
        clean = clean.replace(/^[^\w\s]+/, '').trim();
        if (clean) {
            clean = clean.charAt(0).toUpperCase() + clean.slice(1);
            if (clean.length > 50) clean = clean.substring(0, 47) + '...';
            return `${clean} Interview Performance`;
        }
        return 'Interview Performance';
    };

    const renderAnswer = (answer) => {
        if (answer === '__SKIPPED__') return "This question was skipped";
        if (answer.startsWith('CODE SUBMITTED:')) {
            const codeMatch = answer.match(/CODE:\n```(.*?)\n([\s\S]*?)\n```/);
            const explanationMatch = answer.match(/EXPLANATION:\n([\s\S]*)/);
            
            if (codeMatch) {
                const lang = codeMatch[1];
                const codeContent = codeMatch[2];
                const explanation = explanationMatch ? explanationMatch[1] : '';
                
                return (
                    <div className="space-y-4">
                        <div className="rounded-lg overflow-hidden border border-border/40">
                             <div className="bg-muted px-3 py-1.5 text-[10px] font-mono border-b border-border/40 flex justify-between items-center">
                                <span className="text-primary font-bold">SOURCE CODE ({lang.toUpperCase()})</span>
                                <Code2 size={14} className="text-muted-foreground" />
                             </div>
                             <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                                <code>{codeContent}</code>
                             </pre>
                        </div>
                        {explanation && (
                            <div className="italic text-muted-foreground pt-2 border-t border-border/10">
                                {explanation}
                            </div>
                        )}
                    </div>
                );
            }
        }
        return answer;
    };

    const currentQ = questions[currentSlide];

    const confirmDelete = async () => {
        try {
            await api.delete(`/sessions/${sessionId}`);
            toast.success('Session deleted successfully');
            navigate('/');
            setIsDeleteDialogOpen(false);
        } catch (err) {
            toast.error('Failed to delete session');
        }
    };

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-center mb-[-0.5rem]">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
                    <ChevronLeft size={16} /> Back to Dashboard
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 size={16} /> Delete Interview
                </Button>
            </div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-2xl bg-muted/30 border border-border/50 shadow-sm">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{formatJobTitle(session.parsedData?.developerTitle)}</h1>
                    <p className="text-muted-foreground">Session held on {new Date(session.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
                <div className="flex items-center gap-4 bg-background/60 p-3 pr-6 rounded-2xl border border-border/40 shadow-inner">
                    <div className="relative flex items-center justify-center w-16 h-16">
                        <svg className="transform -rotate-90 w-16 h-16">
                            <circle cx="32" cy="32" r="24" fill="transparent" stroke="currentColor" strokeWidth="5" className="text-muted/20" />
                            <circle 
                                cx="32" cy="32" r="24" fill="transparent" stroke="currentColor" strokeWidth="5" 
                                strokeDasharray="150.8" 
                                strokeDashoffset={150.8 - ((session.score * 10) / 100) * 150.8} 
                                className={cn("transition-all duration-1000 ease-out", session.score >= 8 ? "text-green-500" : session.score >= 5 ? "text-orange-500" : "text-red-500")} 
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={cn("absolute text-lg font-black", session.score >= 8 ? "text-green-600" : session.score >= 5 ? "text-orange-600" : "text-red-600")}>
                            {(session.score * 10).toFixed(0)}%
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Overall Score</p>
                        <p className="text-sm font-medium text-foreground">{session.score.toFixed(1)} out of 10</p>
                    </div>
                </div>
            </header>

            <Card className="border-border/50 shadow-sm overflow-hidden text-center lg:w-2/3 mx-auto">
                <CardHeader className="pb-2">
                    <CardTitle>Skill Dimensions</CardTitle>
                    <CardDescription>Average performance across communication, technical depth, and structure</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] relative w-full">
                    <Radar data={radarData} options={radarOptions} />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Analysis: Question <span className="text-foreground">{currentSlide + 1}</span> of {totalQuestions}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={prevSlide} className="h-8 w-8 rounded-full">
                            <ChevronLeft size={18} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextSlide} className="h-8 w-8 rounded-full">
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
                <Progress value={((currentSlide + 1) / totalQuestions) * 100} className="h-1.5" />
            </div>

            <Card className="border-border/50 shadow-lg overflow-hidden transition-all duration-300">
                <CardHeader className="space-y-4 pb-4">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className="px-3 py-1 font-bold tracking-wider uppercase bg-muted/50 border-border/50">
                            Problem Case {currentSlide + 1}
                        </Badge>
                        <div className={cn("flex flex-col items-center px-4 py-2 rounded-xl border border-border/50", getScoreBg(currentQ.feedback?.score || 0))}>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Question Score</span>
                            <span className={cn("text-2xl font-black", getScoreColor(currentQ.feedback?.score || 0))}>
                                {currentQ.feedback?.score || 0}
                            </span>
                        </div>
                    </div>
                    <CardTitle className="text-xl leading-relaxed font-semibold">{currentQ.text}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Your Response</p>
                        <div className="p-4 rounded-xl bg-muted/40 border border-border/40 text-sm leading-relaxed text-muted-foreground">
                            {renderAnswer(currentQ.answer)}
                        </div>
                    </div>

                    <Separator className="bg-border/40" />

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="strengths" className="border-border/40">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-green-600 font-bold">
                                    <CheckCircle size={18} /> <span>Major Strengths</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-2 pt-2 pl-7 list-disc text-muted-foreground text-sm leading-relaxed">
                                    {currentQ.feedback?.strengths?.map((s, idx) => <li key={idx} className="marker:text-green-500">{s}</li>)}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="weaknesses" className="border-border/40">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-destructive font-bold">
                                    <XCircle size={18} /> <span>Areas for Improvement</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-2 pt-2 pl-7 list-disc text-muted-foreground text-sm leading-relaxed">
                                    {currentQ.feedback?.weaknesses?.map((w, idx) => <li key={idx} className="marker:text-destructive">{w}</li>)}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="suggestions" className="border-none">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-primary font-bold">
                                    <Lightbulb size={18} /> <span>Expert Suggestions</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-2 pt-2 pl-7 list-disc text-muted-foreground text-sm leading-relaxed">
                                    {currentQ.feedback?.suggestions?.map((s, idx) => <li key={idx} className="marker:text-primary">{s}</li>)}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-border/40 p-6 flex justify-between gap-4">
                   <div className="flex gap-2 shrink-0">
                      {questions.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setCurrentSlide(i)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                i === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-primary/50"
                            )}
                        />
                      ))}
                   </div>
                   <Button variant="outline" size="sm" onClick={() => navigate('/')} className="font-semibold shadow-sm">
                        Finish Review
                   </Button>
                </CardFooter>
            </Card>

            <div className="p-8 text-center bg-primary/[0.03] border border-primary/10 rounded-2xl">
                <h3 className="text-lg font-bold mb-2">Ready to improve?</h3>
                <p className="text-muted-foreground text-sm mb-6">Start a new session based on a different resume or focus area to strengthen your weaknesses.</p>
                <Button onClick={() => navigate('/upload')} className="h-12 px-8 font-bold text-lg shadow-lg shadow-primary/20">
                    New Interview Session
                </Button>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Interview Session</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this interview session? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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

export default InterviewFeedback;
