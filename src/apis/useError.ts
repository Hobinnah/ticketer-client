import axios from "axios";

/**
 * General error handler for API operations
 * @param error - The error object to handle
 * @param operation - Description of the operation that failed
 * @returns Never returns, always throws an error
 */
export const handleApiError = (error: unknown, operation: string): never => {
  if (axios.isAxiosError(error)) {
    // Handle network and CORS errors
    if (error.code === 'ERR_NETWORK' || (error.message && error.message.includes('CORS'))) {
      throw new Error(`Connection failed: Please check if the API server is running and CORS is configured. Unable to ${operation}.`);
    }
    
    let serverMessage = 'Unknown server error';
    
    // Extract error message from response
    if (error.response?.data) {
      const data = error.response.data;
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
        try {
          serverMessage = JSON.stringify(data);
        } catch {
          serverMessage = `Server returned ${error.response.status} ${error.response.statusText}`;
        }
      }
    } else if (error.message) {
      serverMessage = error.message;
    }
    
    const fullErrorMessage = `Failed to ${operation}: ${serverMessage}`;
    
    // If error message is too long, show simplified error with code
    if (fullErrorMessage.length > 200) {
      const errorCode = error.response?.status || error.code || 'UNKNOWN';
      throw new Error(`An error occurred with the error code: ${errorCode}`);
    }
    
    throw new Error(fullErrorMessage);
  }
  
  // Handle generic Error objects
  if (error instanceof Error) {
    const fullErrorMessage = `Failed to ${operation}: ${error.message}`;
    if (fullErrorMessage.length > 200) {
      throw new Error(`An error occurred with the error code: GENERIC_ERROR`);
    }
    throw new Error(fullErrorMessage);
  }
  
  // Handle unknown errors
  throw new Error(`Failed to ${operation}: Unknown error occurred`);
};

/**
 * Type definition for API error response
 */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  title?: string;
  detail?: string;
  statusCode?: number;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public readonly statusCode?: number;
  public readonly errorCode?: string;
  public readonly operation: string;

  constructor(message: string, statusCode?: number, errorCode?: string, operation?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.operation = operation || 'unknown operation';
  }
}