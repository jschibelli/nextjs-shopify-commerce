'use client';

import {
    Heart,
    HelpCircle,
    Home,
    MapPin,
    Menu,
    MessageSquare,
    Package,
    Search,
    Settings,
    ShoppingBag,
    Star,
    User,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { useEnhancedCart } from '@/components/cart/enhanced-cart-context';
import EnhancedCartModal from '@/components/cart/enhanced-cart-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWishlist } from '@/components/wishlist/wishlist-context';
import WishlistModal from '@/components/wishlist/wishlist-modal';
import AccountLink from './account-link';

export default function CustomerNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart } = useEnhancedCart();
  const { wishlistCount } = useWishlist();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      closeMobileMenu();
    }
  };

  // Main navigation items
  const mainNavItems = [
    { href: '/search', label: 'Products' },
    { href: '/search?collection=hydrogen', label: 'Hydrogen' },
    { href: '/search?collection=oxygen', label: 'Oxygen' },
    { href: '/search?collection=accessories', label: 'Accessories' },
  ];

  // Account navigation items
  const accountNavItems = [
    { href: '/account', label: 'Profile', icon: User },
    { href: '/account/orders', label: 'Orders', icon: Package },
    { href: '/account/addresses', label: 'Addresses', icon: MapPin },
    { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/account/loyalty', label: 'Loyalty', icon: Star },
    { href: '/account/support', label: 'Support', icon: MessageSquare },
    { href: '/account/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <span className="sr-only">Home</span>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:block">Shella</span>
            <span className="font-bold text-xl text-foreground sm:hidden">S</span>
          </Link>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden lg:flex lg:gap-x-8">
          {mainNavItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`text-sm font-medium transition-colors ${
                pathname === item.href || pathname.includes(item.href.split('=')[1] || '') 
                  ? 'text-primary' 
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pr-10"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Utility Icons */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account/support" aria-label="Help">
                  <HelpCircle className="h-5 w-5" />
                </Link>
              </Button>
              <AccountLink />
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative" 
                onClick={openWishlist}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative" 
                onClick={openCart}
                aria-label="Shopping cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cart?.lines && cart.lines.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {cart.lines.length}
                  </Badge>
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile Right Section */}
        <div className="flex lg:hidden items-center space-x-2">
          {/* Mobile Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={openMobileMenu}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Mobile Cart */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative" 
            onClick={openCart}
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cart?.lines && cart.lines.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {cart.lines.length}
              </Badge>
            )}
          </Button>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={openMobileMenu}
            aria-label="Open mobile menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" 
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 h-screen z-[9999] w-full max-w-sm bg-background shadow-2xl border-l border-border overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2" onClick={closeMobileMenu}>
                <span className="sr-only">Home</span>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">Shella</span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeMobileMenu}
                aria-label="Close mobile menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Mobile Search */}
            <div className="px-6 py-4 border-b border-border">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>
            </div>

            {/* Mobile Navigation */}
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Shop
              </h3>
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href || pathname.includes(item.href.split('=')[1] || '') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Account Section */}
            <div className="px-6 py-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Account
              </h3>
              <div className="space-y-1">
                {accountNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={openWishlist}
                  className="flex items-center space-x-2"
                >
                  <Heart className="h-4 w-4" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="px-6 py-4 border-t border-border mt-auto">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>© 2024 Shella</span>
                <Link href="/account/support" onClick={closeMobileMenu}>
                  Help
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <EnhancedCartModal isOpen={isCartOpen} onClose={closeCart} />
      <WishlistModal isOpen={isWishlistOpen} onClose={closeWishlist} />
    </header>
  );
} 