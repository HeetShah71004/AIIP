import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Lightbulb, ChevronLeft, BarChart3, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { getSession } from '../api/interviewApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const InterviewFeedback = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedCards, setExpandedCards] = useState({});

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

    const toggleCard = (index) => {
        setExpandedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    if (loading) return <LoadingSpinner fullPage message="Fetching your performance report..." />;

    const { session, questions } = data;

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

            <div className="feedback-grid" style={{ marginBottom: '3rem' }}>
                {questions.map((q, i) => {
                    const isExpanded = expandedCards[i];
                    return (
                        <div key={i} className="glass q-feedback-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <span className="q-number" style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Q{i+1}</span>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: q.feedback?.score >= 7 ? 'var(--success)' : 'var(--primary)' }}>{q.feedback?.score || 0}/10</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Question Score</div>
                                </div>
                            </div>
                            
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', lineHeight: '1.5' }}>{q.text}</h3>
                            
                            <div className="answer-section" style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Your Answer</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text)', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : '3', WebkitBoxOrient: 'vertical' }}>
                                    {q.answer}
                                </p>
                            </div>

                            <div className={`feedback-details ${isExpanded ? 'expanded' : 'collapsed'}`}>
                                <div className="detail-item" style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '0.25rem' }}>
                                        <CheckCircle size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>STRENGTHS</span>
                                    </div>
                                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.85rem' }}>
                                        {q.feedback?.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '0.25rem' }}>
                                        <XCircle size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>WEAKNESSES</span>
                                    </div>
                                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.85rem' }}>
                                        {q.feedback?.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                                    </ul>
                                </div>
                                <div className="detail-item" style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                                        <Lightbulb size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>SUGGESTIONS</span>
                                    </div>
                                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.85rem' }}>
                                        {q.feedback?.suggestions?.map((s, idx) => <li key={idx}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <button 
                                onClick={() => toggleCard(i)}
                                style={{ 
                                    marginTop: '1rem', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: 'none', 
                                    color: 'var(--primary)', 
                                    padding: '0.5rem', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                className="toggle-details-btn"
                            >
                                {isExpanded ? (
                                    <>Hide Details <ChevronUp size={16} /></>
                                ) : (
                                    <>Show Details <ChevronDown size={16} /></>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="action-area" style={{ textAlign: 'center' }}>
                <button className="btn-primary" onClick={() => navigate('/')} style={{ padding: '1rem 3rem' }}>
                    Return to Dashboard
                </button>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .feedback-page { color: white; }
                .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
                
                .feedback-grid {
                    column-count: 3;
                    column-gap: 2rem;
                    width: 100%;
                }

                @media (max-width: 1200px) {
                    .feedback-grid { column-count: 2; }
                }
                @media (max-width: 768px) {
                    .feedback-grid { column-count: 1; }
                }

                .q-feedback-card { 
                    border-radius: 1.25rem; 
                    transition: transform 0.2s, box-shadow 0.2s; 
                    break-inside: avoid;
                    display: inline-block;
                    width: 100%;
                }
                
                .q-feedback-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); }
                
                .feedback-details { 
                    overflow: hidden; 
                    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease; 
                }
                .feedback-details.collapsed { max-height: 0; opacity: 0; pointer-events: none; }
                .feedback-details.expanded { max-height: 2000px; opacity: 1; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; }
                
                .toggle-details-btn:hover { background: rgba(255,255,255,0.1); }
                li { margin-bottom: 0.25rem; }
            ` }} />
        </div>
    );
};

export default InterviewFeedback;
