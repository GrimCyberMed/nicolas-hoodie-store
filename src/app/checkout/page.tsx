'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import type { ShippingAddress } from '@/types';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to your cart before checking out.</p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-3 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal - discountAmount + shippingCost;

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (paymentMethodId: string) => {
    // TODO: Implement Stripe payment processing
    // const stripe = await stripePromise;
    // const result = await stripe.confirmCardPayment(paymentMethodId);
    
    // For now, simulate successful payment
    setTimeout(() => {
      clearCart();
      router.push('/checkout/success');
    }, 1500);
  };

  const handleBackToShipping = () => {
    setCurrentStep('shipping');
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase</p>
        </div>

        {/* Progress Steps */}
        <CheckoutSteps currentStep={currentStep} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2">
            {currentStep === 'shipping' && (
              <ShippingForm 
                onSubmit={handleShippingSubmit}
                initialData={shippingAddress}
              />
            )}

            {currentStep === 'payment' && shippingAddress && (
              <PaymentForm
                onSubmit={handlePaymentSubmit}
                onBack={handleBackToShipping}
                total={total}
              />
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              discountAmount={discountAmount}
              total={total}
              discountCode={discountCode}
              onApplyDiscount={setDiscountCode}
              onDiscountApplied={setDiscountAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
