# Advanced Cart Features & API Integration

This document outlines the advanced cart features implemented in the Next.js Shopify Commerce application, including the API integration, enhanced cart context, and advanced functionality.

## 🛒 Cart API Endpoints

### Base URL: `/api/cart`

#### GET `/api/cart`
Retrieves the current cart state.

**Response:**
```json
{
  "cart": {
    "id": "cart_id",
    "checkoutUrl": "https://checkout.shopify.com/...",
    "totalQuantity": 3,
    "lines": [...],
    "cost": {
      "subtotalAmount": { "amount": "150.00", "currencyCode": "USD" },
      "totalAmount": { "amount": "150.00", "currencyCode": "USD" },
      "totalTaxAmount": { "amount": "0.00", "currencyCode": "USD" }
    }
  }
}
```

#### POST `/api/cart`
Performs cart operations based on the `action` parameter.

**Actions:**
- `add` - Add item to cart
- `update` - Update item quantity
- `remove` - Remove item from cart
- `clear` - Clear entire cart
- `create` - Create new cart

**Example Request:**
```json
{
  "action": "add",
  "merchandiseId": "gid://shopify/ProductVariant/123",
  "quantity": 2
}
```

## 🔧 Enhanced Cart Context

### `useEnhancedCart()`

Provides advanced cart functionality with analytics and better state management.

**Features:**
- Optimistic updates
- Cart analytics
- Error handling
- Loading states

**Usage:**
```tsx
import { useEnhancedCart } from 'components/cart/enhanced-cart-context';

function MyComponent() {
  const { 
    cart, 
    analytics, 
    updateCartItem, 
    addCartItem, 
    removeCartItem, 
    clearCart 
  } = useEnhancedCart();

  return (
    <div>
      <p>Total Items: {analytics.totalItems}</p>
      <p>Unique Items: {analytics.uniqueItems}</p>
      <p>Average Price: ${analytics.averageItemPrice.toFixed(2)}</p>
    </div>
  );
}
```

## 📊 Cart Analytics

### `CartAnalytics` Component

Displays detailed cart insights including:
- Total items and unique items
- Price range analysis
- Most/least expensive items
- Category breakdown

**Usage:**
```tsx
import CartAnalytics from 'components/cart/cart-analytics';

function CartPage() {
  const { cart } = useEnhancedCart();
  
  return (
    <div>
      <CartAnalytics cart={cart} />
    </div>
  );
}
```

## 💾 Cart Persistence

### `useCartPersistence()` Hook

Manages cart data persistence across sessions.

**Features:**
- Local storage support
- Session storage support
- Automatic cart recovery
- Age-based cleanup

**Usage:**
```tsx
import { useCartPersistence } from 'components/cart/use-cart-persistence';

function CartManager() {
  const { 
    saveCart, 
    loadCart, 
    clearStoredCart, 
    hasStoredCart 
  } = useCartPersistence();

  // Save cart when it changes
  useEffect(() => {
    if (cart) {
      saveCart(cart);
    }
  }, [cart, saveCart]);

  // Recover cart on mount
  useEffect(() => {
    if (hasStoredCart) {
      const recoveredCart = loadCart();
      if (recoveredCart) {
        setCart(recoveredCart);
      }
    }
  }, [hasStoredCart, loadCart]);
}
```

## 🚀 Cart API Client

### `cartApiClient` Class

Provides a clean interface for all cart API operations with:
- Automatic retry logic
- Request timeout handling
- Error handling
- Batch operations

**Usage:**
```tsx
import { cartApiClient } from 'components/cart/cart-api-client';

// Add item to cart
const response = await cartApiClient.addItem('merchandise_id', 2);
if (response.success) {
  console.log('Item added:', response.cart);
} else {
  console.error('Error:', response.error);
}

// Batch operations
const batchResponse = await cartApiClient.addMultipleItems([
  { merchandiseId: 'id1', quantity: 1 },
  { merchandiseId: 'id2', quantity: 2 }
]);
```

## 🎨 Enhanced Cart Modal

### `EnhancedCartModal` Component

Advanced cart modal with features:
- Cart analytics display
- Bulk item selection
- Save for later functionality
- Clear cart option
- Continue shopping button

**Features:**
- Real-time analytics
- Bulk actions (select all, remove selected)
- Save items to wishlist
- Cart recovery
- Enhanced UX with loading states

## 🔄 Cart Recovery

### `useCartRecovery()` Hook

Handles cart recovery and synchronization.

**Features:**
- Automatic cart saving
- Cart recovery on page load
- Cross-tab synchronization
- Age-based cleanup

## 📈 Cart Insights

### `useCartInsights()` Hook

Provides detailed cart analytics and insights.

**Insights:**
- Total value and average price
- Price range analysis
- Item categorization
- Most/least expensive items
- Category breakdown

## 🛠️ Utility Functions

### `cartUtils` Object

Common cart utility functions:

```tsx
import { cartUtils } from 'components/cart/cart-api-client';

// Calculate totals
const totals = cartUtils.calculateTotals(cart);

// Check if cart is empty
const isEmpty = cartUtils.isEmpty(cart);

// Find item by ID
const item = cartUtils.getItemByMerchandiseId(cart, 'merchandise_id');

// Format for display
const displayData = cartUtils.formatCartForDisplay(cart);
```

## 🔧 Advanced Features

### 1. Optimistic Updates
Cart updates are applied immediately in the UI while the API request is processed in the background.

### 2. Error Handling
Comprehensive error handling with user-friendly messages and automatic retry logic.

### 3. Loading States
Visual feedback during cart operations with loading indicators.

### 4. Cart Persistence
Cart data is automatically saved and recovered across browser sessions.

### 5. Analytics
Real-time cart analytics with detailed insights about cart contents.

### 6. Bulk Operations
Support for bulk item selection and operations.

### 7. API Retry Logic
Automatic retry with exponential backoff for failed requests.

## 🚀 Getting Started

### 1. Setup Enhanced Cart Provider

```tsx
// app/layout.tsx
import { EnhancedCartProvider } from 'components/cart/enhanced-cart-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <EnhancedCartProvider cartPromise={getCart()}>
          {children}
        </EnhancedCartProvider>
      </body>
    </html>
  );
}
```

### 2. Use Enhanced Cart Modal

```tsx
// components/layout/navbar.tsx
import EnhancedCartModal from 'components/cart/enhanced-cart-modal';

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <nav>
      <button onClick={() => setIsCartOpen(true)}>
        Cart
      </button>
      <EnhancedCartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </nav>
  );
}
```

### 3. Add Cart Analytics

```tsx
// pages/cart.tsx
import CartAnalytics from 'components/cart/cart-analytics';
import { useEnhancedCart } from 'components/cart/enhanced-cart-context';

export default function CartPage() {
  const { cart } = useEnhancedCart();

  return (
    <div>
      <h1>Shopping Cart</h1>
      <CartAnalytics cart={cart} />
      {/* Cart items */}
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Cart API Client Options

```tsx
const cartClient = new CartApiClient({
  baseUrl: '/api/cart',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
});
```

## 🧪 Testing

### API Testing

```bash
# Test cart API endpoints
curl -X GET http://localhost:3000/api/cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"action":"add","merchandiseId":"test","quantity":1}'
```

### Component Testing

```tsx
// __tests__/cart-analytics.test.tsx
import { render, screen } from '@testing-library/react';
import CartAnalytics from 'components/cart/cart-analytics';

test('displays cart analytics', () => {
  const mockCart = {
    totalQuantity: 3,
    lines: [...],
    cost: { totalAmount: { amount: '150.00', currencyCode: 'USD' } }
  };

  render(<CartAnalytics cart={mockCart} />);
  
  expect(screen.getByText('Total Items: 3')).toBeInTheDocument();
});
```

## 📚 API Reference

### Cart API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get current cart |
| POST | `/api/cart` | Perform cart operations |

### Cart Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `add` | `merchandiseId`, `quantity` | Add item to cart |
| `update` | `lineId`, `merchandiseId`, `quantity` | Update item quantity |
| `remove` | `lineId` | Remove item from cart |
| `clear` | None | Clear entire cart |
| `create` | None | Create new cart |

### Cart Analytics

| Metric | Description |
|--------|-------------|
| `totalItems` | Total quantity of all items |
| `uniqueItems` | Number of unique products |
| `averageItemPrice` | Average price per item |
| `mostExpensiveItem` | Item with highest unit price |
| `leastExpensiveItem` | Item with lowest unit price |
| `priceRange` | Min, max, and average prices |

## 🎯 Best Practices

1. **Use Optimistic Updates**: Apply changes immediately in the UI
2. **Handle Errors Gracefully**: Show user-friendly error messages
3. **Provide Loading States**: Give visual feedback during operations
4. **Persist Cart Data**: Save cart state for better UX
5. **Use Analytics**: Leverage cart insights for better user experience
6. **Implement Retry Logic**: Handle network failures gracefully
7. **Batch Operations**: Group related operations when possible

## 🔮 Future Enhancements

- [ ] Real-time cart synchronization
- [ ] Advanced cart analytics dashboard
- [ ] Cart sharing functionality
- [ ] Cart templates and saved carts
- [ ] Advanced inventory management
- [ ] Cart abandonment recovery
- [ ] A/B testing for cart optimization
- [ ] Machine learning for cart recommendations 