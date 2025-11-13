# Frontend Component Context

## Command: `/custom frontend-component`

## Purpose
Create a reusable React component with TypeScript, following project conventions.

## Context
This is for the Hoodie E-Commerce Store built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## Requirements

### Component Structure
- Use functional component
- Add `'use client'` directive only if using hooks/interactivity
- Include TypeScript interface for props
- Use PascalCase for component name
- Export as default

### TypeScript
- Define interface for props
- Use proper types (avoid `any`)
- Include JSDoc comments for complex props
- Export interface if reusable

### Styling
- Use Tailwind CSS classes
- Mobile-first responsive design
- Group classes logically: layout → spacing → colors → effects
- Consider dark mode (optional for now)

### Best Practices
- Keep components small and focused (single responsibility)
- Extract repeated logic into custom hooks
- Add error boundaries for error states
- Include loading states where applicable
- Make accessible (semantic HTML, ARIA labels)

## Template

```typescript
'use client' // Only if needed

interface [ComponentName]Props {
  // Define props here
  id: string
  title: string
  // ... other props
}

/**
 * [Brief description of component]
 * @param props - Component props
 */
export default function [ComponentName]({ 
  id,
  title,
  // ... destructure props
}: [ComponentName]Props) {
  // Component logic here
  
  return (
    <div className="...">
      {/* JSX here */}
    </div>
  )
}
```

## Examples

### Product Card Component
```typescript
'use client'

import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl: string
  inStock: boolean
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  imageUrl,
  inStock 
}: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem)
  
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <div className="relative h-64 w-full mb-4">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      
      <p className="text-2xl font-bold text-blue-600 mb-4">
        ${price.toFixed(2)}
      </p>
      
      <button
        onClick={() => addItem({ id, name, price, imageUrl })}
        disabled={!inStock}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  )
}
```

### Button Component (Reusable)
```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2'
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }
  
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}
```

## Common Patterns

### With Loading State
```typescript
'use client'

import { useState } from 'react'

export default function ActionButton() {
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleAction() {
    setIsLoading(true)
    try {
      // Do something async
      await someAsyncFunction()
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <button disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Click Me'}
    </button>
  )
}
```

### With Error Handling
```typescript
'use client'

import { useState } from 'react'

export default function FormComponent() {
  const [error, setError] = useState<string | null>(null)
  
  async function handleSubmit() {
    try {
      setError(null)
      // Do something
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }
  
  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}
      {/* Form elements */}
    </div>
  )
}
```

## Checklist

When creating a component:
- [ ] Proper TypeScript interface defined
- [ ] `'use client'` only if using hooks/events
- [ ] Tailwind CSS for styling
- [ ] Mobile responsive
- [ ] Accessible (semantic HTML, labels)
- [ ] Error states handled
- [ ] Loading states where applicable
- [ ] Follows single responsibility principle
- [ ] Properly documented with comments

## Notes
- Server Components are default in Next.js App Router
- Only add `'use client'` when using useState, useEffect, onClick, etc.
- Keep components under 200 lines - split if larger
- Test on mobile sizes (Chrome DevTools)
