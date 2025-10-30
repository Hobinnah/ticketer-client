{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

/**
 * ===================================THIS FILE WAS AUTO GENERATED===================================
 * 
 * Generic API utilities for making HTTP requests with TypeScript support
 * Provides both React Query hooks and direct async functions for GET and POST operations
 * 
 * Features:
 * - Type-safe HTTP requests with generics
 * - React Query integration for caching and state management
 * - Consistent error handling across all requests
 * - Automatic request/response logging for debugging
 * - CORS-friendly configuration
 * 
 * @author Auto-generated
 * @version 1.0.0
 */

import { env } from "../env";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Configure axios defaults for CORS and development environments
axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';

/**
 * Base URL for all API requests
 * Configured from environment variables
 */
const BASE_URL = env.API_BASE_URL;

/* ================================================================================================
 * GET REQUEST METHODS
 * ================================================================================================ */

/**
 * React Query hook for GET requests with automatic caching and state management
 * 
 * @template T - The expected response data type
 * @param {string} url - The API endpoint (relative to BASE_URL)
 * @param {string} identifier - Unique identifier for query key and logging
 * @returns {Object} Query result with data, loading states, and error handling
 * 
 * @example
 * ```typescript
 * // Get users with type safety
 * const usersData = getData<User[]>('/api/users', 'users');
 * 
 * // Get specific ticket
 * const ticketData = getData<Ticket>('/api/tickets/123', 'ticket-123');
 * ```
 */
export const getData = <T = any>(url: string, identifier: string) => {
  const { data = { data: [], totalCount: 0 } } = useQuery({
    queryKey: [
      identifier,
      { url }
    ],
    queryFn: () => fetchData<T>(url, identifier),
  });

  return data || { data: [] };
};

/**
 * Generic async function for GET requests without React Query
 * Use this for one-off requests or in non-React contexts
 * 
 * @template T - The expected response data type
 * @param {string} url - The API endpoint (relative to BASE_URL)
 * @param {string} identifier - Unique identifier for logging and error messages
 * @returns {Promise<{data: T}>} Promise resolving to response data wrapped in data property
 * 
 * @throws {Error} Throws descriptive error messages for network, CORS, and API errors
 * 
 * @example
 * ```typescript
 * // Fetch users directly
 * const users = await fetchData<User[]>('/api/users', 'users');
 * console.log(users.data); // User[]
 * 
 * // Fetch with error handling
 * try {
 *   const result = await fetchData<CustomType>('/api/custom', 'customData');
 *   // Handle success
 * } catch (error) {
 *   // Handle error - will have descriptive message
 * }
 * ```
 */
export const fetchData = async <T = any>(url: string, identifier: string): Promise<{ data: T; }> => {
  try {
    // Construct full URL by combining base URL with endpoint
    let fullUrl = `${BASE_URL}${url}`;

    // Make GET request
    const response = await axios.get(fullUrl);
    
    // Log response for debugging (can be removed in production)
    console.log(`Fetch ${identifier} response:`, response);
    
    const data = response.data;
    return { data: data ?? [] };
  } catch (error) {
    // Use centralized error handling
    return handleApiError(error, `fetch ${identifier}`);
  }
};

/* ================================================================================================
 * POST REQUEST METHODS
 * ================================================================================================ */

/**
 * Generic async function for POST requests
 * Use this for creating, updating, or sending data to the server
 * 
 * @template TRequest - The type of the request payload being sent
 * @template TResponse - The expected response data type from server
 * @param {string} url - The API endpoint (relative to BASE_URL)
 * @param {TRequest} payload - The data to send in the request body
 * @param {string} identifier - Unique identifier for logging and error messages
 * @returns {Promise<{data: TResponse}>} Promise resolving to response data wrapped in data property
 * 
 * @throws {Error} Throws descriptive error messages for network, CORS, validation, and API errors
 * 
 * @example
 * ```typescript
 * // Create a new user
 * interface CreateUserRequest {
 *   name: string;
 *   email: string;
 * }
 * 
 * const newUser = await postData<CreateUserRequest, User>(
 *   '/api/users',
 *   { name: 'John Doe', email: 'john@example.com' },
 *   'createUser'
 * );
 * 
 * // Update existing record
 * const updatedTicket = await postData<UpdateTicketRequest, Ticket>(
 *   '/api/tickets/123',
 *   ticketUpdateData,
 *   'updateTicket'
 * );
 * 
 * // Handle errors
 * try {
 *   const result = await postData('/api/submit', formData, 'submitForm');
 *   // Handle success
 * } catch (error) {
 *   // Error will have descriptive message including validation errors
 * }
 * ```
 */
export const postData = async <TRequest = any, TResponse = any>(
  url: string, 
  payload: TRequest, 
  identifier: string
): Promise<{ data: TResponse }> => {
  try {
    // Construct full URL by combining base URL with endpoint
    let fullUrl = `${BASE_URL}${url}`;

    // Make POST request with payload
    const response = await axios.post(fullUrl, payload);
    
    // Log response for debugging (can be removed in production)
    console.log(`Post ${identifier} response:`, response);
    
    const data = response.data;
    return { data: data };
  } catch (error) {
    // Use centralized error handling
    return handleApiError(error, `post ${identifier}`);
  }
};

/* ================================================================================================
 * ERROR HANDLING
 * ================================================================================================ */

/**
 * Centralized error handling for all API requests
 * Converts various error types into user-friendly error messages
 * 
 * @param {unknown} error - The error object from axios or other sources
 * @param {string} operation - Description of the operation that failed (e.g., "fetch users", "create ticket")
 * @throws {Error} Always throws an Error with a descriptive message
 * 
 * Error handling priorities:
 * 1. Network/CORS errors - Provides setup guidance
 * 2. Server response errors - Extracts meaningful messages from response
 * 3. Generic axios errors - Uses error.message
 * 4. Unknown errors - Fallback message
 * 
 * Common error message formats extracted:
 * - Plain string responses
 * - { message: "..." }
 * - { error: "..." }
 * - { title: "..." }
 * - { detail: "..." }
 * - JSON stringified for complex objects
 * - HTTP status codes as fallback
 * 
 * @example
 * ```typescript
 * try {
 *   // API call
 * } catch (error) {
 *   handleApiError(error, 'fetch user data');
 *   // Will throw with message like:
 *   // "Failed to fetch user data: User not found"
 *   // "Connection failed: Please check if the API server is running..."
 * }
 * ```
 */
const handleApiError = (error: unknown, operation: string): never => {
  // Handle axios-specific errors
  if (axios.isAxiosError(error)) {
    // Network connectivity issues
    if (error.code === 'ERR_NETWORK' || (error.message && error.message.includes('CORS'))) {
      throw new Error(`Connection failed: Please check if the API server is running and CORS is configured. Unable to ${operation}.`);
    }
    
    let serverMessage = 'Unknown server error';
    
    // Extract meaningful error message from server response
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle different response data formats
      if (typeof data === 'string') {
        serverMessage = data;
      } else if ((data as any).message) {
        serverMessage = (data as any).message;
      } else if ((data as any).error) {
        serverMessage = (data as any).error;
      } else if ((data as any).title) {
        serverMessage = (data as any).title;
      } else if ((data as any).detail) {
        serverMessage = (data as any).detail;
      } else {
        // Fallback: stringify complex objects or use status text
        try { 
          serverMessage = JSON.stringify(data); 
        } catch { 
          serverMessage = `Server returned ${error.response.status} ${error.response.statusText}`; 
        }
      }
    } else if (error.message) {
      // Use axios error message if no response data
      serverMessage = error.message;
    }
    
    throw new Error(`Failed to ${operation}: ${serverMessage}`);
  }
  
  // Handle generic JavaScript errors
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`);
  }
  
  // Handle completely unknown error types
  throw new Error(`Failed to ${operation}: Unknown error occurred`);
};

