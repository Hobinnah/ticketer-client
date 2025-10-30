{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Change Password Page Component
 * 
 * Professional password change interface with modern design, real-time validation,
 * and enhanced user experience. Fe  };

  // Show loading or redirect if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1 className="reset-password-title">Authentication Required</h1>
            <p className="reset-password-subtitle">Please log in to change your password.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="submit-button"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">`es a centered card layout with gradient background,
 * comprehensive form validation, and password strength indicators.
 * 
 * Features:
 * - Modern centered card design with gradient background
 * - Real-time password validation and strength checking
 * - Comprehensive form validation with React Hook Form and Zod
 * - Professional UI with smooth animations and transitions
 * - Responsive design for all screen sizes
 * - Accessibility compliant with proper ARIA labels
 * - Error handling with user-friendly messages
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
import { useAuth } from '../../hooks/useAuth';
import '../../themes/theme.css';

/**
 * Password change form validation schema
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

/**
 * Form data type derived from validation schema
 */
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Change Password Page Component
 * 
 * Provides a secure and user-friendly interface for users to change their passwords.
 * Includes real-time validation, password strength indicators, and comprehensive
 * error handling.
 * 
 * @returns JSX.Element - The change password page component
 */
const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { changePassword, validatePasswordStrength, isLoading } = useAccount();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  /**
   * Initialize form with React Hook Form and Zod validation
   */
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
  });

  // Watch new password for real-time strength validation
  const newPassword = watch('newPassword') || '';
  const passwordStrength = validatePasswordStrength(newPassword);

  /**
   * Handle form submission
   * 
   * @param data - Form data containing password information
   */
  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      // Get username from current user - try multiple fallbacks
      const userName = currentUser?.user?.userName || 
                     currentUser?.user?.email || 
                     currentUser?.name || 
                     '';

      // Validate that we have a username
      if (!userName) {
        throw new Error('User information not available. Please log in again.');
      }

      // console.log('Sending changePassword request with:', { // SECURITY: Contains sensitive user data
      //   userName,
      //   hasCurrentPassword: !!data.currentPassword,
      //   hasNewPassword: !!data.newPassword,
      //   currentUser: currentUser,
      //   apiBaseUrl: window.location.origin
      // });

      await changePassword({
        userName,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      setSubmitSuccess(true);
      reset();
      
      // Navigate back after success
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error('Change password error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to change password');
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
          <p className="reset-password-subtitle">Hello {currentUser?.user?.firstName || 'User'}!</p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            Password changed successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {submitError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
          {/* Current Password */}
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <div className="password-input-wrapper">
              <input
                {...register('currentPassword')}
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                placeholder="current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('current')}
                tabIndex={-1}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPasswords.current ? (
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
            {errors.currentPassword && (
              <span className="error-text">{errors.currentPassword.message}</span>
            )}
          </div>

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

          {/* Remember password link */}
          <div className="remember-password">
            <span>Remember password?</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !isValid || !isDirty}
          >
            {isLoading ? (
              <>
                <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Creating...
              </>
            ) : (
              'Create'
            )}
          </button>

          {/* Sign In Link */}
          <div className="sign-in-link">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="link-button"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
