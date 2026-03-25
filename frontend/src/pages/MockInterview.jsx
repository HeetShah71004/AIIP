import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Timer, Award, CheckCircle, ChevronLeft, ChevronRight, Loader2, XCircle, AlertCircle, LayoutGrid, User, Bot, Play, Code, Code2, Terminal, FileText, BookOpen, FlaskConical, History, ThumbsUp, ThumbsDown, MessageSquare, Star, Share2, HelpCircle, Maximize2, Minimize2, Mic, StopCircle, AudioLines } from 'lucide-react';
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
    const [leftPaneWidth, setLeftPaneWidth] = useState(42);
    const [isResizing, setIsResizing] = useState(false);
    const [descriptionHeight, setDescriptionHeight] = useState(46);
    const [isDescChatResizing, setIsDescChatResizing] = useState(false);
    const [consoleHeight, setConsoleHeight] = useState(240);
    const [isConsoleResizing, setIsConsoleResizing] = useState(false);
    const [isFullscreenMode, setIsFullscreenMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [lastTranscript, setLastTranscript] = useState(null);
    const [speechLanguage, setSpeechLanguage] = useState('en-US');
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const scrollAreaRef = useRef(null);
    const splitPaneRef = useRef(null);
    const leftPaneRef = useRef(null);
    const rightPaneRef = useRef(null);
    const interviewContainerRef = useRef(null);
    const leftPaneResizeMetaRef = useRef({ startY: 0, startHeight: 46 });
    const consoleResizeMetaRef = useRef({ startY: 0, startHeight: 240 });
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
        if (!isResizing) return;

        const handleMouseMove = (event) => {
            if (!splitPaneRef.current) return;
            const rect = splitPaneRef.current.getBoundingClientRect();
            const nextWidth = ((event.clientX - rect.left) / rect.width) * 100;
            const clampedWidth = Math.min(72, Math.max(28, nextWidth));
            setLeftPaneWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        if (!isConsoleResizing) return;

        const handleMouseMove = (event) => {
            const { startY, startHeight } = consoleResizeMetaRef.current;
            const delta = startY - event.clientY;
            const nextHeight = startHeight + delta;
            const maxHeight = rightPaneRef.current
                ? Math.max(220, rightPaneRef.current.getBoundingClientRect().height * 0.55)
                : 420;
            const clampedHeight = Math.min(maxHeight, Math.max(140, nextHeight));
            setConsoleHeight(clampedHeight);
        };

        const handleMouseUp = () => {
            setIsConsoleResizing(false);
        };

        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isConsoleResizing]);

    useEffect(() => {
        if (!isDescChatResizing) return;

        const handleMouseMove = (event) => {
            if (!leftPaneRef.current) return;
            const { startY, startHeight } = leftPaneResizeMetaRef.current;
            const delta = startY - event.clientY;
            const paneHeight = leftPaneRef.current.getBoundingClientRect().height;
            if (!paneHeight) return;
            const nextHeight = startHeight + (delta / paneHeight) * 100;
            const clampedHeight = Math.min(68, Math.max(28, nextHeight));
            setDescriptionHeight(clampedHeight);
        };

        const handleMouseUp = () => {
            setIsDescChatResizing(false);
        };

        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDescChatResizing]);

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
            setIsCodingMode(questions[currentQuestionIndex].type === 'Coding');
            if (questions[currentQuestionIndex].type === 'Coding') {
                setCode(questions[currentQuestionIndex].codeTemplate || '// Start coding here...');
                setOutput('');
                setUserInput('');
            } else {
                setAnswer('');
                setOutput('');
                setUserInput('');
            }
        }
    }, [currentQuestionIndex, questions]);

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
                
                let executionOutput = `> [Success] Code executed successfully!\n> ${timestamp}\n`;
                if (stdout) executionOutput += `\nSTDOUT:\n${stdout}`;
                if (stderr) executionOutput += `\nSTDERR:\n${stderr}`;
                if (!stdout && !stderr && fullOutput) executionOutput += `\n${fullOutput}`;
                if (!stdout && !stderr && !fullOutput) executionOutput += `\n(No output produced)`;
                
                setOutput(executionOutput);
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
            "mx-auto transition-all duration-500 ease-in-out",
            isCodingMode ? "w-full max-w-none h-screen px-0 py-0" : "container max-w-7xl px-4 py-8 h-[calc(100vh-64px)]"
        )}
        ref={interviewContainerRef}
        >
            <Card className={cn(
                "grid h-full overflow-hidden border-border/50 shadow-2xl transition-all duration-500",
                !isCodingMode && "lg:grid-cols-[260px_1fr] rounded-3xl",
                isCodingMode && "grid-cols-1 rounded-none border-none",
                isCodingMode && !isDark && "bg-gradient-to-br from-white via-slate-50 to-blue-50/30"
            )}>
                {/* Sidebar */}
                {!isCodingMode && (
                <aside className={cn(
                    "border-r border-border/50 flex flex-col h-full overflow-hidden w-[260px]",
                    isDark ? "bg-muted/20" : "bg-white/80 backdrop-blur-sm",
                )}>
                    <div className="p-6 border-b border-border/50 flex items-center justify-between">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleGoToDashboardClick} 
                            disabled={submitting}
                            className="w-full justify-start gap-2 hover:bg-background/80 transition-all font-medium"
                        >
                            <ChevronLeft size={16} /> Dashboard
                        </Button>
                    </div>

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
                </aside>
                )}

                {/* Main Content Area */}
                <div className={cn(
                    "flex-1 flex overflow-hidden backdrop-blur-md",
                    isDark ? "bg-slate-950" : (isCodingMode ? "bg-slate-100" : "bg-gradient-to-b from-slate-100 to-slate-50"),
                    "flex-col"
                )}>
                    {isCodingMode && !isFullscreenMode && (
                        <div className={cn(
                            "h-14 shrink-0 border-b border-border/40 px-4 flex items-center sticky top-0 z-30 backdrop-blur-md",
                            isDark ? "bg-slate-900 shadow-[0_6px_20px_rgba(0,0,0,0.25)]" : "bg-white shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                        )}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleGoToDashboardClick}
                                disabled={submitting}
                                className="h-8 px-2.5 gap-1.5 font-semibold"
                            >
                                <ChevronLeft size={14} /> Dashboard
                            </Button>

                            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-background/70 px-2.5 py-1 rounded-full border border-border/50">
                                <Timer size={13} className="text-primary" />
                                <span className="text-foreground tracking-normal">{formatTime(timeLeft)}</span>
                                </div>
                            </div>

                            <div className="ml-auto flex items-center gap-3 min-w-[150px]">
                                <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                                    {isFinished ? 'Completed' : `${currentQuestionIndex}/${questions.length}`}
                                </span>
                                <Progress value={isFinished ? 100 : (currentQuestionIndex / questions.length) * 100} className="h-1.5 w-20" />
                                <div className="h-5 w-px bg-border/60" />

                            <div className="flex-1 overflow-x-auto max-w-[420px]">
                                <div className="flex items-center gap-2 min-w-max pr-2">
                                    {questions.map((q, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => i < currentQuestionIndex ? setSelectedPastQuestion(i) : null}
                                            className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                                                (i === currentQuestionIndex && !isFinished) ? "bg-primary text-primary-foreground" :
                                                i < currentQuestionIndex ? (questions[i].answer === '__SKIPPED__' ? "bg-red-500/80 text-white" : "bg-green-500/80 text-white") : "bg-muted/40 text-muted-foreground",
                                                i < currentQuestionIndex && "cursor-pointer hover:opacity-80"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            </div>

                            {isFinished && (
                                <Button
                                    size="sm"
                                    onClick={() => navigate(`/feedback/${sessionId}`)}
                                    className="h-8 px-3 whitespace-nowrap"
                                >
                                    View Report
                                </Button>
                            )}
                        </div>
                    )}

                    <div
                        className={cn(
                            "flex-1 flex overflow-hidden",
                            isCodingMode ? "flex-row gap-2.5 p-2.5" : "flex-col"
                        )}
                        ref={splitPaneRef}
                    >
                    {/* Left Pane: Chat & Problem Description */}
                    <div className={cn(
                        "flex flex-col h-full overflow-hidden",
                        isCodingMode ? "min-w-[360px] rounded-2xl border border-border/50" : "w-full border-r border-border/40",
                        isCodingMode && !isDark && "bg-white"
                    )}
                    style={isCodingMode ? { width: `${leftPaneWidth}%` } : undefined}
                    >
                        {isCodingMode && (
                            <div className={cn(
                                "px-4 py-2 border-b border-border/40 flex items-center shrink-0 h-10",
                                isDark ? "bg-slate-900" : "bg-slate-200"
                            )}>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" className="h-8 gap-2 px-3 text-[11px] font-bold text-primary border-b-2 border-primary rounded-none hover:bg-transparent">
                                        <FileText size={14} /> DESCRIPTION
                                    </Button>
                                </div>
                            </div>
                        )}
                        {isCodingMode ? (
                            <div ref={leftPaneRef} className="flex-1 min-h-0 p-2 flex flex-col gap-2">
                                <div
                                    className={cn(
                                        "rounded-xl border border-border/40 overflow-hidden",
                                        isDark ? "bg-slate-950" : "bg-white"
                                    )}
                                    style={{ height: `${descriptionHeight}%` }}
                                >
                                    <ScrollArea className="h-full">
                                        <div className="mx-auto p-6 space-y-4 max-w-3xl">
                                            {questions[currentQuestionIndex] && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                                                    <div className="flex items-center justify-between pb-2 border-b border-border/20">
                                                        <h2 className="text-2xl font-bold tracking-tight text-foreground/90 leading-tight">
                                                            {currentQuestionIndex + 1}. {questions[currentQuestionIndex].title || "Problem Description"}
                                                        </h2>
                                                        <div className="flex items-center gap-3">
                                                            <DifficultyBadge 
                                                                difficulty={questions[currentQuestionIndex].difficulty || 'Medium'}
                                                                eloRating={session?.difficultyRating}
                                                            />

                                                        </div>
                                                    </div>

                                                    <div className={cn(
                                                        "prose max-w-none leading-relaxed text-[15px] space-y-4",
                                                        isDark ? "prose-invert text-muted-foreground/90" : "prose-slate text-slate-700"
                                                    )}>
                                                        <div dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex].text }} className="whitespace-pre-wrap" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>

                                <div
                                    role="separator"
                                    aria-orientation="horizontal"
                                    aria-label="Resize description and AI discussion"
                                    onMouseDown={(event) => {
                                        leftPaneResizeMetaRef.current = { startY: event.clientY, startHeight: descriptionHeight };
                                        setIsDescChatResizing(true);
                                    }}
                                    onDoubleClick={() => setDescriptionHeight(46)}
                                    className="h-2 cursor-row-resize shrink-0 bg-transparent"
                                />

                                <div className={cn(
                                    "flex-1 min-h-0 rounded-xl border border-border/40 overflow-hidden flex flex-col",
                                    isDark ? "bg-slate-950" : "bg-white"
                                )}>
                                    <div className={cn("h-10 px-4 border-b border-border/40 flex items-center", isDark ? "bg-slate-900" : "bg-slate-100")}>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">AI Discussion</p>
                                    </div>

                                    <ScrollArea ref={scrollAreaRef} className="flex-1">
                                        <div className="mx-auto p-5 space-y-5 max-w-3xl">
                                            {chatHistory
                                                .filter(msg => !(questions[currentQuestionIndex] && msg.text === questions[currentQuestionIndex].text))
                                                .filter(msg => shouldShowLiveFeedback || !msg.isFeedback)
                                                .map((msg, i) => (
                                                <div key={msg.id || i} className={cn("flex w-full gap-3", msg.type === 'user' ? "flex-row-reverse" : "flex-row")}>
                                                    <ChatAvatar type={msg.type} />
                                                    <div className={cn("flex flex-col gap-2 max-w-[85%]", msg.type === 'user' ? "items-end" : "items-start")}>
                                                        <Card className={cn(
                                                            "border-border/40 shadow-sm transition-all duration-300",
                                                            msg.type === 'user' ? "bg-primary text-primary-foreground border-none shadow-primary/20" : "bg-card/90",
                                                            msg.isFeedback && `border-l-4 ${getScoreBorderColor(msg.score)} shadow-md`
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
                                    </ScrollArea>
                                </div>
                            </div>
                        ) : (
                            <ScrollArea ref={scrollAreaRef} className="flex-1">
                                <div className="mx-auto w-full max-w-4xl p-4 md:p-6 space-y-5 md:space-y-6">
                                    <Card className="border-border/50 shadow-sm bg-card/90 overflow-hidden">
                                        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                                            <div className="flex items-center justify-between shrink-0">
                                                <CardTitle className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-bold flex items-center gap-2">
                                                    <FileText size={14} className="text-primary" /> Interview Question
                                                </CardTitle>
                                                <div className="flex items-center gap-3">
                                                    <DifficultyBadge 
                                                        difficulty={questions[currentQuestionIndex]?.difficulty || 'Medium'} 
                                                        compact={true}
                                                    />

                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 md:p-6 space-y-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                                                    Question {displayQuestionNumber} of {questions.length}
                                                </Badge>
                                            </div>
                                            <h2 className="text-lg md:text-xl font-bold tracking-tight leading-snug text-foreground">
                                                {hasMeaningfulQuestionTitle
                                                    ? `${displayQuestionNumber}. ${rawQuestionTitle}`
                                                    : `Question ${displayQuestionNumber}`}
                                            </h2>
                                            <div className="leading-relaxed text-[14px] md:text-[15px] text-muted-foreground whitespace-pre-wrap">
                                                <div dangerouslySetInnerHTML={{ __html: activeQuestion?.text || "" }} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-4">
                                        <div className="flex items-center px-1">
                                            <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-bold">Discussion</p>
                                        </div>

                                        {nonCodingMessages.map((msg, i) => (
                                                <div key={msg.id || i} className={cn("flex w-full gap-3", msg.type === 'user' ? "flex-row-reverse" : "flex-row")}>
                                                    <ChatAvatar type={msg.type} />
                                                    <div className={cn("flex flex-col gap-2 max-w-[88%]", msg.type === 'user' ? "items-end" : "items-start")}>
                                                        <Card className={cn(
                                                            "border-border/40 shadow-sm transition-all duration-300",
                                                            msg.type === 'user' ? "bg-primary text-primary-foreground border-none shadow-primary/20" : "bg-card/90",
                                                            msg.isFeedback && `border-l-4 ${getScoreBorderColor(msg.score)} shadow-md`
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

                                        {!submitting && nonCodingMessages.length === 0 && (
                                            <div className="flex items-center gap-3 px-2 py-1.5">
                                                <MessageSquare size={18} className="text-foreground" />
                                                <p className="text-sm font-semibold text-foreground">Start your {getOrdinalWord(displayQuestionNumber)} answer</p>
                                            </div>
                                        )}

                                        {submitting && (
                                            <div className="flex flex-row gap-3">
                                                <ChatAvatar type="ai" />
                                                <TypingIndicator />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>
                        )}

                        {/* Timer and Difficulty for non-coding mode */}
                        {/* Bottom badges removed - now in header */}

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

                                    <div className="flex items-center gap-2">
                                        <select
                                            value={speechLanguage}
                                            onChange={(e) => setSpeechLanguage(e.target.value)}
                                            disabled={isRecording || isTranscribing || submitting}
                                            className="h-[56px] px-3 rounded-2xl border border-border/40 bg-background/60 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-sm"
                                            title="Select language for speech recognition"
                                        >
                                            <option value="en-US">English</option>
                                            <option value="hi-IN">Hindi</option>
                                        </select>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleToggleRecording}
                                            disabled={!canRecordAudio || isTranscribing || submitting || currentQuestionIndex >= questions.length}
                                            className={cn(
                                                "h-[56px] w-[56px] shrink-0 rounded-2xl transition-all duration-300 shadow-sm",
                                                isRecording
                                                    ? "border-rose-500/40 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                                                    : "border-primary/15 bg-primary/[0.04] text-primary hover:bg-primary/10"
                                            )}
                                            title={isRecording ? 'Stop recording' : 'Start recording'}
                                        >
                                            {isTranscribing ? (
                                                <Loader2 size={22} className="animate-spin" />
                                            ) : isRecording ? (
                                                <StopCircle size={22} strokeWidth={1.8} />
                                            ) : (
                                                <Mic size={22} strokeWidth={1.8} />
                                            )}
                                        </Button>
                                    </div>
                                    
                                    <form onSubmit={(e) => handleSubmit(e)} className="relative flex-1 group">
                                        <textarea
                                            className="w-full bg-background/60 backdrop-blur-sm border border-border/40 rounded-2xl px-6 py-4 pr-16 text-base focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all duration-300 resize-none min-h-[56px] max-h-48 shadow-sm"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder={isRecording ? 'Listening... click stop to transcribe' : 'Type your professional answer here...'}
                                            disabled={submitting || isTranscribing || currentQuestionIndex >= questions.length}
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
                                            disabled={!answer.trim() || submitting || isTranscribing || currentQuestionIndex >= questions.length}
                                            type="submit"
                                        >
                                            <Send size={18} />
                                        </Button>
                                    </form>
                                </div>

                                <div className="max-w-3xl mx-auto mt-3 px-1">
                                    {isTranscribing && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                            <AudioLines size={14} className="animate-pulse" />
                                            Processing speech and building transcript...
                                        </div>
                                    )}

                                    {!isTranscribing && lastTranscript?.text && (
                                        <div className="rounded-xl border border-border/40 bg-background/60 px-3 py-2">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Latest transcript</p>
                                            <p className="mt-1 text-xs text-foreground/85 line-clamp-2">{lastTranscript.text}</p>
                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                Confidence: {typeof lastTranscript.confidence === 'number' ? `${(lastTranscript.confidence * 100).toFixed(1)}%` : 'n/a'} | Words: {lastTranscript.words.length} | Speakers: {new Set(lastTranscript.speakerSegments.map((segment) => segment.speaker)).size || 1}
                                            </p>
                                            {lastTranscript.words.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Word confidence</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {lastTranscript.words.map((w, i) => {
                                                            const conf = typeof w.confidence === 'number' ? w.confidence : null;
                                                            const confColor = conf === null ? 'bg-gray-400/20' : conf > 0.8 ? 'bg-green-500/10 text-green-600' : conf > 0.5 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-red-500/10 text-red-600';
                                                            return (
                                                                <span key={i} className={cn('text-[9px] px-1.5 py-0.5 rounded border border-border/40', confColor)} title={conf ? `${(conf * 100).toFixed(0)}% confident` : 'unknown confidence'}>
                                                                    {w.word}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {isCodingMode && (
                        <div
                            role="separator"
                            aria-orientation="vertical"
                            aria-label="Resize description and code panels"
                            onMouseDown={() => setIsResizing(true)}
                            onDoubleClick={() => setLeftPaneWidth(42)}
                            className={cn(
                                "hidden lg:flex w-2 cursor-col-resize select-none bg-transparent"
                            )}
                        />
                    )}

                    {/* Right Pane: Persistent Coding Interface */}
                    {isCodingMode && (
                        <div className={cn(
                            "flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-right-4 duration-500 rounded-2xl border border-border/50",
                            isDark ? "bg-slate-950" : "bg-slate-100"
                        )}
                        ref={rightPaneRef}
                        >
                            {/* Editor Toolbar */}
                            <div className={cn(
                                "px-4 py-1.5 border-b border-border/40 flex items-center justify-between shrink-0",
                                isDark ? "bg-slate-900" : "bg-slate-200"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-widest">
                                        <Code size={14} strokeWidth={2.5} />
                                        Code
                                    </div>
                                    <div className="h-4 w-px bg-border/40" />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className={cn(
                                                "h-8 gap-2 border border-border/40 transition-all font-bold text-[11px] uppercase tracking-wider",
                                                isDark ? "bg-background/20 hover:bg-background/40" : "bg-white/80 hover:bg-slate-100"
                                            )}>
                                                {language.toUpperCase()}
                                                <ChevronRight size={14} className="rotate-90 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className={cn(
                                            "w-48 backdrop-blur-xl border-border/40 p-1",
                                            isDark ? "bg-slate-900/95" : "bg-white/95"
                                        )}>
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
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={toggleFullscreenMode}
                                        className="h-8 w-8 p-0"
                                        title={isFullscreenMode ? "Exit fullscreen" : "Maximize"}
                                    >
                                        {isFullscreenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                    </Button>
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

                            <div
                                role="separator"
                                aria-orientation="horizontal"
                                aria-label="Resize code editor and output panels"
                                onMouseDown={(event) => {
                                    consoleResizeMetaRef.current = { startY: event.clientY, startHeight: consoleHeight };
                                    setIsConsoleResizing(true);
                                }}
                                onDoubleClick={() => setConsoleHeight(240)}
                                className={cn(
                                    "h-2 cursor-row-resize shrink-0 bg-transparent mx-2.5"
                                )}
                            />

                            {/* Results & Console area */}
                            <div className={cn(
                                "mx-2.5 mb-2.5 rounded-xl border border-border/40 flex flex-col shrink-0 overflow-hidden",
                                isDark ? "bg-slate-900" : "bg-slate-100"
                            )}
                            style={{ height: `${consoleHeight}px` }}
                            >
                                <Tabs defaultValue="output" className="flex-1 flex flex-col overflow-hidden">
                                    <TabsList className={cn(
                                        "px-4 border-b border-border/40 flex items-center justify-start shrink-0 h-9 gap-4 rounded-none",
                                        isDark ? "bg-slate-800" : "bg-slate-200"
                                    )}>
                                        <TabsTrigger value="output" className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all rounded-none bg-transparent shadow-none">Output</TabsTrigger>
                                        <TabsTrigger value="input" className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all rounded-none bg-transparent shadow-none">Input</TabsTrigger>
                                        <div className="flex-1" />
                                        <Terminal size={14} className="text-muted-foreground/40" />
                                    </TabsList>
                                    <TabsContent value="input" className="flex-1 m-0 p-0 overflow-hidden outline-none">
                                        <div className={cn("flex flex-col h-full", isDark ? "bg-muted/5" : "bg-white/80")}>
                                            <div className={cn(
                                                "px-3 py-1 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter",
                                                isDark ? "bg-black/20" : "bg-slate-100"
                                            )}>stdin</div>
                                            <textarea
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                placeholder="Enter input..."
                                                className={cn(
                                                    "flex-1 w-full bg-transparent p-3 text-[12px] font-mono focus:outline-none resize-none",
                                                    isDark ? "text-slate-300 placeholder:text-slate-700" : "text-slate-700 placeholder:text-slate-400"
                                                )}
                                            />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="output" className="flex-1 m-0 p-0 overflow-hidden outline-none">
                                        <ScrollArea className={cn("h-full p-4", isDark ? "bg-black/20" : "bg-white/80")}>
                                            <pre className="text-[13px] font-mono leading-relaxed">
                                                {output ? (
                                                    <code className={output.includes('[Error]') ? (isDark ? 'text-red-400' : 'text-red-700') : (isDark ? 'text-green-400' : 'text-emerald-700')}>
                                                        {output}
                                                    </code>
                                                ) : (
                                                    <span className={cn("italic animate-pulse", isDark ? "text-slate-600" : "text-slate-500")}>Waiting for code execution...</span>
                                                )}
                                            </pre>
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Coding Mode Submit Area */}
                            <div className={cn(
                                "p-4 border-t border-border/40 backdrop-blur-sm shrink-0 rounded-b-2xl",
                                isDark ? "bg-slate-900" : "bg-slate-100"
                            )}>
                                <div className="flex gap-3 items-end">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => setShowSkipModal(true)}
                                        disabled={submitting || currentQuestionIndex >= questions.length}
                                        className="h-[46px] w-[46px] shrink-0 border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 rounded-xl transition-all shadow-sm"
                                    >
                                        <XCircle size={20} strokeWidth={1.5} />
                                    </Button>
                                    
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit(e, `LANGUAGE: ${language}\n\nCODE:\n\`\`\`${language}\n${code}\n\`\`\`\n\nEXPLANATION:\n${answer}`);
                                    }} className="relative flex-1 group">
                                        <textarea
                                            className="w-full bg-background/80 border border-border/40 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none min-h-[46px] max-h-28 shadow-sm"
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
                                            className="absolute right-2 bottom-2 h-8 w-8 rounded-lg shadow-md transition-all active:scale-95" 
                                            disabled={!answer.trim() || submitting || currentQuestionIndex >= questions.length}
                                            type="submit"
                                        >
                                            <Send size={14} />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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
