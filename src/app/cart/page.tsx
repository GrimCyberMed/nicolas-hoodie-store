'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartItem } from '@/components/cart/CartItem';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="w-24 h-24 text-secondary mx-auto mb-6"
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
              <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
              <p className="text-secondary mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link href="/products">
                <Button variant="primary" size="lg">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Cart Items ({items.length})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-sm text-secondary hover:text-red-500 transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">Subtotal</span>
                      <span className="text-foreground font-medium">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">Shipping</span>
                      <span className="text-foreground font-medium">
                        Calculated at checkout
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">Tax</span>
                      <span className="text-foreground font-medium">
                        Calculated at checkout
                      </span>
                    </div>
                    
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-foreground">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" className="w-full mb-3">
                    Proceed to Checkout
                  </Button>

                  <Link href="/products">
                    <Button variant="outline" size="md" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-start gap-3 text-sm text-secondary">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p>
                        Secure checkout powered by Stripe. Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
