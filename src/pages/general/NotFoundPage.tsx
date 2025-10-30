{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  // Update document title
  React.useEffect(() => {
    const prev = document.title;
    document.title = "404 • Page not found";
    return () => { document.title = prev; };
  }, []);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="reset-password-container">
      {/* Background geometric patterns */}
      <div className="reset-password-background">
        <div className="geometric-pattern pattern-1"></div>
        <div className="geometric-pattern pattern-2"></div>
        <div className="geometric-pattern pattern-3"></div>
      </div>

      {/* Logo */}
      <div className="reset-password-logo">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 0L24.4721 15.5279L40 20L24.4721 24.4721L20 40L15.5279 24.4721L0 20L15.5279 15.5279L20 0Z" fill="white"/>
        </svg>
        <span>Ticketer</span>
      </div>

      {/* Main card */}
      <div className="reset-password-card">
        {/* Header */}
        <div className="reset-password-header">
          <div className="reset-password-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="reset-password-title">404 - Page Not Found</h1>
          <p className="reset-password-subtitle">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        {/* Content */}
        <div className="reset-password-form">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Sorry, we couldn't find the page you were looking for. 
              You might want to check the URL or return to a safe place.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="reset-password-button"
              style={{ 
                background: '#06b6d4',
                borderColor: '#06b6d4'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Go to Dashboard
            </button>
            
            <button
              type="button"
              onClick={goBack}
              className="reset-password-button secondary"
              style={{ 
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Go Back
            </button>
          </div>

          {/* Additional Help Links */}
          <div className="sign-in-link" style={{ marginTop: '2rem' }}>
            <span>Need help? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="link-button"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;