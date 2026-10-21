/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

import { logger } from './logger';
import { env } from '../config/env';

class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = env.isDevelopment || env.ENABLE_DEV_TOOLS;
  }

  /**
   * Start a performance measurement
   */
  start(label: string): void {
    if (!this.enabled) return;
    this.marks.set(label, performance.now());
  }

  /**
   * End a performance measurement and log the duration
   */
  end(label: string): number | null {
    if (!this.enabled) return null;

    const startTime = this.marks.get(label);
    if (!startTime) {
      logger.warn(`Performance mark "${label}" not found`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    logger.performance(label, duration);

    // Warn if operation took too long
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${label}`, { duration: `${duration}ms` });
    }

    return duration;
  }

  /**
   * Measure a synchronous operation
   */
  measure<T>(label: string, operation: () => T): T {
    if (!this.enabled) return operation();

    this.start(label);
    try {
      return operation();
    } finally {
      this.end(label);
    }
  }

  /**
   * Measure an async operation
   */
  async measureAsync<T>(label: string, operation: () => Promise<T>): Promise<T> {
    if (!this.enabled) return operation();

    this.start(label);
    try {
      return await operation();
    } finally {
      this.end(label);
    }
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage(): { used: number; total: number; percentage: number } | null {
    if (!this.enabled || !(performance as any).memory) return null;

    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
    };
  }

  /**
   * Log memory usage
   */
  logMemoryUsage(): void {
    const memory = this.getMemoryUsage();
    if (memory) {
      logger.debug('Memory Usage', memory);
    }
  }

  /**
   * Measure component render time
   */
  measureRender(componentName: string): { onMount: () => void; onUnmount: () => void } {
    const mountLabel = `${componentName} Mount`;
    const renderLabel = `${componentName} Render`;

    return {
      onMount: () => {
        this.start(mountLabel);
      },
      onUnmount: () => {
        this.end(mountLabel);
      },
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React component performance HOC
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const name = componentName || Component.displayName || Component.name || 'Component';

  return (props: P) => {
    const { onMount, onUnmount } = performanceMonitor.measureRender(name);

    React.useEffect(() => {
      onMount();
      return onUnmount;
    }, []);

    return React.createElement(Component, props);
  };
}

/**
 * Hook to measure effect performance
 */
export function usePerformanceEffect(
  label: string,
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  React.useEffect(() => {
    performanceMonitor.start(label);
    const cleanup = effect();
    performanceMonitor.end(label);
    return cleanup;
  }, deps);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        imgElement.src = src;
        observer.unobserve(imgElement);
      }
    });
  }, options);

  observer.observe(imgElement);

  // Return cleanup function
  return () => observer.disconnect();
}

/**
 * Get Web Vitals metrics
 */
export function reportWebVitals(onPerfEntry?: (metric: any) => void): void {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(() => {
      // web-vitals not installed, skip
    });
  }
}

/**
 * Log page load performance
 */
export function logPageLoadPerformance(): void {
  if (typeof window === 'undefined' || !window.performance) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        const metrics = {
          dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
          tcp: Math.round(navigation.connectEnd - navigation.connectStart),
          request: Math.round(navigation.responseStart - navigation.requestStart),
          response: Math.round(navigation.responseEnd - navigation.responseStart),
          domProcessing: Math.round(navigation.domComplete - navigation.domLoading),
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          total: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        };

        logger.info('Page Load Performance', metrics);
      }
    }, 0);
  });
}

// Initialize page load performance logging
if (env.isDevelopment) {
  logPageLoadPerformance();
}
