/**
 * Token Monitor Web Worker
 * 
 * This Web Worker runs in a separate thread to monitor token expiration
 * without interfering with React's component lifecycle or hook rules.
 */

let monitoringInterval = null;
let isMonitoring = false;

// Listen for messages from the main thread
self.onmessage = function(event) {
    const { type, data } = event.data;
    
    switch (type) {
        case 'START_MONITORING':
            startMonitoring(data);
            break;
            
        case 'STOP_MONITORING':
            stopMonitoring();
            break;
            
        case 'CHECK_TOKEN':
            checkToken(data);
            break;
            
        default:
            console.warn('Token Worker: Unknown message type:', type);
    }
};

function startMonitoring(config) {
    if (isMonitoring) {
        console.log('Token Worker: Already monitoring, stopping previous session');
        stopMonitoring();
    }
    
    console.log('Token Worker: Starting token monitoring with config:', {
        interval: config.interval || 60000,
        hasToken: !!config.token
    });
    
    isMonitoring = true;
    
    // Check immediately
    if (config.token) {
        checkToken(config);
    }
    
    // Set up periodic checking
    monitoringInterval = setInterval(() => {
        if (isMonitoring) {
            // Request fresh token data from main thread
            self.postMessage({
                type: 'REQUEST_TOKEN_CHECK'
            });
        }
    }, config.interval || 60000);
}

function stopMonitoring() {
    console.log('Token Worker: Stopping token monitoring');
    
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
    
    isMonitoring = false;
}

function checkToken(tokenData) {
    if (!tokenData || !tokenData.token) {
        console.log('Token Worker: No token provided for checking');
        return;
    }
    
    try {
        console.log('Token Worker: Checking token expiration...');
        
        let tokenExpired = false;
        let expirationInfo = null;
        
        if (tokenData.token.includes('.')) {
            // Standard JWT token
            const result = checkJWTExpiration(tokenData.token);
            tokenExpired = result.expired;
            expirationInfo = result;
        } else {
            // Custom encoded token - decode first
            try {
                const decodedToken = decodeCustomToken(tokenData.token);
                if (decodedToken && decodedToken.includes('.')) {
                    const result = checkJWTExpiration(decodedToken);
                    tokenExpired = result.expired;
                    expirationInfo = result;
                } else {
                    console.log('Token Worker: Custom token does not decode to JWT format');
                }
            } catch (decodeError) {
                console.error('Token Worker: Error decoding custom token:', decodeError);
            }
        }
        
        // Send result back to main thread
        self.postMessage({
            type: 'TOKEN_CHECK_RESULT',
            data: {
                expired: tokenExpired,
                expiration: expirationInfo,
                timestamp: Date.now()
            }
        });
        
    } catch (error) {
        console.error('Token Worker: Error during token check:', error);
        
        self.postMessage({
            type: 'TOKEN_CHECK_ERROR',
            data: {
                error: error.message,
                timestamp: Date.now()
            }
        });
    }
}

function checkJWTExpiration(token) {
    try {
        // Extract payload from JWT
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            return { expired: true, reason: 'Invalid JWT format' };
        }
        
        // Convert base64URL to standard base64
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Decode base64 to JSON string
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        // Parse JWT payload
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
        console.error('Token Worker: Error checking JWT expiration:', error);
        return { expired: true, reason: 'Error parsing token' };
    }
}

function decodeCustomToken(encodedToken) {
    try {
        // Try double base64 decoding (common format)
        return atob(atob(encodedToken));
    } catch (error1) {
        try {
            // Try single base64 decoding
            return atob(encodedToken);
        } catch (error2) {
            // Return as-is if decoding fails
            return encodedToken;
        }
    }
}

console.log('Token Monitor Web Worker initialized');