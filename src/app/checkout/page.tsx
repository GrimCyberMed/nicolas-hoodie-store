'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { StripeProvider } from '@/providers/StripeProvider';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { ShippingAddress } from '@/types';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

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

  const handleShippingSubmit = async (address: ShippingAddress) => {
    setShippingAddress(address);
    setIsLoadingPayment(true);

    try {
      // Create payment intent
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
          metadata: {
            customer_email: address.email,
            customer_name: address.full_name,
            items_count: items.length,
          },
        }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setCurrentStep('payment');
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Create order in database
      if (shippingAddress) {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: user?.id || null,
            status: 'paid',
            total_amount: total,
            shipping_address: shippingAddress,
            payment_intent_id: paymentIntentId,
            discount_code: discountCode || null,
            discount_amount: discountAmount,
          }])
          .select()
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
        } else if (order) {
          // Create order items
          const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          }));

          await supabase.from('order_items').insert(orderItems);
        }
      }

      // Clear cart and redirect to success page
      clearCart();
      router.push(`/checkout/success?payment_intent=${paymentIntentId}`);
    } catch (error) {
      console.error('Error processing order:', error);
      // Still redirect to success since payment was successful
      clearCart();
      router.push('/checkout/success');
    }
  };

  const handleBackToShipping = () => {
    setCurrentStep('shipping');
    setClientSecret('');
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
                isLoading={isLoadingPayment}
              />
            )}

            {currentStep === 'payment' && shippingAddress && clientSecret && (
              <StripeProvider clientSecret={clientSecret}>
                <StripePaymentForm
                  onSuccess={handlePaymentSuccess}
                  onBack={handleBackToShipping}
                  total={total}
                />
              </StripeProvider>
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
