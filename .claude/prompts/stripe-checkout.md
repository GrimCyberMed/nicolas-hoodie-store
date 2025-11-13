# Stripe Checkout Context

## Command: `/custom stripe-checkout`

## Purpose
Integrate Stripe payment processing using Stripe Checkout (hosted payment page).

## Context
Stripe Checkout provides a pre-built, hosted payment page for easy integration.

## Installation

```bash
npm install stripe @stripe/stripe-js
```

## Environment Variables

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Stripe Client Setup

```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})
```

## Checkout Flow

### Step 1: Create Checkout Session (API Route)

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.imageUrl],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
    })
    
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
```

### Step 2: Checkout Button Component

```typescript
'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'

export default function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const items = useCartStore(state => state.items)
  
  async function handleCheckout() {
    setIsLoading(true)
    setError(null)
    
    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }
      
      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }
  
  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        disabled={isLoading || items.length === 0}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Proceed to Checkout'}
      </button>
    </div>
  )
}
```

### Step 3: Success Page

```typescript
// app/success/page.tsx
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'

interface SuccessPageProps {
  searchParams: {
    session_id?: string
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id
  
  if (!sessionId) {
    redirect('/')
  }
  
  // Retrieve session details
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase.
        </p>
        
        <div className="bg-gray-50 p-4 rounded mb-6">
          <p className="text-sm text-gray-600">Order Number</p>
          <p className="font-mono font-bold">{session.id}</p>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          A confirmation email has been sent to {session.customer_details?.email}
        </p>
        
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  )
}
```

## Webhooks (Order Processing)

### Step 1: Create Webhook Endpoint

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
  
  // Handle event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      
      // Save order to database
      await createOrder(session)
      
      // Send confirmation email
      await sendConfirmationEmail(session)
      
      console.log('Order created:', session.id)
      break
      
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment succeeded:', paymentIntent.id)
      break
      
    default:
      console.log('Unhandled event type:', event.type)
  }
  
  return NextResponse.json({ received: true })
}

async function createOrder(session: Stripe.Checkout.Session) {
  // Save order to Supabase
  const { supabase } = await import('@/lib/supabase')
  
  await supabase.from('orders').insert({
    stripe_session_id: session.id,
    customer_email: session.customer_details?.email,
    amount_total: session.amount_total,
    status: 'completed',
  })
}

async function sendConfirmationEmail(session: Stripe.Checkout.Session) {
  // Send email using Resend
  // Implementation here
}
```

### Step 2: Configure Webhook in Stripe

1. **Stripe Dashboard → Developers → Webhooks**
2. **Add endpoint:** `https://your-domain.com/api/webhooks/stripe`
3. **Select events:** 
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. **Copy signing secret** to `.env.local`

### Step 3: Test Webhook Locally

```bash
# Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Get webhook secret
stripe listen --print-secret
```

## Test Cards

```typescript
// Test card numbers for development
const testCards = {
  success: '4242 4242 4242 4242',
  decline: '4000 0000 0000 0002',
  requiresAuth: '4000 0025 0000 3155',
}

// Expiry: Any future date
// CVC: Any 3 digits
// ZIP: Any 5 digits
```

## Clear Cart After Purchase

```typescript
'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const clearCart = useCartStore(state => state.clearCart)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  useEffect(() => {
    if (sessionId) {
      // Clear cart after successful payment
      clearCart()
    }
  }, [sessionId, clearCart])
  
  // ... rest of component
}
```

## Error Handling

```typescript
async function handleCheckout() {
  try {
    setIsLoading(true)
    setError(null)
    
    const response = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Checkout failed')
    }
    
    const { url } = await response.json()
    window.location.href = url
    
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Something went wrong')
    console.error('Checkout error:', err)
  } finally {
    setIsLoading(false)
  }
}
```

## Advanced: Custom Checkout Form (Optional)

```typescript
// For more control, use Stripe Elements
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CustomCheckout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!stripe || !elements) return
    
    const cardElement = elements.getElement(CardElement)
    
    // Create payment intent on backend
    // Confirm payment with card element
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay Now</button>
    </form>
  )
}
```

## Production Checklist

- [ ] Test cards work in test mode
- [ ] Switch to live API keys
- [ ] Configure live webhooks
- [ ] Test real payment flow
- [ ] Set up proper error logging
- [ ] Add order confirmation emails
- [ ] Save orders to database
- [ ] Update inventory after purchase
- [ ] Handle failed payments gracefully

## Security Best Practices

- ✅ Never expose secret keys in client code
- ✅ Verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Validate amounts on server-side
- ✅ Store minimal payment data (use Stripe IDs)
- ❌ Never store credit card numbers
- ❌ Never trust client-side amounts
- ❌ Never skip webhook signature verification

## Common Issues

### "Invalid API Key"
- Check environment variables are set
- Verify key format (sk_test_ or sk_live_)
- Restart dev server after changing .env

### "Webhook signature verification failed"
- Check webhook secret is correct
- Verify endpoint URL matches Stripe dashboard
- Test with Stripe CLI first

### Redirect not working
- Check success_url and cancel_url are absolute
- Verify NEXT_PUBLIC_SITE_URL is set
- Test with full URL (not localhost in production)

## Debugging

```typescript
// Log session details
console.log('Checkout session:', session.id)
console.log('Amount:', session.amount_total / 100)
console.log('Customer:', session.customer_details)

// Test webhook locally
// stripe trigger checkout.session.completed
```

## Notes
- Stripe Checkout handles PCI compliance
- Test mode uses test API keys
- Webhooks required for reliable order processing
- Clear cart only after successful payment
- Always verify webhooks signatures
