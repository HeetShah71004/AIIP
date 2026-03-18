import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Timer, Award, CheckCircle, ChevronLeft, Loader2, XCircle } from 'lucide-react';
import { getSession, submitAnswer, getQuestionsFromBank } from '../api/interviewApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

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
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const sessionData = await getSession(sessionId);
                setSession(sessionData.data.session);
                
                // If it's a new session, we need to fetch questions from bank
                if (sessionData.data.questions.length === 0) {
                    const bankQuestions = await getQuestionsFromBank({ limit: sessionData.data.session.totalQuestions });
                    setQuestions(bankQuestions.questions);
                    // Add first question to chat
                    setChatHistory([{
                        type: 'ai',
                        text: `Welcome! Let's start the interview. Here is your first question: \n\n ${bankQuestions.questions[0].text}`,
                        timestamp: new Date()
                    }]);
                } else {
                    setQuestions(sessionData.data.questions);
                    // Reconstruct chat history from existing questions/answers
                    const history = [];
                    const completedCount = sessionData.data.session.completedQuestions;
                    const allQuestions = sessionData.data.questions;
                    
                    // Show all completed questions + the current one
                    for (let i = 0; i <= completedCount && i < allQuestions.length; i++) {
                        const q = allQuestions[i];
                        history.push({ type: 'ai', text: q.text, timestamp: q.createdAt });
                        
                        if (q.answer) {
                            const displayText = q.answer === '__SKIPPED__' ? '[Question Skipped]' : q.answer;
                            history.push({ type: 'user', text: displayText, timestamp: q.createdAt });
                            if (q.feedback) {
                                history.push({ type: 'ai', text: `Feedback: ${q.feedback.analysis}`, timestamp: q.createdAt, isFeedback: true, score: q.feedback.score });
                            }
                        }
                        
                        // If we just showed the last completed question feedback, 
                        // and there's a next question, the loop will continue to show it.
                        // If the interview is finished, we add the final message.
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
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSkip = async () => {
        if (!window.confirm('Are you sure you want to skip this question? You will get 0 score for it.')) return;

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
            if (nextIndex < questions.length) {
                const nextQuestionMessage = {
                    type: 'ai',
                    text: `Understood. Moving to the next question: \n\n ${questions[nextIndex].text}`,
                    timestamp: new Date()
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
            if (nextIndex < questions.length) {
                const nextQuestionMessage = {
                    type: 'ai',
                    text: `Great. Next question: \n\n ${questions[nextIndex].text}`,
                    timestamp: new Date()
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
        <div className="interview-page">
            <div className="interview-sidebar glass">
                <button onClick={() => navigate('/')} className="back-btn">
                    <ChevronLeft size={20} /> Back to Dashboard
                </button>
                
                <div className="sidebar-stats">
                    <div className="stat-item">
                        <Timer size={24} className="icon" />
                        <div>
                            <p className="label">Time Remaining</p>
                            <p className="value">{formatTime(timeLeft)}</p>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Award size={24} className="icon" />
                        <div>
                            <p className="label">Progress</p>
                            <p className="value">{currentQuestionIndex} / {questions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="question-list">
                    <p className="section-title">Interview Questions</p>
                    {questions.map((q, i) => (
                        <div key={i} className={`q-indicator ${i === currentQuestionIndex ? 'active' : i < currentQuestionIndex ? 'completed' : ''}`}>
                            {i < currentQuestionIndex ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
                            <span className="q-text">{q.text.substring(0, 30)}...</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-container">
                <div className="chat-messages" ref={scrollRef}>
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`message-wrapper ${msg.type}`}>
                            <div className={`message ${msg.isFeedback ? 'feedback' : ''}`}>
                                <p className="text">{msg.text}</p>
                                {msg.isFeedback && (
                                    <div className="score-tag">
                                        Score: {msg.score}/10
                                    </div>
                                )}
                                {msg.isFinal && (
                                    <button className="btn-primary" onClick={() => navigate(`/feedback/${sessionId}`)}>
                                        View Full Report
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {submitting && (
                        <div className="message-wrapper ai">
                            <div className="message pulse">
                                <Loader2 className="animate-spin" size={20} />
                                <span>AI is evaluating your answer...</span>
                            </div>
                        </div>
                    )}
                </div>

                <form className="chat-input-area" onSubmit={handleSubmit}>
                    <button type="button" className="skip-btn" onClick={handleSkip} disabled={submitting || currentQuestionIndex >= questions.length} title="Skip this question">
                        <XCircle size={20} />
                        <span>Skip Case</span>
                    </button>
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={submitting || currentQuestionIndex >= questions.length}
                    />
                    <button type="submit" className="send-btn" disabled={!answer.trim() || submitting || currentQuestionIndex >= questions.length}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .interview-page { display: flex; height: calc(100vh - 64px); background: #0f172a; color: white; overflow: hidden; }
                .interview-sidebar { width: 320px; flex-shrink: 0; border-right: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; }
                .chat-container { flex: 1; display: flex; flex-direction: column; padding: 2rem; position: relative; min-width: 0; }
                .chat-messages { flex: 1; overflow-y: auto; padding-right: 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .message-wrapper { display: flex; width: 100%; }
                .message-wrapper.ai { justify-content: flex-start; }
                .message-wrapper.user { justify-content: flex-end; }
                .message { max-width: 80%; padding: 1rem 1.5rem; border-radius: 1rem; line-height: 1.6; }
                .ai .message { background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius: 2px; }
                .user .message { background: var(--primary); border-bottom-right-radius: 2px; }
                .message.feedback { border-left: 4px solid #10b981; background: rgba(16, 185, 129, 0.05); }
                .score-tag { margin-top: 0.5rem; font-weight: bold; color: #10b981; }
                .chat-input-area { margin-top: 1.5rem; background: rgba(30, 41, 59, 0.5); border-radius: 1rem; padding: 0.75rem; display: flex; gap: 0.75rem; align-items: flex-end; border: 1px solid rgba(255,255,255,0.1); }
                .chat-input-area textarea { flex: 1; background: transparent; border: none; font-family: inherit; font-size: 1rem; color: white; outline: none; resize: none; min-height: 24px; max-height: 150px; padding: 0.5rem; }
                .send-btn { background: var(--primary); color: white; border: none; border-radius: 0.75rem; padding: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .skip-btn { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 0.75rem; padding: 0.5rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; font-size: 0.875rem; font-weight: 500; }
                .skip-btn:hover:not(:disabled) { background: rgba(239, 68, 68, 0.2); }
                .skip-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .back-btn { display: flex; align-items: center; gap: 0.5rem; background: transparent; border: none; color: white; cursor: pointer; font-size: 0.9rem; opacity: 0.7; transition: opacity 0.2s; }
                .back-btn:hover { opacity: 1; }
                .sidebar-stats { display: flex; flex-direction: column; gap: 1.5rem; }
                .stat-item { display: flex; align-items: center; gap: 1rem; }
                .stat-item .icon { color: var(--primary); }
                .stat-item .label { font-size: 0.8rem; color: #94a3b8; margin: 0; }
                .stat-item .value { font-size: 1.25rem; font-weight: bold; margin: 0; }
                .section-title { font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 2rem; }
                .question-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .q-indicator { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.75rem; background: rgba(30, 41, 59, 0.4); font-size: 0.875rem; transition: all 0.2s; }
                .q-indicator.active { background: rgba(99, 102, 241, 0.1); border: 1px solid var(--primary); }
                .q-indicator.completed { color: #10b981; }
                .q-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            ` }} />
        </div>
    );
};

export default MockInterview;
