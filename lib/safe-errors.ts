/**
 * Sanitizes error messages to prevent exposing sensitive information
 * Maps technical errors to user-friendly messages
 */

const SAFE_ERROR_MESSAGES: Record<string, string> = {
  // Network & Connection Errors
  'ECONNREFUSED': 'Service temporarily unavailable. Please try again.',
  'ETIMEDOUT': 'Request timed out. Please try again.',
  'ENOTFOUND': 'Service connection failed. Please try again.',
  'ECONNRESET': 'Connection lost. Please try again.',

  // Database Errors
  'MongoServerError': 'Database error occurred. Please try again.',
  'MongoNetworkError': 'Database connection failed. Please try again.',
  'MongooseError': 'Database operation failed. Please try again.',
  'mongodb': 'Database error occurred. Please try again.',

  // OpenAI Errors
  'OpenAI': 'AI service error. Please try again.',
  'insufficient_quota': 'AI service quota exceeded. Please contact support.',
  'rate_limit_exceeded': 'Too many requests. Please try again in a moment.',
  'Invalid API key': 'Service configuration error. Please contact support.',

  // File System Errors
  'ENOENT': 'Resource not found.',
  'EACCES': 'Permission denied.',
  'EPERM': 'Operation not permitted.',

  // Validation Errors
  'ValidationError': 'Invalid input provided.',
  'Invalid URL': 'Invalid URL provided.',

  // Payment Errors
  'Payment': 'Payment processing error. Please try again.',
  'insufficient funds': 'Insufficient funds. Please add USDC to your wallet.',

  // Workflow Errors
  'Workflow': 'Analysis workflow error. Please try again.',
  'timeout': 'Request timed out. Please try again.',
};

export function getSafeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMessage = error.message;

  // Check for known error patterns
  for (const [pattern, safeMessage] of Object.entries(SAFE_ERROR_MESSAGES)) {
    if (errorMessage.includes(pattern)) {
      return safeMessage;
    }
  }

  // Check for specific error types by name
  if (error.name in SAFE_ERROR_MESSAGES) {
    return SAFE_ERROR_MESSAGES[error.name];
  }

  // Default safe message
  return 'An error occurred. Please try again.';
}

/**
 * Logs full error details server-side while returning safe message to client
 */
export function logAndSanitizeError(error: unknown, context: string): string {
  // Log full error details server-side for debugging
  console.error(`[${context}] Full error:`, error);

  if (error instanceof Error) {
    console.error(`[${context}] Error name:`, error.name);
    console.error(`[${context}] Error message:`, error.message);
    if (error.stack) {
      console.error(`[${context}] Stack trace:`, error.stack);
    }
  }

  // Return sanitized message
  return getSafeErrorMessage(error);
}
