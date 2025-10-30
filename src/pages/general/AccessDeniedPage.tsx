{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import '../../themes/theme.css';

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/overview');
  }, [navigate]);

  const handleGoLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

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

      {/* Main Content */}
      <div className="reset-password-card">
        {/* Header */}
        <div className="reset-password-header">
          <div className="reset-password-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 className="reset-password-title">Access Denied</h1>
          <p className="reset-password-subtitle">
            You don't have permission to access this resource
          </p>
        </div>

        {/* Error Message */}
        <div className="error-message">
          <div className="error-code">
            <span className="error-number">403</span>
            <span className="error-text">Forbidden</span>
          </div>
          
          <p>
            Your current role doesn't have the required permissions to view this page. 
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="access-denied-actions">
          <button 
            onClick={handleGoBack}
            className="action-btn secondary-btn"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go Back
          </button>

          <button 
            onClick={handleGoHome}
            className="action-btn primary-btn"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go Home
          </button>

          <button 
            onClick={handleGoLogin}
            className="action-btn tertiary-btn"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Login Again
          </button>
        </div>

        {/* Help Section */}
        <div className="reset-password-footer">
          <div className="help-text">
            <p><strong>Need Help?</strong></p>
            <p>If you believe you should have access to this resource:</p>
            <ul style={{ 
              textAlign: 'left', 
              marginTop: '0.5rem',
              paddingLeft: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem'
            }}>
              <li>Contact your system administrator</li>
              <li>Verify your account permissions</li>
              <li>Try logging in with a different account</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}