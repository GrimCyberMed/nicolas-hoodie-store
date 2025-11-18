'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { CartItem } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  discountCode: string;
  onApplyDiscount: (code: string) => void;
  onDiscountApplied: (amount: number) => void;
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
  discountAmount,
  total,
  discountCode,
  onApplyDiscount,
  onDiscountApplied,
}: OrderSummaryProps) {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');

  const handleApplyDiscount = async () => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return;
    }

    setIsApplying(true);
    setError('');

    // Simulate API call to validate discount code
    setTimeout(() => {
      // For demo purposes, accept any code starting with "SAVE"
      if (code.toUpperCase().startsWith('SAVE')) {
        const discount = subtotal * 0.1; // 10% off
        onDiscountApplied(discount);
        onApplyDiscount(code);
        setError('');
      } else {
        setError('Invalid discount code');
      }
      setIsApplying(false);
    }, 500);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
      <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>

      {/* Items List */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity}
              </p>
              <p className="text-sm font-semibold text-foreground">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Discount Code */}
      {!discountCode && (
        <div className="mb-6">
          <label htmlFor="discount-code" className="block text-sm font-medium text-foreground mb-2">
            Discount Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="discount-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground text-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyDiscount}
              disabled={isApplying}
              className="px-4"
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      )}

      {/* Applied Discount */}
      {discountCode && (
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {discountCode} applied
              </span>
            </div>
            <button
              onClick={() => {
                onApplyDiscount('');
                onDiscountApplied(0);
                setCode('');
              }}
              className="text-xs text-green-600 dark:text-green-400 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-green-600 font-medium">-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-foreground font-medium">
            {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>

        {shippingCost > 0 && subtotal < 100 && (
          <div className="text-xs text-muted-foreground">
            Add ${(100 - subtotal).toFixed(2)} more for free shipping!
          </div>
        )}

        <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Security Badges */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
