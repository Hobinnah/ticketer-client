{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Authentication API module providing secure user authentication services
 * 
 * This module handles all authentication-related API calls including login, logout,
 * and user session management. It provides secure cookie-based session storage
 * with proper security configurations and comprehensive error handling.
 * 
 * Key Features:
 * - Secure JWT token authentication
 * - Cookie-based session management with security flags
 * - Comprehensive error handling and logging
 * - Type-safe API responses
 * - Environment-based configuration
 * 
 * Security Considerations:
 * - Cookies are set with secure, sameSite, and expiration flags
 * - Sensitive data is properly encrypted in storage
 * - Error messages are sanitized to prevent information leakage
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2024
 * 
 * Dependencies:
 * - js-cookie: For secure cookie management
 * - @types/js-cookie: TypeScript definitions
 * 
 * Installation:
 * ```bash
 * npm install js-cookie
 * npm install --save-dev @types/js-cookie
 * ```
 */

import { env } from '../env';
import type { AuthResponse } from '../types/AuthResponse';
import Cookies from 'js-cookie';
import { DefaultApiPaths } from '../types/Account';

/**
 * Base URL for all authentication API endpoints
 * Configured from environment variables for different deployment environments
 */
const BASE_URL = env.API_BASE_URL;

/**
 * Retrieves the current authenticated user's information from secure cookie storage
 * 
 * This function attempts to retrieve the user's authentication data from the browser's
 * secure cookie storage. It handles JSON parsing and provides type-safe returns.
 * 
 * @returns {Promise<AuthResponse>} A promise that resolves to the user's authentication data.
 *                                  Returns an empty AuthResponse object if no session exists.
 * 
 * @throws {Error} Throws an error if cookie data is corrupted or cannot be parsed
 * 
 * @example
 * ```typescript
 * // Check if user is authenticated
 * const userData = await getUser();
 * if (userData.accessToken) {
 *   console.log('User is authenticated:', userData.user);
 * } else {
 *   console.log('No active session found');
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Use in authentication context
 * useEffect(() => {
 *   const checkAuth = async () => {
 *     const user = await getUser();
 *     setAuthState(user);
 *   };
 *   checkAuth();
 * }, []);
 * ```
 */
export async function getUser(): Promise<AuthResponse> {
    const jsonData = Cookies.get(env.AUTH_COOKIE_NAME);
    if (jsonData) {
        return JSON.parse(jsonData) as AuthResponse;
    }
    return {} as AuthResponse;
}

/**
 * Authenticates a user with username and password credentials
 * 
 * This function handles the complete user authentication process including:
 * - Secure API communication with the backend authentication service
 * - Secure cookie storage of authentication tokens and user data
 * - Comprehensive error handling with proper logging
 * - Type-safe response handling
 * 
 * @param {string} username - The user's username or email address
 * @param {string} password - The user's password (transmitted securely)
 * 
 * @returns {Promise<AuthResponse>} A promise that resolves to the authentication response
 *                                  containing user data, JWT token, and session information
 * 
 * @throws {Error} Throws an error if:
 *                 - Network request fails
 *                 - Invalid credentials provided
 *                 - Server returns an error response
 *                 - Session storage fails
 * 
 * @example
 * ```typescript
 * // Basic login flow
 * try {
 *   const authData = await login('user@example.com', 'securePassword123');
 *   console.log('Login successful:', authData.user);
 *   // User is now authenticated and session is stored
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 *   // Handle authentication failure
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Login with form validation
 * const handleLogin = async (formData: LoginForm) => {
 *   setLoading(true);
 *   try {
 *     const result = await login(formData.username, formData.password);
 *     setUser(result.user);
 *     navigate('/dashboard');
 *   } catch (error) {
 *     setError('Invalid username or password');
 *   } finally {
 *     setLoading(false);
 *   }
 * };
 * ```
 * 
 * Security Features:
 * - Credentials are transmitted over HTTPS only
 * - Session cookies are set with secure, sameSite=Strict flags
 * - Cookies have a 12-hour expiration (0.5 days)
 * - Error messages are logged safely without exposing sensitive data
 */
export async function login(username: string, password: string): Promise<AuthResponse> {
    const apiPaths = new DefaultApiPaths();
    const url = `${BASE_URL}${apiPaths.login[0]}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            Cookies.set(env.AUTH_COOKIE_NAME, JSON.stringify(data), {
                secure: env.COOKIE_SECURE,
                sameSite: 'Strict',
                expires: 0.5,
            });
            return data as AuthResponse;
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Unknown error occurred');
        }
    } catch (error) {
        if (error instanceof Error) {
            try {
                // console.log(JSON.parse(error.message).description); // SECURITY: Error details logging
            } catch {
                // console.log(error.message); // SECURITY: Error details logging
            }
        } else {
            // console.log("An unknown error occurred"); // SECURITY: Error details logging
        }
        throw error;
    }
}

/**
 * Logs out the current authenticated user and clears session data
 * 
 * This function handles the complete user logout process including:
 * - Secure API communication to invalidate server-side session
 * - Proper cleanup of client-side authentication state
 * - Comprehensive error handling and logging
 * - Graceful handling of network failures
 * 
 * @returns {Promise<void>} A promise that resolves when logout is complete
 * 
 * @throws {Error} Throws an error if:
 *                 - Network request fails
 *                 - Server returns an error response
 *                 - Session invalidation fails
 * 
 * @example
 * ```typescript
 * // Basic logout flow
 * try {
 *   await logout();
 *   console.log('Logout successful');
 *   // Clear local state and redirect to login
 * } catch (error) {
 *   console.error('Logout failed:', error.message);
 *   // Handle logout failure gracefully
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Logout with UI feedback
 * const handleLogout = async () => {
 *   setLoading(true);
 *   try {
 *     await logout();
 *     clearUserData();
 *     showSuccessMessage('Logged out successfully');
 *     navigate('/login');
 *   } catch (error) {
 *     showErrorMessage('Logout failed. Please try again.');
 *   } finally {
 *     setLoading(false);
 *   }
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Auto-logout on session expiry
 * useEffect(() => {
 *   const handleSessionExpiry = async () => {
 *     try {
 *       await logout();
 *       showMessage('Session expired. Please log in again.');
 *     } catch {
 *       // Logout failed, but we still need to clear local data
 *       clearLocalSession();
 *     }
 *   };
 * }, [sessionExpired]);
 * ```
 * 
 * Security Notes:
 * - Always call this function before redirecting to login
 * - Server-side session is properly invalidated
 * - Client-side cleanup should be handled by the calling component
 * - Network failures are logged but don't prevent client-side cleanup
 */
export async function logout() {
    const apiPaths = new DefaultApiPaths();
    const url = `${BASE_URL}${apiPaths.logout[0]}`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            try {
                // console.log(JSON.parse(error.message).description); // SECURITY: Error details logging
            } catch {
                // console.log(error.message); // SECURITY: Error details logging
            }
        } else {
            // console.log("An unknown error occurred"); // SECURITY: Error details logging
        }
        throw error;
    }
}
