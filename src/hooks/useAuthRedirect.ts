{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Authentication Redirect Hook
 * 
 * Provides role-based routing functionality for post-authentication navigation.
 * This hook centralizes the logic for determining where users should be redirected
 * after successful login based on their assigned roles and permissions.
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2025-09-28
 * 
 * Features:
 * - Role-based priority routing
 * - "Remember me" session persistence
 * - Centralized route configuration
 * - Type-safe route definitions
 * - Comprehensive error handling fallbacks
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * User Role Routing Configuration
 * 
 * Defines the mapping between user roles and their corresponding dashboard routes.
 * This centralized configuration makes it easy to modify routes and add new roles.
 * 
 * @constant ROLE_ROUTES
 */
const ROLE_ROUTES = {
  /** Standard user role - redirects to personal course management */
  user: "/home",
  /** Administrator role - redirects to system administration dashboard */
  admin: "/overview",
  /** Viewer role - redirects to read-only dashboard */
  viewer: "/overview",
  /** Default fallback route for unmatched roles or empty role arrays */
  default: "/overview"
} as const;

/**
 * Custom hook for handling user authentication redirects based on roles.
 * 
 * Provides functionality to redirect users to appropriate dashboards after successful
 * authentication, with support for role-based routing and "remember me" functionality.
 * 
 * @example
 * ```typescript
 * function LoginComponent() {
 *   const { redirectToUserDashboard } = useAuthRedirect();
 *   
 *   const handleLogin = async (credentials) => {
 *     const response = await authService.login(credentials);
 *     if (response.success) {
 *       redirectToUserDashboard(response.roles, rememberMe);
 *     }
 *   };
 * }
 * ```
 * 
 * @returns {Object} Hook interface with redirect functionality
 */
export const useAuthRedirect = () => {
  const navigate = useNavigate();

  /**
   * Determines the appropriate redirect route based on user roles with hierarchical priority.
   * 
   * @param roles - Array of user roles returned from authentication service
   * @returns The route path to redirect the user to after successful login
   * 
   * @example
   * ```typescript
   * // User with multiple roles gets redirected based on highest priority
   * getRedirectRoute(['user', 'admin']) // Returns '/dashboard' (admin takes priority)
   * getRedirectRoute(['user']) // Returns '/overview' 
   * getRedirectRoute([]) // Returns '/overview' (default fallback)
   * ```
   */
  const getRedirectRoute = useCallback((roles: string[]): string => {
    const normalizedRoles = roles.map(role => role.toLowerCase());
    
    /**
     * Role Priority Configuration (Highest to Lowest Priority):
     * 
     * 1. 'admin' -> '/dashboard'
     *    - Administrators get full system access and management capabilities
     *    - Highest priority role - overrides all other roles if present
     * 
     * 2. 'user' -> '/mycourses' 
     *    - Regular users access their personal course dashboard
     *    - Standard role for most authenticated users
     * 
     * Additional roles can be configured here by adding them to the array:
     * - 'trainer' -> '/trainer' (currently not in priority but available in ROLE_ROUTES)
     * - 'moderator' -> '/moderation' (example of future role)
     * - 'viewer' -> '/readonly' (example of limited access role)
     * 
     * Priority Logic:
     * - Iterates through roles in descending priority order
     * - Returns the route for the FIRST matching role found
     * - Falls back to default route if no priority roles are matched
     * 
     * To modify priorities:
     * 1. Reorder the array below to change priority sequence
     * 2. Add new roles to both ROLE_ROUTES object and this priority array
     * 3. Consider access level hierarchy when setting priorities
     */
    for (const role of ['admin', 'user', 'viewer'] as const) {
      if (normalizedRoles.includes(role)) {
        return ROLE_ROUTES[role];
      }
    }
    
    return ROLE_ROUTES.default;
  }, []);

  /**
   * Redirects user to their appropriate dashboard based on their roles and handles persistence.
   * 
   * This function combines role-based routing with optional "remember me" functionality,
   * providing a complete post-authentication redirect solution.
   * 
   * @param roles - Array of user roles from authentication response
   * @param rememberMe - Optional flag to persist user session preferences
   * 
   * @example
   * ```typescript
   * // Basic usage with roles only
   * redirectToUserDashboard(['user', 'trainer']);
   * 
   * // With remember me functionality
   * redirectToUserDashboard(['admin'], true);
   * 
   * // Empty roles fallback to default route
   * redirectToUserDashboard([]);
   * ```
   * 
   * @sideEffects
   * - Navigates to determined route using React Router
   * - May set localStorage item if rememberMe is true
   * - Uses replace navigation to prevent back button issues
   * 
   * @security
   * - Role validation should be performed server-side
   * - Client-side routing is for UX only, not access control
   * - localStorage usage follows standard web security practices
   */
  const redirectToUserDashboard = useCallback((roles: string[], rememberMe?: boolean) => {
    const redirectRoute = getRedirectRoute(roles);
    
    // Handle remember me functionality - stores user preference for future sessions
    if (rememberMe) {
      localStorage.setItem('rememberUser', 'true');
    }
    
    // Navigate with replace to prevent users from going back to login page
    navigate(redirectRoute, { replace: true });
  }, [navigate, getRedirectRoute]);

  /**
   * Hook return object containing redirect functionality
   * 
   * @returns {Object} Interface for authentication redirect operations
   * @returns {Function} redirectToUserDashboard - Main redirect function with role-based routing
   */
  return { 
    redirectToUserDashboard 
  };
};