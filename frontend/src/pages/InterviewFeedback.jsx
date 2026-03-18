import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Lightbulb, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { getSession } from '../api/interviewApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const InterviewFeedback = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedCards, setExpandedCards] = useState({});
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [slideDirection, setSlideDirection] = useState('next');
    const autoPlayRef = useRef(null);
    const AUTOPLAY_INTERVAL = 6000;

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

    const totalSlides = data?.questions?.length || 0;

    const goToSlide = useCallback((index) => {
        setSlideDirection(index > currentSlide ? 'next' : 'prev');
        setCurrentSlide(index);
    }, [currentSlide]);

    const nextSlide = useCallback(() => {
        setSlideDirection('next');
        setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const prevSlide = useCallback(() => {
        setSlideDirection('prev');
        setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') { nextSlide(); setIsAutoPlaying(false); }
            if (e.key === 'ArrowLeft') { prevSlide(); setIsAutoPlaying(false); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Auto-play logic
    useEffect(() => {
        if (isAutoPlaying && totalSlides > 1) {
            autoPlayRef.current = setInterval(() => {
                nextSlide();
            }, AUTOPLAY_INTERVAL);
        }
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [isAutoPlaying, totalSlides, nextSlide]);

    const toggleAutoPlay = () => setIsAutoPlaying(prev => !prev);

    const toggleCard = (index) => {
        setExpandedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
        // Pause autoplay when user expands details
        if (!expandedCards[index]) {
            setIsAutoPlaying(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage message="Fetching your performance report..." />;

    const { session, questions } = data;

    const getScoreColor = (score) => {
        if (score >= 7) return '#22c55e';
        if (score >= 4) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreGradient = (score) => {
        if (score >= 7) return 'linear-gradient(135deg, #22c55e, #16a34a)';
        if (score >= 4) return 'linear-gradient(135deg, #f59e0b, #d97706)';
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
    };

    return (
        <div className="container feedback-page" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button onClick={() => navigate('/')} className="back-btn" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <header className="feedback-header glass" style={{ padding: '2rem', borderRadius: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Interview Performance</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Session held on {new Date(session.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="overall-score" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: session.score >= 7 ? 'var(--success)' : 'var(--primary)' }}>
                        {session.score.toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/10</span>
                    </div>
                    <p style={{ margin: 0, fontWeight: '600' }}>Overall Score</p>
                </div>
            </header>

            {/* Slider Container */}
            <div className="slider-wrapper">
                {/* Progress Bar */}
                <div className="slider-progress-bar">
                    <div
                        className="slider-progress-fill"
                        style={{
                            width: `${((currentSlide + 1) / totalSlides) * 100}%`,
                            background: getScoreGradient(questions[currentSlide]?.feedback?.score || 0)
                        }}
                    />
                </div>

                {/* Slide Counter & Auto-play Toggle */}
                <div className="slider-top-controls">
                    <span className="slide-counter">
                        Question <strong>{currentSlide + 1}</strong> of <strong>{totalSlides}</strong>
                    </span>
                </div>

                {/* Main Slider */}
                <div className="slider-container">
                    <button className="slider-arrow slider-arrow-left" onClick={prevSlide} aria-label="Previous question">
                        <ChevronLeft size={24} />
                    </button>

                    <div className="slider-viewport">
                        <div
                            className="slider-track"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {questions.map((q, i) => {
                                const isExpanded = expandedCards[i];
                                const score = q.feedback?.score || 0;
                                const isSkipped = q.answer === '__SKIPPED__';
                                return (
                                    <div key={i} className="slider-slide">
                                        <div className="glass q-feedback-card">
                                            {/* Score Badge */}
                                            <div className="card-score-header">
                                                <div className="q-badge-row">
                                                    <span className="q-number-badge">Q{i + 1}</span>
                                                    {isSkipped && <span className="skipped-badge">Skipped</span>}
                                                </div>
                                                <div className="score-circle" style={{ background: getScoreGradient(score) }}>
                                                    <span className="score-value">{score}</span>
                                                    <span className="score-max">/10</span>
                                                </div>
                                            </div>

                                            {/* Question */}
                                            <h3 className="question-text">{q.text}</h3>

                                            {/* Answer */}
                                            <div className="answer-section">
                                                <p className="answer-label">YOUR ANSWER</p>
                                                <p className="answer-content" style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: isExpanded ? 'unset' : '3',
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {isSkipped ? (
                                                        <em style={{ color: 'var(--text-muted)' }}>This question was skipped</em>
                                                    ) : q.answer}
                                                </p>
                                            </div>

                                            {/* Expandable Details */}
                                            <div className={`feedback-details ${isExpanded ? 'expanded' : 'collapsed'}`}>
                                                <div className="detail-item">
                                                    <div className="detail-header" style={{ color: '#22c55e' }}>
                                                        <CheckCircle size={16} /> <span>STRENGTHS</span>
                                                    </div>
                                                    <ul className="detail-list">
                                                        {q.feedback?.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                                                    </ul>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-header" style={{ color: '#ef4444' }}>
                                                        <XCircle size={16} /> <span>WEAKNESSES</span>
                                                    </div>
                                                    <ul className="detail-list">
                                                        {q.feedback?.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                                                    </ul>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-header" style={{ color: 'var(--primary)' }}>
                                                        <Lightbulb size={16} /> <span>SUGGESTIONS</span>
                                                    </div>
                                                    <ul className="detail-list">
                                                        {q.feedback?.suggestions?.map((s, idx) => <li key={idx}>{s}</li>)}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Toggle Button */}
                                            <button className="toggle-details-btn" onClick={() => toggleCard(i)}>
                                                {isExpanded ? (
                                                    <>Hide Details <ChevronUp size={16} /></>
                                                ) : (
                                                    <>Show Details <ChevronDown size={16} /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button className="slider-arrow slider-arrow-right" onClick={nextSlide} aria-label="Next question">
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Dot Indicators */}
                <div className="slider-dots">
                    {questions.map((q, i) => (
                        <button
                            key={i}
                            className={`slider-dot ${i === currentSlide ? 'active' : ''}`}
                            onClick={() => goToSlide(i)}
                            aria-label={`Go to question ${i + 1}`}
                            style={i === currentSlide ? { background: getScoreGradient(q.feedback?.score || 0) } : {}}
                        />
                    ))}
                </div>

                {/* Keyboard hint */}
                <p className="keyboard-hint">Use ← → arrow keys or swipe to navigate</p>
            </div>

            <div className="action-area" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="btn-primary" onClick={() => navigate('/')} style={{ padding: '1rem 3rem' }}>
                    Return to Dashboard
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .feedback-page { color: white; }
                .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }

                /* Slider Wrapper */
                .slider-wrapper {
                    max-width: 720px;
                    margin: 0 auto;
                }

                /* Progress Bar */
                .slider-progress-bar {
                    height: 3px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 3px;
                    margin-bottom: 1rem;
                    overflow: hidden;
                }
                .slider-progress-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Top Controls */
                .slider-top-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .slide-counter {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                .slide-counter strong {
                    color: var(--text);
                }


                /* Slider Container */
                .slider-container {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    position: relative;
                }

                /* Arrows */
                .slider-arrow {
                    flex-shrink: 0;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(30, 41, 59, 0.8);
                    backdrop-filter: blur(8px);
                    color: var(--text);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.25s;
                    margin-top: 6rem;
                }
                .slider-arrow:hover {
                    background: rgba(99, 102, 241, 0.3);
                    border-color: var(--primary);
                    transform: scale(1.1);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
                }

                /* Viewport */
                .slider-viewport {
                    flex: 1;
                    overflow: hidden;
                    border-radius: 1.25rem;
                }

                /* Track */
                .slider-track {
                    display: flex;
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Individual Slide */
                .slider-slide {
                    min-width: 100%;
                    box-sizing: border-box;
                }

                /* Card */
                .q-feedback-card {
                    border-radius: 1.25rem;
                    padding: 2rem;
                    transition: box-shadow 0.3s;
                    animation: slideIn 0.4s ease-out;
                }

                @keyframes slideIn {
                    from { opacity: 0.7; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }

                /* Score Header */
                .card-score-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }
                .q-badge-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .q-number-badge {
                    background: var(--primary);
                    color: white;
                    padding: 0.25rem 0.7rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .skipped-badge {
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                /* Score Circle */
                .score-circle {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .score-value {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: white;
                    line-height: 1;
                }
                .score-max {
                    font-size: 0.6rem;
                    color: rgba(255,255,255,0.7);
                    font-weight: 600;
                }

                /* Question Text */
                .question-text {
                    font-size: 1.05rem;
                    line-height: 1.6;
                    margin-bottom: 1.25rem;
                    color: var(--text);
                }

                /* Answer Section */
                .answer-section {
                    margin-bottom: 1rem;
                }
                .answer-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                }
                .answer-content {
                    font-size: 0.9rem;
                    color: var(--text);
                    background: rgba(255,255,255,0.03);
                    padding: 0.85rem 1rem;
                    border-radius: 10px;
                    border-left: 3px solid var(--primary);
                    line-height: 1.6;
                }

                /* Feedback Details */
                .feedback-details {
                    overflow: hidden;
                    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
                }
                .feedback-details.collapsed {
                    max-height: 0;
                    opacity: 0;
                    pointer-events: none;
                }
                .feedback-details.expanded {
                    max-height: 2000px;
                    opacity: 1;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    padding-top: 1.25rem;
                    margin-top: 0.5rem;
                }

                .detail-item {
                    margin-bottom: 1rem;
                }
                .detail-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.35rem;
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .detail-list {
                    padding-left: 1.5rem;
                    margin: 0;
                    font-size: 0.85rem;
                    line-height: 1.7;
                }
                .detail-list li {
                    margin-bottom: 0.25rem;
                }

                /* Toggle Button */
                .toggle-details-btn {
                    margin-top: 1rem;
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.06);
                    color: var(--primary);
                    padding: 0.6rem;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: all 0.25s;
                }
                .toggle-details-btn:hover {
                    background: rgba(99, 102, 241, 0.12);
                    border-color: rgba(99, 102, 241, 0.3);
                }

                /* Dot Indicators */
                .slider-dots {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1.25rem;
                    flex-wrap: wrap;
                }
                .slider-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255,255,255,0.15);
                    cursor: pointer;
                    transition: all 0.3s;
                    padding: 0;
                }
                .slider-dot:hover {
                    background: rgba(255,255,255,0.3);
                    transform: scale(1.2);
                }
                .slider-dot.active {
                    width: 28px;
                    border-radius: 999px;
                    transform: scale(1);
                }

                /* Keyboard Hint */
                .keyboard-hint {
                    text-align: center;
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.25);
                    margin-top: 0.75rem;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .slider-wrapper { max-width: 100%; }
                    .slider-arrow { 
                        width: 36px; 
                        height: 36px; 
                        margin-top: 4rem; 
                    }
                    .q-feedback-card { padding: 1.25rem; }
                    .score-circle { width: 48px; height: 48px; }
                    .score-value { font-size: 1.2rem; }
                    .keyboard-hint { display: none; }
                }
            ` }} />
        </div>
    );
};

export default InterviewFeedback;
