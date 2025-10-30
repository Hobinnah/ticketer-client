{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * @fileoverview Token Monitoring Hook using Web Worker
 * 
 * This custom hook provides proactive token monitoring using a Web Worker
 * to avoid React hooks rule violations and component lifecycle issues.
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2025-09-29
 */

import { useEffect, useRef, useCallback } from 'react';

export interface TokenMonitorConfig {
    /** Token to monitor for expiration */
    token?: string;
    /** Monitoring interval in milliseconds (default: 60000) */
    interval?: number;
    /** Callback when token expires */
    onTokenExpired?: () => void;
    /** Callback when token expiration is detected with time remaining */
    onExpirationWarning?: (minutesRemaining: number) => void;
    /** Warning threshold in minutes (default: 5) */
    warningThreshold?: number;
    /** Enable debug logging */
    debug?: boolean;
}

/**
 * Custom hook for proactive token monitoring using Web Worker
 * 
 * This hook manages a Web Worker that monitors token expiration in the background
 * without interfering with React's component lifecycle or causing hook rule violations.
 * 
 * @param config - Configuration for token monitoring
 * @returns Object with monitoring status and control methods
 */
export function useTokenMonitor(config: TokenMonitorConfig) {
    const workerRef = useRef<Worker | null>(null);
    const configRef = useRef<TokenMonitorConfig>(config);
    const warningShownRef = useRef<boolean>(false);

    // Update config reference
    configRef.current = config;

    const handleWorkerMessage = useCallback((event: MessageEvent) => {
        const { type, data } = event.data;
        const currentConfig = configRef.current;
        
        if (currentConfig.debug) {
            console.log('Token Monitor: Worker message received:', { type, data });
        }

        switch (type) {
            case 'TOKEN_CHECK_RESULT':
                if (data.expired) {
                    console.warn('🔐 Token expired - triggering logout');
                    currentConfig.onTokenExpired?.();
                } else if (data.expiration && data.expiration.minutesToExpiry <= (currentConfig.warningThreshold || 5)) {
                    // Show warning if token expires soon and we haven't shown it yet
                    if (!warningShownRef.current) {
                        console.warn(`⚠️ Token expires in ${data.expiration.minutesToExpiry} minutes`);
                        currentConfig.onExpirationWarning?.(data.expiration.minutesToExpiry);
                        warningShownRef.current = true;
                    }
                } else {
                    // Reset warning flag if token has plenty of time left
                    if (data.expiration && data.expiration.minutesToExpiry > (currentConfig.warningThreshold || 5)) {
                        warningShownRef.current = false;
                    }
                    
                    if (currentConfig.debug) {
                        console.log('Token Monitor: Token is valid', {
                            minutesToExpiry: data.expiration?.minutesToExpiry || 'unknown'
                        });
                    }
                }
                break;

            case 'TOKEN_CHECK_ERROR':
                console.error('Token Monitor: Worker error:', data.error);
                break;

            case 'REQUEST_TOKEN_CHECK':
                // Worker is requesting fresh token data
                if (workerRef.current && currentConfig.token) {
                    workerRef.current.postMessage({
                        type: 'CHECK_TOKEN',
                        data: { token: currentConfig.token }
                    });
                }
                break;

            default:
                if (currentConfig.debug) {
                    console.warn('Token Monitor: Unknown worker message type:', type);
                }
        }
    }, []);

    const startMonitoring = useCallback(() => {
        if (!workerRef.current || !configRef.current.token) {
            return;
        }

        console.log('Token Monitor: Starting proactive token monitoring');
        
        workerRef.current.postMessage({
            type: 'START_MONITORING',
            data: {
                token: configRef.current.token,
                interval: configRef.current.interval || 60000
            }
        });
    }, []);

    const stopMonitoring = useCallback(() => {
        if (!workerRef.current) {
            return;
        }

        console.log('Token Monitor: Stopping token monitoring');
        
        workerRef.current.postMessage({
            type: 'STOP_MONITORING'
        });
        
        // Reset warning flag
        warningShownRef.current = false;
    }, []);

    // Initialize Web Worker
    useEffect(() => {
        try {
            workerRef.current = new Worker('/token-monitor-worker.js');
            workerRef.current.addEventListener('message', handleWorkerMessage);
            
            if (config.debug) {
                console.log('Token Monitor: Web Worker initialized');
            }
            
            return () => {
                if (workerRef.current) {
                    workerRef.current.removeEventListener('message', handleWorkerMessage);
                    workerRef.current.terminate();
                    workerRef.current = null;
                    
                    if (config.debug) {
                        console.log('Token Monitor: Web Worker terminated');
                    }
                }
            };
        } catch (error) {
            console.error('Token Monitor: Failed to initialize Web Worker:', error);
        }
    }, [handleWorkerMessage, config.debug]);

    // Start/stop monitoring based on token availability
    useEffect(() => {
        if (config.token && workerRef.current) {
            startMonitoring();
        } else {
            stopMonitoring();
        }
    }, [config.token, startMonitoring, stopMonitoring]);

    return {
        /** Whether monitoring is active */
        isMonitoring: !!config.token && !!workerRef.current,
        /** Manually start monitoring */
        startMonitoring,
        /** Manually stop monitoring */
        stopMonitoring,
        /** Whether Web Worker is available */
        isWorkerSupported: typeof Worker !== 'undefined'
    };
}

export default useTokenMonitor;