import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import Profile from './pages/Profile';
import MockInterview from './pages/MockInterview';
import InterviewFeedback from './pages/InterviewFeedback';
import Analytics from './pages/Analytics';
import CompanySelection from './pages/CompanySelection';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
import CodePlayground from './pages/CodePlayground';
import Navbar from './components/Navbar';
import './index.css';
import ConversationalInterview from './pages/ConversationalInterview';
import Gamification from './pages/Gamification';
import ResumeBuilder from './pages/ResumeBuilder';
import PeerInterview from './pages/PeerInterview';
import RecruiterDashboard from './pages/RecruiterDashboard';

const AppContent = () => {
  const location = useLocation();
  const isInterviewPage = location.pathname.startsWith('/interview/');
  const isPlaygroundPage = location.pathname.startsWith('/playground');
  const isConversationalPage = location.pathname === '/conversational-interview';
  const isResumeBuilder = location.pathname === '/resume-builder';

  return (
    <>
      {!(isInterviewPage || isPlaygroundPage || isConversationalPage || isResumeBuilder) && <Navbar />}
      <main className="min-h-screen">
        <Routes>
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <ResumeUpload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company-prep" 
            element={
              <ProtectedRoute>
                <CompanySelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile"  
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview/:sessionId" 
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback/:sessionId" 
            element={
              <ProtectedRoute>
                <InterviewFeedback />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/conversational-interview"
            element={
              <ProtectedRoute>
                <ConversationalInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification"
            element={
              <ProtectedRoute>
                <Gamification />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/playground" 
            element={
              <ProtectedRoute>
                <CodePlayground />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resume-builder" 
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/peer-interview"
            element={
              <ProtectedRoute>
                <PeerInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Toaster position="top-center" reverseOrder={false} />
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
