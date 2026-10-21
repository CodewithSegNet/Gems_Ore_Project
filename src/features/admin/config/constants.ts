/**
 * Application Constants
 * Centralized configuration for the Gems Ore Admin Dashboard
 */

// Application Info
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Gems Ore Admin',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
} as const;

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
} as const;

// Currency Configuration
export const CURRENCY_CONFIG = {
  default: (import.meta.env.VITE_DEFAULT_CURRENCY || 'NGN') as 'NGN' | 'USD',
  usdToNgnRate: parseFloat(import.meta.env.VITE_USD_TO_NGN_RATE || '1500'),
  symbols: {
    NGN: '₦',
    USD: '$',
  },
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000', 10), // 1 hour default
  storageKey: 'isAuthenticated',
  // Demo credentials - REPLACE WITH BACKEND AUTH IN PRODUCTION
  demo: {
    email: 'admin@gemsore.com',
    password: 'admin123',
  },
} as const;

// Feature Flags
export const FEATURES = {
  cryptoPayments: import.meta.env.VITE_ENABLE_CRYPTO_PAYMENTS === 'true',
  multiCurrency: import.meta.env.VITE_ENABLE_MULTI_CURRENCY === 'true',
  customRequests: import.meta.env.VITE_ENABLE_CUSTOM_REQUESTS === 'true',
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  mockData: import.meta.env.VITE_MOCK_DATA_ENABLED !== 'false', // Default to true
} as const;

// Payment Configuration
export const PAYMENT_CONFIG = {
  paystack: {
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  },
  crypto: {
    btc: {
      address: import.meta.env.VITE_BTC_WALLET_ADDRESS || '',
    },
    usdt: {
      erc20: import.meta.env.VITE_USDT_ERC20_ADDRESS || '',
      bep20: import.meta.env.VITE_USDT_BEP20_ADDRESS || '',
      trc20: import.meta.env.VITE_USDT_TRC20_ADDRESS || '',
    },
  },
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  auth: 'isAuthenticated',
  currency: 'selectedCurrency',
  products: 'gemsore_products',
  categories: 'gemsore_categories',
  orders: 'gemsore_orders',
  discounts: 'gemsore_discounts',
  reviews: 'gemsore_reviews',
  customRequests: 'gemsore_custom_requests',
  settings: 'gemsore_settings',
} as const;

// Pagination Configuration
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxImages: 4,
  acceptedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  acceptedImageExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// Order Status Configuration
export const ORDER_STATUS = {
  awaitingPayment: 'awaiting_payment',
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS = {
  awaiting_payment: 'Awaiting Payment',
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export const ORDER_STATUS_COLORS = {
  awaiting_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  btc: 'BTC',
  usdt: 'USDT',
  paystack: 'Paystack',
} as const;

// Review Status
export const REVIEW_STATUS = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
} as const;

// Discount Types
export const DISCOUNT_TYPES = {
  newCustomer: 'new_customer',
  orderAmount: 'order_amount',
  general: 'general',
  product: 'product',
} as const;

// Product Gender
export const PRODUCT_GENDER = {
  male: 'male',
  female: 'female',
} as const;

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  full: 'MMMM dd, yyyy',
  short: 'MM/dd/yyyy',
  iso: 'yyyy-MM-dd',
} as const;

// Validation Rules
export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^(\+\d{1,3}[- ]?)?\d{10,14}$/,
    message: 'Please enter a valid phone number',
  },
  password: {
    minLength: 8,
    message: 'Password must be at least 8 characters long',
  },
  price: {
    min: 0,
    message: 'Price must be a positive number',
  },
  stock: {
    min: 0,
    message: 'Stock must be a non-negative number',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'An error occurred. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  sessionExpired: 'Your session has expired. Please log in again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  created: 'Created successfully',
  updated: 'Updated successfully',
  deleted: 'Deleted successfully',
  saved: 'Saved successfully',
} as const;
