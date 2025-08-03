'use client';

import { Heart, HelpCircle, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl" style={{ fontFamily: 'cursive' }}>Shella</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                <span>LAYOUTS</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                <span>SHOP</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                <span>BLOG</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                <span>GALLERY</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors">
                <span>PAGES</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <Link href="/search?category=womens" className="text-sm font-medium hover:text-primary transition-colors">
              WOMEN'S
            </Link>
            <Link href="/search?category=mens" className="text-sm font-medium hover:text-primary transition-colors">
              MEN'S
            </Link>
          </nav>

          {/* Call to Action and Utility Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Call to Action */}
            <div className="flex items-center space-x-2">
              <Link href="/search?sale=true" className="text-sm font-medium hover:text-primary transition-colors">
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
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="text-xs ml-1">Bag (0)</span>
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="pb-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">SEARCH</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="px-4 py-4 space-y-4">
            <nav className="space-y-2">
              <Link
                href="/search?category=womens"
                className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                WOMEN'S
              </Link>
              <Link
                href="/search?category=mens"
                className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                MEN'S
              </Link>
              <Link
                href="/search?category=accessories"
                className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ACCESSORIES
              </Link>
              <Link
                href="/search?sale=true"
                className="block py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SALE
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4 pt-4 border-t">
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="text-xs ml-1">Bag (0)</span>
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
