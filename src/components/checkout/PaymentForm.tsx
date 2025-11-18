'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PaymentFormProps {
  onSubmit: (paymentMethodId: string) => void;
  onBack: () => void;
  total: number;
}

export function PaymentForm({ onSubmit, onBack, total }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }

    // Limit CVV to 3-4 digits
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'card') {
      const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');
      if (!cardNumberClean) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
        newErrors.cardNumber = 'Invalid card number';
      }

      if (!cardData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }

      if (!cardData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
        newErrors.expiryDate = 'Invalid expiry date (MM/YY)';
      }

      if (!cardData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (cardData.cvv.length < 3) {
        newErrors.cvv = 'Invalid CVV';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      onSubmit('payment_method_id_' + Date.now());
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Payment Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                paymentMethod === 'card'
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium">Credit Card</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('paypal')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                paymentMethod === 'paypal'
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.653h8.53c2.347 0 4.203.645 5.072 1.765.78.998.98 2.314.58 3.805-.014.053-.029.104-.045.155-.013.044-.026.088-.04.132l-.004.013-.005.015c-.36 1.157-.93 2.07-1.697 2.717-.83.7-1.91 1.05-3.21 1.05h-1.94a.77.77 0 0 0-.76.653l-.045.289-.503 3.18-.024.15-.013.082-.004.025-.003.015a.641.641 0 0 1-.633.74z"/>
                </svg>
                <span className="font-medium">PayPal</span>
              </div>
            </button>
          </div>
        </div>

        {/* Card Payment Form */}
        {paymentMethod === 'card' && (
          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-foreground mb-1">
                Card Number *
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleCardChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
              />
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>

            {/* Cardholder Name */}
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-foreground mb-1">
                Cardholder Name *
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={cardData.cardName}
                onChange={handleCardChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
              />
              {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
            </div>

            {/* Expiry Date & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-foreground mb-1">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleCardChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                />
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-foreground mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleCardChange}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </div>
        )}

        {/* PayPal Message */}
        {paymentMethod === 'paypal' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You will be redirected to PayPal to complete your purchase securely.
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground">Secure Payment</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isProcessing}
          >
            Back to Shipping
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay $${total.toFixed(2)}`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
