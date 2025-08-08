'use client';

import { CreditCard, Heart, MapPin, MessageSquare, Package, Star } from 'lucide-react';
import Link from 'next/link';

export function AccountQuickActions() {
  const quickActions = [
    {
      href: '/account/orders',
      label: 'Recent Orders',
      icon: Package,
      color: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900'
    },
    {
      href: '/account/addresses',
      label: 'Manage Addresses',
      icon: MapPin,
      color: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900'
    },
    {
      href: '/account/support',
      label: 'Get Support',
      icon: MessageSquare,
      color: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900'
    },
    {
      href: '/account/loyalty',
      label: 'Loyalty Points',
      icon: Star,
      color: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900'
    },
    {
      href: '/account/wishlist',
      label: 'My Wishlist',
      icon: Heart,
      color: 'bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900'
    },
    {
      href: '/account/settings',
      label: 'Account Settings',
      icon: CreditCard,
      color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex flex-col items-center p-4 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-md ${action.color}`}
          >
            <action.icon className="h-6 w-6 mb-2" />
            <span className="text-xs font-medium text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
} 