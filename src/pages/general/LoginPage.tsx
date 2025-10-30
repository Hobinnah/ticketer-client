{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

import { useState, useContext, useCallback } from 'react';
import { AuthContext } from '../../contexts/AuthProvider';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';
import { useNavigate } from 'react-router-dom';
import TwoFactorAuth from '../../components/TwoFactorAuth';
import '../../themes/theme.css';

// Enhanced schema with better validation
const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .transform(email => email.toLowerCase().trim()),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must not exceed 128 characters" }),
  rememberMe: z.boolean(),
});

type FormFields = z.infer<typeof loginSchema>;



export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    emailAddress: string;
    tempToken: string;
    message?: string;
  } | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FormFields>({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // Validate on blur for better UX
  });

  const auth = useContext(AuthContext);
  const { redirectToUserDashboard } = useAuthRedirect();

  // Enhanced error parser
  const parseError = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      try {
        const errorObj = JSON.parse(error.message);
        return errorObj.description || errorObj.message || error.message;
      } catch {
        return error.message;
      }
    }
    return "An unexpected error occurred. Please try again.";
  }, []);

  const onSubmitHandler = useCallback(async (data: FormFields) => {
    try {
      if (!auth?.handleLogin) {
        throw new Error('Authentication service is not available. Please refresh the page and try again.');
      }

      const response = await auth.handleLogin(data.username, data.password);
      
      // console.log('Login response:', response); // SECURITY: Contains sensitive data
      // console.log('requiresTwoFactor:', response?.requiresTwoFactor);
      // console.log('tempToken exists:', !!response?.tempToken);
      // console.log('token contains 2FA delimiter:', response?.accessToken?.includes('-===-'));
      
      // Check if 2FA is required
      if (response?.requiresTwoFactor) {
        // The server sends the 2FA token in the 'accessToken' field, not 'tempToken'
        const twoFactorToken = response.tempToken || response.accessToken;
        
        if (!twoFactorToken) {
          throw new Error('2FA required but no token provided by server');
        }
        
        // Store 2FA data and show 2FA form
        setTwoFactorData({
          emailAddress: data.username,
          tempToken: twoFactorToken,
          message: response.twoFactorMessage || 'Please enter the 5-digit code sent to your email'
        });
        setShow2FA(true);
        
        // The OTP is embedded in the tempToken, no need to send additional request
        // The server should have already sent the email with the OTP
        
        return; // Don't proceed with normal login flow
      }
      
      if (response?.isLoginSuccessful && response.roles) {
        redirectToUserDashboard(response.roles, data.rememberMe);
      } else {
        throw new Error('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      const errorMessage = parseError(error);
      setError("root", { 
        type: "manual", 
        message: errorMessage 
      });
      console.error('Login error:', error);
    }
  }, [auth, redirectToUserDashboard, parseError, setError, setTwoFactorData, setShow2FA]);

  // Handle 2FA cancellation
  const handle2FACancel = useCallback(() => {
    setShow2FA(false);
    setTwoFactorData(null);
  }, []);

  // Handle 2FA completion
  const handle2FASuccess = useCallback(async (finalToken: string) => {
    try {
      // console.log('Final token received from 2FA:', finalToken); // SECURITY: Contains sensitive token
      
      // Validate the token format
      if (!finalToken || typeof finalToken !== 'string') {
        throw new Error('Invalid final token received from 2FA');
      }

      // Check if it's a JWT token (contains dots)
      const tokenParts = finalToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT token format received from 2FA');
      }
      
      // Use the AuthProvider's complete2FA method
      if (auth && auth.complete2FA && twoFactorData) {
        // Complete the 2FA process using the auth context
        await auth.complete2FA(finalToken);
        
        // Get the remember me setting
        const formData = new FormData(document.querySelector('form') as HTMLFormElement);
        const rememberMe = formData.get('rememberMe') === 'on';
        
        // Get roles from the updated auth context
        const roles = auth.currentUser?.roles || [];
        
        // console.log('Auth context after 2FA completion:', auth.currentUser); // SECURITY: Contains sensitive user data
        // console.log('2FA completed successfully, redirecting with roles:', roles); // SECURITY: Contains sensitive role data
        // console.log('Roles length:', roles.length);
        
        if (roles.length === 0) {
          console.warn('No roles found after 2FA completion - this might cause access denied');
        }
        
        redirectToUserDashboard(roles, rememberMe);
        
        // Clean up 2FA state
        setShow2FA(false);
        setTwoFactorData(null);
      } else {
        throw new Error('Authentication context or complete2FA method not available');
      }
      
    } catch (error) {
      console.error('2FA completion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during 2FA completion';
      setError("root", { 
        type: "manual", 
        message: `Authentication failed: ${errorMessage}. Please try logging in again.` 
      });
      handle2FACancel();
    }
  }, [auth, twoFactorData, redirectToUserDashboard, setError, handle2FACancel]);

  
  // Enhanced social login handlers
  const handleGoogleLogin = useCallback(async () => {
    try {
      // TODO: Implement Google OAuth
      // console.log('Initiating Google OAuth login...'); // SECURITY: OAuth flow logging
      // Example: window.location.href = '/auth/google';
      alert('Google login will be available soon!');
    } catch (error) {
      console.error('Google login error:', error);
      setError("root", { 
        type: "manual", 
        message: "Google login is temporarily unavailable. Please try email login." 
      });
    }
  }, [setError]);

  
  const handleADLogin = useCallback(async () => {
    try {
      // TODO: Implement Active Directory OAuth
      // console.log('Initiating Active Directory login...'); // SECURITY: OAuth flow logging
      // Example: window.location.href = '/auth/microsoft';
      alert('Active Directory login will be available soon!');
    } catch (error) {
      console.error('AD login error:', error);
      setError("root", { 
        type: "manual", 
        message: "Active Directory login is temporarily unavailable. Please try email login." 
      });
    }
  }, [setError]);


  // Enhanced password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Show 2FA component if 2FA is required, otherwise show login form
  return show2FA && twoFactorData ? (
    <TwoFactorAuth
      emailAddress={twoFactorData.emailAddress}
      tempToken={twoFactorData.tempToken}
      message={twoFactorData.message}
      onSuccess={handle2FASuccess}
      onCancel={handle2FACancel}
    />
  ) : (
    <div className="login-container">
      {/* Floating Particles */}
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Geometric Particles */}
      <div className="geometric-particles">
        <div className="geo-particle triangle"></div>
        <div className="geo-particle square"></div>
        <div className="geo-particle circle"></div>
      </div>

      {/* Left side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-wrapper">
          {/* Logo */}
          <div className="login-logo">
            <div className="logo-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="login-header">
            <h1 className="login-title">Login to your account</h1>
            <p className="login-subtitle">Welcome back! Please enter your details.</p>
          </div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit(onSubmitHandler)}>
            {errors.root && (
              <div 
                id="login-error"
                className="error-message"
                role="alert"
                aria-live="polite"
              >
                {errors.root.message}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="username" className="form-label">Email</label>
              <input
                {...register("username")}
                id="username"
                type="email"
                className="form-input login-input"
                placeholder="Enter your email"
              />
              {errors.username && (
                <div className="error-message">
                  {errors.username.message}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input login-input"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <div className="error-message">
                    {errors.password.message}
                  </div>
                )}
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M10.73 5.073A11.031 11.031 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.043M6.53 6.53A9.045 9.045 0 0 0 2 12s3 7 10 7c1.95 0 3.76-.45 5.47-1.53M3 3l18 18M8.06 8.06A3 3 0 1 0 15.94 15.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  {...register("rememberMe")}
                  type="checkbox"
                  className="checkbox-input"
                />
                <span className="checkbox-text">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={isSubmitting}
              aria-describedby={errors.root ? "login-error" : undefined}
            >
              {isSubmitting ? (
                <div className="btn-loading">
                  <svg 
                    className="spinner" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="32">
                      <animate attributeName="stroke-dashoffset" values="32;0;32" dur="1s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="btn-content">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>LOGIN</span>
                </div>
              )}
            </button>

            {/* Forgot Password */}
            <div className="login-footer">
              <button 
                type="button" 
                className="forgot-password"
                onClick={() => navigate('/forgot-password')}
              >
                🔒 Forgot password?
              </button>
            </div>

            {/* Divider */}
            <div className="login-divider">
              <span>or</span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              className="google-login-btn"
              onClick={handleGoogleLogin}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Active Directory Login Button */}
            <button
              type="button"
              className="ad-login-btn"
              onClick={handleADLogin}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 2H12.6C13.6 2 14.4 2.8 14.4 3.8V4.2C14.4 4.6 14.7 4.9 15.1 4.9C15.5 4.9 15.8 5.2 15.8 5.6V6.4C15.8 6.8 16.1 7.1 16.5 7.1C16.9 7.1 17.2 7.4 17.2 7.8V8.6C17.2 9 17.5 9.3 17.9 9.3C18.3 9.3 18.6 9.6 18.6 10V10.8C18.6 11.2 18.9 11.5 19.3 11.5C19.7 11.5 20 11.8 20 12.2V13C20 13.4 19.7 13.7 19.3 13.7C18.9 13.7 18.6 14 18.6 14.4V15.2C18.6 15.6 18.3 15.9 17.9 15.9C17.5 15.9 17.2 16.2 17.2 16.6V17.4C17.2 17.8 16.9 18.1 16.5 18.1C16.1 18.1 15.8 18.4 15.8 18.8V19.6C15.8 20 15.5 20.3 15.1 20.3C14.7 20.3 14.4 20.6 14.4 21V21.8C14.4 22.2 14.1 22.5 13.7 22.5H10.3C9.9 22.5 9.6 22.2 9.6 21.8V21C9.6 20.6 9.3 20.3 8.9 20.3C8.5 20.3 8.2 20 8.2 19.6V18.8C8.2 18.4 7.9 18.1 7.5 18.1C7.1 18.1 6.8 17.8 6.8 17.4V16.6C6.8 16.2 6.5 15.9 6.1 15.9C5.7 15.9 5.4 15.6 5.4 15.2V14.4C5.4 14 5.1 13.7 4.7 13.7C4.3 13.7 4 13.4 4 13V12.2C4 11.8 4.3 11.5 4.7 11.5C5.1 11.5 5.4 11.2 5.4 10.8V10C5.4 9.6 5.7 9.3 6.1 9.3C6.5 9.3 6.8 9 6.8 8.6V7.8C6.8 7.4 7.1 7.1 7.5 7.1C7.9 7.1 8.2 6.8 8.2 6.4V5.6C8.2 5.2 8.5 4.9 8.9 4.9C9.3 4.9 9.6 4.6 9.6 4.2V3.8C9.6 2.8 10.4 2 11.4 2M12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6M12 8C13.1 8 14 8.9 14 10S13.1 12 12 12 10 11.1 10 10 10.9 8 12 8Z"/>
              </svg>
              Login with OpenIDConnect
            </button>

            {/* Registration Link */}
            <div className="registration-link" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <span style={{ color: '#6b7280' }}>Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontWeight: '500',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Branded Background */}
      <div className="login-hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Ticketer Admin</h2>
          <div className="hero-decoration">
            {/* Background pattern/decoration */}
            <div className="hero-pattern"></div>
          </div>
        </div>
        
        {/* Floating Chart Elements */}
        <div className="chart-element chart-element-1">
          <svg width="88" height="48" viewBox="0 0 176 96" style={{imageRendering: 'crisp-edges'}}>
            <rect x="16" y="64" width="16" height="32" fill="#3B82F6" rx="3"/>
            <rect x="40" y="48" width="16" height="48" fill="#10B981" rx="3"/>
            <rect x="64" y="32" width="16" height="64" fill="#F59E0B" rx="3"/>
            <rect x="88" y="56" width="16" height="40" fill="#EF4444" rx="3"/>
            <rect x="112" y="40" width="16" height="56" fill="#8B5CF6" rx="3"/>
            <rect x="136" y="24" width="16" height="72" fill="#06B6D4" rx="3"/>
          </svg>
        </div>

        <div className="chart-element chart-element-2">
          <svg width="108" height="58" viewBox="0 0 216 116" style={{imageRendering: 'crisp-edges'}}>
            <polyline points="16,90 50,70 84,80 118,50 152,60 186,30" stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="16" cy="90" r="5" fill="#3B82F6"/>
            <circle cx="50" cy="70" r="5" fill="#3B82F6"/>
            <circle cx="84" cy="80" r="5" fill="#3B82F6"/>
            <circle cx="118" cy="50" r="5" fill="#3B82F6"/>
            <circle cx="152" cy="60" r="5" fill="#3B82F6"/>
            <circle cx="186" cy="30" r="5" fill="#3B82F6"/>
            <path d="M 16,90 L 50,70 L 84,80 L 118,50 L 152,60 L 186,30 L 186,100 L 16,100 Z" fill="rgba(59,130,246,0.15)"/>
          </svg>
        </div>

        <div className="chart-element chart-element-3">
          <svg width="68" height="68" viewBox="0 0 136 136" style={{imageRendering: 'crisp-edges'}}>
            <circle cx="68" cy="68" r="52" fill="none" stroke="#E5E7EB" strokeWidth="6"/>
            <path d="M 68,16 A 52,52 0 0,1 111.4,91.4" fill="none" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round"/>
            <path d="M 111.4,91.4 A 52,52 0 0,1 24.6,44.6" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round"/>
            <path d="M 24.6,44.6 A 52,52 0 0,1 68,16" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="chart-element chart-element-4">
          <svg width="78" height="38" viewBox="0 0 78 38">
            <rect x="8" y="8" width="60" height="4" fill="#E5E7EB" rx="2"/>
            <rect x="8" y="8" width="45" height="4" fill="#10B981" rx="2"/>
            <rect x="8" y="18" width="60" height="4" fill="#E5E7EB" rx="2"/>
            <rect x="8" y="18" width="35" height="4" fill="#3B82F6" rx="2"/>
            <rect x="8" y="28" width="60" height="4" fill="#E5E7EB" rx="2"/>
            <rect x="8" y="28" width="50" height="4" fill="#F59E0B" rx="2"/>
          </svg>
        </div>

        <div className="chart-element chart-element-5">
          <svg width="98" height="53" viewBox="0 0 98 53">
            <rect x="8" y="35" width="12" height="18" fill="#3B82F6" rx="2"/>
            <rect x="24" y="28" width="12" height="25" fill="#10B981" rx="2"/>
            <rect x="40" y="20" width="12" height="33" fill="#F59E0B" rx="2"/>
            <rect x="56" y="32" width="12" height="21" fill="#EF4444" rx="2"/>
            <rect x="72" y="15" width="12" height="38" fill="#8B5CF6" rx="2"/>
            <text x="14" y="48" fontSize="8" fill="#6B7280" textAnchor="middle">Q1</text>
            <text x="30" y="48" fontSize="8" fill="#6B7280" textAnchor="middle">Q2</text>
            <text x="46" y="48" fontSize="8" fill="#6B7280" textAnchor="middle">Q3</text>
            <text x="62" y="48" fontSize="8" fill="#6B7280" textAnchor="middle">Q4</text>
            <text x="78" y="48" fontSize="8" fill="#6B7280" textAnchor="middle">Q5</text>
          </svg>
        </div>

        <div className="chart-element chart-element-6">
          <svg width="63" height="43" viewBox="0 0 63 43">
            <circle cx="31" cy="21" r="18" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
            <path d="M 31,3 A 18,18 0 0,1 45,30" fill="none" stroke="#06B6D4" strokeWidth="3"/>
            <path d="M 45,30 A 18,18 0 0,1 17,12" fill="none" stroke="#10B981" strokeWidth="3"/>
            <circle cx="31" cy="21" r="8" fill="rgba(59,130,246,0.2)"/>
            <text x="31" y="25" fontSize="10" fill="#374151" textAnchor="middle">72%</text>
          </svg>
        </div>

        <div className="chart-element chart-element-7">
          <svg width="73" height="33" viewBox="0 0 73 33">
            <rect x="5" y="5" width="8" height="20" fill="#F59E0B" rx="1"/>
            <rect x="18" y="8" width="8" height="17" fill="#EF4444" rx="1"/>
            <rect x="31" y="3" width="8" height="22" fill="#10B981" rx="1"/>
            <rect x="44" y="10" width="8" height="15" fill="#3B82F6" rx="1"/>
            <rect x="57" y="6" width="8" height="19" fill="#8B5CF6" rx="1"/>
          </svg>
        </div>

        <div className="chart-element chart-element-8">
          <svg width="83" height="48" viewBox="0 0 83 48">
            <polyline points="5,35 20,25 35,30 50,18 65,22 78,12" stroke="#10B981" strokeWidth="2" fill="none"/>
            <polyline points="5,40 20,32 35,35 50,28 65,30 78,25" stroke="#3B82F6" strokeWidth="2" fill="none"/>
            <circle cx="35" cy="30" r="2" fill="#10B981"/>
            <circle cx="50" cy="18" r="2" fill="#10B981"/>
            <circle cx="50" cy="28" r="2" fill="#3B82F6"/>
            <circle cx="65" cy="22" r="2" fill="#10B981"/>
          </svg>
        </div>

        <div className="chart-element chart-element-9">
          <svg width="58" height="38" viewBox="0 0 58 38">
            <rect x="8" y="8" width="40" height="3" fill="#E5E7EB" rx="1"/>
            <rect x="8" y="8" width="28" height="3" fill="#06B6D4" rx="1"/>
            <rect x="8" y="15" width="40" height="3" fill="#E5E7EB" rx="1"/>
            <rect x="8" y="15" width="35" height="3" fill="#10B981" rx="1"/>
            <rect x="8" y="22" width="40" height="3" fill="#E5E7EB" rx="1"/>
            <rect x="8" y="22" width="20" height="3" fill="#F59E0B" rx="1"/>
            <rect x="8" y="29" width="40" height="3" fill="#E5E7EB" rx="1"/>
            <rect x="8" y="29" width="32" height="3" fill="#EF4444" rx="1"/>
          </svg>
        </div>

        <div className="chart-element chart-element-10">
          <svg width="68" height="28" viewBox="0 0 68 28">
            <rect x="5" y="15" width="6" height="10" fill="#3B82F6" rx="1"/>
            <rect x="14" y="12" width="6" height="13" fill="#10B981" rx="1"/>
            <rect x="23" y="8" width="6" height="17" fill="#F59E0B" rx="1"/>
            <rect x="32" y="10" width="6" height="15" fill="#EF4444" rx="1"/>
            <rect x="41" y="6" width="6" height="19" fill="#8B5CF6" rx="1"/>
            <rect x="50" y="14" width="6" height="11" fill="#06B6D4" rx="1"/>
            <rect x="59" y="9" width="6" height="16" fill="#84CC16" rx="1"/>
          </svg>
        </div>

        {/* Transparent Overlay */}
        <div className="charts-overlay"></div>

        {/* Business Image Overlay */}
        <div className="business-image-overlay"></div>
      </div>


    </div>
  );
}