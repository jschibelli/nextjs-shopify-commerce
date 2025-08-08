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
import MobileAccount from './mobile-account';

export default function Navbar() {
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <span className="sr-only">Home</span>
            <Home className="h-6 w-6 text-foreground" />
            <span className="font-bold text-xl text-foreground">Shella</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
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
                className="w-56 pr-10"
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

        {/* Mobile menu button */}
        <div className="lg:hidden">
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
                <Home className="h-6 w-6 text-foreground" />
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
            
            <div className="p-6 space-y-6">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {/* Main Navigation */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Shop
                </h3>
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      pathname === item.href || pathname.includes(item.href.split('=')[1] || '') 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-foreground hover:bg-accent'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>



              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <MobileAccount onClose={closeMobileMenu} />
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
        </>
      )}

      {/* Enhanced Cart Modal */}
      <EnhancedCartModal isOpen={isCartOpen} onClose={closeCart} />

      {/* Wishlist Modal */}
      <WishlistModal isOpen={isWishlistOpen} onClose={closeWishlist} />
    </header>
  );
}
