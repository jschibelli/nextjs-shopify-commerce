'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    Bell,
    ChevronDown,
    CreditCard,
    Database,
    DollarSign,
    FileText,
    FolderOpen,
    Globe,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    MapPin,
    Menu,
    Package,
    Search,
    Settings,
    ShoppingCart,
    Tags,
    Truck,
    User,
    Users,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    description: 'Manage your products'
  },
  {
    name: 'Collections',
    href: '/admin/collections',
    icon: FolderOpen,
    description: 'Organize products'
  },
  {
    name: 'Inventory',
    href: '/admin/inventory',
    icon: MapPin,
    description: 'Stock management'
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    description: 'Customer management'
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Order processing'
  },
  {
    name: 'Gift Cards',
    href: '/admin/gift-cards',
    icon: CreditCard,
    description: 'Gift card management'
  },
  {
    name: 'Abandoned Checkouts',
    href: '/admin/abandoned-checkouts',
    icon: ShoppingCart,
    description: 'Recovery campaigns'
  },
  {
    name: 'Price Lists',
    href: '/admin/price-lists',
    icon: DollarSign,
    description: 'Segment pricing'
  },
  {
    name: 'Markets',
    href: '/admin/markets',
    icon: Globe,
    description: 'Multi-market selling'
  },
  {
    name: 'Bulk Operations',
    href: '/admin/bulk-operations',
    icon: Database,
    description: 'Data import/export'
  },
  {
    name: 'Shipping',
    href: '/admin/shipping',
    icon: Truck,
    description: 'Fulfillment & shipping'
  },
  {
    name: 'Discounts',
    href: '/admin/discounts',
    icon: Tags,
    description: 'Promotions & codes'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Business insights'
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    description: 'Custom reports'
  },
  {
    name: 'Reviews',
    href: '/admin/reviews',
    icon: HelpCircle,
    description: 'Customer reviews'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Store configuration'
  }
];

const quickActions = [
  {
    name: 'Add Product',
    href: '/admin/products?action=create',
    icon: Package,
    description: 'Create new product'
  },
  {
    name: 'Create Collection',
    href: '/admin/collections?action=create',
    icon: FolderOpen,
    description: 'New collection'
  },
  {
    name: 'View Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Recent orders'
  },
  {
    name: 'Customer Support',
    href: '/admin/customers?tab=support',
    icon: Users,
    description: 'Support tickets'
  }
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Search:', searchQuery);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Desktop Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Admin Dashboard
                </span>
                <span className="text-xl font-bold text-gray-900 sm:hidden">
                  Admin
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links - Hidden on mobile, visible on lg+ */}
            <div className="hidden xl:ml-8 xl:flex xl:space-x-1">
              {navigation.slice(0, 6).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                      {item.description}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
          </div>

          {/* Right side - Actions and Profile */}
          <div className="flex items-center space-x-2">
            {/* Notifications - Hidden on mobile */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Quick Actions Dropdown - Hidden on mobile */}
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden xl:flex">
                    Quick Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {quickActions.map((action) => (
                    <DropdownMenuItem key={action.name} asChild>
                      <Link href={action.href} className="flex items-center space-x-3">
                        <action.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{action.name}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="ml-2 hidden sm:block">Admin</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/admin/logout" className="flex items-center text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          {/* Mobile Search */}
          <div className="px-4 py-3 border-b border-gray-200">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
          </div>

          {/* Mobile Navigation Links */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Account Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Account
              </h3>
              <div className="space-y-1">
                <Link
                  href="/admin/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/api/admin/logout"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 