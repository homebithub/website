/**
 * API Error Handling Utilities
 * 
 * Centralized error handling for API calls with user-friendly messages.
 */

export interface ApiError {
  status?: number;
  message?: string;
  code?: string;
  data?: any;
  response?: Response;
}

/**
 * Handle API errors and return user-friendly error messages
 * @param error Error object from API call
 * @returns User-friendly error message
 */
export const handleApiError = (error: any): string => {
  console.error('[API Error]', error);
  
  // Network error (no response)
  if (!error.response && error.message === 'Failed to fetch') {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Error with custom message
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }
  
  // HTTP status code errors
  if (error.status || error.response?.status) {
    const status = error.status || error.response?.status;
    
    switch (status) {
      case 400:
        return error.data?.message || error.data?.error || 'Invalid request. Please check your input and try again.';
      
      case 401:
        // Session expired - will be handled by auth context
        return 'Your session has expired. Please log in again.';
      
      case 403:
        return error.data?.message || "You don't have permission to perform this action.";
      
      case 404:
        return error.data?.message || 'The requested resource was not found.';
      
      case 409:
        return error.data?.message || 'This action cannot be completed due to a conflict. Please try again.';
      
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      
      case 500:
        return 'Something went wrong on our end. Please try again later.';
      
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few moments.';
      
      default:
        return error.data?.message || 'An unexpected error occurred. Please try again.';
    }
  }
  
  // Generic error
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Parse error from fetch response
 * @param response Fetch response object
 * @returns Parsed error object
 */
export const parseErrorResponse = async (response: Response): Promise<ApiError> => {
  let data: any = null;
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }
  } catch (e) {
    console.error('Error parsing error response:', e);
  }
  
  return {
    status: response.status,
    message: data?.message || data?.error || response.statusText,
    code: data?.code,
    data,
    response,
  };
};

/**
 * Check if error is authentication error (401)
 * @param error Error object
 * @returns True if authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error?.status === 401 || error?.response?.status === 401;
};

/**
 * Check if error is validation error (400)
 * @param error Error object
 * @returns True if validation error
 */
export const isValidationError = (error: any): boolean => {
  return error?.status === 400 || error?.response?.status === 400;
};

/**
 * Check if error is permission error (403)
 * @param error Error object
 * @returns True if permission error
 */
export const isPermissionError = (error: any): boolean => {
  return error?.status === 403 || error?.response?.status === 403;
};

/**
 * Check if error is not found error (404)
 * @param error Error object
 * @returns True if not found error
 */
export const isNotFoundError = (error: any): boolean => {
  return error?.status === 404 || error?.response?.status === 404;
};

/**
 * Check if error is conflict error (409)
 * @param error Error object
 * @returns True if conflict error
 */
export const isConflictError = (error: any): boolean => {
  return error?.status === 409 || error?.response?.status === 409;
};

/**
 * Extract validation errors from API response
 * @param error Error object
 * @returns Object with field-specific error messages
 */
export const extractValidationErrors = (error: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (error?.data?.details) {
    // Handle structured validation errors
    if (Array.isArray(error.data.details)) {
      error.data.details.forEach((detail: any) => {
        if (detail.field && detail.message) {
          errors[detail.field] = detail.message;
        }
      });
    } else if (typeof error.data.details === 'object') {
      Object.entries(error.data.details).forEach(([field, message]) => {
        errors[field] = String(message);
      });
    }
  }
  
  return errors;
};
