import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

/**
 * Custom hook for managing localStorage with React state
 * Provides automatic synchronization and type safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getStorageItem(key, initialValue);
  });

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        setStorageItem(key, valueToStore);

        // Dispatch custom event to sync across tabs/components
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, value: valueToStore },
          })
        );
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }
    },
    [key, storedValue]
  );

  // Remove item from storage
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      window.dispatchEvent(
        new CustomEvent('local-storage', {
          detail: { key, value: null },
        })
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error removing localStorage key "${key}":`, error);
      }
    }
  }, [key, initialValue]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        // Native storage event (from other tabs)
        if (e.key === key && e.newValue !== null) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('Error parsing storage event:', error);
            }
          }
        }
      } else {
        // Custom event (from same tab)
        const detail = (e as CustomEvent).detail;
        if (detail.key === key) {
          setStoredValue(detail.value ?? initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for session storage (similar to useLocalStorage but for sessionStorage)
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error reading sessionStorage key "${key}":`, error);
      }
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`Error setting sessionStorage key "${key}":`, error);
        }
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error removing sessionStorage key "${key}":`, error);
      }
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
