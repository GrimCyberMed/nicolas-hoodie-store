# Shopping Cart Context

## Command: `/custom shopping-cart`

## Purpose
Implement shopping cart functionality using Zustand for state management.

## Context
Global state management for cart items, quantities, and totals.

## Installation

```bash
npm install zustand
```

## Zustand Store Setup

```typescript
// store/cartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => set((state) => {
        const existingItem = state.items.find(item => item.id === product.id)
        
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        }
        
        return {
          items: [...state.items, { ...product, quantity: 1 }]
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(item => item.id !== id)
          }
        }
        
        return {
          items: state.items.map(item =>
            item.id === id
              ? { ...item, quantity }
              : item
          )
        }
      }),
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => 
          total + (item.price * item.quantity), 0
        )
      },
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
)
```

## Using the Cart Store

### Add to Cart Button

```typescript
'use client'

import { useCartStore } from '@/store/cartStore'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore(state => state.addItem)
  
  const handleAddToCart = () => {
    addItem(product)
    // Optional: Show toast notification
    alert('Added to cart!')
  }
  
  return (
    <button
      onClick={handleAddToCart}
      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Add to Cart
    </button>
  )
}
```

### Cart Icon with Count

```typescript
'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'

export default function CartIcon() {
  const totalItems = useCartStore(state => state.getTotalItems())
  
  return (
    <Link href="/cart" className="relative">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  )
}
```

## Cart Page

```typescript
// app/cart/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'

export default function CartPage() {
  const items = useCartStore(state => state.items)
  const removeItem = useCartStore(state => state.removeItem)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const getTotalPrice = useCartStore(state => state.getTotalPrice())
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/products">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Continue Shopping
          </button>
        </Link>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg border">
              <div className="relative w-24 h-24">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 border rounded"
                  >
                    -
                  </button>
                  
                  <span className="px-4">{item.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              <div className="font-bold">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${getTotalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${getTotalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <Link href="/checkout">
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Proceed to Checkout
            </button>
          </Link>
          
          <Link href="/products">
            <button className="w-full py-3 mt-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

## Cart Item Component (Reusable)

```typescript
'use client'

import Image from 'next/image'
import { useCartStore, CartItem } from '@/store/cartStore'

interface CartItemCardProps {
  item: CartItem
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const removeItem = useCartStore(state => state.removeItem)
  
  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border">
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={80}
        height={80}
        className="rounded"
      />
      
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
        
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
            aria-label="Decrease quantity"
          >
            -
          </button>
          
          <span className="text-sm font-medium">{item.quantity}</span>
          
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.id)}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Remove
        </button>
        
        <p className="font-bold">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  )
}
```

## Mini Cart (Dropdown)

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'

export default function MiniCart() {
  const [isOpen, setIsOpen] = useState(false)
  const items = useCartStore(state => state.items)
  const getTotalPrice = useCartStore(state => state.getTotalPrice())
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        
        {items.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <h3 className="font-bold mb-4">Shopping Cart</h3>
            
            {items.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">${getTotalPrice.toFixed(2)}</span>
                  </div>
                  
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      View Cart
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

## Helper Functions

```typescript
// lib/cartUtils.ts

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  )
}

export function calculateTax(subtotal: number, taxRate: number = 0.08): number {
  return subtotal * taxRate
}

export function calculateShipping(items: CartItem[]): number {
  // Free shipping over $50
  const subtotal = calculateSubtotal(items)
  return subtotal >= 50 ? 0 : 5.99
}
```

## Best Practices

- ✅ Persist cart to localStorage (Zustand persist)
- ✅ Handle quantity updates smoothly
- ✅ Show empty cart state
- ✅ Display item count in header
- ✅ Allow removing items
- ✅ Calculate totals accurately
- ✅ Mobile-responsive cart UI
- ❌ Don't fetch cart from database (use local state)
- ❌ Don't allow negative quantities
- ❌ Don't forget to clear cart after purchase

## Checklist

- [ ] Zustand store configured
- [ ] Persist middleware enabled
- [ ] Add to cart working
- [ ] Update quantity working
- [ ] Remove item working
- [ ] Cart page displays correctly
- [ ] Cart icon shows count
- [ ] Empty state handled
- [ ] Totals calculate correctly
- [ ] Mobile responsive

## Testing Checklist

- [ ] Add same product twice (quantity increases)
- [ ] Remove item from cart
- [ ] Update quantity to 0 (removes item)
- [ ] Clear cart works
- [ ] Cart persists on page refresh
- [ ] Cart icon shows correct count
- [ ] Totals calculate correctly

## Notes
- Zustand is simpler than Redux
- Persist middleware saves to localStorage
- Cart clears on successful purchase
- Consider adding wishlist later
