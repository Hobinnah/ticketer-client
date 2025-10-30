{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Authentication Context Provider
 * 
 * Provides centralized authentication state management for the entire application.
 * This context manages user authentication status, tokens, user data, and provides
 * methods for login/logout operations with automatic token handling and API interceptors.
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2025-09-28
 * 
 * Features:
 * - JWT token management and automatic refresh
 * - User session persistence across browser sessions
 * - Axios request/response interceptors for authentication
 * - Role-based user information management
 * - Automatic logout on token expiration
 * - Cookie-based token storage for security
 */

import { createContext, type PropsWithChildren, useEffect, useLayoutEffect, useState } from "react";
import { getUser, login, logout } from "../apis/auth";
import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from "../types/AuthResponse";
import Cookies from 'js-cookie';
import { decodeJWTToken, isTokenExpired } from "../apis/helpers";
import { env } from "../env";
import tokenMonitorService from "../services/tokenMonitorService";


/**
 * Authentication Context Interface
 * 
 * Defines the shape of the authentication context that will be available
 * to all components wrapped by the AuthProvider.
 * 
 * @interface AuthContext
 */
type AuthContext = {
    /** JWT authentication token for API requests */
    authToken?: string | null;
    /** Complete user information including roles and permissions */
    currentUser?: AuthResponse | null;
    /** Boolean indicating if user is currently authenticated */
    isAuthenticated?: boolean | null;
    /** 
     * Handles user login with username/password
     * @param username - User's email address
     * @param password - User's password
     * @returns Promise resolving to authentication response
     */
    handleLogin: (username: string, password: string) => Promise<AuthResponse>;
    /** 
     * Handles user logout and cleanup
     * @returns Promise resolving when logout is complete
     */
    handleLogout: () => Promise<void>;
    /** 
     * Completes 2FA authentication with final token
     * @param finalToken - Final JWT token after 2FA validation
     * @returns Promise resolving when 2FA completion is successful
     */
    complete2FA: (finalToken: string) => Promise<void>;
};

/**
 * Authentication Context
 * 
 * React context for sharing authentication state across the application.
 * Use with useContext hook or the custom useAuth hook for type safety.
 */
export const AuthContext = createContext<AuthContext | undefined>(undefined);

/**
 * Props for AuthProvider component
 */
type AuthProviderProps = PropsWithChildren;

/**
 * Centralized exception patterns for API endpoints that should not trigger global auth handling
 */
export const exceptionPatterns = [
  '/api/task/',
  // Add more endpoint patterns here as needed
];

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication state and methods to all child components.
 * Automatically handles token persistence, user session management, and API authentication.
 * 
 * @param children - Child components that will have access to authentication context
 * @returns JSX element providing authentication context to children
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <Routes>
 *           <Route path="/login" element={<LoginPage />} />
 *           <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *         </Routes>
 *       </Router>
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export default function AuthProvider({ children }: AuthProviderProps) {
    /** JWT token for API authentication */
    const [authToken, setAuthToken] = useState<string | null>();
    /** Current authenticated user data */
    const [currentUser, setCurrentUser] = useState<AuthResponse | null>();
    /** Authentication status flag */
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    /**
     * FINAL APPROACH: Pure JavaScript Token Monitoring (No React State Changes)
     * 
     * This approach starts monitoring when the component mounts and lets the
     * service handle everything independently, including redirect. No React
     * state modifications during logout to prevent hooks rule violations.
     */
    useEffect(() => {
        // Start monitoring immediately when AuthProvider mounts
        console.log('AuthProvider mounted - initializing token monitoring');
        
        // Configure the service to handle everything independently
        tokenMonitorService.configure({
            interval: 60000,      // 1 minute
            warningThreshold: 5,  // 5 minutes warning
            debug: true           // Enable logging
        });

        // The service will start monitoring when it detects a valid auth cookie
        // and will handle logout completely independently of React
        tokenMonitorService.start();

        // Cleanup when component unmounts
        return () => {
            console.log('AuthProvider unmounting - stopping token monitoring');
            tokenMonitorService.stop();
        };
    }, []); // No dependencies at all - runs once on mount, cleans up on unmount

    /**
     * Initialize authentication state on component mount
     * Attempts to restore user session from stored tokens
     */
    useEffect(() => {
        // Clean up any old cookies from previous versions
        // console.log('AuthProvider: Cleaning up legacy cookies'); // SECURITY: Auth flow logging
        Cookies.remove(env.AUTH_COOKIE_NAME);
        fetchUser();


    }, []);

    /**
     * DISABLED: Proactive Token Monitoring 
     * 
     * The proactive token monitoring has been temporarily disabled due to React hooks
     * rule violations that cause "Rendered fewer hooks than expected" errors.
     * 
     * The app still has reactive token expiration handling via:
     * 1. Axios interceptors (401/403 responses) 
     * 2. ProtectedRoute checks (on navigation)
     * 3. Manual login/logout flows
     * 
     * TODO: Implement using a different approach that doesn't violate React hooks rules
     */
    
    // DISABLED useEffect for token monitoring to prevent hook order issues
    /*
    useEffect(() => {
        if (!isAuthenticated || !currentUser?.accessToken || isLoggingOut) {
            console.log('AuthProvider: Token monitoring SKIPPED', { isAuthenticated, hasToken: !!currentUser?.accessToken, isLoggingOut });
            return;
        }

        console.log('AuthProvider: Setting up token monitoring interval...');
        
        const tokenMonitorInterval = setInterval(() => {
            // Create a closure that captures current values without causing re-renders
            const checkToken = () => {
                // Get fresh state values at check time
                const userElement = document.querySelector('[data-auth-user]');
                if (!userElement) {
                    console.log('AuthProvider: No auth user element found, skipping check');
                    return;
                }
                
                const userData = userElement.getAttribute('data-auth-user');
                if (!userData) {
                    console.log('AuthProvider: No user data found, triggering logout');
                    handleTokenExpiration();
                    return;
                }
                
                try {
                    const user = JSON.parse(userData);
                    if (!user.accessToken) {
                        console.log('AuthProvider: No token found, triggering logout');
                        handleTokenExpiration();
                        return;
                    }
                    
                    console.log('AuthProvider: Checking token expiration...');
                    
                    // Check token expiration
                    let tokenExpired = false;
                    
                    if (user.accessToken.includes('.')) {
                        // Standard JWT
                        tokenExpired = isTokenExpired(user.accessToken);
                        console.log('AuthProvider: JWT token expired:', tokenExpired);
                    } else {
                        // Custom token - decode and check
                        try {
                            const decodedResult = decodeJWTToken(user.accessToken);
                            if (decodedResult.token.includes('.')) {
                                tokenExpired = isTokenExpired(decodedResult.token);
                                console.log('AuthProvider: Custom token (decoded to JWT) expired:', tokenExpired);
                            } else {
                                console.log('AuthProvider: Custom token does not decode to JWT, cannot check expiration');
                            }
                        } catch (decodeError) {
                            console.error('AuthProvider: Error decoding custom token:', decodeError);
                        }
                    }
                    
                    if (tokenExpired) {
                        console.warn('� Token expired detected by monitoring');
                        handleTokenExpiration();
                    }
                    
                } catch (parseError) {
                    console.error('AuthProvider: Error parsing user data:', parseError);
                    handleTokenExpiration();
                }
            };
            
            console.log('AuthProvider: Running token check...');
            checkToken();
        }, 60000);

        // Initial check
        console.log('AuthProvider: Running initial token check...');
        
        return () => {
            clearInterval(tokenMonitorInterval);
        };
    }, [isAuthenticated, isLoggingOut]); // Reduced dependencies
    */

    /**
     * Fetches current user information from the server
     * 
     * Attempts to retrieve user data using stored authentication tokens.
     * On success, updates authentication state. On failure, clears all auth data.
     * 
     * @private
     */
    async function fetchUser() {
        try {
            const response = await getUser();
            
            // Check if token is expired before setting authentication state
            if (response.accessToken && isTokenExpired(response.accessToken)) {
                // console.log('Token expired during fetchUser, clearing auth state'); // SECURITY: Auth flow logging
                setAuthToken(null);
                setCurrentUser(null);
                setIsAuthenticated(false);
                // Clear stored session data (current and legacy cookie names)
                Cookies.remove(env.AUTH_COOKIE_NAME);
                return;
            }
            
            setAuthToken(response.accessToken);
            setCurrentUser(response);
            setIsAuthenticated(response.isLoginSuccessful);
        } catch {
            setAuthToken(null);
            setCurrentUser(null);
            setIsAuthenticated(false);
        }
    }

    /**
     * Handles user login authentication
     * 
     * Authenticates user with provided credentials and updates application state.
     * On successful login, stores JWT token and user information.
     * 
     * @param username - User's email address
     * @param password - User's password
     * @returns Promise resolving to authentication response with user data and roles
     * 
     * @throws {Error} When login credentials are invalid or network error occurs
     * 
     * @example
     * ```tsx
     * const auth = useContext(AuthContext);
     * try {
     *   const response = await auth.handleLogin('user@example.com', 'password123');
     *   console.log('Login successful:', response.roles);
     * } catch (error) {
     *   console.error('Login failed:', error.message);
     * }
     * ```
     */
    async function handleLogin(username: string, password: string): Promise<AuthResponse> {
        try {
            const response = await login(username, password);
            // console.log('AuthProvider - login response:', response); // SECURITY: Contains sensitive login data
            // console.log('AuthProvider - isLoginSuccessful:', response.isLoginSuccessful);
            // console.log('AuthProvider - requiresTwoFactor:', response.requiresTwoFactor);
            
            if (response.isLoginSuccessful) {
                if (!response.requiresTwoFactor) {
                    // Standard login - no 2FA required
                    // console.log('AuthProvider - decoding standard token (no 2FA)');
                    const token = decodeJWTToken(response.accessToken);
                    setAuthToken(token.token);
                    setCurrentUser(response);
                    setIsAuthenticated(response.isLoginSuccessful);
                } else {
                    // 2FA required - store user data but don't authenticate yet
                    // console.log('AuthProvider - 2FA required, storing user data but waiting for 2FA completion');
                    // console.log('AuthProvider - storing user roles:', response.roles); // SECURITY: Contains sensitive role data
                    setCurrentUser(response); // Store user data including roles
                    setIsAuthenticated(false); // But don't authenticate until 2FA is complete
                    setAuthToken(null); // No auth token until 2FA is complete
                }
            }
            return response;
        } catch (error: unknown) {
            // Clear any existing auth state on login failure
            setAuthToken(null);
            setCurrentUser(null);
            setIsAuthenticated(false);
            
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred during login");
            }
        }
    }

    /**
     * Handles user logout and cleanup
     * 
     * Clears all authentication state, removes stored tokens, and calls logout API.
     * Ensures complete cleanup of user session data.
     * 
     * @example
     * ```tsx
     * const auth = useContext(AuthContext);
     * const handleSignOut = async () => {
     *   try {
     *     await auth.handleLogout();
     *     navigate('/login');
     *   } catch (error) {
     *     console.error('Logout error:', error);
     *   }
     * };
     * ```
     */
    async function handleLogout() {
        // Clear authentication state
        setAuthToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        
        // Remove stored session data (current and legacy cookie names)
        Cookies.remove(env.AUTH_COOKIE_NAME);
        
        // Call logout API to invalidate server-side session
        try {
            await logout();
        } catch (error) {
            // Continue with logout even if API call fails
            console.warn('Logout API call failed:', error);
        }
    }

    /**
     * Completes 2FA authentication process
     * 
     * Updates authentication state with the final token after 2FA validation.
     * This should be called when 2FA validation is successful.
     * 
     * @param finalToken - The final JWT token received after successful 2FA
     */
    async function complete2FA(finalToken: string) {
        // console.log('AuthProvider - completing 2FA with final token');
        // console.log('Final token received:', finalToken); // SECURITY: Contains sensitive token
        // console.log('Final token length:', finalToken?.length);
        // console.log('Final token type:', typeof finalToken);
        
        if (!finalToken) {
            throw new Error('Final token is required to complete 2FA');
        }
        
        // Decode the final token (this should be a standard JWT, not 2FA encoded)
        // console.log('Attempting to decode final token as standard JWT...');
        const tokenData = decodeJWTToken(finalToken, false);
        // console.log('Token decoded successfully:', tokenData); // SECURITY: Contains sensitive token data
        
        // Update authentication state
        setAuthToken(tokenData.token);
        setIsAuthenticated(true);
        
        // console.log('Authentication state updated - isAuthenticated: true');
        // console.log('Auth token set to:', tokenData.token?.substring(0, 50)); // SECURITY: Contains partial token
        
        // Update the current user data if it exists
        if (currentUser) {
            // console.log('Current user before update:', currentUser); // SECURITY: Contains sensitive user data
            // console.log('Current user roles before update:', currentUser.roles); // SECURITY: Contains sensitive role data
            
            const updatedUser = {
                ...currentUser,
                token: finalToken,
                isLoginSuccessful: true,
                requiresTwoFactor: false
            };
            
            // console.log('Updated user after 2FA:', updatedUser); // SECURITY: Contains sensitive user data
            // console.log('Updated user roles after 2FA:', updatedUser.roles); // SECURITY: Contains sensitive role data
            
            setCurrentUser(updatedUser);
            
            // Store the updated session in cookies
            Cookies.set(env.AUTH_COOKIE_NAME, JSON.stringify(updatedUser), {
                secure: env.COOKIE_SECURE,
                sameSite: 'Strict',
                expires: 0.5,
            });
        } else {
            console.warn('No currentUser found during 2FA completion');
        }
        
        // console.log('AuthProvider - 2FA completion successful'); // SECURITY: Auth flow logging
    }

    useLayoutEffect(() => {
        const authInterceptor = axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            if (authToken) {
                config.headers.Authorization = `Bearer ${authToken}`;
            }
            return config;
        });

        const refreshInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                if (error.response?.status === 401) {
                    // Check if this is a task-related API call - let component handle the error
                    if (exceptionPatterns.some(pattern => originalRequest.url?.includes(pattern))) {
                        // console.log('Task API authentication error - letting component handle'); // SECURITY: Auth flow logging
                        return Promise.reject(error);
                    }
                    
                    // Token expired - redirect to login for other calls
                    // console.log('Token expired, redirecting to login'); // SECURITY: Auth flow logging
                    handleLogout();
                    window.location.href = '/login';
                } else if (error.response?.status === 403) {
                    // Check if this is a task-related API call - let component handle the error
                    if (exceptionPatterns.some(pattern => originalRequest.url?.includes(pattern))) {
                        // console.log('API exception - letting component handle');
                        return Promise.reject(error);
                    }
                    
                    if (error.response.data?.message === "Unauthorized") {
                        // Try to refresh token
                        try {
                            const response = await getUser();
                            if (response.accessToken && !isTokenExpired(response.accessToken)) {
                                const token = decodeJWTToken(response.accessToken);
                                setAuthToken(token.token);
                                originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                                originalRequest._retry = true;
                                return axios(originalRequest);
                            } else {
                                // Token is expired, redirect to login
                                handleLogout();
                                window.location.href = '/login';
                            }
                        } catch {
                            handleLogout();
                            window.location.href = '/login';
                        }
                    } else {
                        // Permission denied - redirect to access denied page
                        // console.log('Access denied, redirecting to access-denied page'); // SECURITY: Auth flow logging
                        window.location.href = '/access-denied';
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(authInterceptor);
            axios.interceptors.response.eject(refreshInterceptor);
        };
    }, [authToken]);

    return <AuthContext.Provider value={{
        authToken,
        currentUser,
        isAuthenticated,
        handleLogin,
        handleLogout,
        complete2FA
    }}>{children}</AuthContext.Provider>;
}
