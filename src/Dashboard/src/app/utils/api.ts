/**
 * API Client
 * Template for backend API integration
 * Currently uses mock data - replace with real API calls in production
 */

import { API_CONFIG, ERROR_MESSAGES } from '../config/constants';
import { getStorageItem } from './storage';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Custom API Error class
 */
export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Get authentication token
 */
function getAuthToken(): string | null {
  try {
    const authState = getStorageItem<{ token?: string }>('isAuthenticated', {});
    return authState.token || null;
  } catch {
    return null;
  }
}

/**
 * API Request wrapper with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiClientError(
        errorData.message || ERROR_MESSAGES.generic,
        response.status,
        errorData.code
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiClientError('Request timeout', 408);
      }
      
      throw new ApiClientError(
        ERROR_MESSAGES.network,
        0
      );
    }

    throw new ApiClientError(ERROR_MESSAGES.generic, 0);
  }
}

/**
 * API Methods - Template for backend integration
 * Replace these with actual API calls in production
 */

export const api = {
  // Products
  products: {
    getAll: async () => {
      // TODO: Replace with actual API call
      // return apiRequest<Product[]>('/products');
      throw new Error('Not implemented - using mock data');
    },
    
    getById: async (id: string) => {
      // TODO: Replace with actual API call
      // return apiRequest<Product>(`/products/${id}`);
      throw new Error('Not implemented - using mock data');
    },
    
    create: async (data: unknown) => {
      // TODO: Replace with actual API call
      // return apiRequest<Product>('/products', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      // });
      throw new Error('Not implemented - using mock data');
    },
    
    update: async (id: string, data: unknown) => {
      // TODO: Replace with actual API call
      // return apiRequest<Product>(`/products/${id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(data),
      // });
      throw new Error('Not implemented - using mock data');
    },
    
    delete: async (id: string) => {
      // TODO: Replace with actual API call
      // return apiRequest<void>(`/products/${id}`, {
      //   method: 'DELETE',
      // });
      throw new Error('Not implemented - using mock data');
    },
  },

  // Orders
  orders: {
    getAll: async () => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    getById: async (id: string) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    updateStatus: async (id: string, status: string) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    approvePayment: async (id: string) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
  },

  // Categories
  categories: {
    getAll: async () => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    create: async (data: unknown) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    update: async (id: string, data: unknown) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    delete: async (id: string) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
  },

  // Reviews
  reviews: {
    getAll: async () => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    updateStatus: async (id: string, status: string) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
  },

  // Discounts
  discounts: {
    getAll: async () => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    create: async (data: unknown) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    update: async (id: string, data: unknown) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    delete: async (id: string) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
  },

  // Custom Requests
  customRequests: {
    getAll: async () => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    updateStatus: async (id: string, status: string) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
  },

  // Settings
  settings: {
    get: async () => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    update: async (data: unknown) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
  },

  // File Upload
  upload: {
    image: async (file: File) => {
      // TODO: Replace with actual API call
      // const formData = new FormData();
      // formData.append('file', file);
      // return apiRequest<{ url: string }>('/upload/image', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {}, // Let browser set Content-Type for FormData
      // });
      throw new Error('Not implemented - using mock data');
    },
  },

  // Analytics
  analytics: {
    getDashboardStats: async () => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
    
    getReports: async (startDate: string, endDate: string) => {
      // TODO: Replace with actual API call
      throw new Error('Not implemented - using mock data');
    },
  },
};

/**
 * Helper function to handle API errors in components
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
      return ERROR_MESSAGES.unauthorized;
    }
    
    if (error.status === 404) {
      return ERROR_MESSAGES.notFound;
    }
    
    if (error.status === 0) {
      return ERROR_MESSAGES.network;
    }
    
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return ERROR_MESSAGES.generic;
}

/**
 * Type guards for API responses
 */
export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof (response as ApiResponse<T>).success === 'boolean'
  );
}
