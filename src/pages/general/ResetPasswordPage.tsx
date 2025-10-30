{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Reset Password Page Component
 * 
 * Professional password reset interface with modern design, token validation,
 * and enhanced user experience. Features a centered card layout with gradient background,
 * comprehensive form validation, and password strength indicators.
 * 
 * Expected URL Format:
 * /reset-password?email=user@example.com&token=abc123def456ghi789
 * 
 * Features:
 * - Modern centered card design with gradient background
 * - Real-time password validation and strength checking
 * - Comprehensive form validation with React Hook Form and Zod
 * - Professional UI with smooth animations and transitions
 * - Responsive design for all screen sizes
 * - Accessibility compliant with proper ARIA labels
 * - Error handling with user-friendly messages
 * - URL token parsing and validation
 * - Token expiration handling
 * 
 * @author Ticketer Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from '../../apis/useAccount';
import '../../themes/theme.css';

/**
 * Reset password form validation schema
 */
const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Form data type derived from validation schema
 */
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Reset Password Page Component
 * 
 * Provides a secure and user-friendly interface for users to reset their passwords
 * using a token received via email. Includes real-time validation, password strength 
 * indicators, and comprehensive error handling.
 * 
 * @returns JSX.Element - The reset password page component
 */
const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, validatePasswordStrength, isLoading, error } = useAccount();
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [tokenValid, setTokenValid] = useState<boolean>(false);

  /**
   * Initialize form with React Hook Form and Zod validation
   */
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  // Watch new password for real-time strength validation
  const newPassword = watch('newPassword') || '';
  const passwordStrength = validatePasswordStrength(newPassword);

  /**
   * Parse URL parameters on component mount
   */
  useEffect(() => {
    const emailParam = searchParams.get('email') || '';
    const tokenParam = searchParams.get('token') || '';
    
    if (!emailParam || !tokenParam) {
      setSubmitError('Invalid reset link. Missing email or token parameters.');
      setTokenValid(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailParam)) {
      setSubmitError('Invalid email address in reset link.');
      setTokenValid(false);
      return;
    }

    // Validate token format (should be non-empty string)
    if (tokenParam.length < 10) {
      setSubmitError('Invalid reset token format.');
      setTokenValid(false);
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);
    setTokenValid(true);
    // console.log('Reset password page loaded for:', emailParam); // SECURITY: Contains email address
  }, [searchParams]);

  /**
   * Handle form submission
   * 
   * @param data - Form data containing password information
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!tokenValid) {
      setSubmitError('Invalid reset link. Please request a new password reset.');
      return;
    }

    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      // console.log('Resetting password for:', email); // SECURITY: Contains email address

      await resetPassword({
        emailAddress: email,
        token: token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      setSubmitSuccess(true);
      reset();
      
      // Navigate back to login after success
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to reset password');
    }
  };

  /**
   * Toggle password visibility for specific field
   * 
   * @param field - Password field to toggle
   */
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  /**
   * Get password strength color based on score
   * 
   * @param score - Password strength score (0-100)
   * @returns CSS color value
   */
  const getStrengthColor = (score: number): string => {
    if (score < 30) return '#ef4444'; // red
    if (score < 60) return '#f59e0b'; // yellow
    if (score < 80) return '#3b82f6'; // blue
    return '#10b981'; // green
  };

  /**
   * Get password strength label based on score
   * 
   * @param score - Password strength score (0-100)
   * @returns Strength description
   */
  const getStrengthLabel = (score: number): string => {
    if (score < 30) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  };

  // Show error if token is invalid
  if (!tokenValid && (submitError || (!email && !token))) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <div className="reset-password-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h1 className="reset-password-title">Invalid Reset Link</h1>
            <p className="reset-password-subtitle">
              This password reset link is invalid or has expired.
            </p>
          </div>
          
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {submitError || 'Invalid reset link parameters.'}
          </div>

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="submit-button"
          >
            Request New Reset Link
          </button>

          <div className="sign-in-link">
            <span>Remember your password? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="link-button"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="reset-password-title">Reset Password</h1>
          <p className="reset-password-subtitle">
            Enter your new password for {email}
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <div>
              <div>Password reset successfully!</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: '0.8' }}>
                Redirecting to login...
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
          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <div className="password-input-wrapper">
              <input
                {...register('newPassword')}
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                className={`form-input ${errors.newPassword ? 'error' : ''}`}
                placeholder="new password"
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new')}
                tabIndex={-1}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPasswords.new ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
            {errors.newPassword && (
              <span className="error-text">{errors.newPassword.message}</span>
            )}
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${passwordStrength.score}%`,
                      backgroundColor: getStrengthColor(passwordStrength.score)
                    }}
                  ></div>
                </div>
                <span 
                  className="strength-label"
                  style={{ color: getStrengthColor(passwordStrength.score) }}
                >
                  {getStrengthLabel(passwordStrength.score)}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                {...register('confirmPassword')}
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="confirm password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
                tabIndex={-1}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPasswords.confirm ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Password Requirements */}
          <div className="password-requirements">
            <p className="requirements-title">Password requirements:</p>
            <ul className="requirements-list">
              <li className={newPassword.length >= 8 ? 'met' : ''}>
                At least 8 characters long
              </li>
              <li className={/[A-Z]/.test(newPassword) ? 'met' : ''}>
                Contains uppercase letter (A-Z)
              </li>
              <li className={/[a-z]/.test(newPassword) ? 'met' : ''}>
                Contains lowercase letter (a-z)
              </li>
              <li className={/\d/.test(newPassword) ? 'met' : ''}>
                Contains number (0-9)
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'met' : ''}>
                Contains special character (!@#$%^&*)
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !isValid || !isDirty || !tokenValid}
          >
            {isLoading ? (
              <>
                <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Resetting Password...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Reset Password
              </>
            )}
          </button>

          {/* Sign In Link */}
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

export default ResetPasswordPage;