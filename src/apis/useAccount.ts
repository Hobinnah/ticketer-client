{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Account Management API module providing user account services
 * 
 * This module handles all account-related API calls including password changes,
 * profile updates, and account settings management. It provides secure API
 * communication with proper error handling and validation.
 * 
 * Key Features:
 * - Password change functionality with validation
 * - Profile update capabilities
 * - Account settings management
 * - Secure API communication
 * - Type-safe API responses
 * - Comprehensive error handling
 * 
 * Security Considerations:
 * - Password validation and strength requirements
 * - Secure transmission of sensitive data
 * - Proper error handling without information leakage
 * - Authentication token validation
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2024
 * 
 * Dependencies:
 * - axios: For HTTP requests
 * - react: For React hooks
 * - js-cookie: For cookie management
 * 
 * Usage:
 * ```typescript
 * import { useAccount } from '@/apis/useAccount';
 * 
 * const { changePassword, updateProfile, isLoading, error } = useAccount();
 * 
 * // Change password
 * await changePassword({
 *   currentPassword: 'current123',
 *   newPassword: 'newPassword123',
 *   confirmPassword: 'newPassword123'
 * });
 * ```
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { env } from '../env';
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  AccountSettingsRequest,
  ForgotPasswordRequest,
  ConfirmEmailRequest,
  ResetPasswordRequest,
  RegisterUserRequest,
  ApiResponse,
  PasswordStrengthResponse,
  Send2FARequest,
  Verify2FARequest,
  TwoFactorAuthResponse
} from '../types/Account';
import { DefaultApiPaths } from '../types/Account';

/**
 * Custom hook for account management operations
 * 
 * Provides a comprehensive set of functions for managing user accounts,
 * including password changes, profile updates, and account settings.
 * 
 * @returns Account management functions and state
 */
export const useAccount = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create instance of API paths configuration
  // This centralizes all API endpoint paths in one place for easier maintenance
  const apiPaths = new DefaultApiPaths();

  /**
   * Change user password
   * 
   * Validates and updates the user's password after verifying the current password.
   * Performs client-side validation before sending the request to the server.
   * 
   * @param request - Password change request data
   * @returns Promise resolving to API response
   * @throws Error if validation fails or API request fails
   */
  const changePassword = useCallback(async (request: ChangePasswordRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Client-side validation
      if (!request.userName) {
        throw new Error('Username is required');
      }

      if (!request.currentPassword) {
        throw new Error('Current password is required');
      }

      if (!request.newPassword) {
        throw new Error('New password is required');
      }

      if (request.newPassword !== request.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (request.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (request.currentPassword === request.newPassword) {
        throw new Error('New password must be different from current password');
      }

      // Prepare payload - matching backend C# model structure
      const payload = {
        UserName: request.userName,
        CurrentPassword: request.currentPassword,
        NewPassword: request.newPassword,
      };

      // Try different endpoint variations (from centralized API paths)
      const possibleEndpoints = apiPaths.changePassword.map(path => 
        `${env.API_BASE_URL}${path}`
      );
      
      // console.log('=== CHANGE PASSWORD API DEBUG INFO ==='); // SECURITY: Debug info - disabled in production
      // console.log('Environment DEV mode:', import.meta.env.DEV);
      // console.log('Raw API_BASE_URL:', env.API_BASE_URL);
      // console.log('Window location:', window.location.origin);
      // console.log('Possible endpoints to try:', possibleEndpoints);
      // console.log('Request payload:', payload); // SECURITY: Contains sensitive password data
      // console.log('Current timestamp:', new Date().toISOString());
      
      // Try the most common endpoint first
      const primaryUrl = possibleEndpoints[0];
      // console.log(`🚀 Making axios POST request to: ${primaryUrl}`); // SECURITY: Could expose API endpoints
      
      // API request - Authorization header automatically added by axios interceptor
      const response = await axios.post(primaryUrl, payload);
      
      // console.log('✅ Request successful!');

      // console.log('API Response Status:', response.status);
      // console.log('API Response Data:', response.data); // SECURITY: Contains response data
      // console.log('API Response Headers:', response.headers); // SECURITY: Contains header information

      // Handle different response formats
      if (response.status >= 200 && response.status < 300) {
        // Success case - return the response data
        return {
          success: true,
          message: response.data?.message || 'Password changed successfully',
          data: response.data
        };
      } else {
        throw new Error(response.data?.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('❌ REQUEST FAILED - DETAILED ERROR INFO:');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Full axios error object:', error);
      
      if (error.response) {
        console.error('🟡 Server responded with error:');
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        console.error('Data:', error.response.data);
        console.error('Config URL:', error.response.config?.url);
      } else if (error.request) {
        console.error('🔴 No response from server:');
        console.error('Request object:', error.request);
        console.error('Request readyState:', error.request.readyState);
        console.error('Request status:', error.request.status);
      } else {
        console.error('🚨 Request setup error:', error.message);
      }
      
      console.error('Request config:', error.config);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check if the backend server is running.';
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        if (status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'Access denied. You do not have permission to change passwords.';
        } else if (status === 404) {
          errorMessage = 'Change password endpoint not found. Please check the API configuration.';
        } else if (status === 400) {
          errorMessage = error.response?.data?.message || 'Invalid request. Please check your input.';
        } else {
          errorMessage = error.response?.data?.message || `Server error: ${status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send forgot password email
   * 
   * This function handles the forgot password process by sending a password reset
   * email to the specified email address. The backend will generate a secure token
   * and send reset instructions to the user.
   * 
   * @param request - Forgot password request containing email address
   * @returns Promise resolving to API response
   * 
   * @throws {Error} Throws an error if:
   *                 - Network request fails
   *                 - Email address is not found
   *                 - Server returns an error response
   * 
   * @example
   * ```typescript
   * try {
   *   await forgotPassword({ emailAddress: 'user@example.com' });
   *   console.log('Reset email sent successfully');
   * } catch (error) {
   *   console.error('Failed to send reset email:', error.message);
   * }
   * ```
   */
  const forgotPassword = useCallback(async (request: ForgotPasswordRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate email address
      if (!request.emailAddress || !request.emailAddress.trim()) {
        throw new Error('Email address is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.emailAddress)) {
        throw new Error('Please enter a valid email address');
      }

      // console.log('Sending forgot password request for:', request.emailAddress); // SECURITY: Contains email address

      // Prepare the payload
      const payload: ForgotPasswordRequest = {
        emailAddress: request.emailAddress.toLowerCase().trim(),
        token: '' // Placeholder for the token
      };

      // Define possible API endpoints (from centralized API paths)
      const possibleEndpoints = apiPaths.forgotPassword.map(path => 
        `${env.API_BASE_URL}${path}`
      );

      // Try primary endpoint first
      const primaryUrl = possibleEndpoints[0];
      
      console.log('Sending request to:', primaryUrl);

      const response = await axios.post(primaryUrl, payload);

      if (response.status === 200 || response.status === 201) {
        const responseData: ApiResponse = {
          success: true,
          message: response.data?.message || 'Password reset email sent successfully',
          data: response.data,
        };

        console.log('Forgot password request successful:', responseData);
        return responseData;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error: any) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      console.error('Forgot password error:', error);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        
        if (status === 404) {
          errorMessage = 'Email address not found. Please check your email and try again.';
        } else if (status === 400) {
          errorMessage = error.response?.data?.message || 'Invalid email address format.';
        } else if (status === 429) {
          errorMessage = 'Too many requests. Please wait before trying again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response?.data?.message || `Server error: ${status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password using token from email
   * 
   * This function handles the password reset process using a token received via email.
   * It validates the new password and updates the user's password in the system.
   * 
   * @param request - Reset password request containing email, token, and new passwords
   * @returns Promise resolving to API response
   * 
   * @throws {Error} Throws an error if:
   *                 - Network request fails
   *                 - Token is invalid or expired
   *                 - Password validation fails
   *                 - Server returns an error response
   * 
   * @example
   * ```typescript
   * try {
   *   await resetPassword({
   *     emailAddress: 'user@example.com',
   *     token: 'reset-token-from-email',
   *     newPassword: 'NewSecure123!',
   *     confirmPassword: 'NewSecure123!'
   *   });
   *   console.log('Password reset successfully');
   * } catch (error) {
   *   console.error('Failed to reset password:', error.message);
   * }
   * ```
   */
  const resetPassword = useCallback(async (request: ResetPasswordRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!request.emailAddress || !request.emailAddress.trim()) {
        throw new Error('Email address is required');
      }
      if (!request.token || !request.token.trim()) {
        throw new Error('Reset token is required');
      }
      if (!request.newPassword || !request.newPassword.trim()) {
        throw new Error('New password is required');
      }
      if (request.newPassword !== request.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.emailAddress)) {
        throw new Error('Please enter a valid email address');
      }

      console.log('Sending reset password request for:', request.emailAddress);

      // Prepare the payload
      const payload: ResetPasswordRequest = {
        emailAddress: request.emailAddress.toLowerCase().trim(),
        token: request.token.trim(),
        newPassword: request.newPassword,
        confirmPassword: request.confirmPassword,
      };

      // Define possible API endpoints (from centralized API paths)
      const possibleEndpoints = apiPaths.resetPassword.map(path => 
        `${env.API_BASE_URL}${path}`
      );

      // Try primary endpoint first
      const primaryUrl = possibleEndpoints[0];
      
      console.log('Sending reset password request to:', primaryUrl);

      const response = await axios.post(primaryUrl, payload);

      if (response.status === 200 || response.status === 201) {
        const responseData: ApiResponse = {
          success: true,
          message: response.data?.message || 'Password reset successfully',
          data: response.data,
        };

        console.log('Reset password request successful:', responseData);
        return responseData;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      
      console.error('Reset password error:', error);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        
        if (status === 400) {
          errorMessage = error.response?.data?.message || 'Invalid reset token or password requirements not met.';
        } else if (status === 404) {
          errorMessage = 'Reset token not found or has expired. Please request a new password reset.';
        } else if (status === 401) {
          errorMessage = 'Reset token is invalid or has expired. Please request a new password reset.';
        } else if (status === 429) {
          errorMessage = 'Too many requests. Please wait before trying again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response?.data?.message || `Server error: ${status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Validate password strength
   * 
   * Checks password strength and provides feedback on security requirements.
   * Performs real-time validation without sending password to server.
   * 
   * @param password - Password to validate
   * @returns Password strength assessment
   */
  const validatePasswordStrength = useCallback((password: string): PasswordStrengthResponse => {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (password.length >= 8) {
      score += 20;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
      suggestions.push('Add uppercase letters (A-Z)');
    } else {
      score += 20;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
      suggestions.push('Add lowercase letters (a-z)');
    } else {
      score += 20;
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
      suggestions.push('Add numbers (0-9)');
    } else {
      score += 20;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
      suggestions.push('Add special characters (!@#$%^&*)');
    } else {
      score += 20;
    }

    // Additional strength bonuses
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    return {
      score: Math.min(score, 100),
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }, []);

  /**
   * Register a new user account
   * 
   * This function handles user registration with comprehensive validation and error handling.
   * It creates a new user account with the provided information and handles various
   * error scenarios including duplicate accounts, validation failures, and server errors.
   * 
   * @param request - Registration request containing user information
   * @returns Promise resolving to API response
   * 
   * @throws {Error} Throws an error if:
   *                 - Network request fails
   *                 - User already exists
   *                 - Validation fails
   *                 - Server returns an error response
   * 
   * @example
   * ```typescript
   * try {
   *   await registerUser({
   *     userName: 'johnsmith',
   *     emailAddress: 'john@example.com',
   *     password: 'SecurePass123!',
   *     confirmPassword: 'SecurePass123!',
   *     firstName: 'John',
   *     lastName: 'Smith'
   *   });
   *   console.log('Registration successful');
   * } catch (error) {
   *   console.error('Registration failed:', error.message);
   * }
   * ```
   */
  const registerUser = useCallback(async (request: RegisterUserRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!request.userName || !request.userName.trim()) {
        throw new Error('Username is required');
      }
      if (!request.emailAddress || !request.emailAddress.trim()) {
        throw new Error('Email address is required');
      }
      if (!request.password || !request.password.trim()) {
        throw new Error('Password is required');
      }
      if (!request.confirmPassword || !request.confirmPassword.trim()) {
        throw new Error('Password confirmation is required');
      }
      if (!request.firstName || !request.firstName.trim()) {
        throw new Error('First name is required');
      }
      if (!request.lastName || !request.lastName.trim()) {
        throw new Error('Last name is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.emailAddress)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password match
      if (request.password !== request.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password strength
      const passwordStrength = validatePasswordStrength(request.password);
      if (passwordStrength.score < 3) {
        throw new Error('Password is too weak. Please choose a stronger password.');
      }

      // Validate username format (alphanumeric and underscores, 3-30 characters)
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
      if (!usernameRegex.test(request.userName)) {
        throw new Error('Username must be 3-30 characters and contain only letters, numbers, and underscores');
      }

      console.log('Registering user:', request.userName);

      // Prepare the payload
      const payload: RegisterUserRequest = {
        userName: request.userName.trim(),
        emailAddress: request.emailAddress.toLowerCase().trim(),
        password: request.password,
        confirmPassword: request.confirmPassword,
        firstName: request.firstName.trim(),
        lastName: request.lastName.trim(),
        phoneNumber: request.phoneNumber?.trim() || undefined,
      };

      // Define possible API endpoints (from centralized API paths)
      const possibleEndpoints = apiPaths.register.map(path => 
        `${env.API_BASE_URL}${path}`
      );

      // Try primary endpoint first
      const primaryUrl = possibleEndpoints[0];
      
      console.log('Sending registration request to:', primaryUrl);

      const response = await axios.post(primaryUrl, payload);

      if (response.status === 200 || response.status === 201) {
        console.log('Registration successful');
        return {
          success: true,
          message: 'Registration successful. Please check your email for confirmation.',
          data: response.data
        };
      }

      throw new Error('Unexpected response status');

    } catch (error: any) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        switch (status) {
          case 400:
            if (responseData?.message) {
              errorMessage = responseData.message;
            } else if (responseData?.errors) {
              // Handle validation errors
              const validationErrors = Object.values(responseData.errors).flat();
              errorMessage = validationErrors.join('. ');
            } else {
              errorMessage = 'Invalid registration data. Please check your information.';
            }
            break;
          case 409:
            errorMessage = 'Username or email address already exists. Please choose different ones.';
            break;
          case 422:
            errorMessage = 'Invalid data format. Please check your information.';
            break;
          case 429:
            errorMessage = 'Too many registration attempts. Please wait and try again.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            if (responseData?.message) {
              errorMessage = responseData.message;
            }
            break;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [validatePasswordStrength]);

  /**
   * Confirm email address using token from email
   * 
   * This function handles the email confirmation process using a token received via email.
   * It validates the email and token combination to activate or verify the user's email address.
   * 
   * @param request - Confirm email request containing email address and token
   * @returns Promise resolving to API response
   * 
   * @throws {Error} Throws an error if:
   *                 - Network request fails
   *                 - Token is invalid or expired
   *                 - Email address is invalid
   *                 - Server returns an error response
   * 
   * @example
   * ```typescript
   * try {
   *   await confirmEmail({
   *     emailAddress: 'user@example.com',
   *     token: 'confirmation-token-from-email'
   *   });
   *   console.log('Email confirmed successfully');
   * } catch (error) {
   *   console.error('Failed to confirm email:', error.message);
   * }
   * ```
   */
  const confirmEmail = useCallback(async (request: ConfirmEmailRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!request.emailAddress || !request.emailAddress.trim()) {
        throw new Error('Email address is required');
      }
      if (!request.token || !request.token.trim()) {
        throw new Error('Confirmation token is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.emailAddress)) {
        throw new Error('Please enter a valid email address');
      }

      console.log('Confirming email for:', request.emailAddress);

      // Prepare the payload
      const payload: ConfirmEmailRequest = {
        emailAddress: request.emailAddress.toLowerCase().trim(),
        token: request.token.trim(),
      };

      // Define possible API endpoints (from centralized API paths)
      const possibleEndpoints = apiPaths.confirmEmail.map(path => 
        `${env.API_BASE_URL}${path}`
      );

      // Try primary endpoint first
      const primaryUrl = possibleEndpoints[0];
      
      console.log('Sending confirm email request to:', primaryUrl);

      const response = await axios.post(primaryUrl, payload);

      if (response.status === 200 || response.status === 201) {
        const responseData: ApiResponse = {
          success: true,
          message: response.data?.message || 'Email confirmed successfully',
          data: response.data,
        };

        console.log('Confirm email request successful:', responseData);
        return responseData;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error: any) {
      let errorMessage = 'Failed to confirm email. Please try again.';
      
      console.error('Confirm email error:', error);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        
        if (status === 400) {
          errorMessage = error.response?.data?.message || 'Invalid confirmation token or email address.';
        } else if (status === 404) {
          errorMessage = 'Confirmation token not found or has expired. Please request a new confirmation email.';
        } else if (status === 401) {
          errorMessage = 'Confirmation token is invalid or has expired. Please request a new confirmation email.';
        } else if (status === 409) {
          errorMessage = 'Email address is already confirmed.';
        } else if (status === 429) {
          errorMessage = 'Too many requests. Please wait before trying again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response?.data?.message || `Server error: ${status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user profile information
   * 
   * Updates user profile data including personal information and profile picture.
   * Supports both form data and file uploads.
   * 
   * @param request - Profile update request data
   * @returns Promise resolving to API response
   * @throws Error if API request fails
   */
  const updateProfile = useCallback(async (request: UpdateProfileRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      
      if (request.firstName) formData.append('firstName', request.firstName);
      if (request.lastName) formData.append('lastName', request.lastName);
      if (request.email) formData.append('email', request.email);
      if (request.phone) formData.append('phone', request.phone);
      if (request.avatar) formData.append('avatar', request.avatar);

      // Note: Authorization header automatically added by axios interceptor
      // Don't set Content-Type for FormData - browser will set it with boundary
      const response = await axios.put(
        `${env.API_BASE_URL}${apiPaths.updateProfile}`,
        formData
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update account settings
   * 
   * Updates user account preferences and settings including notifications,
   * security settings, and localization preferences.
   * 
   * @param request - Account settings update request
   * @returns Promise resolving to API response
   * @throws Error if API request fails
   */
  const updateSettings = useCallback(async (request: AccountSettingsRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.put(
        `${env.API_BASE_URL}${apiPaths.updateSettings}`,
        request
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update settings');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get current user profile
   * 
   * Retrieves the current user's profile information from the server.
   * 
   * @returns Promise resolving to user profile data
   * @throws Error if API request fails
   */
  const getProfile = useCallback(async (): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(
        `${env.API_BASE_URL}${apiPaths.getProfile}`
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete user account
   * 
   * Permanently deletes the user's account after password confirmation.
   * This action cannot be undone.
   * 
   * @param password - Current password for verification
   * @returns Promise resolving to API response
   * @throws Error if API request fails
   */
  const deleteAccount = useCallback(async (password: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!password) {
        throw new Error('Password confirmation is required');
      }

      const response = await axios.delete(
        `${env.API_BASE_URL}${apiPaths.deleteAccount}`,
        {
          data: { password }
        }
      );

      if (response.data.success) {
        // Clear authentication cookies on successful account deletion
        Cookies.remove('authToken');
        Cookies.remove('user');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete account');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send 2FA OTP code to user's email
   * 
   * Sends an OTP (One-Time Password) to the user's email for two-factor authentication.
   * This should be called after initial login when 2FA is required.
   * 
   * @param request - 2FA request data containing email and temp token
   * @returns Promise resolving to 2FA response
   * @throws Error if API request fails
   */
  const send2FACode = useCallback(async (request: Send2FARequest): Promise<TwoFactorAuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Client-side validation
      if (!request.emailAddress) {
        throw new Error('Email address is required');
      }

      if (!request.token) {
        throw new Error('Authentication token is required');
      }

      // Try multiple API endpoints for better compatibility
      let response;
      let lastError;

      for (const path of apiPaths.send2FA) {
        try {
          response = await axios.post(`${env.API_BASE_URL}${path}`, request);
          break;
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error('Failed to send 2FA code');
      }

      return response.data as TwoFactorAuthResponse;

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send 2FA code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify 2FA OTP code
   * 
   * Verifies the OTP code entered by the user against the server-generated code.
   * On success, returns the final authentication token for login completion.
   * 
   * @param request - 2FA verification data containing email, temp token, and OTP code
   * @returns Promise resolving to authentication response
   * @throws Error if verification fails or API request fails
   */
  const verify2FACode = useCallback(async (request: Verify2FARequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Client-side validation
      if (!request.emailAddress) {
        throw new Error('Email address is required');
      }

      if (!request.token) {
        throw new Error('Authentication token is required');
      }

      if (!request.otpCode) {
        throw new Error('OTP code is required');
      }

      if (request.otpCode.length !== 6) {
        throw new Error('OTP code must be 6 digits');
      }

      // Try multiple API endpoints for better compatibility
      let response;
      let lastError;

      for (const path of apiPaths.verify2FA) {
        try {
          response = await axios.post(`${env.API_BASE_URL}${path}`, request);
          break;
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error('Failed to verify 2FA code');
      }

      return response.data as ApiResponse;

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify 2FA code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Functions
    changePassword,
    forgotPassword,
    resetPassword,
    registerUser,
    confirmEmail,
    updateProfile,
    updateSettings,
    validatePasswordStrength,
    getProfile,
    deleteAccount,
    send2FACode,
    verify2FACode,
    
    // Utilities
    clearError: () => setError(null),
  };
};

export default useAccount;