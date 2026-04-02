import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          console.log('Session restored user data:', res.data.data);
          setUser(res.data.data);
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    // Be robust about user data location
    const userData = res.data.data || res.data.user || (res.data.email ? res.data : null);
    setUser(userData);
    return res.data;
  };

  const googleLogin = async (idToken, role) => {
    const res = await api.post('/auth/google-login', { idToken, role });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    const userData = res.data.data || res.data.user || (res.data.email ? res.data : null);
    console.log('Google login user data receipt:', userData);
    console.log('Avatar URL being used:', userData?.avatar);
    setUser(userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('ad_dismissed');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
