import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <div className="glass" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--card-bg)', 
          margin: '0 auto 2rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '2px solid var(--primary)',
          overflow: 'hidden'
        }}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={60} color="var(--primary)" />
          )}
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{user.name}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>User Profile</p>

        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
            <Mail size={20} color="var(--primary)" />
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email Address</p>
              <p style={{ fontSize: '1.1rem' }}>{user.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
            <Calendar size={20} color="var(--primary)" />
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Joined On</p>
              <p style={{ fontSize: '1.1rem' }}>{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="btn-danger" 
          style={{ 
            marginTop: '3rem', 
            width: '100%', 
            padding: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            borderRadius: '0.75rem'
          }}
        >
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
