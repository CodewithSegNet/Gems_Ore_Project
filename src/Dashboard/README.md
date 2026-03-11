# Gems Ore Admin Dashboard

A comprehensive, production-ready admin dashboard for managing Gems Ore, a jewelry e-commerce business. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

### Core Functionality
- **Dashboard Overview** - Real-time metrics, charts, and insights
- **Product Management** - Full CRUD operations with multi-image upload support
- **Category Management** - Organize products by categories
- **Order Management** - Process orders with cryptocurrency payment approval system
- **Review Management** - Moderate customer reviews
- **Custom Requests** - Handle custom jewelry inquiries
- **Discount System** - Multiple discount types (new customer, order amount, general, product)
- **Financial Reports** - Export reports in CSV and PDF formats
- **Settings** - VAT configuration and payment method setup

### Key Features
- ✅ Multi-currency support (NGN/USD) with real-time conversion
- ✅ Cryptocurrency payments (BTC, USDT with ERC-20, BEP-20, TRC-20)
- ✅ Traditional payment gateway (Paystack)
- ✅ Gender-based product categorization
- ✅ Homepage section management (Best Sellers, Newest Collections)
- ✅ Order cancellation with reason tracking
- ✅ Responsive design for all screen sizes
- ✅ Real-time notifications and badges
- ✅ Session management with timeout
- ✅ Error boundary for graceful error handling
- ✅ **Production-ready optimizations:**
  - Code splitting and lazy loading
  - Performance monitoring utilities
  - Comprehensive error handling
  - Security utilities and validation
  - Environment-based configuration
  - Production-safe logging
  - Type-safe development
  - Optimized build configuration

## Tech Stack

- **Framework:** React 18.3.1
- **Build Tool:** Vite 6.3.5
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.1.12
- **Routing:** React Router 7.13.0
- **UI Components:** Radix UI
- **Charts:** Recharts 2.15.2
- **Forms:** React Hook Form 7.55.0
- **Notifications:** Sonner 2.0.3
- **PDF Export:** jsPDF 4.2.0
- **Icons:** Lucide React 0.487.0

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gems-ore-admin
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update the environment variables in `.env.local` with your actual values.

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
gems-ore-admin/
├── src/
│   ├── app/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Base UI components (Radix UI)
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   └── loading.tsx
│   │   ├── config/            # Configuration files
│   │   │   └── constants.ts   # App constants and config
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useLocalStorage.ts
│   │   ├── pages/             # Page components
│   │   │   ├── dashboard-overview.tsx
│   │   │   ├── products.tsx
│   │   │   ├── orders.tsx
│   │   │   ├── categories.tsx
│   │   │   ├── reviews.tsx
│   │   │   ├── custom-requests.tsx
│   │   │   ├── discounts.tsx
│   │   │   ├── financial-reports.tsx
│   │   │   ├── settings.tsx
│   │   │   └── login.tsx
│   │   ├── utils/             # Utility functions
│   │   │   ├── auth.ts        # Authentication utilities
│   │   │   ├── export-utils.ts # Export (CSV/PDF) utilities
│   │   │   ├── mock-data.ts   # Mock data for development
│   │   │   ├── storage.ts     # LocalStorage utilities
│   │   │   └── validation.ts  # Validation utilities
│   │   ├── App.tsx            # Root component
│   │   └── routes.tsx         # Route configuration
│   └── styles/                # Global styles
│       ├── index.css
│       ├── theme.css
│       └── tailwind.css
├── .env.example               # Environment variables template
├── package.json
├── vite.config.ts
└── README.md
```

## Configuration

### Environment Variables

The application uses environment variables for configuration. See `.env.example` for all available options.

Key variables:
- `VITE_DEFAULT_CURRENCY` - Default currency (NGN or USD)
- `VITE_USD_TO_NGN_RATE` - Conversion rate
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack integration key
- `VITE_BTC_WALLET_ADDRESS` - Bitcoin wallet address
- `VITE_USDT_*_ADDRESS` - USDT wallet addresses for different networks

### Currency Configuration

The dashboard supports multi-currency operations. Configure in `src/app/config/constants.ts`:

```typescript
export const CURRENCY_CONFIG = {
  default: 'NGN',
  usdToNgnRate: 1500,
  symbols: {
    NGN: '₦',
    USD: '$',
  },
};
```

### Payment Methods

Configure payment methods in Settings or via environment variables:
- **Paystack** - Traditional payment gateway
- **Bitcoin (BTC)** - Cryptocurrency payment
- **USDT** - Tether on multiple networks (ERC-20, BEP-20, TRC-20)

## Authentication

### Demo Credentials
- **Email:** admin@gemsore.com
- **Password:** admin123

### Session Management
- Sessions expire after 1 hour (configurable in `AUTH_CONFIG`)
- Auto-logout on session expiry
- Session refresh on user activity

### Production Authentication

**Important:** The current authentication is for demo purposes only. For production:

1. Replace the demo authentication in `src/app/utils/auth.ts` with a secure backend API
2. Implement proper password hashing
3. Use secure tokens (JWT, OAuth)
4. Enable HTTPS only
5. Implement rate limiting
6. Add 2FA for enhanced security

## Data Management

### LocalStorage

The application uses localStorage for data persistence:
- Products: `gemsore_products`
- Categories: `gemsore_categories`
- Orders: `gemsore_orders`
- Reviews: `gemsore_reviews`
- Discounts: `gemsore_discounts`
- Settings: `gemsore_settings`

### Production Backend

For production, replace localStorage with API calls:

1. Create backend API endpoints for all CRUD operations
2. Update utility functions in `src/app/utils/` to call APIs
3. Implement proper error handling and loading states
4. Add authentication headers to all requests
5. Implement data validation on both frontend and backend

## Security Considerations

### Production Checklist

- [ ] Replace demo authentication with secure backend auth
- [ ] Implement HTTPS everywhere
- [ ] Add Content Security Policy (CSP) headers
- [ ] Enable CORS properly on backend
- [ ] Sanitize all user inputs (validation implemented, but enhance as needed)
- [ ] Implement rate limiting on API endpoints
- [ ] Use environment variables for all secrets (never commit them)
- [ ] Enable security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Implement proper session management on backend
- [ ] Add request signing for sensitive operations
- [ ] Enable database encryption for sensitive data
- [ ] Implement audit logging
- [ ] Set up monitoring and alerting
- [ ] Regular security audits and penetration testing

### Input Validation

Validation utilities are available in `src/app/utils/validation.ts`:
- Email validation
- Phone number validation
- Price validation
- File upload validation
- XSS prevention (basic sanitization)

## Performance Optimization

### Build Optimization

The application is configured for optimal production builds:
- Code splitting (React Router)
- Tree shaking
- Minification
- Asset optimization

### Recommended Improvements

1. **Lazy Loading:**
```typescript
const Products = lazy(() => import('./pages/products'));
```

2. **Image Optimization:**
- Use WebP format
- Implement lazy loading for images
- Use CDN for image delivery

3. **Caching:**
- Implement service workers for offline support
- Cache static assets
- Use React Query or SWR for data caching

4. **Code Splitting:**
- Split vendor bundles
- Route-based code splitting (already implemented)

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist folder to Netlify
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment-Specific Builds

For different environments:

```bash
# Development
npm run dev

# Production
npm run build

# Preview production build
npm run preview
```

## Monitoring and Analytics

### Recommended Tools

1. **Error Tracking:**
   - Sentry
   - LogRocket
   - Rollbar

2. **Analytics:**
   - Google Analytics
   - Mixpanel
   - Amplitude

3. **Performance Monitoring:**
   - New Relic
   - DataDog
   - Lighthouse CI

### Implementation

Add error reporting service in `src/app/components/error-boundary.tsx`:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Send to error reporting service
  Sentry.captureException(error, { extra: errorInfo });
}
```

## Testing

### Recommended Testing Strategy

1. **Unit Tests:** Jest + React Testing Library
2. **Integration Tests:** Playwright or Cypress
3. **E2E Tests:** Playwright
4. **Accessibility Tests:** axe-core

## Troubleshooting

### Common Issues

**Build Errors:**
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify environment variables

**Authentication Issues:**
- Clear localStorage
- Check session timeout configuration
- Verify demo credentials

**Data Not Persisting:**
- Check browser localStorage limits
- Verify localStorage is enabled
- Check for storage quota errors

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Follow the component naming conventions
4. Add proper error handling
5. Update documentation as needed

## License

Proprietary - Gems Ore. All rights reserved.

## Support

For support and questions, contact the development team.

---

**Note:** This is a production-ready codebase structure. Before deploying to production, ensure you've completed all items in the Security Checklist and replaced demo authentication with a secure backend implementation.