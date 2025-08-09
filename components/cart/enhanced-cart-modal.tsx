'use client';

import { Dialog, Transition } from '@headlessui/react';
import {
    HeartIcon,
    InformationCircleIcon,
    ShoppingCartIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import LoadingDots from 'components/loading-dots';
import Price from 'components/price';
import { DEFAULT_OPTION } from 'lib/constants';
import { createUrl } from 'lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { redirectToCheckout } from './actions';
import { DeleteItemButton } from './delete-item-button';
import { EditItemQuantityButton } from './edit-item-quantity-button';
import { useEnhancedCart } from './enhanced-cart-context';

type MerchandiseSearchParams = {
  [key: string]: string;
};

interface EnhancedCartModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function EnhancedCartModal({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose 
}: EnhancedCartModalProps = {}) {
  const { cart, analytics, clearCart } = useEnhancedCart();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? externalOnClose : setInternalIsOpen;
  
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Update ref when cart quantity changes
  if (cart?.totalQuantity !== quantityRef.current) {
    quantityRef.current = cart?.totalQuantity;
  }

  const handleSelectAll = () => {
    if (selectedItems.size === cart?.lines.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart?.lines.map(item => item.merchandise.id) || []));
    }
  };

  const handleSelectItem = (merchandiseId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(merchandiseId)) {
      newSelected.delete(merchandiseId);
    } else {
      newSelected.add(merchandiseId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkRemove = () => {
    // This would need to be implemented with the API
    console.log('Bulk remove selected items:', selectedItems);
    setSelectedItems(new Set());
  };

  const handleSaveForLater = () => {
    // This would need to be implemented with wishlist functionality
    console.log('Save for later selected items:', selectedItems);
    setSelectedItems(new Set());
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
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
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[450px] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold">My Cart</p>
                  {cart && cart.totalQuantity > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                      {cart.totalQuantity}
                    </span>
                  )}
                </div>
                <button aria-label="Close cart" onClick={closeCart}>
                  <CloseCart />
                </button>
              </div>

              {!cart || cart.lines.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <ShoppingCartIcon className="h-16" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Your cart is empty.
                  </p>
                  <p className="mt-2 text-center text-sm text-neutral-500">
                    Start shopping to add items to your cart.
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  {/* Cart Analytics */}
                  <div className="mb-4 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="flex items-center space-x-2 text-sm font-medium"
                      >
                        <InformationCircleIcon className="h-4 w-4" />
                        <span>Cart Analytics</span>
                      </button>
                      <span className="text-xs text-neutral-500">
                        {analytics.uniqueItems} unique items
                      </span>
                    </div>
                    {showAnalytics && (
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Total Items:</span>
                          <span>{analytics.totalItems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Price:</span>
                          <span>${analytics.averageItemPrice.toFixed(2)}</span>
                        </div>
                        {analytics.mostExpensiveItem && (
                          <div className="flex justify-between">
                            <span>Most Expensive:</span>
                            <span>{analytics.mostExpensiveItem.merchandise.product.title}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bulk Actions */}
                  {cart.lines.length > 1 && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.size === cart.lines.length}
                          onChange={handleSelectAll}
                          className="rounded border-neutral-300"
                        />
                        <span className="text-sm">Select All</span>
                      </div>
                      {selectedItems.size > 0 && (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveForLater}
                            className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <HeartIcon className="h-3 w-3" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={handleBulkRemove}
                            className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <TrashIcon className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cart Items */}
                  <ul className="grow overflow-auto py-4">
                    {cart.lines
                      .sort((a, b) =>
                        a.merchandise.product.title.localeCompare(
                          b.merchandise.product.title
                        )
                      )
                      .map((item, i) => {
                        const merchandiseSearchParams =
                          {} as MerchandiseSearchParams;

                        item.merchandise.selectedOptions.forEach(
                          ({ name, value }) => {
                            if (value !== DEFAULT_OPTION) {
                              merchandiseSearchParams[name.toLowerCase()] =
                                value;
                            }
                          }
                        );

                        const merchandiseUrl = createUrl(
                          `/product/${item.merchandise.product.handle}`,
                          new URLSearchParams(merchandiseSearchParams)
                        );

                        return (
                          <li
                            key={i}
                            className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                          >
                            <div className="relative flex w-full flex-row justify-between px-1 py-4">
                              {/* Selection Checkbox */}
                              {cart.lines.length > 1 && (
                                <div className="absolute left-0 top-4 z-50">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.merchandise.id)}
                                    onChange={() => handleSelectItem(item.merchandise.id)}
                                    className="rounded border-neutral-300"
                                  />
                                </div>
                              )}
                              
                              <div className="absolute z-40 -ml-1 -mt-2 right-0 top-0">
                                                                  <DeleteItemButton
                                    item={item}
                                    optimisticUpdate={(id: string, type: string) => {
                                      // This would need to be connected to the enhanced cart context
                                      console.log('Delete item:', id, type);
                                    }}
                                  />
                              </div>
                              
                              <div className="flex flex-row ml-6">
                                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                  <Image
                                    className="h-full w-full object-cover"
                                    width={64}
                                    height={64}
                                    alt={
                                      item.merchandise.product.featuredImage
                                        .altText ||
                                      item.merchandise.product.title
                                    }
                                    src={
                                      item.merchandise.product.featuredImage.url
                                    }
                                  />
                                </div>
                                <Link
                                  href={merchandiseUrl}
                                  onClick={closeCart}
                                  className="z-30 ml-2 flex flex-row space-x-4"
                                >
                                  <div className="flex flex-1 flex-col text-base">
                                    <span className="leading-tight">
                                      {item.merchandise.product.title}
                                    </span>
                                    {item.merchandise.title !==
                                    DEFAULT_OPTION ? (
                                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {item.merchandise.title}
                                      </p>
                                    ) : null}
                                  </div>
                                </Link>
                              </div>
                              <div className="flex h-16 flex-col justify-between">
                                <Price
                                  className="flex justify-end space-y-2 text-right text-sm"
                                  amount={item.cost.totalAmount.amount}
                                  currencyCode={
                                    item.cost.totalAmount.currencyCode
                                  }
                                />
                                <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                  <EditItemQuantityButton
                                    item={item}
                                    type="minus"
                                    optimisticUpdate={(id: string, type: string) => {
                                      // This would need to be connected to the enhanced cart context
                                      console.log('Update quantity:', id, type);
                                    }}
                                  />
                                  <p className="w-6 text-center">
                                    <span className="w-full text-sm">
                                      {item.quantity}
                                    </span>
                                  </p>
                                  <EditItemQuantityButton
                                    item={item}
                                    type="plus"
                                    optimisticUpdate={(id: string, type: string) => {
                                      // This would need to be connected to the enhanced cart context
                                      console.log('Update quantity:', id, type);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                  
                  {/* Cart Summary */}
                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>Subtotal</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cart.cost.subtotalAmount.amount}
                        currencyCode={cart.cost.subtotalAmount.currencyCode}
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Taxes</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cart.cost.totalTaxAmount.amount}
                        currencyCode={cart.cost.totalTaxAmount.currencyCode}
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Shipping</p>
                      <p className="text-right">Calculated at checkout</p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p className="font-semibold">Total</p>
                      <Price
                        className="text-right text-base font-semibold text-black dark:text-white"
                        amount={cart.cost.totalAmount.amount}
                        currencyCode={cart.cost.totalAmount.currencyCode}
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <form action={redirectToCheckout}>
                      <CheckoutButton />
                    </form>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleClearCart}
                        className="flex-1 rounded-full border border-neutral-300 p-3 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        Clear Cart
                      </button>
                      <button
                        onClick={() => {
                          // This would need to be implemented
                          console.log('Continue shopping');
                          closeCart();
                        }}
                        className="flex-1 rounded-full border border-neutral-300 p-3 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        Continue Shopping
                      </button>
                    </div>
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

function CloseCart({ className }: { className?: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <XMarkIcon
        className={clsx(
          'h-6 transition-all ease-in-out hover:scale-110',
          className
        )}
      />
    </div>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100"
      type="submit"
      disabled={pending}
    >
      {pending ? <LoadingDots className="bg-white" /> : 'Proceed to Checkout'}
    </button>
  );
} 