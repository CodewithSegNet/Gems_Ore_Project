/**
 * Authentication Utility Functions
 * Handles authentication logic and session management
 */

import { AUTH_CONFIG, STORAGE_KEYS } from '../config/constants';
import { setStorageItem, getStorageItem, removeStorageItem } from './storage';

export interface AuthState {
  isAuthenticated: boolean;
  sessionStartTime?: number;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const authState = getStorageItem<AuthState>(STORAGE_KEYS.auth, {
    isAuthenticated: false,
  });

  if (!authState.isAuthenticated) {
    return false;
  }

  // Check session timeout
  if (authState.sessionStartTime) {
    const now = Date.now();
    const elapsed = now - authState.sessionStartTime;

    if (elapsed > AUTH_CONFIG.sessionTimeout) {
      // Session expired
      logout();
      return false;
    }
  }

  return true;
}

/**
 * Login user
 */
export function login(email: string, password: string): { success: boolean; message?: string } {
  // Demo authentication - REPLACE WITH REAL API CALL IN PRODUCTION
  if (email === AUTH_CONFIG.demo.email && password === AUTH_CONFIG.demo.password) {
    const authState: AuthState = {
      isAuthenticated: true,
      sessionStartTime: Date.now(),
    };

    setStorageItem(STORAGE_KEYS.auth, authState);
    
    return { success: true };
  }

  return { 
    success: false, 
    message: 'Invalid credentials. Please use the demo credentials.' 
  };
}

/**
 * Logout user
 */
export function logout(): void {
  removeStorageItem(STORAGE_KEYS.auth);
  
  // Dispatch event for other components to react
  window.dispatchEvent(new CustomEvent('auth-change', { detail: { isAuthenticated: false } }));
}

/**
 * Refresh session (extend session timeout)
 */
export function refreshSession(): void {
  const authState = getStorageItem<AuthState>(STORAGE_KEYS.auth, {
    isAuthenticated: false,
  });

  if (authState.isAuthenticated) {
    authState.sessionStartTime = Date.now();
    setStorageItem(STORAGE_KEYS.auth, authState);
  }
}

/**
 * Get session remaining time in milliseconds
 */
export function getSessionRemainingTime(): number {
  const authState = getStorageItem<AuthState>(STORAGE_KEYS.auth, {
    isAuthenticated: false,
  });

  if (!authState.isAuthenticated || !authState.sessionStartTime) {
    return 0;
  }

  const now = Date.now();
  const elapsed = now - authState.sessionStartTime;
  const remaining = AUTH_CONFIG.sessionTimeout - elapsed;

  return Math.max(0, remaining);
}

/**
 * Check if session is about to expire (within 5 minutes)
 */
export function isSessionExpiringSoon(): boolean {
  const remaining = getSessionRemainingTime();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  return remaining > 0 && remaining < fiveMinutes;
}
