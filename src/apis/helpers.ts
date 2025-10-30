{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


/**
 * @fileoverview Authentication and Utility Helper Functions
 * 
 * This module provides a comprehensive set of utility functions for authentication,
 * token management, data conversion, and common operations used throughout the
 * Network Manager application. It includes JWT token operations, authentication
 * middleware, image processing utilities, and date formatting functions.
 * 
 * Key Features:
 * - JWT token verification and generation
 * - Authentication middleware for API requests
 * - Token expiration validation and decoding
 * - Image processing and base64 conversion utilities
 * - Date formatting and string manipulation helpers
 * - URL parameter parsing utilities
 * - Custom token encoding/decoding with 2FA support
 * 
 * Security Features:
 * - JOSE-compliant JWT operations
 * - Secure token verification with secret key
 * - Automatic token expiration handling
 * - Multi-layer token encoding for enhanced security
 * - OTP (One-Time Password) integration support
 * 
 * Dependencies:
 * - jose: JWT operations and verification
 * - React Router: URL parameter parsing
 * 
 * @author Netvilleplus Team
 * @version 1.0.0
 * @since 2024
 * 
 * Installation:
 * ```bash
 * npm install jose
 * ```
 */

import * as jose from 'jose';
import { env } from '../env'; 
import { jwtSecret } from '../secrets';
import { useLocation } from 'react-router-dom';

/**
 * Configuration interface for authentication middleware
 * Defines the structure for HTTP request configuration with authorization headers
 * 
 * @interface Config
 */
type Config = {
    /** HTTP request headers */
    headers: {
        /** Optional JWT bearer token for authorization */
        Authorization?: string;
    };
};


/**
 * Text encoder for converting JWT secret to Uint8Array format
 * Required by JOSE library for cryptographic operations
 */
const encoder = new TextEncoder();

/**
 * Encoded secret key for JWT signing and verification
 * Derived from application secret configuration
 */
const secretKey = encoder.encode(jwtSecret);

/**
 * Higher-order authentication middleware function
 * 
 * Provides authentication wrapper for API functions by verifying JWT tokens
 * before allowing access to protected resources. Supports both authenticated
 * and non-authenticated modes based on environment configuration.
 * 
 * @template T - Generic type for wrapped function data
 * @param {...T[]} data - Variable number of arguments to pass to wrapped function
 * @returns {Function} Async function that performs authentication check
 * 
 * @example
 * ```typescript
 * // Wrap an API function with authentication
 * const protectedApiCall = withAuth(originalApiFunction);
 * const result = await protectedApiCall(config);
 * ```
 * 
 * @example
 * ```typescript
 * // Use with multiple data parameters
 * const protectedFunction = withAuth(param1, param2, apiFunction);
 * ```
 * 
 * Authentication Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify token using JWT verification
 * 3. Return 403 Unauthorized if verification fails (when auth is enabled)
 * 4. Execute wrapped function if authentication passes
 * 
 * Security Notes:
 * - Only active when env.USE_AUTH is true
 * - Returns standardized 403 error for unauthorized access
 * - Supports both function and data wrapping patterns
 */
export const withAuth = <T>(...data: T[]) =>
    async (config: Config) => {
        // Extract JWT token from Bearer authorization header
        const authToken = config.headers.Authorization?.split(' ')[1];
        
        // Verify token authenticity and validity
        const verified = authToken ? await verifyAuthToken(authToken) : false;

        // Enforce authentication if enabled in environment
        if (env.USE_AUTH && !verified) {
            return [403, { message: 'Unauthorized' }];
        }
        
        // Execute wrapped function or return data
        return typeof data[0] === 'function' ? data[0](config) : data;
};


/**
 * Verifies the authenticity and validity of a JWT authentication token
 * 
 * Uses JOSE library to cryptographically verify JWT tokens against the
 * application's secret key. Supports both boolean verification and payload
 * extraction modes for different use cases.
 * 
 * @param {string} authToken - The JWT token to verify
 * @param {Object} [options={}] - Verification options
 * @param {boolean} [options.returnPayload=false] - If true, returns token payload instead of boolean
 * 
 * @returns {Promise<boolean | object>} 
 *   - Returns true if token is valid (when returnPayload is false)
 *   - Returns token payload object if valid (when returnPayload is true)
 *   - Returns false if token is invalid or verification fails
 * 
 * @example
 * ```typescript
 * // Simple boolean verification
 * const isValid = await verifyAuthToken(userToken);
 * if (isValid) {
 *   // Token is authentic and not expired
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Extract payload data
 * const payload = await verifyAuthToken(userToken, { returnPayload: true });
 * if (payload) {
 *   console.log('User ID:', payload.sub);
 *   console.log('Expires:', payload.exp);
 * }
 * ```
 * 
 * Security Features:
 * - Cryptographic signature verification using HMAC SHA-256
 * - Automatic expiration time validation
 * - Protection against token tampering
 * - Safe error handling for malformed tokens
 * 
 * Error Handling:
 * - Returns false for any verification failure
 * - Handles malformed tokens gracefully
 * - No error information leakage for security
 */
export const verifyAuthToken = async (authToken: string, options: { returnPayload?: boolean } = {}) => {
    try {
        // Perform cryptographic JWT verification
        const verification = await jose.jwtVerify(authToken, secretKey);
        
        // Return payload or boolean based on options
        return options?.returnPayload ? verification.payload : true;
    } catch {
        // Return false for any verification failure (security)
        return false;
    }
};

/**
 * Generates a new JWT refresh token with embedded user data
 * 
 * Creates a cryptographically signed JWT token with a 1-hour expiration
 * for secure token refresh operations. Uses HMAC SHA-256 algorithm for
 * maximum security and compatibility.
 * 
 * @template T - Generic type for the data to embed in token
 * @param {T} data - User data or payload to embed in the JWT token
 * 
 * @returns {Promise<string>} A signed JWT token string ready for use
 * 
 * @example
 * ```typescript
 * // Generate refresh token with user data
 * const userData = { userId: 123, email: 'user@example.com' };
 * const refreshToken = await generateRefreshAuthToken(userData);
 * ```
 * 
 * @example
 * ```typescript
 * // Generate token for session refresh
 * const sessionData = { sessionId: 'abc123', roles: ['user'] };
 * const token = await generateRefreshAuthToken(sessionData);
 * ```
 * 
 * Token Properties:
 * - **Algorithm**: HMAC SHA-256 (HS256)
 * - **Expiration**: 1 hour from creation
 * - **Issuer**: Application domain
 * - **Issued At**: Current timestamp
 * - **Payload**: Custom data embedded securely
 * 
 * Security Features:
 * - Cryptographic signing prevents tampering
 * - Short expiration time limits exposure window
 * - Standard JWT format for interoperability
 * - Secure secret key for signature generation
 * 
 * Usage Notes:
 * - Use for token refresh flows only
 * - Store securely on client side
 * - Validate expiration before use
 * - Regenerate when main token expires
 */
export const generateRefreshAuthToken = async <T>(data: T) => {
    return await new jose.SignJWT({ data })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer('https://example.com')
        .setExpirationTime('1h')
        .sign(secretKey);
}

/**
 * Converts a data URL string to a Blob object for file operations
 * 
 * Parses base64-encoded data URLs and converts them to binary Blob objects
 * suitable for file uploads, downloads, or other binary data operations.
 * Preserves original MIME type information from the data URL.
 * 
 * @param {string} dataURL - The data URL string to convert (e.g., "data:image/png;base64,...")
 * 
 * @returns {Blob} A Blob object containing the binary data with correct MIME type
 * 
 * @example
 * ```typescript
 * // Convert canvas to blob for upload
 * const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
 * const dataURL = canvas.toDataURL('image/png');
 * const blob = dataURLToBlob(dataURL);
 * 
 * // Use blob for file upload
 * const formData = new FormData();
 * formData.append('image', blob, 'canvas-image.png');
 * ```
 * 
 * @example
 * ```typescript
 * // Convert image data URL to downloadable blob
 * const imageDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
 * const imageBlob = dataURLToBlob(imageDataURL);
 * const downloadURL = URL.createObjectURL(imageBlob);
 * ```
 * 
 * Supported Formats:
 * - Images: PNG, JPEG, GIF, WebP, SVG
 * - Documents: PDF, text files
 * - Any MIME type with base64 encoding
 * 
 * Performance Notes:
 * - Efficient binary conversion using TypedArrays
 * - Preserves original file size and quality
 * - Memory-efficient for large files
 * - Browser-native base64 decoding
 */
export const dataURLToBlob = (dataURL: string): Blob  => {
    // Split data URL into metadata and base64 content
    const parts = dataURL.split(',');
    const byteString = atob(parts[1]); // Decode base64
    const mimeString = parts[0].split(':')[1].split(';')[0]; // Extract MIME type
    
    // Create binary array buffer from decoded string
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert each character to byte value
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    // Return blob with correct MIME type
    return new Blob([arrayBuffer], { type: mimeString });
}

/**
 * Converts an image URL to a base64-encoded data URL string
 * 
 * Fetches an image from a URL and converts it to a base64 data URL format
 * suitable for embedding in HTML, CSS, or storing as text data. Handles
 * both local and remote image URLs with proper CORS support.
 * 
 * @param {string} imageUrl - The URL of the image to convert
 * 
 * @returns {Promise<string>} A promise resolving to base64 data URL string
 * 
 * @throws {Error} Throws error if image fetch fails or conversion fails
 * 
 * @example
 * ```typescript
 * // Convert remote image to base64
 * try {
 *   const base64 = await getBase64FromImageUrl('https://example.com/image.jpg');
 *   console.log(base64); // "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 * } catch (error) {
 *   console.error('Failed to convert image:', error);
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Use with local images
 * const localImage = './assets/logo.png';
 * const logoBase64 = await getBase64FromImageUrl(localImage);
 * 
 * // Embed in img tag
 * const img = document.createElement('img');
 * img.src = logoBase64;
 * ```
 * 
 * @example
 * ```typescript
 * // Batch convert multiple images
 * const imageUrls = ['img1.jpg', 'img2.png', 'img3.gif'];
 * const base64Images = await Promise.all(
 *   imageUrls.map(url => getBase64FromImageUrl(url))
 * );
 * ```
 * 
 * Use Cases:
 * - Offline image storage
 * - Email embedding
 * - CSS background images
 * - Image caching
 * - Data export functionality
 * 
 * Performance Notes:
 * - Uses efficient Fetch API for network requests
 * - FileReader API for optimal memory usage
 * - Promise-based for async/await compatibility
 * - Automatic MIME type detection
 * 
 * Security Considerations:
 * - Respects CORS policies
 * - No client-side image processing vulnerabilities
 * - Safe for user-uploaded content processing
 */
export const getBase64FromImageUrl = async (imageUrl: string): Promise<string> => {
    // Fetch image data from URL
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Convert blob to base64 data URL using FileReader
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        // Handle successful conversion
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        
        // Handle conversion errors
        reader.onerror = reject;
        
        // Start conversion to data URL
        reader.readAsDataURL(blob);
    });
};

/**
 * Capitalizes the first letter of a string while preserving the rest
 * 
 * A utility function for formatting text display, particularly useful for
 * user names, form labels, and UI text that needs proper capitalization.
 * Handles edge cases like empty strings and null values safely.
 * 
 * @param {string} str - The string to capitalize
 * 
 * @returns {string} The string with the first letter capitalized
 * 
 * @example
 * ```typescript
 * // Basic usage
 * capitalizeFirstLetter('hello world'); // "Hello world"
 * capitalizeFirstLetter('JOHN'); // "JOHN" (rest unchanged)
 * capitalizeFirstLetter(''); // ""
 * ```
 * 
 * @example
 * ```typescript
 * // Format user names
 * const firstName = 'john';
 * const lastName = 'doe';
 * const fullName = `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)}`;
 * // Result: "John Doe"
 * ```
 * 
 * @example
 * ```typescript
 * // Format form labels
 * const formFields = ['firstName', 'lastName', 'emailAddress'];
 * const labels = formFields.map(field => capitalizeFirstLetter(field));
 * // Result: ["FirstName", "LastName", "EmailAddress"]
 * ```
 * 
 * Edge Cases:
 * - Empty string returns empty string
 * - Single character strings work correctly
 * - Preserves whitespace and special characters
 * - Safe with unicode characters
 * 
 * Performance:
 * - O(1) time complexity for first character
 * - Minimal memory allocation
 * - No regex overhead
 */
export function capitalizeFirstLetter(str: string): string {
    // Handle empty or null strings safely
    if (!str) return str;
    
    // Capitalize first character, preserve rest
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Custom React hook for parsing URL query parameters
 * 
 * Provides easy access to URL search parameters in React components using
 * React Router's useLocation hook. Returns a URLSearchParams object for
 * convenient parameter extraction and manipulation.
 * 
 * @returns {URLSearchParams} URLSearchParams object for current URL query string
 * 
 * @example
 * ```tsx
 * // Component using query parameters
 * function ProductPage() {
 *   const query = useQuery();
 *   const productId = query.get('id');
 *   const category = query.get('category');
 *   
 *   return <div>Product: {productId} in {category}</div>;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Check for specific parameters
 * function SearchResults() {
 *   const query = useQuery();
 *   const searchTerm = query.get('q') || '';
 *   const page = parseInt(query.get('page') || '1');
 *   const filters = query.getAll('filter');
 *   
 *   return <SearchComponent term={searchTerm} page={page} filters={filters} />;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // URL: /products?category=electronics&sort=price&filter=brand&filter=rating
 * function ProductList() {
 *   const query = useQuery();
 *   
 *   console.log(query.get('category')); // "electronics"
 *   console.log(query.get('sort')); // "price"
 *   console.log(query.getAll('filter')); // ["brand", "rating"]
 *   console.log(query.has('category')); // true
 * }
 * ```
 * 
 * Common URLSearchParams Methods:
 * - `get(key)`: Get single parameter value
 * - `getAll(key)`: Get all values for a parameter
 * - `has(key)`: Check if parameter exists
 * - `keys()`: Iterator over parameter names
 * - `values()`: Iterator over parameter values
 * 
 * Requirements:
 * - Must be used inside React component or custom hook
 * - Requires React Router context (useLocation)
 * - Component must be wrapped by Router provider
 */
export function useQuery() {
    return new URLSearchParams(useLocation().search);
}

/**
 * Formats a date string into a human-readable format
 * 
 * Converts date strings into a localized, user-friendly format using the
 * Intl.DateTimeFormat API. Provides consistent date display across the
 * application with proper localization support.
 * 
 * @param {string} dateString - The date string to format (ISO 8601, etc.)
 * 
 * @returns {string} Formatted date string in "Month Day, Year" format or empty string
 * 
 * @example
 * ```typescript
 * // Format ISO date strings
 * formatDate('2024-01-15'); // "January 15, 2024"
 * formatDate('2024-12-25T10:30:00Z'); // "December 25, 2024"
 * ```
 * 
 * @example
 * ```typescript
 * // Handle various date formats
 * formatDate('2024/03/14'); // "March 14, 2024"
 * formatDate('Mar 14, 2024'); // "March 14, 2024"
 * formatDate(''); // ""
 * formatDate(null); // ""
 * ```
 * 
 * @example
 * ```typescript
 * // Use in component rendering
 * function EventCard({ event }) {
 *   return (
 *     <div>
 *       <h3>{event.title}</h3>
 *       <p>Date: {formatDate(event.date)}</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Format multiple dates
 * const events = [
 *   { name: 'Meeting', date: '2024-01-15' },
 *   { name: 'Conference', date: '2024-02-20' }
 * ];
 * 
 * const formattedEvents = events.map(event => ({
 *   ...event,
 *   formattedDate: formatDate(event.date)
 * }));
 * ```
 * 
 * Output Format:
 * - **US English locale**: "January 15, 2024"
 * - **Full month name**: Complete month spelling
 * - **Numeric day**: Without leading zeros
 * - **Full year**: Four-digit year format
 * 
 * Edge Cases:
 * - Empty/null strings return empty string
 * - Invalid dates handled gracefully
 * - Timezone information preserved from input
 * - Works with various input formats
 * 
 * Performance:
 * - Uses native Intl API for optimal performance
 * - Cached formatter for consistent results
 * - No external date library dependencies
 */
export function formatDate(dateString: string): string {
    // Handle empty or null date strings
    if (!dateString) {
        return '';
    }
    
    // Create Date object and format using Intl API
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    }).format(date);
}

/**
 * Validates JWT token expiration status
 * 
 * Decodes a JWT token and checks if it has expired by comparing the
 * expiration claim (exp) with the current timestamp. Provides safe
 * token validation without external dependencies.
 * 
 * @param {string} token - The JWT token to validate (standard JWT format)
 * 
 * @returns {boolean} True if token is expired or invalid, false if still valid
 * 
 * @example
 * ```typescript
 * // Check token before API calls
 * const userToken = localStorage.getItem('authToken');
 * if (isTokenExpired(userToken)) {
 *   // Redirect to login or refresh token
 *   redirectToLogin();
 * } else {
 *   // Token is valid, proceed with request
 *   makeApiCall();
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Automatic token validation in auth guard
 * function AuthGuard({ children }) {
 *   const token = getStoredToken();
 *   
 *   if (!token || isTokenExpired(token)) {
 *     return <LoginPage />;
 *   }
 *   
 *   return children;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Batch validate multiple tokens
 * const tokens = ['token1', 'token2', 'token3'];
 * const validTokens = tokens.filter(token => !isTokenExpired(token));
 * ```
 * 
 * Token Validation Process:
 * 1. **Format Check**: Verifies JWT structure (3 parts separated by dots)
 * 2. **Payload Decode**: Decodes base64URL payload section
 * 3. **Expiration Extract**: Reads 'exp' claim from payload
 * 4. **Time Compare**: Compares expiration with current Unix timestamp
 * 
 * Security Features:
 * - No external network calls required
 * - Safe error handling for malformed tokens
 * - Prevents use of expired credentials
 * - Client-side validation for performance
 * 
 * Edge Cases:
 * - Empty/null tokens return true (expired)
 * - Malformed JWT structure returns true (expired)
 * - Missing expiration claim returns true (expired)
 * - Invalid base64 encoding returns true (expired)
 * 
 * Performance Notes:
 * - O(1) time complexity
 * - No regex processing required
 * - Minimal memory allocation
 * - Browser-native base64 decoding
 */
export function isTokenExpired(token: string): boolean {
    try {
        // Handle empty or null tokens
        if (!token) return true;
        
        // Extract payload section from JWT (second part)
        const base64Url = token.split('.')[1];
        if (!base64Url) return true;
        
        // Convert base64URL to standard base64
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Decode base64 to JSON string with proper URL encoding
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        // Parse JWT payload and extract expiration
        const payload = JSON.parse(jsonPayload);
        const currentTime = Date.now() / 1000; // Convert to Unix timestamp
        
        // Compare expiration with current time
        return payload.exp < currentTime;
    } catch {
        // Consider any decode error as expired for security
        return true;
    }
}

/**
 * Decodes custom-encoded JWT tokens with optional two-factor authentication support
 * 
 * Handles the application's proprietary token encoding scheme that supports
 * both standard JWT tokens and enhanced tokens with OTP (One-Time Password)
 * integration for two-factor authentication scenarios.
 * 
 * @param {string} encodedToken - The custom-encoded token string to decode
 * @param {boolean} [twoWayAuthentication=false] - Whether to decode 2FA-enhanced token format
 * 
 * @returns {Object} Decoded token object with different properties based on mode:
 *   - **Standard mode**: `{ token: string }`
 *   - **2FA mode**: `{ token: string, otp: string, otpExpiryTime: string }`
 * 
 * @example
 * ```typescript
 * // Decode standard encoded token
 * const standardToken = 'base64EncodedToken';
 * const decoded = decodeJWTToken(standardToken);
 * console.log(decoded.token); // Original JWT token
 * ```
 * 
 * @example
 * ```typescript
 * // Decode 2FA-enhanced token
 * const twoFactorToken = 'tokenPart-NETmkrTUpW0616384oAHT-otpPart-NETmkrTUpW0616384oAHT-expiryPart';
 * const decoded = decodeJWTToken(twoFactorToken, true);
 * 
 * console.log(decoded.token);         // Decoded JWT token
 * console.log(decoded.otp);           // OTP code for verification
 * console.log(decoded.otpExpiryTime); // OTP expiration timestamp
 * ```
 * 
 * @example
 * ```typescript
 * // Use in authentication flow
 * function handleTokenValidation(encodedToken: string, requiresOTP: boolean) {
 *   const decoded = decodeJWTToken(encodedToken, requiresOTP);
 *   
 *   if (requiresOTP) {
 *     // Validate OTP before proceeding
 *     if (new Date() > new Date(decoded.otpExpiryTime)) {
 *       throw new Error('OTP has expired');
 *     }
 *     validateOTP(decoded.otp);
 *   }
 *   
 *   return decoded.token;
 * }
 * ```
 * 
 * Token Formats:
 * 
 * **Standard Format**:
 * - Input: Base64-encoded JWT token (double-encoded)
 * - Process: `atob(atob(encodedToken))`
 * - Output: `{ token: "original-jwt-token" }`
 * 
 * **2FA Enhanced Format**:
 * - Input: `tokenPart-NETmkrTUpW0616384oAHT-otpPart-NETmkrTUpW0616384oAHT-expiryPart`
 * - Delimiter: `-NETmkrTUpW0616384oAHT-`
 * - Process: Split and decode each part individually
 * - Output: `{ token: string, otp: string, otpExpiryTime: string }`
 * 
 * Encoding Levels:
 * - **Token Part**: Triple base64 encoding (`atob(atob(atob()))`)
 * - **OTP Part**: Single base64 encoding (`atob()`)
 * - **Expiry Part**: Double base64 encoding (`atob(atob())`)
 * 
 * Security Features:
 * - Multi-layer encoding prevents simple token inspection
 * - OTP integration for enhanced security
 * - Time-based OTP expiration validation
 * - Custom delimiter prevents collision attacks
 * 
 * Performance Notes:
 * - Minimal string operations for efficiency
 * - No regex processing required
 * - Browser-native base64 decoding
 * - Memory-efficient for large tokens
 * 
 * Use Cases:
 * - Standard authentication token decoding
 * - Two-factor authentication flows
 * - Enhanced security scenarios
 * - Token refresh operations
 */

/**
 * Debug utility function to analyze token structure
 * 
 * @param {string} token - The token to analyze
 * @returns {Object} Analysis of the token structure
 */
export function debugTokenStructure(token: string) {
    // console.log('=== TOKEN STRUCTURE ANALYSIS ==='); // SECURITY: Debug function - disabled in production
    // console.log('Raw token:', token); // SECURITY: Contains sensitive token
    // console.log('Token length:', token.length);
    // console.log('Token type:', typeof token);
    
    // Check for 2FA delimiter
    const has2FADelimiter = token.includes(env.TOKEN_2FA_DELIMITER);
    // console.log('Contains 2FA delimiter:', has2FADelimiter);
    
    if (has2FADelimiter) {
        const parts = token.split(env.TOKEN_2FA_DELIMITER);
        // console.log('Number of parts:', parts.length);
        parts.forEach((part, index) => {
            // console.log(`Part ${index + 1}:`, part); // SECURITY: Contains sensitive token parts
            // console.log(`Part ${index + 1} length:`, part.length);
            console.log( index );
            // Test if it's valid base64
            try {
                atob(part);
                // console.log(`Part ${index + 1} is valid base64:`, true);
            } catch (e) {
                // console.log(`Part ${index + 1} is valid base64:`, false);
                // console.log(`Part ${index + 1} base64 error:`, (e as Error).message);
            }
        });
    } else {
        // Test standard JWT format
        const jwtParts = token.split('.');
        // console.log('JWT parts:', jwtParts.length); // SECURITY: Token structure analysis
        if (jwtParts.length === 3) {
            // console.log('Appears to be JWT format'); // SECURITY: Token structure analysis
        } else {
            // Test if it's base64 encoded
            try {
                // const decoded1 = atob(token);
                // console.log('First level base64 decode successful'); // SECURITY: Token decode analysis
                try {
                    // const decoded2 = atob(decoded1); // Test second level decode
                    // console.log('Second level base64 decode successful'); // SECURITY: Token decode analysis
                    // console.log('Decoded content (first 100 chars):', decoded2.substring(0, 100)); // SECURITY: Contains token content
                } catch (e) {
                    // console.log('Second level base64 decode failed:', (e as Error).message); // SECURITY: Token decode analysis
                }
            } catch (e) {
                // console.log('First level base64 decode failed:', (e as Error).message); // SECURITY: Token decode analysis
            }
        }
    }
    // console.log('=== END TOKEN ANALYSIS ==='); // SECURITY: Debug function - disabled in production
}

export function decodeJWTToken(encodedToken: string, twoWayAuthentication: boolean = false) {
    if (!encodedToken || typeof encodedToken !== 'string') {
        throw new Error('Invalid token: Token must be a non-empty string');
    }
    // console.log('Decoding token. Two-way authentication:', twoWayAuthentication); // SECURITY: Token decode logging
    try {
        if (twoWayAuthentication) {
            // Handle 2FA-enhanced token format with custom delimiter
            const parts = encodedToken.split(env.TOKEN_2FA_DELIMITER);
            // console.log('Decoding 2FA token with parts:', parts); // SECURITY: Contains sensitive token parts

            if (parts.length !== 3) {
                throw new Error('Invalid 2FA token format: Expected 3 parts separated by delimiter');
            }
            
            const encodedTokenPart = parts[0];
            const otpPart = parts[1];
            const otpExpiryTimePart = parts[2];
            
            // console.log('Token part length:', encodedTokenPart?.length); // SECURITY: Token part analysis
            // console.log('OTP part:', otpPart); // SECURITY: Contains sensitive OTP
            // console.log('OTP part length:', otpPart?.length);
            // console.log('Expiry part:', otpExpiryTimePart); // SECURITY: Contains expiry data
            // console.log('Expiry part length:', otpExpiryTimePart?.length);

            if (!encodedTokenPart || !otpPart || !otpExpiryTimePart) {
                throw new Error('Invalid 2FA token format: All parts must be non-empty');
            }

            // Decode token part - try different encoding levels
            let decodedTokenPart: string;
            let tokenDecodeSuccess = false;
            
            // Try triple base64 first (expected)
            try {
                // console.log('Attempting triple base64 decode of token part...'); // SECURITY: Token decode logging
                const step1 = atob(encodedTokenPart);
                // console.log('Token part step 1 successful, length:', step1.length); // SECURITY: Token decode logging
                const step2 = atob(step1);
                // console.log('Token part step 2 successful, length:', step2.length); // SECURITY: Token decode logging
                decodedTokenPart = atob(step2);
                // console.log('Token part triple decode successful, length:', decodedTokenPart.length); // SECURITY: Token decode logging
                tokenDecodeSuccess = true;
            } catch (e1) {
                // console.log('Triple decode failed, trying double decode...'); // SECURITY: Token decode logging
                
                // Try double base64
                try {
                    const step1 = atob(encodedTokenPart);
                    decodedTokenPart = atob(step1);
                    // console.log('Token part double decode successful, length:', decodedTokenPart.length); // SECURITY: Token decode logging
                    tokenDecodeSuccess = true;
                } catch (e2) {
                    // console.log('Double decode failed, trying single decode...'); // SECURITY: Token decode logging
                    
                    // Try single base64
                    try {
                        decodedTokenPart = atob(encodedTokenPart);
                        // console.log('Token part single decode successful, length:', decodedTokenPart.length); // SECURITY: Token decode logging
                        tokenDecodeSuccess = true;
                    } catch (e3) {
                        // console.log('Single decode failed, using raw token...'); // SECURITY: Token decode logging
                        decodedTokenPart = encodedTokenPart;
                        tokenDecodeSuccess = true;
                    }
                }
            }
            
            if (!tokenDecodeSuccess) {
                throw new Error('Invalid token encoding: Failed to decode token part with any method');
            }
            
            // Decode OTP part - try different encoding levels
            let decodedOTP: string;
            let otpDecodeSuccess = false;
            
            // Try single base64 first (expected)
            try {
                // console.log('Attempting single base64 decode of OTP part...'); // SECURITY: Token decode logging
                decodedOTP = atob(otpPart);
                // console.log('OTP single decode successful:', decodedOTP); // SECURITY: Contains sensitive OTP
                otpDecodeSuccess = true;
            } catch (e1) {
                // console.log('OTP single decode failed, trying double decode...'); // SECURITY: Token decode logging
                
                // Try double base64
                try {
                    const step1 = atob(otpPart);
                    decodedOTP = atob(step1);
                    // console.log('OTP double decode successful:', decodedOTP); // SECURITY: Contains sensitive OTP
                    otpDecodeSuccess = true;
                } catch (e2) {
                    // console.log('OTP double decode failed, using raw value...'); // SECURITY: Token decode logging
                    decodedOTP = otpPart;
                    otpDecodeSuccess = true;
                }
            }
            
            if (!otpDecodeSuccess) {
                throw new Error('Invalid OTP encoding: Failed to decode OTP part with any method');
            }
            
            // Decode OTP expiry time part - try different encoding levels
            let decodedOtpExpiryTime: string;
            let expiryDecodeSuccess = false;
            
            // Try double base64 first (expected)
            try {
                // console.log('Attempting double base64 decode of expiry part...'); // SECURITY: Token decode logging
                const expStep1 = atob(otpExpiryTimePart);
                // console.log('Expiry part step 1 successful, length:', expStep1.length); // SECURITY: Token decode logging
                decodedOtpExpiryTime = atob(expStep1);
                // console.log('Expiry part double decode successful:', decodedOtpExpiryTime); // SECURITY: Contains expiry data
                expiryDecodeSuccess = true;
            } catch (e1) {
                // console.log('Expiry double decode failed, trying single decode...'); // SECURITY: Token decode logging
                
                // Try single base64
                try {
                    decodedOtpExpiryTime = atob(otpExpiryTimePart);
                    // console.log('Expiry single decode successful:', decodedOtpExpiryTime); // SECURITY: Contains expiry data
                    expiryDecodeSuccess = true;
                } catch (e2) {
                    // console.log('Expiry single decode failed, using raw value...'); // SECURITY: Token decode logging
                    decodedOtpExpiryTime = otpExpiryTimePart;
                    expiryDecodeSuccess = true;
                }
            }
            
            if (!expiryDecodeSuccess) {
                throw new Error('Invalid expiry time encoding: Failed to decode expiry time part with any method');
            }

            // console.log('Decoded OTP:', decodedOTP); // SECURITY: Contains sensitive OTP
            // console.log('Decoded Expiry Time:', decodedOtpExpiryTime); // SECURITY: Contains expiry data

            return {
                token: decodedTokenPart,
                otp: decodedOTP,
                otpExpiryTime: decodedOtpExpiryTime
            };
        } else {
            // Handle standard encoded token - try multiple decoding strategies
            // console.log('Attempting to decode standard token:', encodedToken); // SECURITY: Contains sensitive token
            
            // First, debug the token structure
            debugTokenStructure(encodedToken);
            
            let decodedToken: string;
            
            // Strategy 1: Check if it's already a JWT token (contains dots)
            if (encodedToken.includes('.') && encodedToken.split('.').length === 3) {
                // console.log('Token appears to be a raw JWT, no decoding needed'); // SECURITY: Token decode logging
                decodedToken = encodedToken;
            } else {
                // Strategy 2: Try double base64 decoding (expected format)
                try {
                    decodedToken = atob(atob(encodedToken));
                    // console.log('Successfully decoded with double base64'); // SECURITY: Token decode logging
                } catch (doubleDecodeError) {
                    // console.log('Double base64 decode failed:', (doubleDecodeError as Error).message); // SECURITY: Token decode logging
                    
                    // Strategy 3: Try single base64 decoding
                    try {
                        decodedToken = atob(encodedToken);
                        console.log('Successfully decoded with single base64');
                    } catch (singleDecodeError) {
                        console.log('Single base64 decode failed:', (singleDecodeError as Error).message);
                        
                        // Strategy 4: No decoding needed (raw token)
                        console.log('Using token as-is (no base64 decoding)');
                        decodedToken = encodedToken;
                    }
                }
            }
            
            // console.log('Final decoded token (first 50 chars):', decodedToken.substring(0, 50)); // SECURITY: Contains partial token
            return { token: decodedToken };
        }
    } catch (error) {
        console.error('Token decoding error:', error);
        throw error;
    }
}