import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Timer, Award, CheckCircle, ChevronLeft, Loader2, XCircle, AlertCircle, LayoutGrid, User, Bot, Play, Code2, Terminal } from 'lucide-react';
import { getSession, submitAnswer, getQuestionsFromBank } from '../api/interviewApi';
import api from '../api/client';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import Editor from '@monaco-editor/react';
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
    const [selectedPastQuestion, setSelectedPastQuestion] = useState(null);
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
        <div className="container max-w-7xl mx-auto px-4 py-10 h-[calc(100vh-40px)]">
            <Card className="grid h-full lg:grid-cols-[320px_1fr] overflow-hidden border-border/50 shadow-2xl">
                {/* Sidebar */}
                <aside className="border-r border-border/50 bg-muted/20 flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-border/50 space-y-8">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleGoToDashboardClick} 
                            disabled={submitting}
                            className="w-full justify-start gap-2 hover:bg-background/80 transition-all font-medium"
                        >
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
                                        <p className="text-2xl font-bold tracking-tight">
                                            {isFinished ? 'Completed' : `${currentQuestionIndex} / ${questions.length}`}
                                        </p>
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                                            {isFinished ? '100%' : `${((currentQuestionIndex / questions.length) * 100).toFixed(0)}%`}
                                        </p>
                                    </div>
                                    <Progress value={isFinished ? 100 : (currentQuestionIndex / questions.length) * 100} className="h-2" />
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
                                        onClick={() => i < currentQuestionIndex ? setSelectedPastQuestion(i) : null}
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ring-offset-background",
                                            (i === currentQuestionIndex && !isFinished) ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 z-10" :
                                            i < currentQuestionIndex ? (
                                                `cursor-pointer hover:opacity-80 hover:scale-110 ${questions[i].answer === '__SKIPPED__' ? "bg-red-500 text-white" : (questions[i].answer ? "bg-green-500 text-white" : "bg-muted/50 text-muted-foreground")}`
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
                        {isFinished && (
                            <Button 
                                onClick={() => navigate(`/feedback/${sessionId}`)} 
                                className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold shadow-lg shadow-primary/20 h-11 rounded-xl mb-2"
                            >
                                <Award size={18} className="mr-2" /> View Full Report
                            </Button>
                        )}
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
                                <div key={msg.id || i} className={cn("flex w-full gap-3", msg.type === 'user' ? "flex-row-reverse" : "flex-row")}>
                                    <ChatAvatar type={msg.type} />
                                    <div className={cn("flex flex-col gap-1.5 max-w-[80%]", msg.type === 'user' ? "items-end" : "items-start")}>
                                        <Card className={cn(
                                            "border-border/40 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-500",
                                            msg.type === 'user' ? "bg-primary text-primary-foreground border-none" : "bg-card/90",
                                            msg.isFeedback && `border-l-4 ${getScoreBorderColor(msg.score)} shadow-md`,
                                            msg.isQuestion && "border-primary/20 bg-primary/[0.02]"
                                        )}>
                                            <CardContent className="p-4 space-y-3">
                                                <p className="leading-relaxed whitespace-pre-wrap text-[14.5px] font-medium tracking-tight">
                                                    {msg.text}
                                                </p>
                                                
                                                {msg.isFeedback && (
                                                    <div className="flex items-center gap-3 pt-1">
                                                        <Badge variant="outline" className={cn("font-bold px-2.5 py-0.5 text-[11px]", getScoreBadgeClass(msg.score))}>
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
                                        <span className="text-[10px] font-bold text-muted-foreground/60 px-1 uppercase tracking-tighter">
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

                            {isCodingMode && (
                                <Card className="border-border/60 shadow-xl overflow-hidden mt-6 animate-in zoom-in-95 duration-300">
                                    <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                            </div>
                                            <Badge variant="secondary" className="px-2 py-0 h-5 text-[10px] font-mono">
                                                {language.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select 
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="bg-background/20 text-xs border-none rounded px-2 h-7 focus:ring-0 cursor-pointer hover:bg-background/40 transition-colors"
                                            >
                                                <option value="javascript">JavaScript</option>
                                                <option value="python">Python</option>
                                                <option value="java">Java</option>
                                                <option value="cpp">C++</option>
                                            </select>
                                            <Button size="sm" onClick={handleRunCode} disabled={isRunning} className="h-7 bg-green-600 hover:bg-green-700 text-white gap-1.5 px-3">
                                                {isRunning ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Play size={14} fill="currentColor" />}
                                                Run
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                onClick={() => {
                                                    const explanationArea = document.querySelector('textarea[placeholder*="explanation"]');
                                                    if (explanationArea) {
                                                        explanationArea.focus();
                                                        explanationArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        toast('Please provide a brief explanation of your logic to submit.', { icon: '📝' });
                                                    }
                                                }} 
                                                disabled={submitting} 
                                                className="h-7 bg-primary hover:opacity-90 text-primary-foreground gap-1.5 px-3 shadow-lg shadow-primary/20"
                                            >
                                                <CheckCircle size={14} />
                                                Submit Answer
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="h-[400px] border-b border-white/10">
                                        <Editor
                                            height="100%"
                                            language={language}
                                            theme="vs-dark"
                                            value={code}
                                            onChange={(val) => setCode(val)}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineNumbers: 'on',
                                                roundedSelection: false,
                                                scrollBeyondLastLine: false,
                                                readOnly: submitting,
                                                automaticLayout: true,
                                                padding: { top: 16 }
                                            }}
                                        />
                                    </div>
                                    <div className="bg-slate-950 flex flex-col h-[200px] overflow-hidden">
                                        <div className="flex flex-1 overflow-hidden">
                                            {/* Input Area */}
                                            <div className="w-1/3 border-r border-white/10 flex flex-col">
                                                <div className="px-3 py-1 bg-slate-900 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Input (stdin)</span>
                                                    <Terminal size={10} className="text-slate-600" />
                                                </div>
                                                <textarea
                                                    value={userInput}
                                                    onChange={(e) => setUserInput(e.target.value)}
                                                    placeholder="Enter input here..."
                                                    className="flex-1 w-full bg-transparent p-3 text-xs font-mono text-slate-300 focus:outline-none resize-none placeholder:text-slate-700"
                                                />
                                            </div>
                                            
                                            {/* Output Area */}
                                            <div className="flex-1 flex flex-col bg-black/40">
                                                <div className="px-3 py-1 bg-slate-900 border-l border-white/5 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Output</span>
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                                    </div>
                                                </div>
                                                <ScrollArea className="flex-1 p-3">
                                                    <pre className="text-xs font-mono leading-relaxed">
                                                        {output ? (
                                                            <code className={output.includes('[Error]') ? 'text-red-400' : 'text-green-400'}>
                                                                {output}
                                                            </code>
                                                        ) : (
                                                            <span className="text-slate-700 italic">Click 'Run' to see results.</span>
                                                        )}
                                                    </pre>
                                                </ScrollArea>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
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
                            
                            <form onSubmit={(e) => {
                                if (isCodingMode) {
                                    e.preventDefault();
                                    // Wrap code in a message
                                    const codeMessage = `LANGUAGE: ${language}\n\nCODE:\n\`\`\`${language}\n${code}\n\`\`\`\n\nEXPLANATION:\n${answer}`;
                                    handleSubmit(e, codeMessage);
                                } else {
                                    handleSubmit(e);
                                }
                            }} className="relative flex-1 group">
                                <textarea
                                    className="w-full bg-background/60 backdrop-blur-sm border border-border/40 rounded-2xl px-6 py-4 pr-16 text-base focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all duration-300 resize-none min-h-[56px] max-h-48 shadow-sm group-hover:border-border/60"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder={isCodingMode ? "Add a brief explanation of your logic... (required)" : "Type your professional answer here..."}
                                    disabled={submitting || currentQuestionIndex >= questions.length}
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (isCodingMode) {
                                                const codeMessage = `LANGUAGE: ${language}\n\nCODE:\n\`\`\`${language}\n${code}\n\`\`\`\n\nEXPLANATION:\n${answer}`;
                                                handleSubmit(e, codeMessage);
                                            } else {
                                                handleSubmit(e);
                                            }
                                        }
                                    }}
                                />
                                <Button 
                                    size="icon" 
                                    className="absolute right-2.5 bottom-2.5 h-10 w-10 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95" 
                                    disabled={(!answer.trim() && !isCodingMode) || submitting || currentQuestionIndex >= questions.length}
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
