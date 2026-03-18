import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trophy, Target, Zap, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/analytics/summary');
        setSessions(res.data.data.sessionHistory);
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch sessions');
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Ready for your next interview?</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/upload')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Play size={20} /> Quick Start
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sessions Completed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.totalSessions || 0}</div>
          </div>
        </div>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--success)' }}>
            <Target size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Average Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(stats?.avgOverallScore * 10).toFixed(0) || 0}%</div>
          </div>
        </div>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--danger)' }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Current Streak</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.streak || 0} Days</div>
          </div>
        </div>
      </div>

      <section>
        <h2 style={{ marginBottom: '1.5rem' }}>Recent Activity</h2>
        <div className="glass" style={{ padding: '0 1rem' }}>
          {sessions.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent activity. Start an interview!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sessions.map(s => (
                <div 
                  key={s._id} 
                  onClick={() => navigate(`/feedback/${s._id}`)}
                  className="activity-item"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1.25rem 1rem', 
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600' }}>Interview Session</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(s.completedAt || s.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: s.score >= 7 ? 'var(--success)' : 'var(--primary)', fontSize: '1.125rem' }}>
                    {(s.score * 10).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .activity-item:hover {
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(4px);
        }
        .activity-item:last-child {
          border-bottom: none !important;
        }
      ` }} />
    </div>
  );
};

export default Dashboard;
