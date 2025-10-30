{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Registration Page Component
 * 
 * Professional user registration interface with modern design, comprehensive validation,
 * and enhanced user experience. Features a centered card layout with gradient background,
 * real-time form validation, password strength indicators, and user-friendly feedback messages.
 * 
 * Features:
 * - Modern centered card design with gradient background
 * - Real-time form validation and password strength checking
 * - Comprehensive form validation with React Hook Form and Zod
 * - Professional UI with smooth animations and transitions
 * - Responsive design for all screen sizes
 * - Accessibility compliant with proper ARIA labels
 * - Error handling with user-friendly messages
 * - Success state with clear next steps
 * - Email availability validation
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
 * Registration form validation schema
 */
const registrationSchema = z.object({
  emailAddress: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .transform(email => email.toLowerCase().trim()),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .transform(name => name.trim()),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .transform(name => name.trim()),
  phoneNumber: z
    .string()
    .transform(phone => phone?.trim() || '')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Form data type derived from validation schema
 */
type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Registration Page Component
 * 
 * Provides a secure and user-friendly interface for new users to create accounts.
 * Includes real-time validation, password strength checking, and comprehensive error handling.
 * 
 * @returns JSX.Element - The registration page component
 */
const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser, validatePasswordStrength, isLoading, error } = useAccount();
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
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
  });

  // Watch password for real-time strength validation
  const password = watch('password') || '';
  const passwordStrength = validatePasswordStrength(password);

  /**
   * Handle form submission
   * 
   * @param data - Form data containing registration information
   */
  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      // console.log('Registering user:', data.emailAddress); // SECURITY: Contains email address

      await registerUser({
        userName: data.emailAddress.split('@')[0], // Use email prefix as username
        emailAddress: data.emailAddress,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || undefined,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      setSubmitSuccess(true);
      reset();

      // Auto redirect to login after success message is shown
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Registration failed. Please try again.'
      );
    }
  };

  /**
   * Get password strength color based on score
   */
  const getPasswordStrengthColor = (score: number): string => {
    if (score < 40) return '#ef4444'; // Red
    if (score < 60) return '#f59e0b'; // Orange
    if (score < 80) return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  /**
   * Get password strength text based on score
   */
  const getPasswordStrengthText = (score: number): string => {
    if (score < 40) return 'Weak';
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="reset-password-title">Create Account</h1>
          <p className="reset-password-subtitle">
            Join us today and start managing your tasks efficiently
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <div>
              <div>Registration successful!</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: '0.8' }}>
                Please check your email for confirmation instructions. Redirecting to login...
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="emailAddress" className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                {...register('emailAddress')}
                type="email"
                id="emailAddress"
                className={`form-input ${errors.emailAddress ? 'error' : ''}`}
                placeholder="your.email@example.com"
                disabled={isLoading || submitSuccess}
                autoComplete="email"
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
            </div>
            {errors.emailAddress && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {errors.emailAddress.message}
              </div>
            )}
          </div>

          {/* First Name and Last Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* First Name Field */}
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  {...register('firstName')}
                  type="text"
                  id="firstName"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="First name"
                  disabled={isLoading || submitSuccess}
                  autoComplete="given-name"
                />
              </div>
              {errors.firstName && (
                <div className="field-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {errors.firstName.message}
                </div>
              )}
            </div>

            {/* Last Name Field */}
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Last name"
                  disabled={isLoading || submitSuccess}
                  autoComplete="family-name"
                />
              </div>
              {errors.lastName && (
                <div className="field-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {errors.lastName.message}
                </div>
              )}
            </div>
          </div>

          {/* Phone Number Field (Optional) */}
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>(Optional)</span>
            </label>
            <div className="input-wrapper">
              <input
                {...register('phoneNumber')}
                type="tel"
                id="phoneNumber"
                className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                placeholder="Enter your phone number"
                disabled={isLoading || submitSuccess}
                autoComplete="tel"
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
            </div>
            {errors.phoneNumber && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {errors.phoneNumber.message}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                {...register('password')}
                type="password"
                id="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading || submitSuccess}
                autoComplete="new-password"
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${passwordStrength.score}%`, 
                      backgroundColor: getPasswordStrengthColor(passwordStrength.score) 
                    }}
                  />
                </div>
                <div className="strength-text" style={{ color: getPasswordStrengthColor(passwordStrength.score) }}>
                  Password strength: {getPasswordStrengthText(passwordStrength.score)}
                </div>
                {passwordStrength.errors.length > 0 && (
                  <ul className="strength-requirements">
                    {passwordStrength.errors.map((error, index) => (
                      <li key={index} style={{ color: '#ef4444' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        {error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {errors.password && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {errors.password.message}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                disabled={isLoading || submitSuccess}
                autoComplete="new-password"
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>
            {errors.confirmPassword && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {errors.confirmPassword.message}
              </div>
            )}
          </div>

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

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={!isValid || !isDirty || isLoading || submitSuccess}
          >
            {isLoading ? (
              <>
                <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Creating Account...
              </>
            ) : submitSuccess ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Account Created!
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Create Account
              </>
            )}
          </button>

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
              <p><strong>Account Verification Required</strong></p>
              <p>After registration, you'll receive a confirmation email. Please verify your email address to activate your account and access all features.</p>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="sign-in-link">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="link-button"
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;