import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Mic, Send, Download, AlertCircle, Zap, Brain, Sparkles, Home } from 'lucide-react';
import api from '../api/client';
import { startSession, getSession, submitAnswer } from '../api/interviewApi';
import toast from 'react-hot-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const ConversationalInterview = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [emotionScore, setEmotionScore] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sessionProgress, setSessionProgress] = useState({ completed: 0, total: 5 });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    confidence: 0,
    stress: 0,
    engagement: 0
  });
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsSessionLoading(true);

        const startRes = await startSession({
          totalQuestions: 5,
          interviewRound: 'Behavioral',
          category: 'Fullstack',
          difficulty: 'Medium'
        });

        const createdSession = startRes?.data;
        if (!createdSession?._id) {
          throw new Error('Failed to create interview session.');
        }

        setSessionId(createdSession._id);
        setSessionProgress({
          completed: createdSession.completedQuestions || 0,
          total: createdSession.totalQuestions || 5
        });

        const sessionRes = await getSession(createdSession._id);
        const allQuestions = (sessionRes?.data?.questions || []).sort(
          (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );

        const firstPendingQuestion = allQuestions.find((q) => !q.answer) || allQuestions[0] || null;

        if (!firstPendingQuestion) {
          setMessages([
            {
              sender: 'ai',
              text: 'Session started, but no questions were generated. Please try again.',
            },
          ]);
          toast.error('No interview questions available right now.');
          return;
        }

        setCurrentQuestion(firstPendingQuestion);
        setMessages([
          {
            sender: 'ai',
            text: firstPendingQuestion.text,
          },
        ]);
      } catch (err) {
        console.error('Failed to initialize conversational interview:', err);
        setMessages([
          {
            sender: 'ai',
            text: 'Could not start interview session. Please refresh and try again.',
          },
        ]);
        toast.error(err?.response?.data?.message || err.message || 'Unable to start interview session');
      } finally {
        setIsSessionLoading(false);
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    if (!sessionId || !currentQuestion) return undefined;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, currentQuestion]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const formatElapsed = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSend = async () => {
    const answerText = input.trim();
    if (!answerText || !sessionId || !currentQuestion || isSubmitting) return;

    setInput('');
    setIsSubmitting(true);
    setMessages((prev) => [...prev, { sender: 'user', text: answerText }]);

    try {
      const result = await submitAnswer(sessionId, {
        questionId: currentQuestion._id,
        answer: answerText,
        timeSpent: 0
      });

      const feedbackText = result?.data?.feedback?.analysis;
      if (feedbackText) {
        setMessages((prev) => [...prev, { sender: 'ai', text: feedbackText }]);
      }

      if (result?.sessionProgress) {
        setSessionProgress(result.sessionProgress);
      }

      if (result?.nextQuestion?.text) {
        setCurrentQuestion(result.nextQuestion);
        setMessages((prev) => [...prev, { sender: 'ai', text: result.nextQuestion.text }]);
      } else {
        setCurrentQuestion(null);
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: 'That was the last question. Interview completed. Great work.' }
        ]);
        toast.success('Interview completed');
      }
    } catch (err) {
      console.error('Submit answer failed:', err);
      toast.error(err?.response?.data?.message || err.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsAnalyzing(true);
      
      try {
        // In a real app, we'd send the actual audio blob
        // Here we simulate the call to our backend emotion analyze endpoint
        const mockAudioData = new Uint8Array(1024).fill(0);
        const res = await api.post('/emotion/analyze', { audio: Array.from(mockAudioData) });
        
        const score = res.data.confidenceScore;
        setEmotionScore(score);
        
        // Update session stats based on the score
        setSessionStats({
          confidence: Math.round(score * 100),
          stress: Math.round((1 - score) * 40), // Heuristic: lower confidence -> more stress
          engagement: Math.round(70 + Math.random() * 30)
        });

        toast.success(`Emotion Analysis Complete: ${(score * 100).toFixed(0)}% Confidence`, {
          icon: '🧠',
          duration: 3000
        });

      } catch (err) {
        console.error('Emotion analysis failed', err);
        toast.error('Could not analyze emotions');
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setIsRecording(true);
      setEmotionScore(null);
    }
  };

  const handleDownloadTranscript = () => {
    const transcript = messages.map(msg => `${msg.sender.toUpperCase()}: ${msg.text}`).join('\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-80 bg-white dark:bg-[#0d1117] p-6 border-r border-gray-200 dark:border-zinc-800 flex flex-col shadow-xl z-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
              <Brain size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight dark:text-zinc-100">AI Analysis</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-rose-500 transition-colors"
            title="Exit to Dashboard"
          >
            <Home size={18} />
          </Button>
        </div>

        <div className="space-y-8 flex-1">
          {/* Real-time Emotion Indicator */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 space-y-4 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confidence</span>
              <Badge variant="outline" className="text-[10px] bg-teal-500/5 text-teal-600 dark:text-teal-400 border-teal-500/20">
                {isSessionLoading ? 'Starting...' : isRecording ? 'Listening...' : isAnalyzing ? 'Analyzing...' : currentQuestion ? 'Interviewing' : 'Completed'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-center py-4 relative">
              {/* Circular Progress Representation */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-zinc-200 dark:text-zinc-800" />
                <circle 
                  cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" 
                  strokeDasharray="364.4" 
                  strokeDashoffset={364.4 - (sessionStats.confidence / 100) * 364.4}
                  className="text-teal-500 transition-all duration-1000 ease-out" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black tracking-tighter dark:text-white">{sessionStats.confidence}%</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Level</span>
              </div>
              
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-40 rounded-full border border-teal-500/30 animate-ping absolute" />
                  <div className="w-48 h-48 rounded-full border border-teal-500/10 animate-ping absolute delay-700" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1.5"><Zap size={12} className="text-amber-500" /> Stress Level</span>
                <span className={sessionStats.stress > 20 ? 'text-rose-500' : 'text-teal-500'}>{sessionStats.stress}%</span>
              </div>
              <Progress value={sessionStats.stress} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-purple-500" /> Engagement</span>
                <span>{sessionStats.engagement}%</span>
              </div>
              <Progress value={sessionStats.engagement} className="h-1.5" />
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Interview Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                <span className="text-xs text-muted-foreground">Current Topic</span>
                <span className="text-xs font-bold dark:text-zinc-200">{currentQuestion ? 'Behavioral Interview' : 'Session Complete'}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-bold dark:text-zinc-200">{sessionProgress.completed}/{sessionProgress.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-dashed">
            <AlertCircle size={16} /> Interrupt & Clarify
          </Button>
          <Button onClick={handleDownloadTranscript} className="w-full h-11 rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90">
            <Download size={16} className="mr-2" /> Download Report
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-[#09090b]">
        {/* Top bar for mobile/compact view */}
        <div className="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Session Active</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-[10px] h-6">{formatElapsed(elapsedSeconds)}</Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 px-8 py-10" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-teal-500 text-white'
                }`}>
                  {msg.sender === 'user' ? 'U' : 'AI'}
                </div>
                <div
                  className={`px-6 py-4 rounded-3xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-gray-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex gap-4 animate-pulse">
                 <div className="w-8 h-8 rounded-full bg-teal-500/20" />
                 <div className="h-12 w-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl rounded-tl-none" />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-8 bg-gradient-to-t from-white dark:from-[#09090b] to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-30 transition-opacity duration-500" />
              <div className="relative flex items-center transition-all duration-300 transform bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-2 pr-4 shadow-2xl focus-within:border-teal-500/50 focus-within:ring-4 ring-teal-500/5">
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isSessionLoading ? 'Starting your session...' : currentQuestion ? 'Share your answer...' : 'Interview completed'}
                  disabled={isSessionLoading || isSubmitting || !currentQuestion}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 px-2 dark:text-zinc-100 placeholder:text-muted-foreground/60"
                />
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleRecord} 
                    variant="ghost"
                    size="icon" 
                    className={`w-12 h-12 rounded-full transition-all duration-300 relative ${
                      isRecording ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {isRecording && <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping" />}
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={handleSend} 
                    disabled={!input.trim() || isSessionLoading || isSubmitting || !currentQuestion}
                    className="w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-center mt-4 text-muted-foreground font-medium uppercase tracking-[0.2em]">
              AI Interviewer is listening. Speak clearly for best analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationalInterview;
