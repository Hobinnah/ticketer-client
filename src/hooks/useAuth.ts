{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Authentication Hook for React Components
 * 
 * This module provides a custom React hook that simplifies access to authentication
 * context and methods throughout the application. It ensures type safety and
 * proper context usage validation for all authentication operations.
 * 
 * Key Features:
 * - Type-safe access to authentication state and methods
 * - Automatic context validation and error handling
 * - Simplified API for authentication operations
 * - Consistent authentication interface across components
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2024
 */

import { useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";

/**
 * Custom React hook for accessing authentication context and methods
 * 
 * This hook provides a clean and type-safe interface for accessing the current
 * authentication state and methods from any component within the AuthProvider tree.
 * It automatically validates that the hook is used within the proper context and
 * throws helpful errors if misused.
 * 
 * @function useAuth
 * 
 * @returns {AuthContextType} Authentication context object containing:
 *   - `currentUser`: The currently authenticated user object (User | null)
 *   - `handleLogin`: Function to authenticate user with credentials
 *   - `handleLogout`: Function to log out current user and clear session
 *   - `isAuthenticated`: Boolean indicating if user is currently logged in
 *   - `loading`: Boolean indicating if authentication operation is in progress
 * 
 * @throws {Error} Throws an error if the hook is used outside of an AuthProvider context
 *                 This ensures proper context setup and prevents runtime errors
 * 
 * @example
 * ```tsx
 * // Basic usage in a component
 * function Dashboard() {
 *   const { currentUser, isAuthenticated, handleLogout } = useAuth();
 * 
 *   if (!isAuthenticated) {
 *     return <div>Please log in</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       <h1>Welcome, {currentUser?.name}</h1>
 *       <button onClick={handleLogout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Login form component
 * function LoginForm() {
 *   const { handleLogin, loading } = useAuth();
 *   const [credentials, setCredentials] = useState({ username: '', password: '' });
 * 
 *   const onSubmit = async (e: FormEvent) => {
 *     e.preventDefault();
 *     try {
 *       await handleLogin(credentials.username, credentials.password);
 *       // Navigation handled by AuthProvider
 *     } catch (error) {
 *       console.error('Login failed:', error);
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={onSubmit}>
 *       <input 
 *         value={credentials.username}
 *         onChange={(e) => setCredentials(prev => ({...prev, username: e.target.value}))}
 *         placeholder="Username"
 *       />
 *       <input 
 *         type="password"
 *         value={credentials.password}
 *         onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
 *         placeholder="Password"
 *       />
 *       <button type="submit" disabled={loading}>
 *         {loading ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Role-based access control
 * function AdminPanel() {
 *   const { currentUser, isAuthenticated } = useAuth();
 * 
 *   const isAdmin = isAuthenticated && 
 *     currentUser?.roles?.includes('admin');
 * 
 *   if (!isAdmin) {
 *     return <AccessDeniedPage />;
 *   }
 * 
 *   return <AdminDashboard />;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Protected route component
 * function ProtectedRoute({ children }: { children: React.ReactNode }) {
 *   const { isAuthenticated, loading } = useAuth();
 * 
 *   if (loading) {
 *     return <LoadingSpinner />;
 *   }
 * 
 *   return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
 * }
 * ```
 * 
 * Context Validation:
 * The hook performs automatic validation to ensure it's used correctly:
 * - Must be called within a component that's wrapped by AuthProvider
 * - Provides clear error messages for debugging context issues
 * - Prevents undefined context access that could cause runtime errors
 * 
 * Performance Notes:
 * - Uses React.useContext for optimal performance
 * - No unnecessary re-renders when context value hasn't changed
 * - Efficient access to authentication state across component tree
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
