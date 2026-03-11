/**
 * LocalStorage Utility Functions
 * Provides type-safe and error-handled localStorage operations
 */

import { STORAGE_KEYS } from '../config/constants';

/**
 * Safely get item from localStorage with JSON parsing
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error reading from localStorage (${key}):`, error);
    }
    return defaultValue;
  }
}

/**
 * Safely set item to localStorage with JSON stringification
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
    return false;
  }
}

/**
 * Clear all application data from localStorage
 */
export function clearAppStorage(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error clearing localStorage:', error);
    }
    return false;
  }
}

/**
 * Get storage size in bytes
 */
export function getStorageSize(): number {
  let total = 0;
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error calculating storage size:', error);
    }
  }
  return total;
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get item with expiry support
 */
export function getStorageItemWithExpiry<T>(key: string, defaultValue: T): T {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return defaultValue;
    }

    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    // Check if item has expiry and if it's expired
    if (item.expiry && now > item.expiry) {
      localStorage.removeItem(key);
      return defaultValue;
    }

    return item.value as T;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error reading from localStorage with expiry (${key}):`, error);
    }
    return defaultValue;
  }
}

/**
 * Set item with expiry (in milliseconds)
 */
export function setStorageItemWithExpiry<T>(
  key: string,
  value: T,
  ttl: number
): boolean {
  try {
    const now = new Date().getTime();
    const item = {
      value,
      expiry: now + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error writing to localStorage with expiry (${key}):`, error);
    }
    return false;
  }
}
