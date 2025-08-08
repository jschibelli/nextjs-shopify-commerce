'use client';

import { Heart, HelpCircle, Home, Menu, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AuthStatus } from '@/components/auth-status';
import { useEnhancedCart } from '@/components/cart/enhanced-cart-context';
import EnhancedCartModal from '@/components/cart/enhanced-cart-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
              <AuthStatus showUserInfo={false} />
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
        <div className="flex lg:hidden">
          <Button variant="ghost" size="icon" onClick={openMobileMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" onClick={closeMobileMenu} />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 h-screen z-[9999] w-full max-w-sm bg-background shadow-2xl border-l border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2" onClick={closeMobileMenu}>
                <span className="sr-only">Home</span>
                <Home className="h-6 w-6 text-foreground" />
                <span className="font-bold text-xl text-foreground">Shella</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="h-[calc(100vh-80px)] overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Navigation Links */}
                <div className="space-y-2">
                  <Link
                    href="/search"
                    className="block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-accent transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Products
                  </Link>
                  <Link
                    href="/search?collection=hydrogen"
                    className="block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-accent transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Hydrogen
                  </Link>
                  <Link
                    href="/search?collection=oxygen"
                    className="block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-accent transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Oxygen
                  </Link>
                  <Link
                    href="/search?collection=accessories"
                    className="block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-accent transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Accessories
                  </Link>
                </div>

                {/* Sale Section */}
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center space-x-2 mb-4">
                    <Link href="/search?sale=true" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      BUY NOW!
                    </Link>
                    <Badge variant="destructive" className="text-xs">SALE</Badge>
                  </div>
                  
                  {/* Mobile Auth Status */}
                  <div className="mb-4">
                    <AuthStatus />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
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
