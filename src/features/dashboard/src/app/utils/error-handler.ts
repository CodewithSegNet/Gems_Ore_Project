/**
 * Error Handling Utilities
 * Centralized error handling and user-friendly error messages
 */

import { logger } from './logger';
import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred', context?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', 0, context);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: Record<string, unknown>) {
    super(message, 'NOT_FOUND', 404, context);
    this.name = 'NotFoundError';
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Handle error with logging and user notification
 */
export function handleError(
  error: unknown,
  options: {
    silent?: boolean;
    showToast?: boolean;
    context?: string;
    fallbackMessage?: string;
  } = {}
): void {
  const {
    silent = false,
    showToast = true,
    context = 'Application',
    fallbackMessage = 'An error occurred',
  } = options;

  const errorMessage = getErrorMessage(error);

  // Log the error
  if (!silent) {
    logger.error(`${context}: ${errorMessage}`, error);
  }

  // Show toast notification
  if (showToast) {
    toast.error(errorMessage || fallbackMessage);
  }
}

/**
 * Handle async operations with error handling
 */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  options: {
    context?: string;
    onError?: (error: unknown) => void;
    showToast?: boolean;
    fallbackMessage?: string;
  } = {}
): Promise<{ data: T | null; error: unknown | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    handleError(error, {
      context: options.context,
      showToast: options.showToast,
      fallbackMessage: options.fallbackMessage,
    });

    if (options.onError) {
      options.onError(error);
    }

    return { data: null, error };
  }
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields }
    );
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.warn('Failed to parse JSON', { json, error });
    return fallback;
  }
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        logger.warn(`Operation failed, retrying... (${attempt + 1}/${maxRetries})`, { error });
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Assert condition with custom error
 */
export function assert(
  condition: boolean,
  message: string,
  ErrorClass: typeof AppError = AppError
): asserts condition {
  if (!condition) {
    throw new ErrorClass(message);
  }
}

/**
 * Type guard to check if error is of specific type
 */
export function isErrorType<T extends Error>(
  error: unknown,
  errorClass: new (...args: any[]) => T
): error is T {
  return error instanceof errorClass;
}

/**
 * Extract error stack trace for debugging
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Create a safe error object for logging/reporting
 */
export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof AppError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      stack: getErrorStack(error),
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: getErrorStack(error),
    };
  }

  return {
    error: String(error),
  };
}
