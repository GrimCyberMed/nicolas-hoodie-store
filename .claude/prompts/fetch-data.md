# Data Fetching Context

## Command: `/custom fetch-data`

## Purpose
Fetch data from Supabase database in Next.js Server Components.

## Context
Using Supabase as PostgreSQL database with auto-generated API.

## Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type-safe helper
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          stock_quantity: number
          created_at: string
        }
      }
    }
  }
}
```

## Fetching in Server Components

```typescript
// app/products/page.tsx
import { supabase } from '@/lib/supabase'

export default async function ProductsPage() {
  // Fetch all products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', error)
    return <div>Error loading products</div>
  }
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {products?.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}
```

## Fetch Single Item

```typescript
// app/products/[id]/page.tsx
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error || !product) {
    notFound()
  }
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p className="text-2xl">${product.price}</p>
    </div>
  )
}
```

## Query Patterns

### Filter Data
```typescript
// Get products in stock
const { data } = await supabase
  .from('products')
  .select('*')
  .gt('stock_quantity', 0)

// Get products by category
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('category', 'hoodies')

// Get products in price range
const { data } = await supabase
  .from('products')
  .select('*')
  .gte('price', 20)
  .lte('price', 50)
```

### Sort Data
```typescript
// Sort by price (ascending)
const { data } = await supabase
  .from('products')
  .select('*')
  .order('price', { ascending: true })

// Sort by newest first
const { data } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false })
```

### Limit Results
```typescript
// Get first 10 products
const { data } = await supabase
  .from('products')
  .select('*')
  .limit(10)

// Pagination
const page = 1
const pageSize = 12
const { data } = await supabase
  .from('products')
  .select('*')
  .range(page * pageSize, (page + 1) * pageSize - 1)
```

### Search
```typescript
// Text search
const { data } = await supabase
  .from('products')
  .select('*')
  .ilike('name', '%hoodie%') // Case-insensitive

// Multiple conditions
const { data } = await supabase
  .from('products')
  .select('*')
  .or('name.ilike.%hoodie%,description.ilike.%hoodie%')
```

## Client-Side Fetching (When Needed)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  price: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
        
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

## Insert Data

```typescript
// Insert single product
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Black Hoodie',
    description: 'Premium quality',
    price: 49.99,
    stock_quantity: 100
  })
  .select()

// Insert multiple products
const { data, error } = await supabase
  .from('products')
  .insert([
    { name: 'Product 1', price: 29.99 },
    { name: 'Product 2', price: 39.99 }
  ])
  .select()
```

## Update Data

```typescript
// Update product
const { data, error } = await supabase
  .from('products')
  .update({ 
    price: 39.99,
    stock_quantity: 50 
  })
  .eq('id', productId)
  .select()

// Increment stock
const { data, error } = await supabase
  .rpc('increment_stock', {
    product_id: productId,
    quantity: 10
  })
```

## Delete Data

```typescript
// Delete single product
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId)

// Delete multiple with condition
const { error } = await supabase
  .from('products')
  .delete()
  .eq('stock_quantity', 0)
```

## Error Handling

```typescript
async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  
  if (error) {
    // Log error
    console.error('Database error:', error.message)
    
    // Return empty array or throw
    return []
  }
  
  return data
}
```

## Revalidation

```typescript
// Revalidate data on interval
export const revalidate = 60 // Revalidate every 60 seconds

export default async function ProductsPage() {
  const products = await getProducts()
  return <div>{/* ... */}</div>
}

// Or force dynamic rendering
export const dynamic = 'force-dynamic'
```

## Realtime Subscriptions (Advanced)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RealtimeProducts() {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    // Initial fetch
    fetchProducts()
    
    // Subscribe to changes
    const channel = supabase
      .channel('products')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'products' 
        }, 
        (payload) => {
          console.log('Change received!', payload)
          fetchProducts() // Refresh data
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  // ... rest of component
}
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Common Patterns

### Loading States
```typescript
export default async function Page() {
  // Show loading UI while fetching
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProductList />
    </Suspense>
  )
}
```

### Error Boundaries
```typescript
// error.tsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

## Type Safety

```typescript
// Define types
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock_quantity: number
  created_at: string
}

// Use in functions
async function getProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
  
  return data || []
}
```

## Best Practices

- ✅ Use Server Components for initial data fetch
- ✅ Handle errors gracefully
- ✅ Use TypeScript for type safety
- ✅ Implement loading states
- ✅ Cache data when possible (revalidate)
- ✅ Use pagination for large datasets
- ❌ Don't fetch in Client Components unless necessary
- ❌ Don't expose secret keys in client code
- ❌ Don't fetch data in loops

## Checklist

- [ ] Supabase client configured
- [ ] Environment variables set
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] TypeScript types defined
- [ ] Data properly displayed
- [ ] Performance optimized (pagination, limits)

## Debugging

```typescript
// Log queries
const { data, error } = await supabase
  .from('products')
  .select('*')

console.log('Data:', data)
console.log('Error:', error)

// Check in Supabase Dashboard
// Table Editor → Run manual queries
// API Docs → See auto-generated endpoints
```

## Notes
- Server Components are recommended for data fetching
- Client Components needed only for interactivity
- Supabase automatically generates REST API
- Use Row Level Security (RLS) in production
