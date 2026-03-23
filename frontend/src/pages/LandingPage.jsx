import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import MockChat from '../components/landing/MockChat';
import SocialProof from '../components/landing/SocialProof';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Pricing from '../components/landing/Pricing';
import CTA from '../components/landing/CTA';
import LandingFooter from '../components/landing/LandingFooter';
import AuthModal from '../components/landing/AuthModal';

const LandingPage = () => {
  const [authModal, setAuthModal] = React.useState({ isOpen: false, view: 'login' });

  const openLogin = () => setAuthModal({ isOpen: true, view: 'login' });
  const openSignup = () => setAuthModal({ isOpen: true, view: 'signup' });
  const closeAuthModal = () => setAuthModal({ ...authModal, isOpen: false });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground transition-colors duration-300">
      <LandingNavbar onLogin={openLogin} onSignup={openSignup} />
      <main>
        <Hero onSignup={openSignup} onLogin={openLogin} />
        <MockChat />
        <SocialProof />
        <HowItWorks />
        <Pricing onSignup={openSignup} />
        <Features />
        <CTA onSignup={openSignup} />
      </main>
      <LandingFooter />
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={closeAuthModal} 
        view={authModal.view} 
      />
    </div>
  );
};

export default LandingPage;
