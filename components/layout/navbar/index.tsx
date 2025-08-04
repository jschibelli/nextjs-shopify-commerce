'use client';

import { Heart, HelpCircle, Home, Menu, ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useCart } from '@/components/cart/cart-context';
import CartModal from '@/components/cart/modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/components/wishlist/wishlist-context';
import WishlistModal from '@/components/wishlist/wishlist-modal';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <span className="sr-only">Home</span>
            <Home className="h-6 w-6 text-foreground" />
            <span className="font-bold text-xl text-foreground">Shella</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
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
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {/* Call to Action and Utility Icons */}
          <div className="hidden lg:flex items-center space-x-6">
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
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
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
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background border-l border-border px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                <span className="sr-only">Home</span>
                <Home className="h-6 w-6 text-foreground" />
                <span className="font-bold text-xl text-foreground">Shella</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  <Link
                    href="/"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/search"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    href="/search?collection=hydrogen"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hydrogen
                  </Link>
                  <Link
                    href="/search?collection=oxygen"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Oxygen
                  </Link>
                  <Link
                    href="/search?collection=accessories"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Accessories
                  </Link>
                </div>
                <div className="py-6">
                  <nav className="flex items-center space-x-4">
                    <Link href="/search?sale=true" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                      SALE
                    </Link>
                  </nav>
                  
                  <div className="flex items-center space-x-4 pt-4 border-t border-border">
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/account">
                        <User className="h-5 w-5" />
                      </Link>
                    </Button>
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
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={closeCart} />
      
      {/* Wishlist Modal */}
      <WishlistModal 
        isOpen={isWishlistOpen} 
        onClose={closeWishlist}
      />
    </header>
  );
}
