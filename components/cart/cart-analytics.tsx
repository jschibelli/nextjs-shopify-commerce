'use client';

import { ChartBarIcon, CurrencyDollarIcon, ShoppingBagIcon, TagIcon } from '@heroicons/react/24/outline';
import Price from 'components/price';
import { Cart } from 'lib/shopify/types';

interface CartAnalyticsProps {
  cart: Cart;
}

interface AnalyticsData {
  totalItems: number;
  uniqueItems: number;
  averageItemPrice: number;
  mostExpensiveItem: any;
  leastExpensiveItem: any;
  totalValue: number;
  itemCategories: { [key: string]: number };
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
}

export default function CartAnalytics({ cart }: CartAnalyticsProps) {
  const analytics = calculateAnalytics(cart);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-4 flex items-center space-x-2">
        <ChartBarIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Cart Analytics</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Total Items */}
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <div className="flex items-center space-x-2">
            <ShoppingBagIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Items</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
            {analytics.totalItems}
          </p>
        </div>

        {/* Unique Items */}
        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <div className="flex items-center space-x-2">
            <TagIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Unique Items</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-100">
            {analytics.uniqueItems}
          </p>
        </div>

        {/* Total Value */}
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Value</span>
          </div>
          <div className="mt-1">
            <Price
              className="text-2xl font-bold text-purple-900 dark:text-purple-100"
              amount={analytics.totalValue.toString()}
              currencyCode="USD"
            />
          </div>
        </div>

        {/* Average Price */}
        <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Avg Price</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-orange-900 dark:text-orange-100">
            ${analytics.averageItemPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Price Range */}
      <div className="mt-4 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
        <h4 className="mb-2 text-sm font-medium">Price Range</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Lowest:</span>
            <Price
              amount={analytics.priceRange.min.toString()}
              currencyCode="USD"
            />
          </div>
          <div className="flex justify-between">
            <span>Highest:</span>
            <Price
              amount={analytics.priceRange.max.toString()}
              currencyCode="USD"
            />
          </div>
          <div className="flex justify-between">
            <span>Average:</span>
            <Price
              amount={analytics.priceRange.average.toString()}
              currencyCode="USD"
            />
          </div>
        </div>
      </div>

      {/* Most/Least Expensive Items */}
      {(analytics.mostExpensiveItem || analytics.leastExpensiveItem) && (
        <div className="mt-4 space-y-2">
          {analytics.mostExpensiveItem && (
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Most Expensive Item
              </h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-200">
                {analytics.mostExpensiveItem.merchandise.product.title}
              </p>
              <Price
                className="text-sm font-semibold text-yellow-900 dark:text-yellow-100"
                amount={analytics.mostExpensiveItem.cost.totalAmount.amount}
                currencyCode={analytics.mostExpensiveItem.cost.totalAmount.currencyCode}
              />
            </div>
          )}
          
          {analytics.leastExpensiveItem && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Least Expensive Item
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                {analytics.leastExpensiveItem.merchandise.product.title}
              </p>
              <Price
                className="text-sm font-semibold text-blue-900 dark:text-blue-100"
                amount={analytics.leastExpensiveItem.cost.totalAmount.amount}
                currencyCode={analytics.leastExpensiveItem.cost.totalAmount.currencyCode}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function calculateAnalytics(cart: Cart): AnalyticsData {
  if (!cart || cart.lines.length === 0) {
    return {
      totalItems: 0,
      uniqueItems: 0,
      averageItemPrice: 0,
      mostExpensiveItem: null,
      leastExpensiveItem: null,
      totalValue: 0,
      itemCategories: {},
      priceRange: { min: 0, max: 0, average: 0 }
    };
  }

  const totalItems = cart.totalQuantity;
  const uniqueItems = cart.lines.length;
  const totalValue = Number(cart.cost.totalAmount.amount);
  const averageItemPrice = totalValue / totalItems;

  // Calculate price range
  const prices = cart.lines.map(item => Number(item.cost.totalAmount.amount) / item.quantity);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  // Find most and least expensive items
  const sortedItems = [...cart.lines].sort((a, b) => {
    const aPrice = Number(a.cost.totalAmount.amount) / a.quantity;
    const bPrice = Number(b.cost.totalAmount.amount) / b.quantity;
    return bPrice - aPrice;
  });

  // Categorize items (simple categorization based on product title)
  const itemCategories: { [key: string]: number } = {};
  cart.lines.forEach(item => {
    const title = item.merchandise.product.title.toLowerCase();
    let category = 'Other';
    
    if (title.includes('shirt') || title.includes('tank') || title.includes('top')) {
      category = 'Tops';
    } else if (title.includes('pant') || title.includes('short')) {
      category = 'Bottoms';
    } else if (title.includes('shoe') || title.includes('boot')) {
      category = 'Footwear';
    } else if (title.includes('jacket') || title.includes('hoodie')) {
      category = 'Outerwear';
    } else if (title.includes('accessory') || title.includes('bag')) {
      category = 'Accessories';
    }
    
    itemCategories[category] = (itemCategories[category] || 0) + item.quantity;
  });

  return {
    totalItems,
    uniqueItems,
    averageItemPrice,
    mostExpensiveItem: sortedItems[0] || null,
    leastExpensiveItem: sortedItems[sortedItems.length - 1] || null,
    totalValue,
    itemCategories,
    priceRange: {
      min: minPrice,
      max: maxPrice,
      average: avgPrice
    }
  };
} 