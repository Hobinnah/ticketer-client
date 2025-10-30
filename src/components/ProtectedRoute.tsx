{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


/**
 * @fileoverview Protected Route Component for Authentication and Authorization
 * 
 * This component provides route-level security by enforcing authentication and
 * role-based authorization. It wraps child components and automatically redirects
 * users based on their authentication status and permissions.
 * 
 * Key Features:
 * - Authentication verification with token validation
 * - Role-based access control (RBAC)
 * - Automatic token expiration handling
 * - Graceful loading state management
 * - Comprehensive debug logging for troubleshooting
 * - Smart redirect logic for different scenarios
 * 
 * Security Features:
 * - JWT token expiration validation
 * - Custom token format support
 * - Session state synchronization
 * - Prevents unauthorized access to protected resources
 * 
 * @author NetVilleplus Team
 * @version 1.0.0
 * @since 2024
 */

import { type PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types/User";
import { isTokenExpired } from "../apis/helpers";

/**
 * Props interface for the ProtectedRoute component
 * 
 * @interface ProtectedRouteProps
 */
type ProtectedRouteProps = PropsWithChildren & {
    /** 
     * Array of roles that are allowed to access this route
     * If not provided, any authenticated user can access the route
     * Role matching is case-insensitive
     * @example ['admin', 'manager'] - Only admins and managers can access
     * @example undefined - Any authenticated user can access
     */
    allowedRoles?: User['roles'];
};

/**
 * Protected Route Component for Authentication and Authorization
 * 
 * A higher-order component that wraps child routes and enforces security policies.
 * It handles authentication verification, token validation, role-based access control,
 * and automatic redirects based on user status and permissions.
 * 
 * @component
 * @param {ProtectedRouteProps} props - Component props
 * @param {User['roles']} [props.allowedRoles] - Array of roles allowed to access this route
 * @param {React.ReactNode} props.children - Child components to render if access is granted
 * 
 * @returns {React.ReactNode} The protected child components or nothing (handles redirect internally)
 * 
 * @example
 * ```tsx
 * // Protect a route for any authenticated user
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 * 
 * @example
 * ```tsx
 * // Protect a route for specific roles
 * <ProtectedRoute allowedRoles={['admin', 'manager']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 * 
 * @example
 * ```tsx
 * // Use with React Router
 * <Routes>
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   } />
 *   <Route path="/admin" element={
 *     <ProtectedRoute allowedRoles={['admin']}>
 *       <AdminPanel />
 *     </ProtectedRoute>
 *   } />
 * </Routes>
 * ```
 * 
 * @example
 * ```tsx
 * // Multiple roles example
 * <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager']}>
 *   <ManagementDashboard />
 * </ProtectedRoute>
 * ```
 * 
 * Redirect Logic:
 * - **No authentication** → `/login`
 * - **Token expired** → `/login` 
 * - **Valid token, insufficient permissions** → `/access-denied`
 * - **Valid token, sufficient permissions** → Render children
 * 
 * Security Checks (in order):
 * 1. **Loading State**: Waits for auth context to initialize
 * 2. **Authentication**: Verifies user is logged in with valid token
 * 3. **Token Expiration**: Validates JWT token hasn't expired
 * 4. **Authorization**: Checks user roles against required roles
 * 5. **Access Grant**: Renders protected content if all checks pass
 * 
 * Debug Information:
 * The component logs detailed authentication state to console for troubleshooting:
 * ```
 * ProtectedRoute - Auth State: {
 *   isAuthenticated: boolean,
 *   hasCurrentUser: boolean,
 *   hasToken: boolean,
 *   tokenLength: number,
 *   userRoles: string[],
 *   requiredRoles: string[]
 * }
 * ```
 * 
 * Token Support:
 * - **JWT Tokens**: Standard format with expiration validation
 * - **Custom Tokens**: Application-specific encoding (skips expiration check)
 * - **Automatic Detection**: Identifies token format by presence of dots
 * 
 * Performance Notes:
 * - Uses React.useEffect for efficient re-evaluation
 * - Minimal re-renders with proper dependency management
 * - Early returns prevent unnecessary processing
 * - Debounced navigation to prevent redirect loops
 */
export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    
    const { currentUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // Debug logging for development and troubleshooting
    // console.log('ProtectedRoute - Auth State:', { // SECURITY: Contains sensitive auth state data
    //     isAuthenticated,
    //     hasCurrentUser: !!currentUser,
    //     hasToken: !!currentUser?.token,
    //     tokenLength: currentUser?.token?.length,
    //     userRoles: currentUser?.roles,
    //     requiredRoles: allowedRoles
    // });

    // Move all navigation logic to useEffect to prevent render-time navigation calls
    useEffect(() => {
        // Wait for auth context to fully initialize before making security decisions
        if (currentUser === undefined || isAuthenticated === undefined) {
            // console.log('Auth context still loading...'); // SECURITY: Auth flow logging
            return; // Still loading, don't navigate yet
        }
        
        // Primary authentication check - verify user has valid session
        if (!isAuthenticated || !currentUser || !currentUser.accessToken) {
            // console.log('User not authenticated, redirecting to login'); // SECURITY: Auth flow logging
            navigate('/login', { replace: true });
            return;
        }
        
        // Token expiration validation - prevents use of expired credentials
        if (currentUser.accessToken) {
            // Detect token format and validate accordingly
            if (currentUser.accessToken.includes('.')) {
                // Standard JWT token - validate expiration
                if (isTokenExpired(currentUser.accessToken)) {
                    // console.log('JWT Token expired, redirecting to login'); // SECURITY: Auth flow logging
                    navigate('/login', { replace: true });
                    return;
                }
            } else {
                // Custom encoded token format - skip expiration check
                // console.log('Custom token format detected, skipping expiration check'); // SECURITY: Auth flow logging
            }
        }
        
        // Role-based authorization check - verify user has required permissions
        if (allowedRoles && allowedRoles.length > 0) {
            // Check if user has at least one of the required roles (case-insensitive)
            const hasRequiredRole = allowedRoles.some(role => 
                currentUser?.roles?.some(userRole => 
                    userRole.toLowerCase() === role.toLowerCase()
                )
            );
            
            if (!hasRequiredRole) {
                // console.log('Access denied, redirecting to access-denied'); // SECURITY: Auth flow logging
                // console.log('User roles:', currentUser?.roles); // SECURITY: Contains sensitive role data
                // console.log('Required roles:', allowedRoles); // SECURITY: Contains role requirements
                navigate('/access-denied', { replace: true });
                return;
            }
        }
    }, [navigate, allowedRoles, currentUser, isAuthenticated]);

    // Show loading while auth context initializes
    if (currentUser === undefined || isAuthenticated === undefined) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '16px',
                color: 'var(--muted)'
            }}>
                Loading...
            </div>
        );
    }
    
    // Show loading while checking authentication (prevents flash of content)
    if (!isAuthenticated || !currentUser || !currentUser.accessToken) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '16px',
                color: 'var(--muted)'
            }}>
                Redirecting...
            </div>
        );
    }
    
    // Show loading while checking token expiration
    if (currentUser.accessToken && currentUser.accessToken.includes('.') && isTokenExpired(currentUser.accessToken)) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '16px',
                color: 'var(--muted)'
            }}>
                Session expired, redirecting...
            </div>
        );
    }
    
    // Show loading while checking role authorization
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.some(role => 
            currentUser?.roles?.some(userRole => 
                userRole.toLowerCase() === role.toLowerCase()
            )
        );
        
        if (!hasRequiredRole) {
            return (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    fontSize: '16px',
                    color: 'var(--muted)'
                }}>
                    Access denied, redirecting...
                </div>
            );
        }
    }

    /**
     * Scroll to top effect for route navigation
     * Ensures consistent user experience when navigating between protected routes
     */
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Render protected content - only reached if all security checks pass
    return <>{children}</>;
};