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
import { ScrollArea } from '@/components/ui/scroll-area';
import './index.css';
import ConversationalInterview from './pages/ConversationalInterview';
import Gamification from './pages/Gamification';
import ResumeBuilder from './pages/ResumeBuilder';
import PeerInterview from './pages/PeerInterview';
import RecruiterDashboard from './pages/RecruiterDashboard';
import LearningRoadmap from './pages/LearningRoadmap';

const AppContent = () => {
  const location = useLocation();
  const isInterviewPage = location.pathname.startsWith('/interview/');
  const isPlaygroundPage = location.pathname.startsWith('/playground');
  const isConversationalPage = location.pathname === '/conversational-interview';
  const isResumeBuilder = location.pathname === '/resume-builder';

  return (
    <ScrollArea className="h-screen w-full">
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
              <ProtectedRoute allowedRoles={['candidate']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <ResumeUpload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company-prep" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CompanySelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile"  
            element={
              <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview/:sessionId" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <MockInterview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback/:sessionId" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <InterviewFeedback />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/conversational-interview"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <ConversationalInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <Gamification />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/playground" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CodePlayground />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resume-builder" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <ResumeBuilder />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/peer-interview"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <PeerInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-roadmap"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <LearningRoadmap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </ScrollArea>
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
