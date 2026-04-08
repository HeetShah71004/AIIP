import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import LoginForm from '../LoginForm';
import SignupForm from '../SignupForm';

const AuthModal = ({ isOpen, onClose, view = 'login' }) => {
  const [currentView, setCurrentView] = React.useState(view);

  React.useEffect(() => {
    setCurrentView(view);
  }, [view]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] w-[92vw] bg-background border-border p-0 rounded-[32px] overflow-hidden shadow-none ring-1 ring-border transition-colors duration-300">
        <div className="px-7 sm:px-9 py-6">
          {currentView === 'login' ? (
            <LoginForm 
              onSuccess={(userData) => {
                onClose();
                const role = userData?.role || userData?.data?.role || 'candidate';
                window.location.href = role === 'recruiter' ? '/recruiter-dashboard' : '/dashboard';
              }} 
              onSwitchToSignup={() => setCurrentView('signup')} 
            />
          ) : (
            <SignupForm 
              onSuccess={(userData) => {
                onClose();
                const role = userData?.role || userData?.data?.role || 'candidate';
                window.location.href = role === 'recruiter' ? '/recruiter-dashboard' : '/dashboard';
              }} 
              onSwitchToLogin={() => setCurrentView('login')} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
