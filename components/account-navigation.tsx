'use client';

import { BarChart3, ChevronDown, Heart, MapPin, Menu, MessageSquare, Package, Settings, Star, Tag, Trophy, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function AccountNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground bg-card border border-border rounded-lg shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
        >
          <span>Account Menu</span>
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mb-6 bg-card border border-border rounded-lg shadow-lg relative z-10">
          <nav className="p-4 space-y-1">
            {navigationSections.map((section) => (
              <div key={section.id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  <div className="flex items-center">
                    <section.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                    {section.title}
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      expandedSections.includes(section.id) ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedSections.includes(section.id) && (
                  <div className="pl-8 pr-3 pb-3 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive(item.href)
                            ? 'bg-accent text-accent-foreground border-l-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden lg:block space-y-6">
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
    </>
  );
} 