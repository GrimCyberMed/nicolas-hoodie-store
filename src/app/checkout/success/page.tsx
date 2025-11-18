'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  const router = useRouter();

  // Generate a random order number for demo
  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Thank you for your purchase
          </p>

          {/* Order Number */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-2xl font-bold text-foreground">{orderNumber}</p>
          </div>

          {/* Order Details */}
          <div className="bg-background border border-border rounded-lg p-6 mb-6 text-left">
            <h2 className="text-lg font-semibold text-foreground mb-4">What's Next?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-background rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Order Confirmation Email</p>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation email with your order details
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-background rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Your order is being prepared for shipment
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-background rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Shipping Notification</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive tracking information once shipped
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">
                Estimated delivery: 5-7 business days
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/profile" className="flex-1">
              <Button variant="outline" className="w-full">
                View Order Details
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Need help with your order?
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link href="/contact" className="text-accent hover:underline">
              Contact Support
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/faq" className="text-accent hover:underline">
              FAQ
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/shipping" className="text-accent hover:underline">
              Shipping Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
