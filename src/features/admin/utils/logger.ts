/**
 * Production-safe Logger
 * Provides structured logging with different levels and production safeguards
 */

import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.level = env.LOG_LEVEL;
    this.isDevelopment = env.isDevelopment;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug') && this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
        } : error,
      };
      
      console.error(this.formatMessage('error', message, errorContext));
      
      // In production, you would send this to an error tracking service
      // Example: Sentry.captureException(error);
      this.sendToErrorTracking(message, error, errorContext);
    }
  }

  private sendToErrorTracking(message: string, error: Error | unknown, context: LogContext): void {
    // Only send to error tracking in production
    if (!this.isDevelopment && env.SENTRY_DSN) {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
      // Example:
      // Sentry.captureException(error, {
      //   extra: { message, ...context }
      // });
    }
  }

  /**
   * Log API errors with structured information
   */
  apiError(endpoint: string, error: Error | unknown, context?: LogContext): void {
    this.error(`API Error: ${endpoint}`, error, {
      endpoint,
      ...context,
    });
  }

  /**
   * Log user actions for analytics
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, context);
    
    // In production, send to analytics service
    if (!this.isDevelopment && env.GA_TRACKING_ID) {
      // TODO: Send to analytics service
      // Example: gtag('event', action, context);
    }
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, duration: number, context?: LogContext): void {
    this.debug(`Performance: ${metric}`, {
      duration: `${duration}ms`,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Helper function to time async operations
 */
export async function timed<T>(
  label: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    logger.performance(label, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${label} failed`, error, { duration: `${duration}ms` });
    throw error;
  }
}

/**
 * Helper to create a scoped logger for a specific module
 */
export function createLogger(scope: string) {
  return {
    debug: (message: string, context?: LogContext) => 
      logger.debug(`[${scope}] ${message}`, context),
    info: (message: string, context?: LogContext) => 
      logger.info(`[${scope}] ${message}`, context),
    warn: (message: string, context?: LogContext) => 
      logger.warn(`[${scope}] ${message}`, context),
    error: (message: string, error?: Error | unknown, context?: LogContext) => 
      logger.error(`[${scope}] ${message}`, error, context),
  };
}
