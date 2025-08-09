'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AccountBreadcrumb() {
  const pathname = usePathname();
  
  const getBreadcrumbItems = () => {
    const segments = pathname.split('/').filter(Boolean);
    const items: Array<{ href: string; label: string; icon?: any }> = [
      { href: '/', label: 'Home', icon: Home }
    ];
    
    if (segments[0] === 'account') {
      items.push({ href: '/account', label: 'Account' });
      
      if (segments[1]) {
        const pageName = segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
        items.push({ href: pathname, label: pageName });
      }
    }
    
    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4 lg:mb-6 overflow-x-auto">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center flex-shrink-0">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />
          )}
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-foreground font-medium truncate">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="flex items-center hover:text-foreground transition-colors flex-shrink-0"
            >
              {item.icon && <item.icon className="h-4 w-4 mr-1 flex-shrink-0" />}
              <span className="truncate">{item.label}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
} 