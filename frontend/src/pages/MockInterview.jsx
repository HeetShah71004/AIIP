import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Timer, Award, CheckCircle, ChevronLeft, ChevronRight, Loader2, XCircle, AlertCircle, LayoutGrid, User, Bot, Play, Code, Code2, Terminal, FileText, BookOpen, FlaskConical, History, Maximize2, ThumbsUp, ThumbsDown, MessageSquare, Star, Share2, HelpCircle } from 'lucide-react';
import { getSession, submitAnswer, getQuestionsFromBank } from '../api/interviewApi';
import api from '../api/client';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const TypingIndicator = () => (
    <div className="flex gap-1.5 p-3 px-4 bg-muted/30 rounded-2xl w-fit animate-pulse border border-border/20">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"></div>
    </div>
);

const ChatAvatar = ({ type }) => (
    <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
        type === 'user' ? "bg-primary text-primary-foreground border-primary/20" : "bg-card text-primary border-border"
    )}>
        {type === 'user' ? <User size={14} /> : <Bot size={14} />}
    </div>
);

const MockInterview = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [code, setCode] = useState('// Your code here');
    const [language, setLanguage] = useState('javascript');
    const [userInput, setUserInput] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isCodingMode, setIsCodingMode] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(1800);
    const [showSkipModal, setShowSkipModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedPastQuestion, setSelectedPastQuestion] = useState(null);
    const { theme } = useTheme();
    const scrollAreaRef = useRef(null);
    const isFinished = chatHistory.some(m => m.isFinal);

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
                    const completedCount = sessionData.data.session.completedQuestions;
                    const allQuestions = sessionData.data.questions;
                    
                    let history = [];
                    
                    if (completedCount === 0) {
                        history = [{ type: 'ai', text: allQuestions[0].text, timestamp: allQuestions[0].createdAt, isQuestion: true }];
                    } else if (completedCount < allQuestions.length) {
                        const prevQ = allQuestions[completedCount - 1];
                        history.push({ type: 'ai', text: prevQ.text, timestamp: prevQ.createdAt, isQuestion: true });
                        history.push({ type: 'user', text: prevQ.answer === '__SKIPPED__' ? '[Question Skipped]' : prevQ.answer, timestamp: prevQ.createdAt });
                        if (prevQ.feedback) {
                            history.push({ type: 'ai', text: prevQ.feedback.analysis, timestamp: prevQ.createdAt, isFeedback: true, score: prevQ.feedback.score });
                        }
                        const curQ = allQuestions[completedCount];
                        history.push({ type: 'ai', text: curQ.text, timestamp: curQ.createdAt, isQuestion: true });
                    } else {
                         const prevQ = allQuestions[allQuestions.length - 1];
                         history.push({ type: 'ai', text: prevQ.text, timestamp: prevQ.createdAt, isQuestion: true });
                         history.push({ type: 'user', text: prevQ.answer === '__SKIPPED__' ? '[Question Skipped]' : prevQ.answer, timestamp: prevQ.createdAt });
                         if (prevQ.feedback) {
                              history.push({ type: 'ai', text: prevQ.feedback.analysis, timestamp: prevQ.createdAt, isFeedback: true, score: prevQ.feedback.score });
                         }
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

    useEffect(() => {
        if (questions[currentQuestionIndex]) {
            setIsCodingMode(questions[currentQuestionIndex].type === 'Coding');
            if (questions[currentQuestionIndex].type === 'Coding') {
                setCode(questions[currentQuestionIndex].codeTemplate || '// Start coding here...');
            } else {
                setAnswer('');
            }
        }
    }, [currentQuestionIndex, questions]);

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Compiling and running...\n');
        
        try {
            const res = await api.post('/code/execute', {
                language,
                code,
                input: userInput
            });

            if (res.data.success) {
                const { stdout, stderr, output: fullOutput } = res.data.data;
                const timestamp = new Date().toLocaleTimeString();
                
                let simulatedOutput = `> [Success] Code executed successfully!\n> ${timestamp}\n`;
                if (stdout) simulatedOutput += `\nSTDOUT:\n${stdout}`;
                if (stderr) simulatedOutput += `\nSTDERR:\n${stderr}`;
                if (!stdout && !stderr) simulatedOutput += `\n(No output produced)`;
                
                setOutput(simulatedOutput);
            } else {
                setOutput(`> [Error] ${res.data.message}`);
            }
        } catch (err) {
            setOutput(`> [Error] Failed to connect to execution engine. ${err.response?.data?.message || err.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSkip = async () => {
        if (submitting) return;
        setShowSkipModal(false);
        setSubmitting(true);

        const currentQuestion = questions[currentQuestionIndex];
        const userMsg = { 
            type: 'user', 
            text: '[Question Skipped]', 
            timestamp: new Date(),
            id: Date.now() + '-user'
        };
        
        setChatHistory(prev => [...prev, userMsg]);

        try {
            const res = await submitAnswer(sessionId, {
                questionId: currentQuestion._id,
                answer: '__SKIPPED__'
            });

            const evaluationData = res.data.feedback;
            
            setChatHistory(prev => [...prev, {
                type: 'ai',
                text: evaluationData.analysis,
                timestamp: new Date(),
                isFeedback: true,
                score: evaluationData.score,
                id: Date.now() + '-feedback'
            }]);

            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < session.totalQuestions) {
                // Fetch the updated session to get the next question (which might have been updated/created by backend)
                const res = await getSession(sessionId);
                const updatedSessionData = res.data;
                const nextQ = updatedSessionData.questions[nextIndex];
                
                if (nextQ) {
                    setChatHistory(prev => [...prev, {
                        type: 'ai',
                        text: nextQ.text,
                        timestamp: new Date(),
                        isQuestion: true,
                        id: nextQ._id
                    }]);
                    
                    setQuestions(updatedSessionData.questions);
                    setCurrentQuestionIndex(nextIndex);
                    setSession(updatedSessionData.session);
                }
            } else {
                setChatHistory(prev => [...prev, {
                    type: 'ai',
                    text: "That was the last question! You've completed the interview session.",
                    timestamp: new Date(),
                    isFinal: true,
                    id: 'final-msg'
                }]);
                setQuestions(prev => {
                    const updated = [...prev];
                    updated[currentQuestionIndex].answer = '__SKIPPED__';
                    updated[currentQuestionIndex].feedback = evaluationData;
                    return updated;
                });
                setCurrentQuestionIndex(nextIndex);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to skip question');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e, customAnswer = null) => {
        e.preventDefault();
        const finalAnswer = customAnswer || answer;
        if (!finalAnswer.trim() && !isCodingMode) return;
        if (submitting) return;

        const currentQuestion = questions[currentQuestionIndex];
        const submittedAnswer = isCodingMode && !customAnswer ? `CODE SUBMITTED:\n\`\`\`${language}\n${code}\n\`\`\`\n\nEXPLANATION:\n${answer}` : finalAnswer;
        
        setAnswer('');
        setSubmitting(true);

        const userMsg = { 
            type: 'user', 
            text: submittedAnswer, 
            timestamp: new Date(),
            id: Date.now() + '-user'
        };
        
        // We only show the current interaction for clarity in the main view
        // But we keep history in the full scroll
        setChatHistory(prev => [...prev, userMsg]);

        try {
            const token = localStorage.getItem('accessToken');
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/sessions/${sessionId}/answer-stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    questionId: currentQuestion._id,
                    answer: submittedAnswer
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || 'Failed to submit answer');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            let evaluationData = null;
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop(); // Keep the last partial event in the buffer

                for (const part of parts) {
                    const lines = part.split('\n');
                    let eventType = null;
                    let eventData = null;

                    for (const line of lines) {
                        if (line.startsWith('event: ')) {
                            eventType = line.replace('event: ', '').trim();
                        } else if (line.startsWith('data: ')) {
                            try {
                                eventData = JSON.parse(line.replace('data: ', '').trim());
                            } catch (e) {
                                console.error('Failed to parse SSE data:', e);
                            }
                        }
                    }

                    if (eventType && eventData) {
                        if (eventType === 'evaluation') {
                            evaluationData = eventData;
                            setChatHistory(prev => [...prev, {
                                type: 'ai',
                                text: eventData.analysis,
                                timestamp: new Date(),
                                isFeedback: true,
                                score: eventData.score,
                                id: Date.now() + '-feedback'
                            }]);
                        } else if (eventType === 'nextQuestion') {
                            setChatHistory(prev => [...prev, {
                                type: 'ai',
                                text: eventData.text,
                                timestamp: new Date(),
                                isQuestion: true,
                                id: eventData._id
                            }]);
                            
                            setQuestions(prev => {
                                const updated = [...prev];
                                updated[currentQuestionIndex].answer = submittedAnswer;
                                updated[currentQuestionIndex].feedback = evaluationData;
                                if (!updated.find(q => q._id === eventData._id)) {
                                    updated.push(eventData);
                                }
                                return updated;
                            });
                            setCurrentQuestionIndex(prev => prev + 1);
                        } else if (eventType === 'final') {
                            setChatHistory(prev => [...prev, {
                                type: 'ai',
                                text: "That was the last question! You've completed the interview session.",
                                timestamp: new Date(),
                                isFinal: true,
                                id: 'final-msg'
                            }]);
                            setQuestions(prev => {
                                const updated = [...prev];
                                updated[currentQuestionIndex].answer = submittedAnswer;
                                updated[currentQuestionIndex].feedback = evaluationData;
                                return updated;
                            });
                            setCurrentQuestionIndex(prev => prev + 1);
                        } else if (eventType === 'error') {
                            throw new Error(eventData.message || 'AI processing error');
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Submit stream error:', err);
            toast.error(err.message === 'Failed to fetch' ? 'Connection lost. Please try again.' : `Error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoToDashboardClick = () => {
        if (currentQuestionIndex >= questions.length) {
            navigate('/');
            return;
        }
        setShowExitModal(true);
    };

    const handleConfirmExit = async () => {
        setShowExitModal(false);
        setSubmitting(true);
        try {
            const remainingQuestions = questions.slice(currentQuestionIndex);
            for (const q of remainingQuestions) {
                await submitAnswer(sessionId, {
                    questionId: q._id,
                    answer: '__SKIPPED__'
                });
            }
        } catch (error) {
            console.error('Error skipping remaining questions:', error);
            toast.error('Could not save all remaining questions');
        } finally {
            setSubmitting(false);
            navigate(`/feedback/${sessionId}`);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreBorderColor = (score) => {
        if (score >= 7) return "border-l-green-500 bg-green-500/[0.03]";
        if (score >= 4) return "border-l-amber-500 bg-amber-500/[0.03]";
        return "border-l-destructive bg-destructive/[0.03]";
    };

    const getScoreBadgeClass = (score) => {
        if (score >= 7) return "bg-green-500/10 text-green-600 border-green-500/20";
        if (score >= 4) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
        return "bg-destructive/10 text-destructive border-destructive/20";
    };

    if (loading) return <LoadingSpinner fullPage message="Preparing your interview session..." />;

    return (
        <div className={cn(
            "mx-auto transition-all duration-500 ease-in-out",
            isCodingMode ? "w-full max-w-none h-screen px-0 py-0" : "container max-w-7xl px-4 py-8 h-[calc(100vh-64px)]"
        )}>
            <Card className={cn(
                "grid h-full overflow-hidden border-border/50 shadow-2xl transition-all duration-500",
                !isCodingMode && "lg:grid-cols-[280px_1fr] rounded-3xl",
                isCodingMode && (sidebarCollapsed ? "lg:grid-cols-[64px_1fr]" : "lg:grid-cols-[260px_1fr] rounded-none border-none")
            )}>
                {/* Sidebar */}
                <aside className={cn(
                    "border-r border-border/50 bg-muted/20 flex flex-col h-full overflow-hidden transition-all duration-500 relative",
                    sidebarCollapsed ? "w-[64px]" : "w-[260px]"
                )}>
                    {/* Collapse Toggle */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-border/80 border border-border hover:bg-primary hover:text-primary-foreground shadow-md transition-all scale-0 group-hover:scale-100 lg:scale-100"
                    >
                        <ChevronLeft size={14} className={cn("transition-transform duration-500", sidebarCollapsed && "rotate-180")} />
                    </Button>

                    <div className={cn("p-6 border-b border-border/50 flex items-center justify-between transition-all", sidebarCollapsed && "px-3")}>
                        {!sidebarCollapsed ? (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleGoToDashboardClick} 
                                disabled={submitting}
                                className="w-full justify-start gap-2 hover:bg-background/80 transition-all font-medium"
                            >
                                <ChevronLeft size={16} /> Dashboard
                            </Button>
                        ) : (
                            <Button variant="ghost" size="icon" onClick={handleGoToDashboardClick} className="mx-auto"><LayoutGrid size={20} /></Button>
                        )}
                    </div>
                    {!sidebarCollapsed ? (
                        <>
                            <div className="p-6 space-y-8">
                                <div className="grid gap-5">
                                    <div className="p-4 bg-background/40 rounded-xl border border-border/40 space-y-1 shadow-sm">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                                            <Timer size={14} className="text-primary" /> Time Remaining
                                        </div>
                                        <p className="text-2xl font-bold tracking-tight text-primary/90">{formatTime(timeLeft)}</p>
                                    </div>
                                    <div className="p-4 bg-background/40 rounded-xl border border-border/40 space-y-3 shadow-sm">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                                            <Award size={14} className="text-primary" /> Progress
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-end justify-between">
                                                <p className="text-xl font-bold tracking-tight">
                                                    {isFinished ? 'Completed' : `${currentQuestionIndex} / ${questions.length}`}
                                                </p>
                                                <p className="text-[10px] font-semibold text-muted-foreground mb-1">
                                                    {isFinished ? '100%' : `${((currentQuestionIndex / questions.length) * 100).toFixed(0)}%`}
                                                </p>
                                            </div>
                                            <Progress value={isFinished ? 100 : (currentQuestionIndex / questions.length) * 100} className="h-1.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em] opacity-70">Case Navigation</p>
                                        <LayoutGrid size={14} className="text-muted-foreground" />
                                    </div>
                                    <div className="grid grid-cols-4 gap-3 px-2">
                                        {questions.map((q, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => i < currentQuestionIndex ? setSelectedPastQuestion(i) : null}
                                                className={cn(
                                                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ring-offset-background",
                                                    (i === currentQuestionIndex && !isFinished) ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105 z-10" :
                                                    i < currentQuestionIndex ? (
                                                        `cursor-pointer hover:opacity-80 hover:scale-110 ${questions[i].answer === '__SKIPPED__' ? "bg-red-500/80 text-white" : (questions[i].answer ? "bg-green-500/80 text-white" : "bg-muted/50 text-muted-foreground")}`
                                                    ) : "bg-muted/30 text-muted-foreground/40 border border-border/50"
                                                )}
                                            >
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollArea>

                            <div className="p-6 pt-0 space-y-4">
                                {isFinished && (
                                    <Button 
                                        onClick={() => navigate(`/feedback/${sessionId}`)} 
                                        className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold shadow-lg shadow-primary/20 h-10 rounded-xl mb-2"
                                    >
                                        <Award size={18} className="mr-2" /> View Full Report
                                    </Button>
                                )}
                                <div className="grid grid-cols-2 gap-x-2 gap-y-2 p-4 bg-muted/20 rounded-2xl border border-border/40">
                                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-muted/50 border border-border/50" /> Not Visited
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Current
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Answered
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Skipped
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center py-8 gap-10">
                            <div className="flex flex-col items-center gap-6">
                                <Timer size={20} className="text-muted-foreground/40" />
                                <Progress value={isFinished ? 100 : (currentQuestionIndex / questions.length) * 100} className="w-10 h-1" orientation="vertical" />
                                <Award size={20} className="text-muted-foreground/40" />
                            </div>
                            <div className="flex flex-col gap-3">
                                {questions.map((q, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                                            (i === currentQuestionIndex && !isFinished) ? "bg-primary text-primary-foreground" :
                                            i < currentQuestionIndex ? (questions[i].answer === '__SKIPPED__' ? "bg-red-500/50" : "bg-green-500/50") : "bg-muted/30"
                                        )}
                                    >
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <div className={cn(
                    "flex-1 flex overflow-hidden bg-background/20 backdrop-blur-md",
                    isCodingMode ? "flex-row" : "flex-col"
                )}>
                    {/* Left Pane: Chat & Problem Description */}
                    <div className={cn(
                        "flex flex-col h-full overflow-hidden border-r border-border/40",
                        isCodingMode ? "w-[42%] min-w-[450px]" : "w-full"
                    )}>
                        <div className="px-4 py-2 border-b border-border/40 bg-muted/20 flex items-center justify-between shrink-0 h-11">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 gap-2 px-3 text-[11px] font-bold text-primary border-b-2 border-primary rounded-none hover:bg-transparent">
                                    <FileText size={14} /> DESCRIPTION
                                </Button>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-foreground">
                                    <Maximize2 size={14} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-foreground rotate-90">
                                    <LayoutGrid size={14} />
                                </Button>
                            </div>
                        </div>
                        <ScrollArea ref={scrollAreaRef} className="flex-1">
                            <div className="p-8 space-y-8 max-w-4xl mx-auto">
                                {/* Problem Description at top for Coding Mode */}
                                {isCodingMode && questions[currentQuestionIndex] && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold tracking-tight text-foreground/90 leading-tight">
                                                {currentQuestionIndex + 1}. {questions[currentQuestionIndex].title || "Problem Description"}
                                            </h2>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none font-bold text-[10px] px-2.5 py-0.5 rounded-full">Easy</Badge>
                                        </div>

                                        <div className="prose prose-invert max-w-none text-muted-foreground/90 leading-relaxed text-[15px] space-y-4">
                                            <div dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex].text }} className="whitespace-pre-wrap" />
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
                                    </div>
                                )}

                                <div className="space-y-8">
                                    {chatHistory
                                        .filter(msg => !(isCodingMode && questions[currentQuestionIndex] && msg.text === questions[currentQuestionIndex].text))
                                        .map((msg, i) => (
                                        <div key={msg.id || i} className={cn("flex w-full gap-3", msg.type === 'user' ? "flex-row-reverse" : "flex-row")}>
                                            <ChatAvatar type={msg.type} />
                                            <div className={cn("flex flex-col gap-2 max-w-[85%]", msg.type === 'user' ? "items-end" : "items-start")}>
                                                <Card className={cn(
                                                    "border-border/40 shadow-sm transition-all duration-300",
                                                    msg.type === 'user' ? "bg-primary text-primary-foreground border-none shadow-primary/20" : "bg-card/90",
                                                    msg.isFeedback && `border-l-4 ${getScoreBorderColor(msg.score)} shadow-md`,
                                                    msg.isQuestion && !isCodingMode && "border-primary/20 bg-primary/[0.02]"
                                                )}>
                                                    <CardContent className="p-4 space-y-3">
                                                        <p className="leading-relaxed whitespace-pre-wrap text-[14px] font-medium tracking-tight">
                                                            {msg.text}
                                                        </p>
                                                        
                                                        {msg.isFeedback && (
                                                            <div className="flex items-center gap-3 pt-1">
                                                                <Badge variant="outline" className={cn("font-bold px-2.5 py-0.5 text-[10px]", getScoreBadgeClass(msg.score))}>
                                                                    Score: {msg.score}/10
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        {msg.isFinal && (
                                                            <Button size="sm" onClick={() => navigate(`/feedback/${sessionId}`)} className="w-full mt-2 bg-primary text-primary-foreground hover:opacity-90 font-bold shadow-lg shadow-primary/10 h-9">
                                                                Full Performance Report
                                                            </Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                                <span className="text-[10px] font-bold text-muted-foreground/50 px-1 uppercase tracking-tighter">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {submitting && (
                                        <div className="flex flex-row gap-3">
                                            <ChatAvatar type="ai" />
                                            <TypingIndicator />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>

                        {/* LeetCode Style Footer for Coding Mode */}

                        {/* Traditional Input for non-coding mode */}
                        {!isCodingMode && (
                            <div className="p-8 border-t border-border/40 bg-muted/20 backdrop-blur-sm shrink-0">
                                <div className="max-w-3xl mx-auto flex gap-4 items-end">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => setShowSkipModal(true)}
                                        disabled={submitting || currentQuestionIndex >= questions.length}
                                        className="h-[56px] w-[56px] shrink-0 border-destructive/10 bg-destructive/[0.02] text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 rounded-2xl transition-all duration-300 shadow-sm"
                                    >
                                        <XCircle size={26} strokeWidth={1.5} />
                                    </Button>
                                    
                                    <form onSubmit={(e) => handleSubmit(e)} className="relative flex-1 group">
                                        <textarea
                                            className="w-full bg-background/60 backdrop-blur-sm border border-border/40 rounded-2xl px-6 py-4 pr-16 text-base focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all duration-300 resize-none min-h-[56px] max-h-48 shadow-sm"
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
                                            className="absolute right-2.5 bottom-2.5 h-10 w-10 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300" 
                                            disabled={!answer.trim() || submitting || currentQuestionIndex >= questions.length}
                                            type="submit"
                                        >
                                            <Send size={18} />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Pane: Persistent Coding Interface */}
                    {isCodingMode && (
                        <div className="flex-1 flex flex-col h-full bg-slate-900/30 overflow-hidden animate-in slide-in-from-right-4 duration-500">
                            {/* Editor Toolbar */}
                            <div className="px-4 py-2 bg-muted/40 border-b border-border/40 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-widest">
                                        <Code size={14} strokeWidth={2.5} />
                                        Code
                                    </div>
                                    <div className="h-4 w-px bg-border/40" />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 gap-2 bg-background/20 border border-border/40 hover:bg-background/40 transition-all font-bold text-[11px] uppercase tracking-wider">
                                                {language.toUpperCase()}
                                                <ChevronRight size={14} className="rotate-90 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-48 bg-slate-900/95 backdrop-blur-xl border-border/40 p-1">
                                            <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
                                                <DropdownMenuRadioItem value="javascript" className="text-[11px] font-bold uppercase tracking-wider focus:bg-primary focus:text-primary-foreground cursor-pointer">Javascript</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="python" className="text-[11px] font-bold uppercase tracking-wider focus:bg-primary focus:text-primary-foreground cursor-pointer">Python</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="java" className="text-[11px] font-bold uppercase tracking-wider focus:bg-primary focus:text-primary-foreground cursor-pointer">Java</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="cpp" className="text-[11px] font-bold uppercase tracking-wider focus:bg-primary focus:text-primary-foreground cursor-pointer">C++</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="go" className="text-[11px] font-bold uppercase tracking-wider focus:bg-primary focus:text-primary-foreground cursor-pointer">Go</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="csharp" className="text-[11px] font-bold uppercase tracking-wider focus:bg-primary focus:text-primary-foreground cursor-pointer">C#</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost" onClick={handleRunCode} disabled={isRunning} className="h-8 text-[11px] font-bold gap-2 hover:bg-green-500/10 hover:text-green-500 transition-all text-foreground uppercase tracking-wider">
                                        {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                                        Run
                                    </Button>
                                </div>
                            </div>

                            {/* Monaco Editor Container */}
                            <div className="flex-1 min-h-0 border-b border-border/40">
                                <Editor
                                    height="100%"
                                    language={language}
                                    theme={theme === 'dark' ? "vs-dark" : "vs-light"}
                                    value={code}
                                    onChange={(val) => setCode(val)}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        roundedSelection: true,
                                        scrollBeyondLastLine: false,
                                        readOnly: submitting,
                                        automaticLayout: true,
                                        padding: { top: 16 },
                                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                                        fontLigatures: true,
                                        cursorSmoothCaretAnimation: "on",
                                        smoothScrolling: true,
                                        hideCursorInOverviewRuler: true,
                                        scrollbar: {
                                            vertical: 'visible',
                                            horizontal: 'visible',
                                            useShadows: false,
                                            verticalHasArrows: false,
                                            horizontalHasArrows: false,
                                            verticalScrollbarSize: 10,
                                            horizontalScrollbarSize: 10
                                        }
                                    }}
                                />
                            </div>

                            {/* Results & Console area */}
                            <div className="h-[240px] border-b border-border/40 bg-black/40 flex flex-col shrink-0">
                                <Tabs defaultValue="output" className="flex-1 flex flex-col overflow-hidden">
                                    <TabsList className="px-4 bg-muted/20 border-b border-border/40 flex items-center justify-start shrink-0 h-9 gap-4 bg-transparent rounded-none">
                                        <TabsTrigger value="output" className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all rounded-none bg-transparent shadow-none">Output</TabsTrigger>
                                        <TabsTrigger value="input" className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all rounded-none bg-transparent shadow-none">Input</TabsTrigger>
                                        <div className="flex-1" />
                                        <Terminal size={14} className="text-muted-foreground/40" />
                                    </TabsList>
                                    <TabsContent value="input" className="flex-1 m-0 p-0 overflow-hidden outline-none">
                                        <div className="flex flex-col h-full bg-muted/5">
                                            <div className="px-3 py-1 bg-black/20 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">stdin</div>
                                            <textarea
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                placeholder="Enter input..."
                                                className="flex-1 w-full bg-transparent p-3 text-[12px] font-mono text-slate-300 focus:outline-none resize-none placeholder:text-slate-700"
                                            />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="output" className="flex-1 m-0 p-0 overflow-hidden outline-none">
                                        <ScrollArea className="h-full p-4 bg-black/20">
                                            <pre className="text-[13px] font-mono leading-relaxed">
                                                {output ? (
                                                    <code className={output.includes('[Error]') ? 'text-red-400' : 'text-green-400'}>
                                                        {output}
                                                    </code>
                                                ) : (
                                                    <span className="text-slate-600 italic animate-pulse">Waiting for code execution...</span>
                                                )}
                                            </pre>
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Coding Mode Submit Area */}
                            <div className="p-6 bg-muted/30 backdrop-blur-sm shrink-0">
                                <div className="flex gap-4 items-end">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => setShowSkipModal(true)}
                                        disabled={submitting || currentQuestionIndex >= questions.length}
                                        className="h-[52px] w-[52px] shrink-0 border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 rounded-xl transition-all shadow-sm"
                                    >
                                        <XCircle size={24} strokeWidth={1.5} />
                                    </Button>
                                    
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit(e, `LANGUAGE: ${language}\n\nCODE:\n\`\`\`${language}\n${code}\n\`\`\`\n\nEXPLANATION:\n${answer}`);
                                    }} className="relative flex-1 group">
                                        <textarea
                                            className="w-full bg-background/80 border border-border/40 rounded-xl px-5 py-3.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none min-h-[52px] max-h-32 shadow-sm"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder="Explain your approach to submit code..."
                                            disabled={submitting || currentQuestionIndex >= questions.length}
                                            rows={1}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSubmit(e, `LANGUAGE: ${language}\n\nCODE:\n\`\`\`${language}\n${code}\n\`\`\`\n\nEXPLANATION:\n${answer}`);
                                                }
                                            }}
                                        />
                                        <Button 
                                            size="icon" 
                                            className="absolute right-2 bottom-2 h-9 w-9 rounded-lg shadow-md transition-all active:scale-95" 
                                            disabled={!answer.trim() || submitting || currentQuestionIndex >= questions.length}
                                            type="submit"
                                        >
                                            <Send size={16} />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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

            <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
                <DialogContent className="max-w-[400px]">
                    <DialogHeader className="space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <AlertCircle size={24} />
                        </div>
                        <DialogTitle className="text-center text-2xl">End Interview?</DialogTitle>
                        <DialogDescription className="text-center text-balance leading-relaxed">
                            Are you sure you want to exit? All remaining questions will be skipped, and your mock interview will be over.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-2 gap-3 sm:justify-center mt-4">
                        <Button variant="outline" onClick={() => setShowExitModal(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmExit}>Yes, End Interview</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={selectedPastQuestion !== null} onOpenChange={(open) => !open && setSelectedPastQuestion(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl border-b border-border/50 pb-4">
                            Review Question {selectedPastQuestion !== null ? selectedPastQuestion + 1 : ''}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedPastQuestion !== null && (
                        <div className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Question</h4>
                                <p className="text-foreground leading-relaxed font-semibold bg-muted/20 p-4 rounded-xl border border-border/40">
                                    {questions[selectedPastQuestion].text}
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Your Answer</h4>
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-sm font-medium italic text-primary/90">
                                    {questions[selectedPastQuestion].answer === '__SKIPPED__' ? '[Question Skipped]' : questions[selectedPastQuestion].answer}
                                </div>
                            </div>

                            {questions[selectedPastQuestion].feedback && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between pl-1">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Feedback</h4>
                                        <Badge variant="outline" className={getScoreBadgeClass(questions[selectedPastQuestion].feedback.score)}>
                                            Score: {questions[selectedPastQuestion].feedback.score}/10
                                        </Badge>
                                    </div>
                                    <div className="p-5 bg-card border border-border/50 shadow-sm rounded-xl text-sm leading-relaxed text-muted-foreground">
                                        <p>{questions[selectedPastQuestion].feedback.analysis}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MockInterview;
