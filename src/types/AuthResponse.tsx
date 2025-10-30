{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Authentication Response Type Definitions
 * 
 * This module defines the TypeScript type structure for authentication responses
 * from the backend API. It ensures type safety across the authentication system
 * and provides clear contracts for authentication data handling.
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2024
 */

import type { User } from "./User";

/**
 * Authentication response interface returned from login API calls
 * 
 * This type defines the complete structure of authentication data received
 * from the backend authentication service after successful login attempts.
 * It includes all necessary information for session management, authorization,
 * and user interface personalization.
 * 
 * @interface AuthResponse
 * 
 * @property {string} accessToken - JWT authentication token for secure API requests
 *                                 This token should be included in Authorization headers
 *                                 for all protected API calls. Format: "Bearer <accessToken>"
 * 
 * @property {string} name - Display name of the authenticated user
 *                          Used for UI personalization and user identification
 *                          in the interface (e.g., "Welcome, John Doe")
 * 
 * @property {Array<string>} roles - Array of user roles for authorization
 *                                  Used for role-based access control (RBAC)
 *                                  Common roles: ["admin", "user", "manager", "viewer"]
 * 
 * @property {boolean} isLoginSuccessful - Boolean flag indicating authentication status
 *                                        True if login was successful, false otherwise
 *                                        Used for conditional logic and error handling
 * 
 * @property {User} user - Complete user object with detailed user information
 *                        Contains user profile data, preferences, and metadata
 *                        See User type for detailed structure
 * 
 * @example
 * ```typescript
 * // Successful authentication response
 * const authResponse: AuthResponse = {
 *   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   name: "John Doe",
 *   roles: ["admin", "user"],
 *   isLoginSuccessful: true,
 *   user: {
 *     id: "123",
 *     email: "john@example.com",
 *     // ... other user properties
 *   }
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Using in authentication context
 * const handleAuthResponse = (response: AuthResponse) => {
 *   if (response.isLoginSuccessful) {
 *     localStorage.setItem('authToken', response.accessToken);
 *     setUser(response.user);
 *     setUserRoles(response.roles);
 *     navigate('/dashboard');
 *   } else {
 *     setError('Authentication failed');
 *   }
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Role-based authorization check
 * const hasAdminAccess = (authResponse: AuthResponse): boolean => {
 *   return authResponse.isLoginSuccessful && 
 *          authResponse.roles.includes('admin');
 * };
 * ```
 * 
 * Security Considerations:
 * - The accessToken should be stored securely (httpOnly cookies preferred)
 * - Roles should be validated on both client and server side
 * - User data should be sanitized before display
 * - Token expiration should be handled gracefully
 */
export type AuthResponse = {
    accessToken: string;
    name: string;
    roles: Array<string>;
    isLoginSuccessful: boolean;
    user: User;
    requiresTwoFactor?: boolean;
    tempToken?: string;
    twoFactorMessage?: string;
};