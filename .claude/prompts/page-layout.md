# Page Layout Context

## Command: `/custom page-layout`

## Purpose
Create a Next.js page with proper layout, routing, and SEO.

## Context
Using Next.js 14 App Router with file-based routing and layouts.

## File Structure

```
app/
├── page.tsx              # Homepage (/)
├── layout.tsx            # Root layout (wraps all pages)
├── products/
│   ├── page.tsx         # Products list (/products)
│   └── [id]/
│       └── page.tsx     # Product detail (/products/123)
├── cart/
│   └── page.tsx         # Cart page (/cart)
└── checkout/
    └── page.tsx         # Checkout (/checkout)
```

## Page Template

```typescript
// app/products/page.tsx
import { Metadata } from 'next'

// SEO Metadata
export const metadata: Metadata = {
  title: 'Products | Hoodie Store',
  description: 'Browse our collection of premium hoodies',
}

// Server Component (default)
export default async function ProductsPage() {
  // Fetch data here if needed
  
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          Our Products
        </h1>
        
        {/* Page content */}
      </div>
    </main>
  )
}
```

## Dynamic Routes

```typescript
// app/products/[id]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: {
    id: string
  }
}

// Generate metadata dynamically
export async function generateMetadata({ 
  params 
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id)
  
  if (!product) {
    return {
      title: 'Product Not Found'
    }
  }
  
  return {
    title: `${product.name} | Hoodie Store`,
    description: product.description,
  }
}

export default async function ProductPage({ 
  params 
}: ProductPageProps) {
  const product = await getProduct(params.id)
  
  if (!product) {
    notFound() // Shows 404 page
  }
  
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1>{product.name}</h1>
        {/* Product details */}
      </div>
    </main>
  )
}
```

## Layout Template

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Hoodie Store | Premium Custom Hoodies',
    template: '%s | Hoodie Store'
  },
  description: 'Shop premium custom hoodies with fast shipping',
  keywords: ['hoodies', 'custom apparel', 'streetwear'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

## Loading States

```typescript
// app/products/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )
}
```

## Error Handling

```typescript
// app/products/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Something went wrong!
        </h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

## Not Found Page

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Page not found</p>
        <Link 
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
```

## Navigation Links

```typescript
// Use Next.js Link for navigation
import Link from 'next/link'

<Link 
  href="/products"
  className="text-blue-600 hover:underline"
>
  View Products
</Link>

// With dynamic routes
<Link href={`/products/${product.id}`}>
  View Details
</Link>
```

## Common Page Layouts

### Homepage
```typescript
export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Premium Custom Hoodies
          </h1>
          <p className="text-xl mb-8">
            Quality you can feel, style you can see
          </p>
          <Link href="/products">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg">
              Shop Now
            </button>
          </Link>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          {/* Product grid */}
        </div>
      </section>
    </main>
  )
}
```

### Product Grid Page
```typescript
export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">All Products</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </main>
  )
}
```

## SEO Best Practices

```typescript
// Rich metadata
export const metadata: Metadata = {
  title: 'Product Name | Hoodie Store',
  description: 'Detailed product description with keywords',
  keywords: ['hoodie', 'streetwear', 'custom'],
  openGraph: {
    title: 'Product Name',
    description: 'Product description',
    images: ['/product-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Product Name',
    description: 'Product description',
    images: ['/product-image.jpg'],
  },
}
```

## Responsive Container Widths

```typescript
<div className="container mx-auto px-4 py-8 max-w-7xl">
  {/* Content */}
</div>

// Mobile: Full width with padding
// Tablet: Max width with auto margins
// Desktop: Max 1280px (max-w-7xl)
```

## Checklist

- [ ] Proper file location in `app/` directory
- [ ] SEO metadata defined
- [ ] Responsive container and padding
- [ ] Loading state (`loading.tsx`)
- [ ] Error boundary (`error.tsx`)
- [ ] 404 handling for dynamic routes
- [ ] Semantic HTML (main, section, article)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Mobile-responsive layout
- [ ] Next.js Link for navigation

## Notes
- Pages in `app/` folder are Server Components by default
- Use `loading.tsx` for automatic loading UI
- Use `error.tsx` for error boundaries
- Dynamic routes use `[param]` folders
- Metadata improves SEO significantly
