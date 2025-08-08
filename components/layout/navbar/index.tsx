'use client';

import { Heart, HelpCircle, Home, Menu, Search, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
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

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart } = useEnhancedCart();
  const { wishlistCount } = useWishlist();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      closeMobileMenu();
    }
  };

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
        <div className="hidden lg:flex lg:gap-x-12">
          <Link href="/search" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="/search?collection=hydrogen" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
            Hydrogen
          </Link>
          <Link href="/search?collection=oxygen" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
            Oxygen
          </Link>
          <Link href="/search?collection=accessories" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
            Accessories
          </Link>
        </div>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <div className="flex items-center space-x-6">
            {/* Call to Action */}
            <div className="flex items-center space-x-2">
              <Link href="/search?sale=true" className="text-sm font-medium hover:text-primary transition-colors text-foreground">
                BUY NOW!
              </Link>
              <Badge variant="destructive" className="text-xs">SALE</Badge>
            </div>

            {/* Utility Icons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <AccountLink />
              <Button variant="ghost" size="icon" className="relative" onClick={openWishlist}>
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
              <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
                <ShoppingBag className="h-5 w-5" />
                {cart?.totalQuantity && cart.totalQuantity > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {cart.totalQuantity}
                  </Badge>
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={openMobileMenu}
            aria-label="Open mobile menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[999999] pointer-events-auto" style={{ height: '100vh', width: '100vw' }}>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
            style={{ height: '100vh', width: '100vw' }}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-sm overflow-y-auto bg-background border-l border-border shadow-2xl z-[999999]" style={{ height: '100vh' }}>
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2" onClick={closeMobileMenu}>
                <span className="sr-only">Home</span>
                <Home className="h-6 w-6 text-foreground" />
                <span className="font-bold text-xl text-foreground">Shella</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={closeMobileMenu}
                aria-label="Close mobile menu"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <div className="px-4 py-6 bg-background" style={{ minHeight: 'calc(100vh - 120px)' }}>
              {/* Mobile Search */}
              <div className="mb-6">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1">
                <Link
                  href="/"
                  className="block rounded-lg px-3 py-3 text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <Link
                  href="/search"
                  className="block rounded-lg px-3 py-3 text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={closeMobileMenu}
                >
                  Products
                </Link>
                <Link
                  href="/search?collection=hydrogen"
                  className="block rounded-lg px-3 py-3 text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={closeMobileMenu}
                >
                  Hydrogen
                </Link>
                <Link
                  href="/search?collection=oxygen"
                  className="block rounded-lg px-3 py-3 text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={closeMobileMenu}
                >
                  Oxygen
                </Link>
                <Link
                  href="/search?collection=accessories"
                  className="block rounded-lg px-3 py-3 text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={closeMobileMenu}
                >
                  Accessories
                </Link>
              </div>

              {/* Mobile Sale Link */}
              <div className="mt-6 pt-6 border-t border-border">
                <Link 
                  href="/search?sale=true" 
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors font-semibold p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={closeMobileMenu}
                >
                  <span>SALE</span>
                  <Badge variant="destructive" className="text-xs">HOT</Badge>
                </Link>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                    <AccountLink />
                    <Button variant="ghost" size="icon" className="relative h-10 w-10" onClick={openWishlist}>
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
                    <Button variant="ghost" size="icon" className="relative h-10 w-10" onClick={openCart}>
                      <ShoppingBag className="h-5 w-5" />
                      {cart?.totalQuantity && cart.totalQuantity > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                        >
                          {cart.totalQuantity}
                        </Badge>
                      )}
                    </Button>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <EnhancedCartModal isOpen={isCartOpen} onClose={closeCart} />
      
      {/* Wishlist Modal */}
      <WishlistModal 
        isOpen={isWishlistOpen} 
        onClose={closeWishlist}
      />
    </header>
  );
}
