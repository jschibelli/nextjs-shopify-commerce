'use client';

import {
    BarChart3,
    Heart,
    MapPin,
    MessageSquare,
    Package,
    Settings,
    Star,
    Tag,
    Trophy,
    User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AccountSidebar() {
  const pathname = usePathname();

  const navigationSections = [
    {
      id: 'account',
      title: 'Account',
      icon: User,
      items: [
        { href: '/account', label: 'Profile', icon: User },
        { href: '/account/settings', label: 'Settings', icon: Settings },
      ]
    },
    {
      id: 'orders',
      title: 'Orders & Shipping',
      icon: Package,
      items: [
        { href: '/account/orders', label: 'Orders', icon: Package },
        { href: '/account/addresses', label: 'Addresses', icon: MapPin },
        { href: '/account/returns', label: 'Returns', icon: Package },
      ]
    },
    {
      id: 'engagement',
      title: 'Engagement',
      icon: Star,
      items: [
        { href: '/account/loyalty', label: 'Loyalty Program', icon: Star },
        { href: '/account/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/account/tags', label: 'Tags', icon: Tag },
        { href: '/account/journey', label: 'Journey', icon: MapPin },
        { href: '/account/gamification', label: 'Gamification', icon: Trophy },
      ]
    },
    {
      id: 'support',
      title: 'Support & Reviews',
      icon: MessageSquare,
      items: [
        { href: '/account/support', label: 'Support', icon: MessageSquare },
        { href: '/account/reviews', label: 'Reviews', icon: Star },
        { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
      ]
    }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="space-y-6">
      {navigationSections.map((section) => (
        <div key={section.id}>
          <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-accent text-accent-foreground border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
} 