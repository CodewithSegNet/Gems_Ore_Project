/**
 * Validation Utility Functions
 * Provides reusable validation logic for forms and data
 */

import { VALIDATION } from '../config/constants';

/**
 * Validate email address
 */
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!VALIDATION.email.pattern.test(email)) {
    return { isValid: false, message: VALIDATION.email.message };
  }
  
  return { isValid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): { isValid: boolean; message?: string } {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  if (!VALIDATION.phone.pattern.test(phone)) {
    return { isValid: false, message: VALIDATION.phone.message };
  }
  
  return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < VALIDATION.password.minLength) {
    return { isValid: false, message: VALIDATION.password.message };
  }
  
  return { isValid: true };
}

/**
 * Validate price
 */
export function validatePrice(price: number | string): { isValid: boolean; message?: string } {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return { isValid: false, message: 'Please enter a valid price' };
  }
  
  if (numPrice < VALIDATION.price.min) {
    return { isValid: false, message: VALIDATION.price.message };
  }
  
  return { isValid: true };
}

/**
 * Validate stock quantity
 */
export function validateStock(stock: number | string): { isValid: boolean; message?: string } {
  const numStock = typeof stock === 'string' ? parseInt(stock, 10) : stock;
  
  if (isNaN(numStock)) {
    return { isValid: false, message: 'Please enter a valid stock quantity' };
  }
  
  if (numStock < VALIDATION.stock.min) {
    return { isValid: false, message: VALIDATION.stock.message };
  }
  
  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: unknown, fieldName: string = 'This field'): { isValid: boolean; message?: string } {
  if (value === null || value === undefined) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  return { isValid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number): { isValid: boolean; message?: string } {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    return { 
      isValid: false, 
      message: `File size must be less than ${maxSizeMB}MB` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate file type
 */
export function validateFileType(file: File, acceptedTypes: string[]): { isValid: boolean; message?: string } {
  if (!acceptedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: `File type must be one of: ${acceptedTypes.join(', ')}` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate URL
 */
export function validateURL(url: string): { isValid: boolean; message?: string } {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date | string,
  endDate: Date | string
): { isValid: boolean; message?: string } {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (start > end) {
    return { isValid: false, message: 'End date must be after start date' };
  }
  
  return { isValid: true };
}

/**
 * Validate discount value
 */
export function validateDiscount(
  value: number,
  type: 'percentage' | 'fixed'
): { isValid: boolean; message?: string } {
  if (isNaN(value) || value < 0) {
    return { isValid: false, message: 'Discount value must be a positive number' };
  }
  
  if (type === 'percentage' && value > 100) {
    return { isValid: false, message: 'Percentage discount cannot exceed 100%' };
  }
  
  return { isValid: true };
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize HTML input
 */
export function validateAndSanitizeHTML(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}
