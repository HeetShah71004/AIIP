import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Upload, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="glass" style={{ margin: '1rem 2rem', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)', textDecoration: 'none' }}>
        AI Interview Platform
      </Link>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link to="/upload" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', textDecoration: 'none' }}>
          <Upload size={20} /> Upload Resume
        </Link>
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', textDecoration: 'none' }}>
          <User size={20} /> Profile
        </Link>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
