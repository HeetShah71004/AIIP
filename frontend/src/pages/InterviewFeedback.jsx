import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Lightbulb, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { getSession } from '../api/interviewApi';
import toast from 'react-hot-toast';
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
import { cn } from "@/lib/utils"

const InterviewFeedback = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

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

    const currentQ = questions[currentSlide];

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ChevronLeft size={16} /> Back to Dashboard
            </Button>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-2xl bg-muted/30 border border-border/50 shadow-sm">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Interview Performance</h1>
                    <p className="text-muted-foreground">Session held on {new Date(session.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
                <div className="flex items-center gap-4 bg-background/60 p-4 rounded-2xl border border-border/40 shadow-inner">
                    <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Overall Score</p>
                        <div className="flex items-baseline gap-1">
                            <span className={cn("text-4xl font-black", session.score >= 7 ? "text-green-600" : "text-primary")}>
                                {session.score.toFixed(1)}
                            </span>
                            <span className="text-muted-foreground font-medium">/10</span>
                        </div>
                    </div>
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", session.score >= 7 ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary")}>
                        <Star size={24} fill="currentColor" />
                    </div>
                </div>
            </header>

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
                        <div className="p-4 rounded-xl bg-muted/40 border border-border/40 text-sm leading-relaxed italic text-muted-foreground">
                            {currentQ.answer === '__SKIPPED__' ? "This question was skipped" : currentQ.answer}
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
        </div>
    );
};

export default InterviewFeedback;
