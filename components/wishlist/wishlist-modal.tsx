'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Heart, ShoppingCart, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { useWishlist } from './wishlist-context';

interface WishlistModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function WishlistModal({ isOpen: externalIsOpen, onClose: externalOnClose }: WishlistModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { wishlistItems, removeFromWishlist, isLoading, isAuthenticated } = useWishlist();
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? externalOnClose : setInternalIsOpen;
  
  const openWishlist = () => setIsOpen(true);
  const closeWishlist = () => setIsOpen(false);

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      await removeFromWishlist(itemId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const addToCart = async (item: any) => {
    // This would integrate with your cart system
    console.log('Adding to cart:', item);
    // You can implement cart integration here
  };

  return (
    <>
      <Transition show={isOpen}>
        <Dialog onClose={closeWishlist} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[390px] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">My Wishlist</p>
                <button aria-label="Close wishlist" onClick={closeWishlist}>
                  <CloseWishlist />
                </button>
              </div>

              {isLoading ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  <p className="mt-4 text-center text-sm">Loading wishlist...</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <Heart className="h-16 text-muted-foreground" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Please log in to view your wishlist.
                  </p>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Your wishlist items will be saved to your account.
                  </p>
                  <Link href="/login" onClick={closeWishlist}>
                    <Button className="mt-4">
                      Log In
                    </Button>
                  </Link>
                </div>
              ) : !wishlistItems || wishlistItems.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <Heart className="h-16 text-muted-foreground" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Your wishlist is empty.
                  </p>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Start adding items you love!
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="grow overflow-auto py-4 space-y-4">
                    {wishlistItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700 pb-4"
                      >
                        <div className="relative flex w-full flex-row justify-between">
                          <div className="flex flex-row">
                            <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                              {item.image && item.image !== '/api/placeholder/150/150' ? (
                                <Image
                                  className="h-full w-full object-cover"
                                  width={64}
                                  height={64}
                                  alt={item.name}
                                  src={item.image}
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
                                  {item.name}
                                </span>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                  {item.category}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-sm font-medium">
                                    ${item.price.toFixed(2)}
                                  </span>
                                  {item.originalPrice > item.price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      ${item.originalPrice.toFixed(2)}
                                    </span>
                                  )}
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
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToCart(item)}
                              disabled={!item.inStock}
                              className="text-xs"
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Add to Cart
                            </Button>
                            <Badge 
                              variant={item.inStock ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {item.inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="py-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Total Items:</span>
                      <span className="text-sm font-bold">{wishlistItems.length}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Total Value:</span>
                      <span className="text-sm font-bold">
                        ${wishlistItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        // Add all items to cart
                        wishlistItems.forEach(item => addToCart(item));
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add All to Cart
                    </Button>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

function CloseWishlist({ className }: { className?: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <X
        className={clsx(
          'h-6 transition-all ease-in-out hover:scale-110',
          className
        )}
      />
    </div>
  );
} 