'use client';

import { useEnhancedCart } from 'components/cart/enhanced-cart-context';
import EnhancedCartModal from 'components/cart/enhanced-cart-modal';
import { useCartInsights } from 'components/cart/use-cart-persistence';
import { useState } from 'react';

export default function TestCartPage() {
  const { cart, analytics, clearCart } = useEnhancedCart();
  const insights = useCartInsights(cart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Advanced Cart Features Test</h1>
      
      {/* Test Cart Modal */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Test Cart Modal</h2>
        <button
          onClick={() => setIsCartOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Cart Modal
        </button>
        <EnhancedCartModal 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cart Analytics */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Cart Analytics</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Total Items:</span>
                <span className="font-bold">{analytics.totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Unique Items:</span>
                <span className="font-bold">{analytics.uniqueItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Average Price:</span>
                <span className="font-bold">${analytics.averageItemPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Insights */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Cart Insights</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Total Value:</span>
                <span className="font-bold">${insights.totalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Average Price:</span>
                <span className="font-bold">${insights.averageItemPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Price Range:</span>
                <span className="font-bold">${insights.priceRange.min.toFixed(2)} - ${insights.priceRange.max.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Unique Items:</span>
                <span className="font-bold">{Object.keys(insights.itemCategories).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Cart Actions</h2>
        <div className="flex space-x-4">
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Cart
          </button>
          <button
            onClick={() => console.log('Cart:', cart)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log Cart
          </button>
        </div>
      </div>

      {/* Cart Details */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Cart Details</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(cart, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 