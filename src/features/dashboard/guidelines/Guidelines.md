# Development Guidelines

Comprehensive guidelines for developing and maintaining the Gems Ore Admin Dashboard.

## 📋 Table of Contents

1. [Code Style](#code-style)
2. [Project Structure](#project-structure)
3. [TypeScript Guidelines](#typescript-guidelines)
4. [React Best Practices](#react-best-practices)
5. [Component Guidelines](#component-guidelines)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Performance](#performance)
9. [Security](#security)
10. [Testing](#testing)
11. [Git Workflow](#git-workflow)
12. [Documentation](#documentation)

## Code Style

### General Principles

- Write clean, readable, and maintainable code
- Follow the DRY (Don't Repeat Yourself) principle
- Keep functions small and focused
- Use meaningful variable and function names
- Add comments for complex logic only

### Formatting

```typescript
// ✅ Good: Clear and consistent formatting
export function calculateTotal(
  items: Product[],
  currency: Currency
): number {
  return items.reduce((sum, item) => {
    return sum + convertPrice(item.price, currency);
  }, 0);
}

// ❌ Bad: Inconsistent formatting
export function calculateTotal(items:Product[],currency:Currency):number{return items.reduce((sum,item)=>sum+convertPrice(item.price,currency),0)}
```

### Naming Conventions

```typescript
// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_ENDPOINT = '/api/products';

// Variables & Functions: camelCase
const userName = 'Admin';
function fetchProducts() {}

// Types & Interfaces: PascalCase
interface Product {}
type Currency = 'NGN' | 'USD';

// Components: PascalCase
function ProductCard() {}

// Private functions: _prefixed (optional)
function _internalHelper() {}

// Boolean variables: is/has/should prefix
const isActive = true;
const hasPermission = false;
const shouldUpdate = true;
```

## Project Structure

### Directory Organization

```
src/
├── app/
│   ├── components/         # Reusable components
│   │   ├── ui/            # Base UI components (Radix)
│   │   └── [feature]/     # Feature-specific components
│   ├── config/            # Configuration files
│   │   ├── constants.ts   # App constants
│   │   └── env.ts        # Environment config
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Authentication
│   │   ├── error-handler.ts  # Error handling
│   │   ├── logger.ts     # Logging utility
│   │   ├── performance.ts # Performance monitoring
│   │   ├── security.ts   # Security utilities
│   │   └── storage.ts    # LocalStorage wrapper
│   ├── App.tsx           # Root component
│   └── routes.tsx        # Route configuration
└── styles/               # Global styles
```

### File Naming

```
// Components: PascalCase.tsx
ProductCard.tsx
DashboardLayout.tsx

// Utilities: kebab-case.ts or camelCase.ts
error-handler.ts
validation.ts

// Pages: kebab-case.tsx
dashboard-overview.tsx
financial-reports.tsx

// Types: index.ts (in types directory)
types/index.ts
```

## TypeScript Guidelines

### Type Safety

```typescript
// ✅ Good: Explicit types
function calculatePrice(price: number, tax: number): number {
  return price + (price * tax);
}

// ❌ Bad: Implicit any
function calculatePrice(price, tax) {
  return price + (price * tax);
}

// ✅ Good: Type interfaces
interface Product {
  id: string;
  name: string;
  price: number;
}

// ❌ Bad: Object without type
const product = {
  id: '1',
  name: 'Ring',
  price: 1000,
};
```

### Type Definitions

```typescript
// Prefer interfaces for objects
interface User {
  id: string;
  name: string;
  email: string;
}

// Use types for unions, primitives, tuples
type Currency = 'NGN' | 'USD';
type Coordinates = [number, number];

// Use generic types for reusability
interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Use utility types
type PartialUser = Partial<User>;
type ReadonlyUser = Readonly<User>;
type UserWithoutEmail = Omit<User, 'email'>;
```

### Avoid Type Assertions

```typescript
// ❌ Bad: Type assertion
const user = data as User;

// ✅ Good: Type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data
  );
}

if (isUser(data)) {
  // TypeScript knows data is User
  console.log(data.name);
}
```

## React Best Practices

### Component Structure

```typescript
// ✅ Good: Well-structured component
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { logger } from '@/utils/logger';

interface ProductCardProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProductCard({ 
  product, 
  onEdit, 
  onDelete 
}: ProductCardProps) {
  // Hooks first
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    logger.debug('ProductCard mounted', { productId: product.id });
  }, [product.id]);

  // Event handlers
  const handleEdit = () => {
    onEdit?.(product.id);
  };

  const handleDelete = () => {
    if (confirm('Delete this product?')) {
      onDelete?.(product.id);
    }
  };

  // Render
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

### Hooks Usage

```typescript
// ✅ Good: Custom hook for logic reuse
function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await api.products.getAll();
        setProducts(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}

// Usage
function ProductList() {
  const { products, loading, error } = useProducts();

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return <div>{/* render products */}</div>;
}
```

### Performance Optimization

```typescript
// Use memo for expensive components
const ProductCard = memo(({ product }: { product: Product }) => {
  return <div>{product.name}</div>;
});

// Use useMemo for expensive computations
const filteredProducts = useMemo(() => {
  return products.filter(p => p.category === category);
}, [products, category]);

// Use useCallback for stable function references
const handleClick = useCallback((id: string) => {
  selectProduct(id);
}, [selectProduct]);
```

## Component Guidelines

### Component Composition

```typescript
// ✅ Good: Composable components
function ProductList() {
  return (
    <div>
      <ProductListHeader />
      <ProductListFilters />
      <ProductListGrid>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductListGrid>
    </div>
  );
}

// ❌ Bad: Monolithic component
function ProductList() {
  return (
    <div>
      {/* All code in one component */}
    </div>
  );
}
```

### Props Design

```typescript
// ✅ Good: Clear prop interface
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// ❌ Bad: Unclear props
interface ButtonProps {
  type?: string;
  className?: string;
  onClick?: any;
}

// ✅ Good: Destructure with defaults
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
}: ButtonProps) {
  // Component logic
}
```

### Conditional Rendering

```typescript
// ✅ Good: Early returns
function ProductDetails({ product }: { product?: Product }) {
  if (!product) {
    return <div>No product found</div>;
  }

  if (product.status === 'inactive') {
    return <div>Product inactive</div>;
  }

  return <div>{product.name}</div>;
}

// ❌ Bad: Nested ternaries
function ProductDetails({ product }: { product?: Product }) {
  return (
    <div>
      {product ? (
        product.status === 'active' ? (
          <div>{product.name}</div>
        ) : (
          <div>Inactive</div>
        )
      ) : (
        <div>Not found</div>
      )}
    </div>
  );
}
```

## State Management

### Local State

```typescript
// Use useState for component-level state
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Global State (LocalStorage)

```typescript
// Use custom hook for persistent state
import { useLocalStorage } from '@/hooks/useLocalStorage';

function App() {
  const [currency, setCurrency] = useLocalStorage<Currency>(
    'selectedCurrency',
    'NGN'
  );

  return <div>Currency: {currency}</div>;
}
```

### Form State

```typescript
// Use React Hook Form for forms
import { useForm } from 'react-hook-form';

function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>();

  const onSubmit = async (data: ProductFormData) => {
    await saveProduct(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} />
      {errors.name && <span>Name is required</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Error Handling

### Error Boundaries

```typescript
// Wrap app in error boundary
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Async Error Handling

```typescript
// ✅ Good: Proper error handling
async function fetchProducts() {
  try {
    const products = await api.products.getAll();
    return products;
  } catch (error) {
    logger.error('Failed to fetch products', error);
    toast.error('Failed to load products');
    throw error;
  }
}

// Using error handler utility
import { handleAsync } from '@/utils/error-handler';

const { data, error } = await handleAsync(
  () => api.products.getAll(),
  {
    context: 'ProductList',
    showToast: true,
    fallbackMessage: 'Failed to load products',
  }
);
```

## Performance

### Code Splitting

```typescript
// Lazy load routes
const Products = lazy(() => import('./pages/products'));

// Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Products />
</Suspense>
```

### Memoization

```typescript
// Expensive computation
const sortedProducts = useMemo(() => {
  return [...products].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}, [products]);

// Stable callback
const handleDelete = useCallback((id: string) => {
  deleteProduct(id);
}, [deleteProduct]);
```

## Security

### Input Validation

```typescript
import { validateInput } from '@/utils/security';

function ProductForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const handleSubmit = (data: any) => {
    // Validate before submitting
    const { valid, error } = validateInput(data.name, {
      maxLength: 100,
      allowHtml: false,
    });

    if (!valid) {
      toast.error(error);
      return;
    }

    onSubmit(data);
  };
}
```

### Sanitization

```typescript
import { sanitizeHtml } from '@/utils/security';

// Sanitize user input before displaying
const cleanDescription = sanitizeHtml(product.description);
```

## Testing

### Unit Tests (Recommended)

```typescript
// ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    const product = { id: '1', name: 'Test Product', price: 100 };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

## Git Workflow

### Commit Messages

```bash
# Format: <type>: <subject>

# Types:
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
perf: Performance improvement
test: Add tests
chore: Maintenance

# Examples:
git commit -m "feat: Add product multi-image upload"
git commit -m "fix: Resolve currency conversion bug"
git commit -m "docs: Update deployment guide"
```

### Branch Naming

```bash
# Format: <type>/<description>

feature/product-upload
bugfix/currency-conversion
hotfix/security-patch
docs/api-documentation
```

## Documentation

### Code Comments

```typescript
/**
 * Calculate total price with currency conversion
 * @param items - Array of products
 * @param currency - Target currency (NGN or USD)
 * @returns Total price in target currency
 */
function calculateTotal(items: Product[], currency: Currency): number {
  return items.reduce((sum, item) => {
    return sum + convertPrice(item.price, currency);
  }, 0);
}

// Use inline comments for complex logic only
const rate = currency === 'USD' 
  ? 1 / CURRENCY_CONFIG.usdToNgnRate // Convert NGN to USD
  : CURRENCY_CONFIG.usdToNgnRate;     // Convert USD to NGN
```

### README Updates

- Update README.md when adding new features
- Document environment variables
- Keep installation instructions current
- Update troubleshooting section

---

## Quick Reference

### Before Committing
- [ ] No TypeScript errors
- [ ] No console.logs (use logger)
- [ ] Code formatted
- [ ] No hardcoded values (use constants)
- [ ] Error handling added
- [ ] Types defined
- [ ] Loading states added

### Before PR
- [ ] Code reviewed
- [ ] Tests passing (if applicable)
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Build successful

### Before Production
- [ ] Security audit
- [ ] Performance testing
- [ ] Environment variables set
- [ ] Error tracking configured
- [ ] Monitoring setup

---

**Last Updated:** March 6, 2026
