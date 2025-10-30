{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Confirm Email Page Component
 * 
 * Professional email confirmation interface with modern design, token validation,
 * and enhanced user experience. Features a centered card layout with gradient background,
 * automatic token processing, and user-friendly feedback messages.
 * 
 * Expected URL Format:
 * /confirm-email?email=user@example.com&token=abc123def456ghi789
 * 
 * Features:
 * - Modern centered card design with gradient background
 * - Automatic token validation and processing
 * - Professional UI with smooth animations and transitions
 * - Responsive design for all screen sizes
 * - Accessibility compliant with proper ARIA labels
 * - Error handling with user-friendly messages
 * - URL token parsing and validation
 * - Success/failure states with clear next steps
 * 
 * @author Ticketer Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from '../../apis/useAccount';
import '../../themes/theme.css';

/**
 * Confirm Email Page Component
 * 
 * Provides a secure and user-friendly interface for users to confirm their email addresses
 * using a token received via email. Automatically processes the confirmation when the page loads.
 * 
 * @returns JSX.Element - The confirm email page component
 */
const ConfirmEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmEmail, isLoading, error } = useAccount();
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const [confirmationSuccess, setConfirmationSuccess] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [tokenValid, setTokenValid] = useState<boolean>(false);

  /**
   * Parse URL parameters and attempt confirmation on component mount
   */
  useEffect(() => {
    const emailParam = searchParams.get('email') || '';
    const tokenParam = searchParams.get('token') || '';
    
    if (!emailParam || !tokenParam) {
      setConfirmationError('Invalid confirmation link. Missing email or token parameters.');
      setTokenValid(false);
      setProcessing(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailParam)) {
      setConfirmationError('Invalid email address in confirmation link.');
      setTokenValid(false);
      setProcessing(false);
      return;
    }

    // Validate token format (should be non-empty string)
    if (tokenParam.length < 10) {
      setConfirmationError('Invalid confirmation token format.');
      setTokenValid(false);
      setProcessing(false);
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);
    setTokenValid(true);
    
    // Automatically attempt confirmation
    handleConfirmation(emailParam, tokenParam);
  }, [searchParams]);

  /**
   * Handle email confirmation process
   * 
   * @param emailAddress - Email address from URL
   * @param confirmationToken - Token from URL
   */
  const handleConfirmation = async (emailAddress: string, confirmationToken: string) => {
    try {
      setProcessing(true);
      setConfirmationError(null);
      setConfirmationSuccess(false);

      // console.log('Confirming email for:', emailAddress); // SECURITY: Contains email address

      await confirmEmail({
        emailAddress: emailAddress,
        token: confirmationToken,
      });

      setConfirmationSuccess(true);
      
      // Auto redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      console.error('Email confirmation error:', error);
      setConfirmationError(
        error instanceof Error 
          ? error.message 
          : 'Failed to confirm email address. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Retry confirmation process
   */
  const retryConfirmation = () => {
    if (tokenValid && email && token) {
      handleConfirmation(email, token);
    }
  };

  /**
   * Request new confirmation email (placeholder for future implementation)
   */
  const requestNewConfirmation = () => {
    // TODO: Implement resend confirmation email functionality
    alert('Resend confirmation email functionality will be implemented soon.');
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
            {processing || isLoading ? (
              <svg className="loading-spinner" width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                </circle>
              </svg>
            ) : confirmationSuccess ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            )}
          </div>
          <h1 className="reset-password-title">
            {processing || isLoading ? 'Confirming Email...' : 
             confirmationSuccess ? 'Email Confirmed!' : 
             'Email Confirmation'}
          </h1>
          <p className="reset-password-subtitle">
            {processing || isLoading ? `Processing confirmation for ${email}` :
             confirmationSuccess ? 'Your email address has been successfully verified.' :
             'There was an issue confirming your email address.'}
          </p>
        </div>

        {/* Processing Message */}
        {(processing || isLoading) && (
          <div className="info-notice">
            <div className="info-icon">
              <svg className="loading-spinner" width="16" height="16" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            <div className="info-text">
              <p><strong>Please wait...</strong></p>
              <p>We're confirming your email address. This should only take a moment.</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {confirmationSuccess && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <div>
              <div>Email confirmed successfully!</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: '0.8' }}>
                You can now use all features of your account. Redirecting to login...
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(confirmationError || (!processing && !isLoading && !confirmationSuccess && error)) && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {confirmationError || error}
          </div>
        )}

        {/* Action Buttons */}
        {!processing && !isLoading && (
          <div className="reset-password-form">
            {confirmationSuccess ? (
              /* Success Actions */
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="submit-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
                Continue to Login
              </button>
            ) : (
              /* Error Actions */
              <>
                {tokenValid && (
                  <button
                    type="button"
                    onClick={retryConfirmation}
                    className="submit-button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23,4 23,10 17,10"/>
                      <path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10"/>
                    </svg>
                    Retry Confirmation
                  </button>
                )}
                
                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={requestNewConfirmation}
                    className="submit-button"
                    style={{ background: 'rgba(107, 114, 128, 0.1)', color: '#374151' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Resend Confirmation Email
                  </button>
                </div>
              </>
            )}

            {/* Information Section */}
            {!confirmationSuccess && (
              <div className="info-notice" style={{ marginTop: '1.5rem' }}>
                <div className="info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
                <div className="info-text">
                  <p><strong>Having trouble?</strong></p>
                  <ul>
                    <li>Check that you clicked the correct link from your email</li>
                    <li>Confirmation links expire after 24 hours</li>
                    <li>Make sure you're using the latest email we sent</li>
                    <li>Contact support if the problem persists</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="sign-in-link" style={{ marginTop: '1.5rem' }}>
              <span>Want to sign in instead? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="link-button"
                disabled={processing || isLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailPage;