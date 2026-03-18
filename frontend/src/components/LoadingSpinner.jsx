import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullPage = false, message = "Loading...", size = 40 }) => {
  if (fullPage) {
    return (
      <div className="loading-container">
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ 
            position: 'absolute', 
            width: `${size + 20}px`, 
            height: `${size + 20}px`, 
            borderRadius: '50%', 
            background: 'var(--primary)', 
            filter: 'blur(40px)', 
            opacity: 0.2 
          }} />
          <Loader2 className="animate-spin" size={size} color="var(--primary)" />
        </div>
        {message && <p className="loading-text">{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <Loader2 className="animate-spin" size={size} />
      {message && <span>{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
