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
      <DialogContent className="sm:max-w-[440px] bg-background border-border p-10 rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-border transition-colors duration-300">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        {currentView === 'login' ? (
          <LoginForm 
            onSuccess={() => {
              onClose();
              window.location.href = '/dashboard';
            }} 
            onSwitchToSignup={() => setCurrentView('signup')} 
          />
        ) : (
          <SignupForm 
            onSuccess={() => {
              onClose();
              window.location.href = '/dashboard';
            }} 
            onSwitchToLogin={() => setCurrentView('login')} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
