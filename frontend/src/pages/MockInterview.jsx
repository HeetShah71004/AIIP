import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Timer, Award, CheckCircle, ChevronLeft, Loader2, XCircle, AlertCircle, LayoutGrid } from 'lucide-react';
import { getSession, submitAnswer, getQuestionsFromBank } from '../api/interviewApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const MockInterview = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(1800);
    const [showSkipModal, setShowSkipModal] = useState(false);
    const scrollAreaRef = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const sessionData = await getSession(sessionId);
                setSession(sessionData.data.session);
                
                if (sessionData.data.questions.length === 0) {
                    const bankQuestions = await getQuestionsFromBank({ limit: sessionData.data.session.totalQuestions });
                    setQuestions(bankQuestions.questions);
                    setChatHistory([{
                        type: 'ai',
                        text: bankQuestions.questions[0].text,
                        timestamp: new Date(),
                        isQuestion: true
                    }]);
                } else {
                    setQuestions(sessionData.data.questions);
                    const history = [];
                    const completedCount = sessionData.data.session.completedQuestions;
                    const allQuestions = sessionData.data.questions;
                    
                    for (let i = 0; i <= completedCount && i < allQuestions.length; i++) {
                        const q = allQuestions[i];
                        history.push({ type: 'ai', text: q.text, timestamp: q.createdAt, isQuestion: true });
                        
                        if (q.answer) {
                            const displayText = q.answer === '__SKIPPED__' ? '[Question Skipped]' : q.answer;
                            history.push({ type: 'user', text: displayText, timestamp: q.createdAt });
                            if (q.feedback) {
                                history.push({ type: 'ai', text: `Feedback: ${q.feedback.analysis}`, timestamp: q.createdAt, isFeedback: true, score: q.feedback.score });
                            }
                        }
                    }

                    if (completedCount >= sessionData.data.session.totalQuestions) {
                        history.push({
                            type: 'ai',
                            text: "You've completed this interview session! You can view your full report in the feedback page.",
                            timestamp: new Date(),
                            isFinal: true
                        });
                    }

                    setChatHistory(history);
                    setCurrentQuestionIndex(completedCount);
                }
                setLoading(false);
            } catch (err) {
                toast.error('Failed to load session');
                navigate('/');
            }
        };
        fetchInitialData();
    }, [sessionId, navigate]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [chatHistory, submitting]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSkip = async () => {
        setShowSkipModal(false);
        const currentQuestion = questions[currentQuestionIndex];
        const userMessage = { type: 'user', text: '[Question Skipped]', timestamp: new Date() };
        setChatHistory([...chatHistory, userMessage]);
        setSubmitting(true);

        try {
            const res = await submitAnswer(sessionId, {
                questionId: currentQuestion._id,
                answer: '__SKIPPED__'
            });

            const feedbackMessage = {
                type: 'ai',
                text: res.data.feedback.analysis,
                timestamp: new Date(),
                isFeedback: true,
                score: res.data.feedback.score
            };

            const nextIndex = currentQuestionIndex + 1;
            
            // Update local questions state to reflect skip status
            setQuestions(prev => prev.map((q, idx) => 
                idx === currentQuestionIndex ? { ...q, answer: '__SKIPPED__' } : q
            ));

            if (nextIndex < questions.length) {
                const nextQuestionMessage = {
                    type: 'ai',
                    text: questions[nextIndex].text,
                    timestamp: new Date(),
                    isQuestion: true
                };
                setChatHistory(prev => [...prev, feedbackMessage, nextQuestionMessage]);
                setCurrentQuestionIndex(nextIndex);
            } else {
                setChatHistory(prev => [...prev, feedbackMessage, {
                    type: 'ai',
                    text: "That was the last question! You've completed the interview session. You can view your full report in the feedback page.",
                    timestamp: new Date(),
                    isFinal: true
                }]);
            }
        } catch (err) {
            toast.error('Failed to skip question');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!answer.trim()) return;

        const currentQuestion = questions[currentQuestionIndex];
        const userMessage = { type: 'user', text: answer, timestamp: new Date() };
        setChatHistory([...chatHistory, userMessage]);
        setSubmitting(true);
        const submittedAnswer = answer;
        setAnswer('');

        try {
            const res = await submitAnswer(sessionId, {
                questionId: currentQuestion._id,
                answer: submittedAnswer
            });

            const feedbackMessage = {
                type: 'ai',
                text: res.data.feedback.analysis,
                timestamp: new Date(),
                isFeedback: true,
                score: res.data.feedback.score
            };

            const nextIndex = currentQuestionIndex + 1;

            // Update local questions state to reflect answer status
            setQuestions(prev => prev.map((q, idx) => 
                idx === currentQuestionIndex ? { ...q, answer: submittedAnswer } : q
            ));

            if (nextIndex < questions.length) {
                const nextQuestionMessage = {
                    type: 'ai',
                    text: questions[nextIndex].text,
                    timestamp: new Date(),
                    isQuestion: true
                };
                setChatHistory(prev => [...prev, feedbackMessage, nextQuestionMessage]);
                setCurrentQuestionIndex(nextIndex);
            } else {
                setChatHistory(prev => [...prev, feedbackMessage, {
                    type: 'ai',
                    text: "That was the last question! You've completed the interview session. You can view your full report in the feedback page.",
                    timestamp: new Date(),
                    isFinal: true
                }]);
            }
        } catch (err) {
            toast.error('Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <LoadingSpinner fullPage message="Preparing your interview session..." />;

    return (
        <div className="container max-w-7xl mx-auto px-4 py-10 h-[calc(100vh-40px)]">
            <Card className="grid h-full lg:grid-cols-[320px_1fr] overflow-hidden border-border/50 shadow-2xl">
                {/* Sidebar */}
                <aside className="border-r border-border/50 bg-muted/20 flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-border/50 space-y-8">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="w-full justify-start gap-2 hover:bg-background/80 transition-all font-medium">
                            <ChevronLeft size={16} /> Dashboard
                        </Button>
                        
                        <div className="grid gap-5">
                            <div className="p-4 bg-background/60 rounded-xl border border-border/40 space-y-2 shadow-sm">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                                    <Timer size={14} className="text-primary" /> Time Remaining
                                </div>
                                <p className="text-2xl font-bold tracking-tight text-primary/90">{formatTime(timeLeft)}</p>
                            </div>
                            <div className="p-4 bg-background/60 rounded-xl border border-border/40 space-y-3 shadow-sm">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                                    <Award size={14} className="text-primary" /> Progress
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-end justify-between">
                                        <p className="text-2xl font-bold tracking-tight">{currentQuestionIndex} / {questions.length}</p>
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">{((currentQuestionIndex / questions.length) * 100).toFixed(0)}%</p>
                                    </div>
                                    <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-6 pb-2">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em] opacity-70">All Questions</p>
                                <LayoutGrid size={14} className="text-muted-foreground" />
                            </div>
                            <div className="grid grid-cols-4 gap-4 px-2">
                                {questions.map((q, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ring-offset-background",
                                            i === currentQuestionIndex ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 z-10" :
                                            i < currentQuestionIndex ? (
                                                questions[i].answer === '__SKIPPED__' ? "bg-red-500 text-white" : "bg-green-500 text-white"
                                            ) : "bg-muted/50 text-muted-foreground border border-border/50"
                                        )}
                                    >
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-6 pt-0 space-y-3">
                        <div className="space-y-2.5 p-4 bg-muted/10 rounded-2xl border border-border/40">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                <div className="w-2.5 h-2.5 rounded-full bg-muted/50 border border-border/50" /> Not Visited
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Current
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Answered
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Skipped
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Chat Area */}
                <main className="flex flex-col h-full overflow-hidden bg-background/40 backdrop-blur-md">
                    <ScrollArea ref={scrollAreaRef} className="flex-1 p-8">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={cn("flex w-full", msg.type === 'user' ? "justify-end" : "justify-start")}>
                                    <Card className={cn(
                                        "max-w-[80%] border-border/40 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-500",
                                        msg.type === 'user' ? "bg-primary text-primary-foreground border-none ring-4 ring-primary/5" : "bg-card/90",
                                        msg.isFeedback && "border-l-4 border-l-green-500 bg-green-500/[0.03]",
                                        msg.isQuestion && "border-primary/30 bg-primary/[0.03]"
                                    )}>
                                        <CardContent className="p-5 space-y-4">
                                            <p className="leading-relaxed whitespace-pre-wrap text-[15px]">{msg.text}</p>
                                            
                                            {msg.isFeedback && (
                                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 font-bold px-3 py-1">
                                                    Score: {msg.score}/10
                                                </Badge>
                                            )}

                                            {msg.isFinal && (
                                                <Button size="lg" onClick={() => navigate(`/feedback/${sessionId}`)} className="w-full mt-4 bg-primary text-primary-foreground hover:opacity-90 font-bold shadow-lg shadow-primary/20">
                                                    View Full Performance Report
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                            {submitting && (
                                <div className="flex justify-start">
                                    <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 animate-pulse flex items-center gap-3 shadow-sm">
                                        <Loader2 className="animate-spin text-primary" size={20} />
                                        <span className="text-sm font-semibold tracking-tight">AI is evaluating your response...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-8 border-t border-border/40 bg-muted/20 backdrop-blur-sm">
                        <div className="max-w-4xl mx-auto flex gap-4 items-end">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => setShowSkipModal(true)}
                                disabled={submitting || currentQuestionIndex >= questions.length}
                                className="h-[56px] w-[56px] shrink-0 border-destructive/10 bg-destructive/[0.02] text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                                title="Skip Question"
                            >
                                <XCircle size={26} strokeWidth={1.5} />
                            </Button>
                            
                            <form onSubmit={handleSubmit} className="relative flex-1 group">
                                <textarea
                                    className="w-full bg-background/60 backdrop-blur-sm border border-border/40 rounded-2xl px-6 py-4 pr-16 text-base focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all duration-300 resize-none min-h-[56px] max-h-48 shadow-sm group-hover:border-border/60"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type your professional answer here..."
                                    disabled={submitting || currentQuestionIndex >= questions.length}
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                                <Button 
                                    size="icon" 
                                    className="absolute right-2.5 bottom-2.5 h-10 w-10 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95" 
                                    disabled={!answer.trim() || submitting || currentQuestionIndex >= questions.length}
                                    type="submit"
                                >
                                    <Send size={18} />
                                </Button>
                            </form>
                        </div>
                    </div>
                </main>
            </Card>

            <Dialog open={showSkipModal} onOpenChange={setShowSkipModal}>
                <DialogContent className="max-w-[400px]">
                    <DialogHeader className="space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <AlertCircle size={24} />
                        </div>
                        <DialogTitle className="text-center text-2xl">Skip this question?</DialogTitle>
                        <DialogDescription className="text-center text-balance leading-relaxed">
                            Are you sure you want to skip this case? You will receive a score of 0 for this question, which will affect your overall performance.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-2 gap-3 sm:justify-center mt-4">
                        <Button variant="outline" onClick={() => setShowSkipModal(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleSkip}>Yes, Skip Case</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MockInterview;
