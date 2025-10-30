{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Account Types and Interfaces
 * 
 * This module contains all type definitions and interfaces related to account management,
 * including API requests, responses, and data structures used throughout the application.
 * 
 * Key Features:
 * - Centralized type definitions for account operations
 * - Request/Response interfaces for API calls
 * - Type-safe data structures
 * - Comprehensive documentation for all types
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2024
 */

/**
 * Interface for password change request payload
 */
export interface ChangePasswordRequest {
  /** Username for the password change request */
  userName: string;
  /** Current user password for verification */
  currentPassword: string;
  /** New password to set */
  newPassword: string;
  /** Confirmation of new password (client-side validation only) */
  confirmPassword: string;
}

/**
 * Interface for profile update request payload
 */
export interface UpdateProfileRequest {
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** User's email address */
  email?: string;
  /** User's phone number */
  phone?: string;
  /** Profile picture file */
  avatar?: File;
}

/**
 * Interface for account settings update request
 */
export interface AccountSettingsRequest {
  /** Email notification preferences */
  emailNotifications?: boolean;
  /** SMS notification preferences */
  smsNotifications?: boolean;
  /** Two-factor authentication enabled */
  twoFactorAuth?: boolean;
  /** Preferred language */
  language?: string;
  /** Timezone preference */
  timezone?: string;
}

/**
 * Interface for forgot password request payload
 */
export interface ForgotPasswordRequest {
  /** Email address for password reset */
  emailAddress: string;
  token: string;
}

/**
 * Interface for confirm email request payload (matches backend ConfirmEmailRequest)
 */
export interface ConfirmEmailRequest {
  /** Email address for password reset */
  emailAddress: string;
  /** Reset token */
  token: string;
}

/**
 * Interface for reset password request payload
 */
export interface ResetPasswordRequest {
  /** Email address for the reset */
  emailAddress: string;
  /** Reset token from email link */
  token: string;
  /** New password to set */
  newPassword: string;
  /** Confirmation of new password */
  confirmPassword: string;
}

/**
 * Interface for user registration request payload
 */
export interface RegisterUserRequest {
  /** Username for the new account */
  userName: string;
  /** Email address for the new account */
  emailAddress: string;
  /** Password for the new account */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Optional phone number */
  phoneNumber?: string;
}

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  /** Success status of the request */
  success: boolean;
  /** Response message */
  message: string;
  /** Response data payload */
  data?: T;
  /** Error details if request failed */
  error?: string;
}

/**
 * Two-Factor Authentication request payload
 */
export interface Send2FARequest {
  /** User's email address */
  emailAddress: string;
  /** Authentication token from initial login */
  token: string;
}

/**
 * Two-Factor Authentication verification payload
 */
export interface Verify2FARequest {
  /** User's email address */
  emailAddress: string;
  /** Authentication token from initial login */
  token: string;
  /** OTP code entered by user */
  otpCode: string;
}

/**
 * Two-Factor Authentication response
 */
export interface TwoFactorAuthResponse {
  /** Whether 2FA is required */
  requiresTwoFactor: boolean;
  /** Temporary token for 2FA verification */
  tempToken?: string;
  /** Message to display to user */
  message: string;
}

/**
 * Password strength validation response
 */
export interface PasswordStrengthResponse {
  /** Overall strength score (0-100) */
  score: number;
  /** Validation status */
  isValid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of improvement suggestions */
  suggestions: string[];
}

/**
 * API endpoint paths configuration for account operations
 */
export interface ApiPaths {
  /** Change password endpoint variations */
  changePassword: readonly string[];
  /** Forgot password endpoint variations */
  forgotPassword: readonly string[];
  /** Reset password endpoint variations */
  resetPassword: readonly string[];
  /** User registration endpoint variations */
  register: readonly string[];
  /** Email confirmation endpoint variations */
  confirmEmail: readonly string[];
  /** Profile update endpoint */
  updateProfile: string;
  /** Account settings endpoint */
  updateSettings: string;
  /** Get profile endpoint */
  getProfile: string;
  /** Delete account endpoint */
  deleteAccount: string;
}

/**
 * Default API paths implementation
 */
export class DefaultApiPaths implements ApiPaths {
  
  readonly login = [
    'api/account/login',
    'api/auth/login',
  ] as const;

  readonly logout = [
    'api/account/logout',
    'api/auth/logout',
  ] as const;

  readonly changePassword = [
    'api/account/changePassword',
    'api/auth/changePassword',
  ] as const;

  readonly forgotPassword = [
    'api/account/forgotPassword',
    'api/auth/forgotPassword',
  ] as const;

  readonly resetPassword = [
    'api/account/resetPassword',
    'api/auth/resetPassword',
  ] as const;

  readonly register = [
    'api/account/register',
    'api/auth/register',
  ] as const;

  readonly confirmEmail = [
    'api/account/confirm-email',
    'api/auth/confirm-email',
    'confirm-email'
  ] as const;

  readonly updateProfile = '/api/account/profile';
  readonly updateSettings = '/api/account/settings';
  readonly getProfile = '/api/account/profile';
  readonly deleteAccount = '/api/account/delete';
  
  readonly send2FA = [
    'api/auth/send2fa',
    'api/account/send2fa',
  ] as const;

  readonly verify2FA = [
    'api/auth/verify2fa', 
    'api/account/verify2fa',
  ] as const;
}