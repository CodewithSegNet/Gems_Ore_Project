/**
 * Centralized TypeScript Type Definitions
 * All application types and interfaces
 */

// ==================== Common Types ====================

export type Currency = 'NGN' | 'USD';

export type PaymentMethod = 'BTC' | 'USDT' | 'Paystack';

export type OrderStatus = 
  | 'awaiting_payment' 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'cancelled';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type ProductStatus = 'active' | 'inactive';

export type Gender = 'male' | 'female';

export type DiscountType = 'new_customer' | 'order_amount' | 'general' | 'product';

export type ValueType = 'percentage' | 'fixed';

export type CustomRequestStatus = 'Pending' | 'Contacted' | 'Completed';

export type USDTNetwork = 'ERC-20' | 'BEP-20' | 'TRC-20';

// ==================== Entity Interfaces ====================

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string; // Primary image for backward compatibility
  images?: string[]; // Multiple product images (up to 4)
  gender: Gender;
  status: ProductStatus;
  createdAt: string;
  isBestSeller?: boolean; // Featured in Best Sellers section
  isNewCollection?: boolean; // Featured in Newest Collections section
  description?: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  cryptoAmount?: number; // Amount in BTC or USDT
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentProof?: string; // Screenshot URL for crypto payments
  paymentApproved?: boolean; // Admin approval status
  cancellationReason?: string; // Reason for cancellation
  items: number;
  date: string;
  products?: OrderProduct[];
}

export interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Review {
  id: string;
  product: string;
  customer: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  date: string;
  images?: string[];
}

export interface Discount {
  id: string;
  name: string; // Friendly name
  discountType: DiscountType;
  code?: string; // Coupon code for general discounts
  type: ValueType; // Percentage or fixed amount
  value: number; // Discount value
  minPurchase?: number; // Minimum purchase requirement
  orderMinAmount?: number; // For order_amount type
  productId?: string; // For product-specific discounts
  productGender?: Gender; // Gender category for product discounts
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  usageLimit?: number;
  usageCount?: number;
}

export interface CustomRequest {
  id: string;
  customer: string;
  email: string;
  phone: string;
  description: string;
  budgetRange: string;
  status: CustomRequestStatus;
  date: string;
  notes?: string;
  imageUrl?: string;
}

export interface Settings {
  vat: {
    enabled: boolean;
    rate: number; // Percentage
  };
  payment: {
    btc: {
      address: string;
    };
    usdt: {
      'ERC-20': string;
      'BEP-20': string;
      'TRC-20': string;
    };
  };
  currency: {
    default: Currency;
    usdToNgnRate: number;
  };
  notifications: {
    email: string;
    orderAlerts: boolean;
    reviewAlerts: boolean;
    customRequestAlerts: boolean;
  };
}

// ==================== Form Types ====================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  price: number;
  stock: number;
  gender: Gender;
  status: ProductStatus;
  images: string[];
  isBestSeller?: boolean;
  isNewCollection?: boolean;
  description?: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

export interface DiscountFormData extends Omit<Discount, 'id'> {
  // Additional form-specific fields if needed
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// ==================== State Types ====================

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  pendingReviews: number;
  pendingCustomRequests: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

// ==================== Component Props Types ====================

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

// ==================== Utility Types ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// ==================== Event Types ====================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface FilterConfig {
  [key: string]: string | string[] | number | boolean;
}

// ==================== Storage Types ====================

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

// ==================== Hook Return Types ====================

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

export interface UseCurrencyReturn {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number, from: Currency, to: Currency) => number;
}
