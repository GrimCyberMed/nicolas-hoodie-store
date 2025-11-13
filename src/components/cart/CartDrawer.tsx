'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from './CartItem';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const { items, isOpen, closeCart, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Shopping Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-16 h-16 text-secondary mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-foreground font-medium mb-2">Your cart is empty</p>
              <p className="text-secondary text-sm mb-4">Add some products to get started!</p>
              <Button onClick={closeCart} variant="primary" size="sm">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">Subtotal</span>
              <span className="text-xl font-bold text-foreground">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Shipping Notice */}
            <p className="text-xs text-secondary">
              Shipping and taxes calculated at checkout
            </p>

            {/* Checkout Button */}
            <Link href="/cart" onClick={closeCart}>
              <Button variant="primary" size="lg" className="w-full">
                View Cart & Checkout
              </Button>
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={closeCart}
              className="w-full text-center text-sm text-secondary hover:text-accent transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
