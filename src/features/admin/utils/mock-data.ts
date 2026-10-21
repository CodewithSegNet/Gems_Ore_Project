// Mock data for the dashboard

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
  image: string; // Keep for backward compatibility
  images?: string[]; // Optional array for multiple images
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
  createdAt: string;
  isBestSeller?: boolean; // Show in Best Sellers section
  isNewCollection?: boolean; // Show in Newest Collections section
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  cryptoAmount?: number; // Amount in BTC or USDT for crypto payments
  status: 'awaiting_payment' | 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'BTC' | 'USDT' | 'Paystack';
  paymentProof?: string; // Screenshot for BTC/USDT payments
  paymentApproved?: boolean; // Admin approval for crypto payments
  cancellationReason?: string; // Reason for order cancellation
  items: number;
  date: string;
}

export interface Discount {
  id: string;
  name: string; // Friendly name for the discount
  discountType: 'new_customer' | 'order_amount' | 'general' | 'product';
  code?: string; // Only for general discounts
  type: 'percentage' | 'fixed'; // percentage or fixed amount
  value: number; // Discount value
  minPurchase?: number; // Minimum purchase amount (for general and order_amount)
  orderMinAmount?: number; // Minimum order amount to trigger (for order_amount type)
  productId?: string; // Product ID (for product discount)
  maxUses?: number; // Maximum uses (for general and new_customer)
  usedCount: number; // How many times used
  expiresAt?: string; // Expiry date
  status: 'active' | 'inactive';
  autoApply?: boolean; // Auto-apply without code (for new_customer, order_amount, product)
}

export interface Review {
  id: string;
  customer: string;
  email: string;
  product: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface CustomRequest {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  description?: string;
  status: 'pending' | 'contacted' | 'completed';
  submittedDate: string;
}

export const mockCategories: Category[] = [
  { id: '1', name: 'Rings', description: 'Beautiful diamond and gemstone rings', productCount: 24, createdAt: '2026-01-15' },
  { id: '2', name: 'Necklaces', description: 'Elegant necklaces for all occasions', productCount: 18, createdAt: '2026-01-16' },
  { id: '3', name: 'Earrings', description: 'Stunning earrings collection', productCount: 32, createdAt: '2026-01-17' },
  { id: '4', name: 'Bracelets', description: 'Luxury bracelets and bangles', productCount: 15, createdAt: '2026-01-18' },
  { id: '5', name: 'Pendants', description: 'Decorative pendants and charms', productCount: 21, createdAt: '2026-01-19' },
];

export const mockProducts: Product[] = [
  { id: 'P001', name: 'Diamond Solitaire Ring', category: 'Rings', price: 2499.99, stock: 12, image: 'https://images.unsplash.com/photo-1629201688905-697730d24490?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'female', status: 'active', createdAt: '2026-02-01', isBestSeller: true, isNewCollection: true },
  { id: 'P002', name: 'Emerald Necklace', category: 'Necklaces', price: 1899.99, stock: 8, image: 'https://images.unsplash.com/photo-1769857879388-df93b4c96bca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'female', status: 'active', createdAt: '2026-02-02', isBestSeller: true },
  { id: 'P003', name: 'Pearl Earrings', category: 'Earrings', price: 599.99, stock: 25, image: 'https://images.unsplash.com/photo-1704957205757-50bb01eb3183?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'female', status: 'active', createdAt: '2026-02-03', isNewCollection: true },
  { id: 'P004', name: 'Gold Bracelet', category: 'Bracelets', price: 1299.99, stock: 0, image: 'https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'female', status: 'inactive', createdAt: '2026-02-04' },
  { id: 'P005', name: 'Ruby Pendant', category: 'Pendants', price: 899.99, stock: 15, image: 'https://images.unsplash.com/photo-1719862056482-15c668d17ed1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'female', status: 'active', createdAt: '2026-02-05', isBestSeller: true },
  { id: 'P006', name: 'Sapphire Ring', category: 'Rings', price: 3299.99, stock: 6, image: 'https://images.unsplash.com/photo-1603561593143-2d9242789dfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'female', status: 'active', createdAt: '2026-02-06', isNewCollection: true },
  { id: 'P007', name: 'Diamond Studs', category: 'Earrings', price: 1499.99, stock: 18, image: 'https://images.unsplash.com/photo-1758631279564-785e98313f8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'female', status: 'active', createdAt: '2026-02-07', isBestSeller: true },
  { id: 'P008', name: 'Platinum Chain', category: 'Necklaces', price: 2199.99, stock: 10, image: 'https://images.unsplash.com/photo-1671663906664-9586041c3aa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'female', status: 'active', createdAt: '2026-02-08', isNewCollection: true },
  { id: 'P009', name: 'Men\'s Signet Ring', category: 'Rings', price: 1799.99, stock: 14, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'male', status: 'active', createdAt: '2026-02-09', isBestSeller: true, isNewCollection: true },
  { id: 'P010', name: 'Men\'s Gold Chain', category: 'Necklaces', price: 2599.99, stock: 9, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'male', status: 'active', createdAt: '2026-02-10' },
  { id: 'P011', name: 'Men\'s Cufflinks', category: 'Bracelets', price: 599.99, stock: 22, image: 'https://images.unsplash.com/photo-1624224323383-17c3df7a5a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'male', status: 'active', createdAt: '2026-02-11' },
  { id: 'P012', name: 'Men\'s Watch', category: 'Bracelets', price: 3999.99, stock: 5, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', gender: 'male', status: 'active', createdAt: '2026-02-12', isBestSeller: true },
];

export const mockOrders: Order[] = [
  { id: 'ORD001', customer: 'Sarah Johnson', email: 'sarah.j@email.com', total: 2499.99, cryptoAmount: 0.0263, status: 'completed', paymentMethod: 'BTC', paymentApproved: true, items: 1, date: '2026-02-20' },
  { id: 'ORD002', customer: 'Michael Chen', email: 'mchen@email.com', total: 3599.98, cryptoAmount: 3600, status: 'processing', paymentMethod: 'USDT', paymentApproved: true, items: 2, date: '2026-02-21' },
  { id: 'ORD003', customer: 'Emma Davis', email: 'emma.d@email.com', total: 1299.99, status: 'pending', paymentMethod: 'Paystack', items: 1, date: '2026-02-22' },
  { id: 'ORD004', customer: 'James Wilson', email: 'jwilson@email.com', total: 5799.97, cryptoAmount: 5800, status: 'completed', paymentMethod: 'USDT', paymentApproved: true, items: 3, date: '2026-02-22' },
  { id: 'ORD005', customer: 'Olivia Brown', email: 'olivia.b@email.com', total: 899.99, cryptoAmount: 0.0095, status: 'cancelled', paymentMethod: 'BTC', cancellationReason: 'Payment Proof Rejected', items: 1, date: '2026-02-23' },
  { id: 'ORD006', customer: 'Liam Martinez', email: 'liam.m@email.com', total: 4199.98, status: 'processing', paymentMethod: 'Paystack', items: 2, date: '2026-02-23' },
  { id: 'ORD007', customer: 'David Thompson', email: 'david.t@email.com', total: 2899.99, status: 'completed', paymentMethod: 'Paystack', items: 2, date: '2026-02-24' },
  { id: 'ORD008', customer: 'Rachel Green', email: 'rachel.g@email.com', total: 1599.99, cryptoAmount: 0.0168, status: 'awaiting_payment', paymentMethod: 'BTC', paymentProof: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', paymentApproved: false, items: 1, date: '2026-02-25' },
  { id: 'ORD009', customer: 'Tom Anderson', email: 'tom.a@email.com', total: 3299.99, cryptoAmount: 3300, status: 'awaiting_payment', paymentMethod: 'USDT', paymentProof: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', paymentApproved: false, items: 2, date: '2026-02-26' },
  { id: 'ORD010', customer: 'Maria Garcia', email: 'maria.g@email.com', total: 2199.99, cryptoAmount: 0.0232, status: 'awaiting_payment', paymentMethod: 'BTC', paymentProof: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', paymentApproved: false, items: 1, date: '2026-03-01' },
];

export const mockDiscounts: Discount[] = [
  { id: 'D001', name: 'Spring Sale', discountType: 'general', code: 'SPRING2026', type: 'percentage', value: 15, minPurchase: 500, maxUses: 100, usedCount: 45, expiresAt: '2026-03-31', status: 'active' },
  { id: 'D002', name: 'New Customer Discount', discountType: 'new_customer', type: 'fixed', value: 50, minPurchase: 200, maxUses: 500, usedCount: 234, expiresAt: '2026-12-31', status: 'active', autoApply: true },
  { id: 'D003', name: 'VIP Discount', discountType: 'general', code: 'VIP20', type: 'percentage', value: 20, minPurchase: 1000, maxUses: 50, usedCount: 38, expiresAt: '2026-06-30', status: 'active' },
  { id: 'D004', name: 'Winter Sale', discountType: 'general', code: 'WINTER2025', type: 'percentage', value: 25, minPurchase: 300, maxUses: 200, usedCount: 200, expiresAt: '2026-01-31', status: 'inactive' },
  { id: 'D005', name: 'Order Amount Discount', discountType: 'order_amount', type: 'fixed', value: 100, orderMinAmount: 500, usedCount: 0, expiresAt: '2026-12-31', status: 'active', autoApply: true },
  { id: 'D006', name: 'Product Discount', discountType: 'product', productId: 'P001', type: 'fixed', value: 500, usedCount: 0, expiresAt: '2026-12-31', status: 'active', autoApply: true },
];

export const mockReviews: Review[] = [
  { id: 'R001', customer: 'Sarah Johnson', email: 'sarah.j@email.com', product: 'Diamond Solitaire Ring', rating: 5, comment: 'Absolutely stunning ring! The diamond sparkles beautifully and the craftsmanship is exceptional. Worth every penny!', date: '2026-02-21', status: 'approved' },
  { id: 'R002', customer: 'Michael Chen', email: 'mchen@email.com', product: 'Emerald Necklace', rating: 4, comment: 'Beautiful necklace with vibrant emerald stones. The only minor issue is it feels slightly heavy after wearing for long periods.', date: '2026-02-22', status: 'approved' },
  { id: 'R003', customer: 'Emma Davis', email: 'emma.d@email.com', product: 'Pearl Earrings', rating: 5, comment: 'Elegant and timeless! These pearl earrings are perfect for both casual and formal occasions.', date: '2026-02-23', status: 'pending' },
  { id: 'R004', customer: 'James Wilson', email: 'jwilson@email.com', product: 'Sapphire Ring', rating: 5, comment: 'Gorgeous sapphire ring! My wife absolutely loves it. The blue color is mesmerizing.', date: '2026-02-24', status: 'pending' },
  { id: 'R005', customer: 'Olivia Brown', email: 'olivia.b@email.com', product: 'Ruby Pendant', rating: 4, comment: 'Beautiful ruby pendant with excellent quality. Fast shipping and secure packaging.', date: '2026-02-25', status: 'pending' },
  { id: 'R006', customer: 'Sophia Garcia', email: 'sophia.g@email.com', product: 'Diamond Studs', rating: 5, comment: 'Perfect diamond studs! They shine brilliantly and are very comfortable to wear all day.', date: '2026-02-26', status: 'approved' },
  { id: 'R007', customer: 'Noah Martinez', email: 'noah.m@email.com', product: 'Platinum Chain', rating: 3, comment: 'Nice chain but the clasp feels a bit loose. Hoping it will hold up over time.', date: '2026-02-27', status: 'pending' },
  { id: 'R008', customer: 'Ava Taylor', email: 'ava.t@email.com', product: 'Diamond Solitaire Ring', rating: 5, comment: 'This is THE ring! Proposed with it and she said yes. Quality is outstanding!', date: '2026-02-28', status: 'approved' },
  { id: 'R009', customer: 'Lucas Anderson', email: 'lucas.a@email.com', product: 'Emerald Necklace', rating: 1, comment: 'Not authentic. This looks fake. Very disappointed with the quality.', date: '2026-02-27', status: 'rejected' },
  { id: 'R010', customer: 'Isabella Lee', email: 'isabella.l@email.com', product: 'Gold Bracelet', rating: 4, comment: 'Lovely gold bracelet. The design is elegant and it fits perfectly.', date: '2026-02-26', status: 'pending' },
];

export const mockCustomRequests: CustomRequest[] = [
  { id: 'CR001', fullName: 'John Doe', email: 'john.d@email.com', phoneNumber: '123-456-7890', description: 'Request for a custom ring design', status: 'pending', submittedDate: '2026-02-20' },
  { id: 'CR002', fullName: 'Jane Smith', email: 'jane.s@email.com', phoneNumber: '987-654-3210', description: 'Inquiry about bulk purchase discounts', status: 'contacted', submittedDate: '2026-02-21' },
  { id: 'CR003', fullName: 'Emily Johnson', email: 'emily.j@email.com', phoneNumber: '555-123-4567', description: 'Request for a custom necklace design', status: 'completed', submittedDate: '2026-02-22' },
  { id: 'CR004', fullName: 'Michael Brown', email: 'michael.b@email.com', phoneNumber: '555-987-6543', description: 'Inquiry about shipping options', status: 'pending', submittedDate: '2026-02-23' },
  { id: 'CR005', fullName: 'Sarah Davis', email: 'sarah.d@email.com', phoneNumber: '555-555-5555', description: 'Request for a custom bracelet design', status: 'contacted', submittedDate: '2026-02-24' },
];

export const salesData = [
  { month: 'Sep', sales: 45000, orders: 89 },
  { month: 'Oct', sales: 52000, orders: 102 },
  { month: 'Nov', sales: 48000, orders: 95 },
  { month: 'Dec', sales: 71000, orders: 145 },
  { month: 'Jan', sales: 58000, orders: 112 },
  { month: 'Feb', sales: 67000, orders: 128 },
];

export const categoryData = [
  { name: 'Rings', value: 35, revenue: 89500 },
  { name: 'Necklaces', value: 25, revenue: 62800 },
  { name: 'Earrings', value: 20, revenue: 48200 },
  { name: 'Bracelets', value: 12, revenue: 29100 },
  { name: 'Pendants', value: 8, revenue: 19400 },
];