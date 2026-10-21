/**
 * Environment Configuration
 * Centralized access to environment variables with type safety and defaults
 */

export const env = {
  // Application
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Gems Ore Admin Dashboard',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
  
  // Environment checks
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || '',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  
  // Currency
  USD_TO_NGN_RATE: Number(import.meta.env.VITE_USD_TO_NGN_RATE) || 1500,
  
  // Feature Flags
  ENABLE_CRYPTO_PAYMENTS: import.meta.env.VITE_ENABLE_CRYPTO_PAYMENTS === 'true' || true,
  ENABLE_CUSTOM_REQUESTS: import.meta.env.VITE_ENABLE_CUSTOM_REQUESTS === 'true' || true,
  ENABLE_REVIEWS: import.meta.env.VITE_ENABLE_REVIEWS === 'true' || true,
  
  // Payment
  PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  
  // Security
  SESSION_TIMEOUT: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000, // 1 hour
  
  // Analytics
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID || '',
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  
  // Development
  ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || import.meta.env.DEV,
  LOG_LEVEL: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 
    (import.meta.env.DEV ? 'debug' : 'error'),
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Add any required environment variable checks here
  // Example:
  // if (!env.API_URL && env.isProduction) {
  //   errors.push('VITE_API_URL is required in production');
  // }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate on load in development
if (env.isDevelopment) {
  const validation = validateEnv();
  if (!validation.isValid) {
    console.warn('Environment validation warnings:', validation.errors);
  }
}
