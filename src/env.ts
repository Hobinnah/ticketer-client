
{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

// Alert type for consistent typing across the app
export type AlertType = 'success' | 'error' | 'info';

export const env = {
    // Environment mode from Vite
    NODE_ENV: import.meta.env.MODE,
    
    // Authentication setting from .env file
    USE_AUTH: import.meta.env.VITE_USE_AUTH === 'true',
    
    // Authentication cookie name and security settings
    AUTH_COOKIE_NAME: import.meta.env.VITE_AUTH_COOKIE_NAME || 'auth_session_ticketer',
    COOKIE_SECURE: import.meta.env.VITE_COOKIE_SECURE === 'true',
    
    // Use proxy in development, full URL in production
    API_BASE_URL: import.meta.env.DEV ? '/' : (import.meta.env.VITE_API_BASE_URL || ''),
    
    // API target for Vite proxy configuration (backend server URL)
    API_TARGET_URL: import.meta.env.VITE_API_BASE_URL || '',
    
    // Search strategy from .env file with fallback
    SEARCH_STRATEGY: (import.meta.env.VITE_SEARCH_STRATEGY as 'server' | 'client') || 'client',
    
    // Alert duration settings from .env file with fallbacks
    ALERT_DURATIONS: {
        'success': parseInt(import.meta.env.VITE_ALERT_DURATION_SUCCESS) || 5000,
        'info': parseInt(import.meta.env.VITE_ALERT_DURATION_INFO) || 6000,
        'error': parseInt(import.meta.env.VITE_ALERT_DURATION_ERROR) || 10000
    },
    
    // Delimiter for 2FA token encoding/decoding from .env file
    TOKEN_2FA_DELIMITER: import.meta.env.VITE_TOKEN_2FA_DELIMITER || ''
};