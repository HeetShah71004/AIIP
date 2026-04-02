import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Timer, Award, CheckCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, XCircle, AlertCircle, LayoutGrid, User, Bot, Play, Code, Code2, Terminal, FileText, BookOpen, FlaskConical, History, ThumbsUp, ThumbsDown, MessageSquare, Star, Share2, HelpCircle, Maximize2, Minimize2, Mic, StopCircle, AudioLines, Settings2 } from 'lucide-react';
import { getSession, submitAnswer, getQuestionsFromBank, transcribeAudio } from '../api/interviewApi';
import api from '../api/client';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import DifficultyBadge from '../components/DifficultyBadge';
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
import { Panel, Group, Separator } from 'react-resizable-panels';

// Custom Resize Handle Component
const ResizeHandle = ({ direction = "horizontal", isDark }) => (
    <Separator 
        className={cn(
            "relative flex items-center justify-center transition-all duration-300 z-10",
            direction === "horizontal" ? "w-1 hover:w-1.5 cursor-col-resize" : "h-1 hover:h-1.5 cursor-row-resize",
            isDark ? "bg-[#121214]" : "bg-slate-200"
        )}
    >
        <div className={cn(
            "transition-all duration-300 pointer-events-none",
            direction === "horizontal" ? "w-[1.5px] h-10 rounded-full" : "h-[1.5px] w-10 rounded-full",
            isDark ? "bg-white/10 group-hover:bg-[#4d6bfe]" : "bg-slate-300 group-hover:bg-[#4d6bfe]"
        )} />
    </Separator>
);

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
    const [questionTimeStart, setQuestionTimeStart] = useState(null);
    const [questionsTimeSpent, setQuestionsTimeSpent] = useState({});
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
    const [expandedCards, setExpandedCards] = useState({});
    const [expandedCodeBlocks, setExpandedCodeBlocks] = useState({});
    
    const toggleCard = (idx) => {
        setExpandedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const toggleCodeBlock = (idx) => {
        setExpandedCodeBlocks(prev => ({ ...prev, [idx]: !prev[idx] }));
    };
    // UI layout state
    const [isFullscreenMode, setIsFullscreenMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [lastTranscript, setLastTranscript] = useState(null);
    const [speechLanguage, setSpeechLanguage] = useState('en-US');
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const scrollAreaRef = useRef(null);
    const textareaRef = useRef(null);
    const splitPaneRef = useRef(null);
    const leftPaneRef = useRef(null);
    const rightPaneRef = useRef(null);
    const interviewContainerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const mediaChunksRef = useRef([]);
    const mediaStreamRef = useRef(null);
    const recordingMimeTypeRef = useRef('audio/webm');
    const speechRecognitionRef = useRef(null);
    const browserTranscriptRef = useRef('');
    const canRecordAudio = typeof window !== 'undefined' && !!window.MediaRecorder && !!navigator.mediaDevices?.getUserMedia;
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    const languageToWebSpeech = (lang) => {
        if (lang === 'hi-IN') return 'hi-IN';
        return 'en-US';
    };
    const isFinished = chatHistory.some(m => m.isFinal);
    const shouldShowLiveFeedback = !isCodingMode || isFinished;
    const activeQuestion = questions[currentQuestionIndex];
    const questionPromptIndices = chatHistory.reduce((indices, msg, idx) => {
        if (msg.isQuestion) indices.push(idx);
        return indices;
    }, []);
    const currentPromptPointer = questionPromptIndices.length > 0
        ? Math.min(currentQuestionIndex, questionPromptIndices.length - 1)
        : -1;
    const currentQuestionStartIndex = currentPromptPointer >= 0 ? questionPromptIndices[currentPromptPointer] : -1;
    const nextQuestionStartIndex = currentPromptPointer >= 0
        ? (questionPromptIndices[currentPromptPointer + 1] ?? chatHistory.length)
        : chatHistory.length;
    const currentQuestionThread = currentQuestionStartIndex >= 0
        ? chatHistory.slice(currentQuestionStartIndex + 1, nextQuestionStartIndex)
        : [];
    const nonCodingMessages = currentQuestionThread
        .filter(msg => !msg.isQuestion)
        .filter(msg => shouldShowLiveFeedback || !msg.isFeedback);
    const rawQuestionTitle = (activeQuestion?.title || "").trim();
    const hasMeaningfulQuestionTitle = rawQuestionTitle.length > 0 && !/^(interview prompt|problem description|question)$/i.test(rawQuestionTitle);
    const displayQuestionNumber = Math.min(currentQuestionIndex + 1, Math.max(questions.length, 1));
    const getOrdinalWord = (n) => {
        const words = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
        if (n >= 1 && n <= words.length) return words[n - 1];
        return `${n}th`;
    };

    const stripHtml = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/gm, '').trim();
    };

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
                setQuestionTimeStart(Date.now());
            } catch (err) {
                toast.error('Failed to load session');
                navigate('/');
            }
        };
        fetchInitialData();
    }, [sessionId, navigate]);

    // Reset timer when question changes
    useEffect(() => {
        setQuestionTimeStart(Date.now());
    }, [currentQuestionIndex]);

    // Scroll to bottom of chat when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [chatHistory, submitting]);

    // Global session timer: Recalculate based on absolute session start time and penalties
    useEffect(() => {
        if (!session?.createdAt) {
            // Fallback for initial load before session data arrives
            const timer = setInterval(() => {
                setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }

        const updateTimer = () => {
            const sessionDuration = 1800; // 30 mins
            const createdTime = new Date(session.createdAt).getTime();
            const currentTime = Date.now();
            const elapsedSeconds = Math.floor((currentTime - createdTime) / 1000);
            const penalty = session.timePenalty || 0;
            const newTimeLeft = Math.max(0, sessionDuration - elapsedSeconds - penalty);
            setTimeLeft(newTimeLeft);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [session?.createdAt, session?.timePenalty]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreenMode(document.fullscreenElement === interviewContainerRef.current);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreenMode = async () => {
        try {
            if (!document.fullscreenElement && interviewContainerRef.current) {
                await interviewContainerRef.current.requestFullscreen();
            } else if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch (error) {
            toast.error('Fullscreen is not supported in this browser');
        }
    };



    useEffect(() => {
        if (questions[currentQuestionIndex]) {
            // Priority 1: Check overall session round type to force Theoretical UI for certain rounds
            const theoreticalRounds = ['Behavioral', 'Phone Screen', 'System Design'];
            const isForcedTheoretical = theoreticalRounds.includes(session?.interviewRound);
            
            // Priority 2: Check individual question type (fallback for general sessions)
            const codingTypes = ['Coding', 'Technical'];
            const isCodingType = codingTypes.includes(questions[currentQuestionIndex].type);
            
            // Set coding mode only if NOT forced theoretical AND is a coding type
            const isCoding = !isForcedTheoretical && isCodingType;
            setIsCodingMode(isCoding);
            
            if (isCoding) {
                setCode(questions[currentQuestionIndex].codeTemplate || '// Start coding here...');
                setOutput('');
                setUserInput('');
            } else {
                setAnswer('');
                setOutput('');
                setUserInput('');
                // Reset textarea height for conversational rounds
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                }
            }
        }
    }, [currentQuestionIndex, questions, session?.interviewRound]);

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }

            if (speechRecognitionRef.current) {
                try {
                    speechRecognitionRef.current.stop();
                } catch (_) {
                    // no-op
                }
                speechRecognitionRef.current = null;
            }

            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((track) => track.stop());
                mediaStreamRef.current = null;
            }
        };
    }, []);

    const handleStopRecording = () => {
        if (speechRecognitionRef.current) {
            try {
                speechRecognitionRef.current.stop();
            } catch (_) {
                // no-op
            }
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const handleToggleRecording = async () => {
        if (isTranscribing || submitting || currentQuestionIndex >= questions.length || isCodingMode) {
            return;
        }

        if (!canRecordAudio) {
            toast.error('Audio recording is not supported in this browser');
            return;
        }

        if (isRecording) {
            handleStopRecording();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            mediaChunksRef.current = [];
            browserTranscriptRef.current = '';

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = languageToWebSpeech(speechLanguage);
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onresult = (event) => {
                    let assembled = '';
                    for (let i = 0; i < event.results.length; i += 1) {
                        assembled += `${event.results[i][0]?.transcript || ''} `;
                    }
                    browserTranscriptRef.current = assembled.trim();
                };

                speechRecognitionRef.current = recognition;
                try {
                    recognition.start();
                } catch (_) {
                    // no-op
                }
            }

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            recordingMimeTypeRef.current = recorder.mimeType || mimeType || 'audio/webm';

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    mediaChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                setIsRecording(false);

                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach((track) => track.stop());
                    mediaStreamRef.current = null;
                }

                if (speechRecognitionRef.current) {
                    try {
                        speechRecognitionRef.current.stop();
                    } catch (_) {
                        // no-op
                    }
                }

                if (mediaChunksRef.current.length === 0) {
                    return;
                }

                const recordingMimeType = recordingMimeTypeRef.current || 'audio/webm';
                const audioBlob = new Blob(mediaChunksRef.current, { type: recordingMimeType });
                mediaChunksRef.current = [];
                setIsTranscribing(true);

                try {
                    const response = await transcribeAudio({
                        audioBlob,
                        language: speechLanguage,
                        diarize: true,
                        detectLanguage: false,
                        mimeType: recordingMimeType
                    });

                    const deepgramTranscript = response?.data?.transcript?.trim() || '';
                    const browserTranscript = browserTranscriptRef.current.trim();
                    const deepgramWordCount = (response?.data?.words || []).length;
                    const deepgramConfidence = typeof response?.data?.confidence === 'number' ? response.data.confidence : null;

                    let transcript = deepgramTranscript || browserTranscript;

                    const browserWordCount = browserTranscript ? browserTranscript.split(/\s+/).filter(Boolean).length : 0;
                    const deepgramLooksWeak = deepgramWordCount <= 1 || (deepgramConfidence !== null && deepgramConfidence < 0.35);
                    if (browserTranscript && deepgramLooksWeak && browserWordCount >= 3) {
                        transcript = browserTranscript;
                    }

                    if (!transcript) {
                        toast.error('No speech detected. Please try again.');
                        return;
                    }

                    setAnswer((prev) => {
                        const prefix = prev.trim().length ? `${prev.trim()} ` : '';
                        return `${prefix}${transcript}`;
                    });

                    setLastTranscript({
                        text: transcript,
                        confidence: response?.data?.confidence,
                        words: response?.data?.words || [],
                        speakerSegments: response?.data?.speakerSegments || []
                    });

                    toast.success('Transcript added to your answer');
                } catch (error) {
                    toast.error(error?.response?.data?.message || error.message || 'Speech-to-text failed');
                } finally {
                    setIsTranscribing(false);
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            toast.error('Microphone permission was denied or unavailable');
        }
    };

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
                
                let executionOutput = '';
                if (stdout) executionOutput += `${stdout}\n`;
                if (stderr) executionOutput += `[Error]\n${stderr}\n`;
                if (!stdout && !stderr && fullOutput) executionOutput += `${fullOutput}\n`;
                if (!stdout && !stderr && !fullOutput) executionOutput += `Process finished successfully. (No output produced)\n`;
                
                setOutput(executionOutput.trim());
            } else {
                setOutput(`[Error] ${res.data.message}`);
            }
        } catch (err) {
            setOutput(`[Error] Failed to connect to execution engine. ${err.response?.data?.message || err.message}`);
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
            const timeSpent = questionTimeStart ? Math.floor((Date.now() - questionTimeStart) / 1000) : 0;
            
            const res = await submitAnswer(sessionId, {
                questionId: currentQuestion._id,
                answer: '__SKIPPED__',
                timeSpent
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
        if (submitting || isTranscribing) return;

        const currentQuestion = questions[currentQuestionIndex];
        const submittedAnswer = isCodingMode && !customAnswer 
            ? `CODE SUBMITTED:\n\`\`\`${language}\n${code}\n\`\`\`\n\nEXECUTION OUTPUT:\n${output}\n\nEXPLANATION:\n${answer}` 
            : finalAnswer;
        
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
            const timeSpent = questionTimeStart ? Math.floor((Date.now() - questionTimeStart) / 1000) : 0;
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
                    answer: submittedAnswer,
                    timeSpent
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
                                id: eventData._id,
                                difficulty: eventData.difficulty,
                                timeLimit: eventData.timeLimit
                            }]);
                            
                            setQuestions(prev => {
                                const updated = [...prev];
                                updated[currentQuestionIndex].answer = submittedAnswer;
                                updated[currentQuestionIndex].feedback = evaluationData;
                                if (!updated.find(q => q._id === eventData._id)) {
                                    updated.push({
                                        ...eventData,
                                        difficulty: eventData.difficulty || 'Medium',
                                        timeLimit: eventData.timeLimit || 3
                                    });
                                }
                                return updated;
                            });
                            setCurrentQuestionIndex(prev => prev + 1);
                            setAnswer('');
                            setCode('// Your code here');
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
            "h-screen flex flex-col overflow-hidden transition-colors duration-300 font-inter",
            isDark ? "bg-[#121214]" : "bg-slate-50"
        )} ref={interviewContainerRef}>
            {/* Professional Header */}
            <header className={cn(
                "h-14 shrink-0 border-b flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300",
                isDark ? "bg-[#0a0a0b] border-white/[0.05] backdrop-blur-xl" : "bg-white/80 border-slate-200 backdrop-blur-xl shadow-sm"
            )}>
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleGoToDashboardClick}
                        className={cn(
                            "rounded-full hover:scale-105 transition-all text-muted-foreground",
                            isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
                        )}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-1.5 transition-all hover:scale-[1.02]">
                        <span className="text-xl font-black tracking-tighter text-[#4d6bfe]">Mock</span>
                        <div className={cn(
                            "px-2 py-0.5 rounded-lg transform -rotate-2",
                            isDark ? "bg-zinc-100 text-zinc-900" : "bg-[#4d6bfe] text-white"
                        )}>
                            <span className="text-sm font-extrabold uppercase">INTERVIEW</span>
                        </div>
                    </div>
                </div>

                {/* Centered Indicators */}
                {!isFinished && (
                    <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2">
                                <Timer size={13} className="text-[#4d6bfe]" />
                                <span className={cn("text-sm font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Time Remaining</p>
                        </div>
                        <div className="h-8 w-px bg-border/40" />
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                                    {currentQuestionIndex + 1} / {questions.length}
                                </span>
                                <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-1.5 w-16" />
                            </div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Progress</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {isFinished && (
                        <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => navigate(`/feedback/${sessionId}`)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 h-9 shadow-lg shadow-emerald-600/20"
                        >
                            <Award size={16} className="mr-2" /> View Report
                        </Button>
                    )}
                    <div className="h-8 w-px bg-border/40" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreenMode}
                        className="h-9 w-9 text-muted-foreground rounded-xl"
                    >
                        {document.fullscreenElement ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </Button>
                </div>
            </header>

            {/* Main Resizable Layout */}
            <main className="flex-1 overflow-hidden relative z-10 flex flex-col">
                {!isFinished ? (
                <div className="flex-1 overflow-hidden">
                    {isCodingMode ? (
                        <Group orientation="horizontal" className="h-full">
                            {/* Left Pane: Description & Chat (IDE Mode) */}
                            <Panel defaultSize={40} minSize={25} className="flex flex-col">
                                <Group orientation="vertical">
                                    <Panel defaultSize={50} minSize={20} className="flex flex-col overflow-hidden">
                                        <div className={cn(
                                            "h-10 px-4 border-b text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shrink-0 transition-colors duration-300",
                                            isDark ? "bg-[#252528] text-zinc-400 border-white/[0.05]" : "bg-slate-100 text-slate-500 border-slate-200"
                                        )}>
                                            <FileText size={14} className="text-[#4d6bfe]" />
                                            Problem Description
                                        </div>
                                        <ScrollArea className={cn(
                                            "flex-1 transition-colors duration-300",
                                            isDark ? "bg-[#1e1e20]" : "bg-white"
                                        )}>
                                            <div className="p-8 space-y-6 max-w-4xl mx-auto font-inter">
                                                <div className="flex items-center justify-between gap-4">
                                                    <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                                                        {questions[currentQuestionIndex]?.title || `Question ${currentQuestionIndex + 1}`}
                                                    </h2>
                                                    <DifficultyBadge difficulty={questions[currentQuestionIndex]?.difficulty || 'Medium'} />
                                                </div>
                                                <div className={cn(
                                                    "prose max-w-none leading-relaxed text-base",
                                                    isDark ? "prose-invert text-zinc-400" : "prose-slate text-slate-700"
                                                )}>
                                                    <div dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex]?.text }} />
                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </Panel>
                                    
                                    <ResizeHandle direction="vertical" isDark={isDark} />
                                    
                                    <Panel defaultSize={50} minSize={20} className="flex flex-col overflow-hidden">
                                        <div className={cn(
                                            "h-10 px-4 border-b text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shrink-0",
                                            isDark ? "bg-[#252528] text-zinc-400 border-white/[0.05]" : "bg-slate-100 text-slate-500 border-slate-200"
                                        )}>
                                            <MessageSquare size={14} className="text-[#4d6bfe]" />
                                            AI Interaction
                                        </div>
                                        <ScrollArea ref={scrollAreaRef} className={cn("flex-1", isDark ? "bg-[#1e1e20]" : "bg-slate-50/30")}>
                                            <div className="p-6 space-y-6">
                                                {currentQuestionThread.filter(msg => !msg.isQuestion).map((msg, idx) => (
                                                    <div key={idx} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2", msg.type === 'user' ? "flex-row-reverse" : "flex-row")}>
                                                        <ChatAvatar type={msg.type === 'bot' || msg.type === 'ai' ? 'bot' : 'user'} />
                                                        <div className={cn(
                                                            "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                                                            msg.type === 'user' ? "bg-[#4d6bfe] text-white rounded-tr-none" : "bg-card border rounded-tl-none"
                                                        )}>
                                                            <div className="whitespace-pre-wrap">{msg.text}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {submitting && <div className="flex gap-4"><ChatAvatar type="bot" /><TypingIndicator /></div>}
                                            </div>
                                        </ScrollArea>
                                    </Panel>
                                </Group>
                            </Panel>

                            <ResizeHandle isDark={isDark} />

                            {/* Right Pane: IDE & Console (IDE Mode) */}
                            <Panel defaultSize={60} minSize={30} className="flex flex-col">
                                <Group orientation="vertical">
                                    <Panel defaultSize={70} minSize={30} className="flex flex-col overflow-hidden">
                                        <div className={cn(
                                            "h-10 px-4 border-b text-[10px] font-bold uppercase tracking-widest flex items-center justify-between shrink-0",
                                            isDark ? "bg-[#252528] text-zinc-400 border-white/[0.05]" : "bg-slate-100 text-slate-500 border-slate-200"
                                        )}>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Code2 size={14} className="text-[#4d6bfe]" /> Editor
                                                </div>
                                                <div className="h-4 w-px bg-border/20" />
                                                <span className="opacity-60">{language}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={handleRunCode} disabled={isRunning} className="h-7 text-[10px] uppercase font-bold tracking-widest text-emerald-500 hover:text-emerald-400">
                                                {isRunning ? <Loader2 size={12} className="animate-spin mr-2" /> : <Play size={12} className="mr-2" fill="currentColor" />}
                                                Run
                                            </Button>
                                        </div>
                                        <div className="flex-1 relative">
                                            <Editor height="100%" language={language} theme={isDark ? "vs-dark" : "vs-light"} value={code} onChange={setCode} options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }} />
                                        </div>
                                    </Panel>

                                    <ResizeHandle direction="vertical" isDark={isDark} />

                                    <Panel defaultSize={30} minSize={15} className="flex flex-col overflow-hidden">
                                        <div className={cn(
                                            "h-10 px-4 border-b text-[10px] font-bold uppercase tracking-widest flex items-center justify-between shrink-0",
                                            isDark ? "bg-[#252528] text-zinc-400 border-white/[0.05]" : "bg-slate-100 text-slate-500 border-slate-200"
                                        )}>
                                            <div className="flex items-center gap-2"><Terminal size={14} className="text-[#4d6bfe]" /> Console</div>
                                        </div>
                                        <ScrollArea className={cn("flex-1 p-4 font-mono text-xs", isDark ? "bg-[#0a0a0b]" : "bg-slate-900 text-slate-300")}>
                                            {output ? <pre className={cn(output.includes('[Error]') ? "text-red-400" : "text-emerald-400")}>{output}</pre> : <div className="opacity-20 text-center py-8 font-bold uppercase tracking-widest text-[10px]">No output</div>}
                                        </ScrollArea>
                                        
                                        <div className={cn("p-4 border-t flex gap-3", isDark ? "bg-[#121214] border-white/5" : "bg-slate-50")}>
                                            <Button variant="outline" size="icon" onClick={() => setShowSkipModal(true)} disabled={submitting} className="h-10 w-10 shrink-0 border-destructive/20 bg-destructive/5 text-destructive rounded-xl hover:bg-destructive/10"><XCircle size={18} /></Button>
                                            <div className="relative flex-1 group">
                                                <textarea
                                                    className={cn("w-full rounded-xl px-4 py-2.5 pr-12 text-sm focus:outline-none transition-all resize-none min-h-[40px] max-h-32 border", isDark ? "bg-zinc-900 border-white/5 text-white focus:border-[#4d6bfe]/50" : "bg-white border-slate-200 focus:border-[#4d6bfe]/50")}
                                                    value={answer}
                                                    onChange={(e) => setAnswer(e.target.value)}
                                                    placeholder="Explain your approach..."
                                                    disabled={submitting}
                                                    rows={1}
                                                />
                                                <Button size="icon" onClick={handleSubmit} disabled={!answer.trim() || submitting} className="absolute right-1.5 bottom-1.5 h-7 w-7 rounded-lg bg-[#4d6bfe] shadow-md transition-all active:scale-95"><Send size={14} /></Button>
                                            </div>
                                        </div>
                                    </Panel>
                                </Group>
                            </Panel>
                        </Group>
                    ) : (
                        /* Theoretical Mode: Conversational Q&A (Non-Coding Mode) */
                        <div className={cn("h-full flex flex-col items-center py-12 px-6", isDark ? "bg-[#0a0a0b]" : "bg-slate-50/50")}>
                            <div className="w-full max-w-4xl flex-1 flex flex-col gap-10">
                                {/* Question Section */}
                                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Badge className="bg-[#4d6bfe]/10 text-[#4d6bfe] border-[#4d6bfe]/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                                            Theoretical Assessment
                                        </Badge>
                                        <DifficultyBadge difficulty={questions[currentQuestionIndex]?.difficulty || 'Medium'} />
                                    </div>
                                    <Card className={cn(
                                        "border-none shadow-2xl rounded-3xl overflow-hidden transition-all duration-500",
                                        isDark ? "bg-[#18181b]/80 border-white/5" : "bg-white"
                                    )}>
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="text-3xl font-black tracking-tight leading-tight uppercase">
                                                Question {currentQuestionIndex + 1}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <div className={cn(
                                                "text-lg lg:text-xl font-medium leading-relaxed opacity-80",
                                                isDark ? "text-zinc-300" : "text-slate-700"
                                            )} dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex]?.text }} />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Conversational History for Current Question */}
                                <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
                                    <div className="space-y-8 pb-8 font-inter">
                                        {currentQuestionThread.filter(msg => !msg.isQuestion).map((msg, idx) => (
                                            <div key={idx} className={cn(
                                                "flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                                msg.type === 'user' ? "flex-row-reverse" : "flex-row"
                                            )}>
                                                <div className="shrink-0 group">
                                                    <ChatAvatar type={msg.type === 'bot' || msg.type === 'ai' ? 'bot' : 'user'} />
                                                </div>
                                                <div className={cn(
                                                    "max-w-[75%] rounded-[2.5rem] p-6 lg:p-8 text-base lg:text-lg leading-relaxed shadow-xl transition-all hover:scale-[1.01]",
                                                    msg.type === 'user' 
                                                        ? "bg-gradient-to-br from-[#4d6bfe] to-[#3b55d1] text-white rounded-tr-none" 
                                                        : (isDark ? "bg-[#1e1e20] border border-white/5 text-zinc-100 rounded-tl-none" : "bg-white border border-slate-100 text-slate-800 rounded-tl-none")
                                                )}>
                                                    <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                                                    {msg.isFeedback && msg.score !== undefined && (
                                                        <div className="mt-6 pt-6 border-t border-current/10 flex items-center gap-4">
                                                            <Badge className={cn(
                                                                "px-4 py-2 rounded-xl text-xs font-black shadow-lg",
                                                                msg.score >= 7 ? "bg-emerald-500 text-white" : msg.score >= 4 ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                                                            )}>
                                                                AI ANALYSIS: {msg.score}/10
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {submitting && (
                                            <div className="flex gap-6 animate-in fade-in duration-300">
                                                <ChatAvatar type="bot" />
                                                <div className="flex items-center gap-2 px-8 py-5 bg-muted/40 rounded-full">
                                                    <Loader2 className="h-5 w-5 animate-spin text-[#4d6bfe]" />
                                                    <span className="text-sm font-black uppercase tracking-widest opacity-40">AI is evaluating...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                {/* Unified Input Bar (Theoretical Mode) */}
                                <div className="animate-in slide-in-from-bottom-8 duration-700">
                                    <div className={cn(
                                        "p-2 rounded-[2.5rem] shadow-2xl transition-all duration-500 border group",
                                        "shadow-[0_0_25px_-5px_rgba(77,107,254,0.05)] focus-within:shadow-[0_0_50px_-12px_rgba(77,107,254,0.3)]",
                                        isDark ? "bg-[#18181b]/90 border-white/5 focus-within:border-[#4d6bfe]/40" : "bg-white border-slate-200 focus-within:border-[#4d6bfe]/30"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleToggleRecording}
                                                className={cn(
                                                    "h-14 w-14 rounded-full transition-all shrink-0",
                                                    isRecording ? "bg-red-500 text-white animate-pulse hover:bg-red-600 scale-110" : "hover:bg-teal-50 hover:text-teal-600"
                                                )}
                                                disabled={isTranscribing || submitting}
                                            >
                                                {isRecording ? <StopCircle size={24} /> : (isTranscribing ? <Loader2 size={24} className="animate-spin" /> : <Mic size={24} />)}
                                            </Button>

                                            <div className="h-8 w-px bg-border/50 mx-1" />

                                            <textarea
                                                ref={textareaRef}
                                                className={cn(
                                                    "flex-1 bg-transparent border-none py-4 px-4 text-lg focus:ring-0 focus:outline-none resize-none max-h-72 font-medium transition-all duration-300",
                                                    "scrollbar-thin scrollbar-thumb-[#4d6bfe]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#4d6bfe]/40",
                                                    isDark ? "text-white placeholder:text-zinc-600" : "text-slate-900 placeholder:text-slate-400"
                                                )}
                                                rows={1}
                                                value={answer}
                                                onChange={(e) => {
                                                    setAnswer(e.target.value);
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                                placeholder={isRecording ? "Listening to your thoughts..." : "Share your detailed response here..."}
                                                disabled={submitting || isTranscribing}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSubmit(e);
                                                    }
                                                }}
                                            />

                                            <div className="flex items-center gap-2 pr-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (answer.length > 0) {
                                                            setAnswer('');
                                                            const textarea = document.querySelector('textarea');
                                                            if (textarea) textarea.style.height = 'auto';
                                                        } else {
                                                            setShowSkipModal(true);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "h-14 w-14 rounded-full transition-all shrink-0 animate-in fade-in zoom-in duration-300",
                                                        answer.length > 0 
                                                            ? "hover:bg-red-50 hover:text-red-500 text-muted-foreground/30" 
                                                            : "hover:bg-muted text-muted-foreground/30"
                                                    )}
                                                    disabled={submitting}
                                                    title={answer.length > 0 ? "Clear Answer" : "Skip Question"}
                                                >
                                                    <XCircle size={22} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    onClick={handleSubmit}
                                                    disabled={(!answer.trim() && !isRecording) || submitting || isTranscribing}
                                                    className={cn(
                                                        "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 shrink-0",
                                                        (answer.trim() || isRecording) && !submitting
                                                            ? "bg-gradient-to-tr from-[#4d6bfe] to-[#3b55d1] hover:shadow-[#4d6bfe]/40 text-white hover:scale-105" 
                                                            : (isDark ? "bg-[#1e1e20] text-zinc-700" : "bg-slate-100 text-slate-300")
                                                    )}
                                                >
                                                    {submitting ? (
                                                        <Loader2 size={24} className="animate-spin" />
                                                    ) : (
                                                        <Send size={24} className={answer.trim() ? "translate-x-0.5 transition-transform" : ""} />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center mt-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                                            <FlaskConical size={12} />
                                            AI-Powered Assessment Environment
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                ) : (
                    <ScrollArea className={cn(
                        "flex-1 overflow-y-auto px-6 py-12 transition-colors duration-300",
                        isDark ? "bg-[#0a0a0b]" : "bg-slate-50/50"
                    )}>
                        <div className="max-w-[1400px] mx-auto space-y-12">
                            <div className="text-center space-y-4 mb-16">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4d6bfe]/10 text-[#4d6bfe] border border-[#4d6bfe]/20 text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <Award size={14} />
                                    Interview Complete
                                </div>
                                <h1 className={cn("text-4xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>Performance Summary</h1>
                                <p className="text-muted-foreground max-w-2xl mx-auto">Great work! Here's a comprehensive breakdown of your performance across all interview rounds. Review the AI analysis to improve your coding and problem-solving skills.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {questions.map((q, idx) => {
                                    const isExpanded = !!expandedCards[idx];
                                    return (
                                        <Card 
                                            key={idx} 
                                            onClick={() => toggleCard(idx)}
                                            className={cn(
                                                "overflow-hidden border-none shadow-xl transition-all duration-500 cursor-pointer group hover:scale-[1.01] flex flex-col",
                                                isDark ? "bg-[#18181b]/50 hover:bg-[#18181b]/80" : "bg-white hover:shadow-2xl",
                                                isExpanded ? "md:col-span-2 lg:col-span-3" : "col-span-1"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-6 flex items-center justify-between border-b transition-colors duration-300",
                                                isDark ? "bg-[#252528]/30 border-white/[0.03]" : "bg-slate-50 border-slate-100",
                                                isExpanded && "bg-[#4d6bfe]/5"
                                            )}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#4d6bfe] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#4d6bfe]/20">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className={cn("text-lg font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                                                            Question {idx + 1}
                                                            {isExpanded ? <ChevronUp size={16} className="text-[#4d6bfe]" /> : <ChevronDown size={16} className="text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <DifficultyBadge difficulty={q.difficulty || 'Medium'} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {q.feedback && (
                                                        <Badge className={cn(
                                                            "px-4 py-2 rounded-xl text-lg font-black shadow-lg",
                                                            q.feedback.score >= 7 ? "bg-emerald-500 text-white shadow-emerald-500/20" : 
                                                            q.feedback.score >= 4 ? "bg-amber-500 text-white shadow-amber-500/20" : 
                                                            "bg-red-500 text-white shadow-red-500/20"
                                                        )}>
                                                            {q.feedback.score}/10
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {!isExpanded ? (
                                                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                                    <div className={cn(
                                                        "text-sm leading-relaxed line-clamp-3",
                                                        isDark ? "text-zinc-400" : "text-slate-600"
                                                    )}>
                                                        {stripHtml(q.text)}
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-border/10">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#4d6bfe] opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                            Details <ChevronRight size={10} />
                                                        </span>
                                                        <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest border-[#4d6bfe]/20 text-[#4d6bfe]/70 bg-[#4d6bfe]/5">
                                                            {q.type === 'Coding' ? 'Coding Round' : 'Theoretical Round'}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            ) : (
                                                <CardContent className="p-8 space-y-10 animate-in fade-in zoom-in-95 duration-500 origin-top">
                                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                                        <div className="space-y-8">
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                                    <FileText size={14} className="text-[#4d6bfe]" />
                                                                    Context & Question
                                                                </h4>
                                                                <div className={cn(
                                                                    "p-6 rounded-2xl text-sm leading-relaxed border",
                                                                    isDark ? "bg-zinc-900 border-white/5 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-700"
                                                                )}>
                                                                    <div dangerouslySetInnerHTML={{ __html: q.text }} />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                                        <User size={14} className="text-[#4d6bfe]" />
                                                                        Your Response
                                                                    </h4>
                                                                    {q.answer !== '__SKIPPED__' && q.answer.length > 300 && (
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm" 
                                                                            onClick={(e) => { e.stopPropagation(); toggleCodeBlock(idx); }}
                                                                            className="h-6 text-[10px] font-bold uppercase tracking-widest text-[#4d6bfe] hover:bg-[#4d6bfe]/10"
                                                                        >
                                                                            {expandedCodeBlocks[idx] ? "Collapse Code" : "Expand Full Code"}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                                <div className={cn(
                                                                    "relative rounded-2xl border shadow-inner transition-all duration-500 overflow-hidden",
                                                                    isDark ? "bg-zinc-950/80 border-white/5 text-emerald-400 font-mono" : "bg-slate-900 text-emerald-400 font-mono",
                                                                    !expandedCodeBlocks[idx] && q.answer !== '__SKIPPED__' && q.answer.length > 300 ? "max-h-[300px]" : "max-h-none"
                                                                )}>
                                                                    <pre className="p-6 whitespace-pre-wrap break-all text-sm leading-relaxed">{q.answer === '__SKIPPED__' ? '[Question Skipped]' : q.answer}</pre>
                                                                    
                                                                    {!expandedCodeBlocks[idx] && q.answer !== '__SKIPPED__' && q.answer.length > 300 && (
                                                                        <div className={cn(
                                                                            "absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center pb-4",
                                                                            isDark ? "bg-gradient-to-t from-zinc-950/90 to-transparent" : "bg-gradient-to-t from-slate-900/90 to-transparent"
                                                                        )}>
                                                                            <Button 
                                                                                variant="secondary" 
                                                                                size="sm" 
                                                                                onClick={(e) => { e.stopPropagation(); toggleCodeBlock(idx); }}
                                                                                className="rounded-full shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[10px] font-bold uppercase tracking-widest px-6"
                                                                            >
                                                                                Show More
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-8">
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                                    <Bot size={14} className="text-[#4d6bfe]" />
                                                                    AI Performance Analysis
                                                                </h4>
                                                                <div className={cn(
                                                                    "p-8 rounded-3xl text-base leading-relaxed border relative overflow-hidden h-full min-h-[300px]",
                                                                    isDark ? "bg-[#4d6bfe]/5 border-[#4d6bfe]/20 text-white" : "bg-[#4d6bfe]/5 border-[#4d6bfe]/10 text-slate-800"
                                                                )}>
                                                                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#4d6bfe]/10 blur-[80px] rounded-full -mr-24 -mt-24" />
                                                                    <p className="relative z-10">{q.feedback ? q.feedback.analysis : "No assessment available for this round."}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-8 border-t border-border/40 flex items-center justify-center">
                                                        <Button 
                                                            variant="outline" 
                                                            className="rounded-full gap-2 px-8 h-12 border-border/60 hover:bg-[#4d6bfe]/10 hover:text-[#4d6bfe] hover:border-[#4d6bfe]/30 transition-all active:scale-95"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/feedback/${sessionId}`);
                                                            }}
                                                        >
                                                            <Share2 size={18} />
                                                            View Detailed Global Feedback
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                            
                            <div className="text-center pt-20 pb-12">
                                <Button 
                                    size="lg" 
                                    className="bg-[#4d6bfe] hover:bg-[#3b55d1] text-white px-12 py-7 text-lg font-black rounded-2xl shadow-2xl shadow-[#4d6bfe]/30 transform transition-all hover:scale-105 active:scale-95"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    BACK TO DASHBOARD
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </main>

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
