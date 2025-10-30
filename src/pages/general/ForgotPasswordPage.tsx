{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Forgot Password Page Component
 * 
 * Professional password reset interface with modern design, email validation,
 * and enhanced user experience. Features a centered card layout with gradient background,
 * comprehensive form validation, and user-friendly feedback messages.
 * 
 * Features:
 * - Modern centered card design with gradient background
 * - Real-time email validation
 * - Comprehensive form validation with React Hook Form and Zod
 * - Professional UI with smooth animations and transitions
 * - Responsive design for all screen sizes
 * - Accessibility compliant with proper ARIA labels
 * - Error handling with user-friendly messages
 * - Success state with clear next steps
 * 
 * @author Ticketer Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../apis/useAccount';
import '../../themes/theme.css';

/**
 * Forgot password form validation schema
 */
const forgotPasswordSchema = z.object({
  emailAddress: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .transform(email => email.toLowerCase().trim()),
});

/**
 * Form data type derived from validation schema
 */
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;



/**
 * Forgot Password Page Component
 * 
 * Provides a secure and user-friendly interface for users to request password resets.
 * Includes real-time validation, professional UI, and comprehensive error handling.
 * 
 * @returns JSX.Element - The forgot password page component
 */
const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, isLoading, error } = useAccount();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  /**
   * Initialize form with React Hook Form and Zod validation
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  /**
   * Handle form submission
   * 
   * @param data - Form data containing email address
   */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      // console.log('Sending forgot password request for:', data.emailAddress); // SECURITY: Contains email address

      await forgotPassword({ emailAddress: data.emailAddress, token: '' });

      setSubmitSuccess(true);
      reset();

      // Auto redirect to login after success message is shown
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      console.error('Forgot password error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Failed to send password reset email. Please try again.'
      );
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
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="reset-password-title">Forgot Password</h1>
          <p className="reset-password-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <div>
              <div>Password reset email sent successfully!</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: '0.8' }}>
                Check your email for reset instructions. Redirecting to login...
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(submitError || error) && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {submitError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="emailAddress" className="form-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                {...register('emailAddress')}
                type="email"
                id="emailAddress"
                className={`form-input ${errors.emailAddress ? 'error' : ''}`}
                placeholder="Enter your email address"
                autoComplete="email"
                autoFocus
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
            </div>
            {errors.emailAddress && (
              <span className="error-text">{errors.emailAddress.message}</span>
            )}
          </div>

          {/* Information Notice */}
          <div className="info-notice">
            <div className="info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <div className="info-text">
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>We'll send a secure reset link to your email</li>
                <li>Click the link to create a new password</li>
                <li>The link expires in 24 hours for security</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Sending Reset Email...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Send Reset Email
              </>
            )}
          </button>

          {/* Back to Login Link */}
          <div className="sign-in-link">
            <span>Remember your password? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="link-button"
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;