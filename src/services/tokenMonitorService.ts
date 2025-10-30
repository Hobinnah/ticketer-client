{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Global Token Monitor Service
 * 
 * This service runs completely outside of React's component lifecycle
 * to avoid any hooks rule violations while providing proactive token monitoring.
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2025-09-29
 */

import { decodeJWTToken } from '../apis/helpers';
import { env } from '../env';
import Cookies from 'js-cookie';

class TokenMonitorService {
    private intervalId: number | null = null;
    private isMonitoring = false;
    private config = {
        interval: 60000, // 1 minute
        warningThreshold: 5, // 5 minutes
        debug: true
    };
    private warningShown = false;

    /**
     * Start monitoring token expiration
     */
    start(): void {
        if (this.isMonitoring) {
            this.log('Already monitoring, stopping previous session');
            this.stop();
        }

        this.log('Starting proactive token monitoring');
        this.isMonitoring = true;
        this.warningShown = false;

        // Check immediately
        this.checkToken();

        // Set up periodic monitoring
        this.intervalId = setInterval(() => {
            this.checkToken();
        }, this.config.interval);
    }

    /**
     * Stop monitoring
     */
    stop(): void {
        this.log('Stopping token monitoring');
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.isMonitoring = false;
        this.warningShown = false;
    }

    /**
     * Check if monitoring is active
     */
    isActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Check current token for expiration
     */
    private checkToken(): void {
        try {
            // Enhanced debugging for cookie access issues
            // this.log('=== COOKIE DEBUG START ===');
            // this.log('Raw document.cookie:', document.cookie);
            // this.log('document.cookie.length:', document.cookie.length);
            
            // Check environment variable
            // this.log('env.AUTH_COOKIE_NAME:', env.AUTH_COOKIE_NAME);
            // this.log('typeof env.AUTH_COOKIE_NAME:', typeof env.AUTH_COOKIE_NAME);
            
            const cookieName = env.AUTH_COOKIE_NAME;
            // this.log('Resolved cookie name:', cookieName);
            
            // Try multiple methods to get the cookie
            const authCookieJS = Cookies.get(cookieName);
            const authCookieManual = this.getManualCookie(cookieName);
            
            // this.log('js-cookie result:', authCookieJS ? 'FOUND' : 'NULL');
            // this.log('manual parsing result:', authCookieManual ? 'FOUND' : 'NULL');
            
            // Use whichever method found the cookie
            const authCookie = authCookieJS || authCookieManual;
            
            if (!authCookie) {
                this.log('No auth cookie found - stopping monitoring');
                // this.log('All available cookies via js-cookie:', Object.keys(Cookies.get()));
                this.stop();
                return;
            }
            
            // this.log('Successfully found auth cookie!');
            // this.log('Cookie value length:', authCookie.length);
            // this.log('Cookie value (first 100 chars):', authCookie.substring(0, 100) + '...');
            
            // Parse and display the cookie contents
            // try {
            //     const parsedCookie = JSON.parse(authCookie);
            //     this.log('Parsed cookie keys:', Object.keys(parsedCookie));
            //     this.log('Has accessToken:', !!parsedCookie.accessToken);
            //     this.log('Has user:', !!parsedCookie.user);
            //     this.log('Has name:', !!parsedCookie.name);
            //     this.log('Has roles:', !!parsedCookie.roles);
            //     if (parsedCookie.accessToken) {
            //         this.log('AccessToken length:', parsedCookie.accessToken.length);
            //         this.log('AccessToken (first 50 chars):', parsedCookie.accessToken.substring(0, 50) + '...');
            //     }
            // } catch (parseError) {
            //     this.log('Error parsing cookie JSON:', parseError);
            //     this.log('Raw cookie value:', authCookie);
            // }

            const authData = JSON.parse(authCookie);
            if (!authData.accessToken) {
                this.log('No token in auth cookie - stopping monitoring');
                this.stop();
                return;
            }

            // this.log('Checking token expiration...');
            
            let tokenExpired = false;
            let expirationInfo: any = null;

            // Handle different token formats
            if (authData.accessToken.includes('.')) {
                // Standard JWT
                const result = this.checkJWTExpiration(authData.accessToken);
                tokenExpired = result.expired;
                expirationInfo = result;
                // this.log('JWT token check result:', result);
            } else {
                // Custom encoded token
                try {
                    const decodedResult = decodeJWTToken(authData.accessToken);
                    if (decodedResult.token && decodedResult.token.includes('.')) {
                        const result = this.checkJWTExpiration(decodedResult.token);
                        tokenExpired = result.expired;
                        expirationInfo = result;
                        // this.log('Custom token (decoded to JWT) check result:', result);
                    } else {
                        this.log('Custom token does not decode to JWT - cannot check expiration');
                        return;
                    }
                } catch (decodeError) {
                    this.log('Error decoding custom token:', decodeError);
                    return;
                }
            }

            // Enhanced expiration display with seconds
            if (expirationInfo) {
                const totalSeconds = expirationInfo.timeToExpiry || 0;
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                this.log(`🕐 Token expiration details:`);
                this.log(`   Total seconds remaining: ${totalSeconds}`);
                this.log(`   Time remaining: ${minutes}m ${seconds}s`);
                // this.log(`   Expiry timestamp: ${new Date(expirationInfo.exp * 1000).toLocaleString()}`);
                // this.log(`   Current timestamp: ${new Date(expirationInfo.currentTime * 1000).toLocaleString()}`);
            }

            // Handle expiration
            if (tokenExpired) {
                console.warn('🔐 PROACTIVE MONITORING: Token expired - performing logout');
                this.handleTokenExpiration();
            } else if (expirationInfo && expirationInfo.minutesToExpiry <= this.config.warningThreshold) {
                const totalSeconds = expirationInfo.timeToExpiry || 0;
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                
                if (!this.warningShown) {
                    console.warn(`⚠️ PROACTIVE MONITORING: Token expires in ${minutes}m ${seconds}s (${totalSeconds} seconds)`);
                    this.warningShown = true;
                    
                    // You could dispatch a custom event here for UI notifications
                    window.dispatchEvent(new CustomEvent('tokenExpirationWarning', {
                        detail: { 
                            minutesRemaining: expirationInfo.minutesToExpiry,
                            secondsRemaining: totalSeconds 
                        }
                    }));
                }
            } else {
                // Reset warning if token has plenty of time
                if (expirationInfo && expirationInfo.minutesToExpiry > this.config.warningThreshold) {
                    this.warningShown = false;
                }
                
                if (expirationInfo) {
                    const totalSeconds = expirationInfo.timeToExpiry || 0;
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    this.log(`✅ Token is valid - ${minutes}m ${seconds}s remaining (${totalSeconds} total seconds)`);
                } else {
                    this.log('✅ Token is valid - expiration time unknown');
                }
            }

        } catch (error) {
            console.error('Token Monitor Service: Error during token check:', error);
        }
    }

    /**
     * Check JWT token expiration
     */
    private checkJWTExpiration(token: string) {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) {
                return { expired: true, reason: 'Invalid JWT format' };
            }

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            const payload = JSON.parse(jsonPayload);
            const currentTime = Math.floor(Date.now() / 1000);

            if (!payload.exp) {
                return { expired: false, reason: 'No expiration claim' };
            }

            const expired = payload.exp < currentTime;
            const timeToExpiry = payload.exp - currentTime;

            return {
                expired,
                exp: payload.exp,
                currentTime,
                timeToExpiry,
                minutesToExpiry: Math.floor(timeToExpiry / 60),
                reason: expired ? 'Token expired' : 'Token valid'
            };

        } catch (error) {
            console.error('Error checking JWT expiration:', error);
            return { expired: true, reason: 'Error parsing token' };
        }
    }

    /**
     * Handle token expiration completely independently
     */
    private handleTokenExpiration(): void {
        console.warn('🔐 TOKEN EXPIRED - Performing complete logout independently of React');
        
        // Stop monitoring first
        this.stop();

        // Clear all authentication data
        Cookies.remove(env.AUTH_COOKIE_NAME);
        
        // Clear any localStorage items that might contain auth data
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            // Add any other auth-related localStorage keys you might have
        } catch (e) {
            // Ignore localStorage errors in incognito mode
        }

        // Clear any sessionStorage items
        try {
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('currentUser');
        } catch (e) {
            // Ignore sessionStorage errors
        }

        // Force immediate redirect without waiting for React
        console.log('🔄 Performing immediate redirect to login page');
        window.location.replace('/login?reason=expired');
    }

    /**
     * Debug logging
     */
    private log(message: string, ...args: any[]): void {
        if (this.config.debug) {
            console.log(`[TokenMonitor] ${message}`, ...args);
        }
    }

    /**
     * Update configuration
     */
    configure(config: Partial<typeof this.config>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Manual test method for debugging cookie issues
     */
    testCookieAccess(): void {
        console.log('=== Cookie Access Test ===');
        
        // Raw document.cookie check
        console.log('Raw document.cookie:', document.cookie);
        console.log('document.cookie length:', document.cookie.length);
        
        // Environment check
        console.log('env.AUTH_COOKIE_NAME:', env.AUTH_COOKIE_NAME);
        console.log('typeof env.AUTH_COOKIE_NAME:', typeof env.AUTH_COOKIE_NAME);
        
        // Cookie name resolution
        const cookieName = env.AUTH_COOKIE_NAME;
        console.log('Resolved cookie name:', cookieName);
        
        // js-cookie library test
        console.log('js-cookie Cookies object:', Cookies);
        const cookie = Cookies.get(cookieName);
        console.log('js-cookie result:', cookie ? 'FOUND' : 'NULL');
        console.log('js-cookie result type:', typeof cookie);
        if (cookie) {
            console.log('Cookie length:', cookie.length);
            console.log('Cookie preview (first 100 chars):', cookie.substring(0, 100) + '...');
        }
        
        // Manual cookie parsing
        const manualCookie = this.getManualCookie(cookieName);
        console.log('Manual cookie parsing result:', manualCookie ? 'FOUND' : 'NULL');
        if (manualCookie) {
            console.log('Manual cookie length:', manualCookie.length);
            console.log('Manual cookie preview (first 100 chars):', manualCookie.substring(0, 100) + '...');
        }
        
        // Parse and display the cookie if found
        const foundCookie = cookie || manualCookie;
        if (foundCookie) {
            try {
                const parsed = JSON.parse(foundCookie);
                console.log('✅ Successfully parsed cookie!');
                console.log('Cookie structure:', Object.keys(parsed));
                console.log('Has accessToken:', !!parsed.accessToken);
                console.log('Has user data:', !!parsed.user);
                console.log('User name:', parsed.name || 'N/A');
                console.log('User roles:', parsed.roles || 'N/A');
                if (parsed.accessToken) {
                    console.log('AccessToken length:', parsed.accessToken.length);
                    console.log('AccessToken starts with:', parsed.accessToken.substring(0, 20) + '...');
                    
                    // Check token expiration
                    try {
                        let expirationCheck;
                        if (parsed.accessToken.includes('.')) {
                            // Standard JWT
                            expirationCheck = this.checkJWTExpiration(parsed.accessToken);
                        } else {
                            // Try to decode custom token
                            const decoded = decodeJWTToken(parsed.accessToken);
                            if (decoded.token && decoded.token.includes('.')) {
                                expirationCheck = this.checkJWTExpiration(decoded.token);
                            }
                        }
                        
                        if (expirationCheck) {
                            const totalSeconds = expirationCheck.timeToExpiry || 0;
                            const minutes = Math.floor(totalSeconds / 60);
                            const seconds = totalSeconds % 60;
                            
                            console.log('🕐 Token Expiration Analysis:');
                            console.log(`   Expired: ${expirationCheck.expired ? '❌ YES' : '✅ NO'}`);
                            console.log(`   Total seconds remaining: ${totalSeconds}`);
                            console.log(`   Time remaining: ${minutes}m ${seconds}s`);
                            console.log(`   Expires at: ${new Date(expirationCheck.exp * 1000).toLocaleString()}`);
                            console.log(`   Current time: ${new Date().toLocaleString()}`);
                        }
                    } catch (expError) {
                        console.log('Could not check token expiration:', expError);
                    }
                }
            } catch (e) {
                console.error('❌ Failed to parse cookie as JSON:', e);
                console.log('Raw cookie content:', foundCookie);
            }
        }
        
        // Get all cookies using js-cookie
        const allCookies = Cookies.get();
        console.log('All cookies via js-cookie:', allCookies);
        console.log('Cookie count:', Object.keys(allCookies).length);
        
        // Test with different cookie names
        const testNames = [
            'auth_session_ticketer', 
            'authToken', 
            'auth_token',
            'session_token',
            'auth_session',
            cookieName
        ];
        
        console.log('Testing alternative cookie names:');
        testNames.forEach(name => {
            const testCookie = Cookies.get(name);
            const manualTest = this.getManualCookie(name);
            console.log(`  ${name}: js-cookie=${testCookie}, manual=${manualTest}`);
        });
        
        // Domain and path information
        console.log('Current domain:', window.location.hostname);
        console.log('Current path:', window.location.pathname);
        console.log('Current protocol:', window.location.protocol);
        
        console.log('=== End Test ===');
    }

    /**
     * Manual cookie parsing for debugging
     */
    private getManualCookie(name: string): string | null {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }
}

// Create singleton instance
export const tokenMonitorService = new TokenMonitorService();

// Make it globally available for debugging
if (typeof window !== 'undefined') {
    (window as any).tokenMonitorService = tokenMonitorService;
}

export default tokenMonitorService;