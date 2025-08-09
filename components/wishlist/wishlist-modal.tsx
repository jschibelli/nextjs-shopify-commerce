'use client';

import { Button } from 'components/ui/button';
import { Heart, ShoppingBag, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from './wishlist-context';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist();

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const closeWishlist = () => {
    onClose();
  };

  if (!isOpen) return null;

  const totalValue = wishlistItems.reduce((sum, item) => {
    const price = parseFloat(item.priceRange.maxVariantPrice.amount);
    return sum + price;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={closeWishlist}
        aria-hidden="true"
      />
      
      {/* Modal Panel */}
      <div className="relative h-full w-full max-w-md bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold">Your Wishlist</h2>
              {wishlistItems.length > 0 && (
                <span className="text-sm text-neutral-500">
                  ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeWishlist}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-neutral-100 mx-auto"></div>
                  <p className="mt-2 text-sm text-neutral-500">Loading wishlist...</p>
                </div>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
                <Heart className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                  Save items you love to your wishlist for easy access later.
                </p>
                <Button onClick={closeWishlist} className="w-full">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="p-4">
                {/* Summary */}
                <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Total Value:</span>
                    <span className="font-medium">
                      {wishlistItems[0]?.priceRange.maxVariantPrice.currencyCode || 'USD'} {totalValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700 pb-4"
                    >
                      <div className="relative flex w-full flex-row justify-between">
                        <div className="flex flex-row">
                          <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                            {item.featuredImage?.url ? (
                              <Image
                                className="h-full w-full object-cover"
                                width={64}
                                height={64}
                                alt={item.featuredImage.altText || item.title}
                                src={item.featuredImage.url}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Heart className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <Link
                            href={`/product/${item.handle}`}
                            onClick={closeWishlist}
                            className="z-30 ml-2 flex flex-row space-x-4"
                          >
                            <div className="flex flex-1 flex-col text-base">
                              <span className="leading-tight line-clamp-2">
                                {item.title}
                              </span>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Product
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm font-medium">
                                  {item.priceRange.maxVariantPrice.currencyCode} {parseFloat(item.priceRange.maxVariantPrice.amount).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs"
                          >
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {wishlistItems.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-2">
              <Button onClick={closeWishlist} variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 