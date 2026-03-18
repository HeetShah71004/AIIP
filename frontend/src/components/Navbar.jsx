import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Upload, BarChart3, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <nav className="glass" style={{ margin: '1rem 2rem', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)', textDecoration: 'none' }}>
        AI Interview Platform
      </Link>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link to="/upload" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', textDecoration: 'none' }}>
          <Upload size={20} /> Upload Resume
        </Link>
        <Link to="/analytics" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', textDecoration: 'none' }}>
          <BarChart3 size={20} /> Analytics
        </Link>

        {/* Profile badge with dropdown — positioned last */}
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="profile-badge standalone"
            onClick={() => setDropdownOpen((prev) => !prev)}
            title={user.name || user.email}
          >
            <div className="avatar-circle">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name || 'User'} referrerPolicy="no-referrer" />
              ) : (
                (user.name || user.email) ? (
                  <span>{(user.name || user.email).charAt(0).toUpperCase()}</span>
                ) : (
                  <UserIcon size={20} />
                )
              )}
            </div>
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown">
              <Link
                to="/profile"
                className="profile-dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <UserIcon size={16} /> View Profile
              </Link>
              <div className="profile-dropdown-divider" />
              <button
                className="profile-dropdown-item danger"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          position: relative;
          padding: 0.5rem 0;
          transition: color 0.3s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-50%);
          border-radius: 2px;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .nav-link:hover {
          color: var(--primary) !important;
        }

        .avatar-circle {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
        }
        .profile-badge:hover .avatar-circle {
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
        }
        .profile-badge:active .avatar-circle {
          transform: scale(0.95);
        }

        .profile-dropdown {
          animation: dropdownFade 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(30, 41, 59, 0.9) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
          padding: 0.5rem !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3) !important;
        }

        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .profile-dropdown-item {
          border-radius: 0.75rem !important;
          margin: 0.25rem 0;
          transition: all 0.2s ease !important;
        }
        .profile-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          padding-left: 1.25rem !important;
        }
        .profile-dropdown-item.danger:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
        }
      ` }} />
    </nav>
  );
};

export default Navbar;
