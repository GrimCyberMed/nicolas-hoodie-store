# Project Context for Claude Code

## Project Overview

**Name:** Hoodie E-Commerce Store
**Purpose:** Modern online store for selling custom hoodies
**Status:** In Development
**Target:** Complete beginners learning web development

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components (no external library initially)
- **State Management:** Zustand (for shopping cart)
- **Forms:** React Hook Form (when needed)
- **Validation:** Zod (when needed)

### Backend
- **Database:** Supabase (PostgreSQL)
- **API:** Next.js API Routes
- **Authentication:** Supabase Auth (future phase)
- **File Storage:** Supabase Storage (product images)

### Payments
- **Provider:** Stripe
- **Method:** Stripe Checkout (hosted page)
- **Webhooks:** Stripe webhooks for order confirmation

### Deployment
- **Hosting:** Vercel
- **CI/CD:** Automatic deployment on GitHub push
- **Domain:** TBD

### Additional Services
- **Email:** Resend (order confirmations)
- **Forms:** Web3Forms (contact form)
- **Analytics:** Vercel Analytics
- **Version Control:** Git + GitHub

---

## Project Structure

```
hoodie-store/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── products/          # Product pages
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   │   ├── common/           # Buttons, inputs, etc.
│   │   ├── layout/           # Header, footer, nav
│   │   └── products/         # Product-specific components
│   ├── lib/                  # Utilities
│   │   ├── supabase.ts       # Supabase client
│   │   ├── stripe.ts         # Stripe configuration
│   │   └── utils.ts          # Helper functions
│   ├── store/                # State management
│   │   └── cartStore.ts      # Zustand cart store
│   ├── types/                # TypeScript types
│   └── styles/               # Global styles
├── public/                    # Static assets
├── .env.local                # Environment variables (NOT committed)
├── .env.example              # Template for environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## Coding Standards

### TypeScript
- Use TypeScript for all files
- Define interfaces for props and data structures
- Avoid `any` type - use proper types
- Export types from dedicated `types/` folder

### React Components
- Use functional components (no class components)
- Use React Server Components by default (App Router)
- Mark Client Components with `'use client'` only when needed
- Name components in PascalCase: `ProductCard.tsx`
- One component per file

### Component Structure
```typescript
'use client' // Only if client-side features needed

import { ComponentProps } from 'react'

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl: string
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  imageUrl 
}: ProductCardProps) {
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  )
}
```

### Styling
- Use Tailwind CSS utility classes
- Mobile-first approach: Start with mobile, use `md:`, `lg:` for larger screens
- Group related classes: layout → spacing → colors → effects
- Use semantic color names from Tailwind config
- Create custom classes in `globals.css` only when necessary

### State Management
- Use `useState` for local component state
- Use Zustand for global state (shopping cart)
- Use Server Components and fetch for data (no useState for API data)
- Avoid prop drilling - use composition or global state

### Data Fetching
- Fetch in Server Components (default)
- Use async/await, not `.then()`
- Handle loading and error states
- Use Supabase client for database queries

### File Naming
- Components: PascalCase (`ProductCard.tsx`)
- Utilities: camelCase (`formatPrice.ts`)
- Pages: lowercase with hyphens (`product-detail/page.tsx`)
- Types: PascalCase (`Product.ts`)

### Code Organization
- Group related functionality (feature-based structure)
- Keep components small and focused
- Extract reusable logic into custom hooks
- Co-locate tests with components

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...

# Other
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**📝 Important:** 
- Never commit `.env.local`
- Keep `.env.example` updated
- Use `NEXT_PUBLIC_` prefix for client-accessible variables

---

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table (Phase 3)
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items Table (Phase 3)
```sql
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

---

## Development Phases

### ✅ Phase 0: Setup (Week 1)
- Environment setup
- Next.js project created
- Claude Code installed
- Git initialized

### 🚧 Phase 1: Frontend Basics (Weeks 2-4)
- React fundamentals learned
- Product listing page
- Product detail page
- Basic styling with Tailwind

### ⏳ Phase 2: Backend Integration (Weeks 5-8)
- Supabase database
- Fetch products from database
- Shopping cart with Zustand
- Cart page

### ⏳ Phase 3: Payments (Weeks 9-10)
- Stripe integration
- Checkout flow
- Webhooks for order processing

### ⏳ Phase 4: Polish & Deploy (Weeks 11-12)
- Image optimization
- SEO improvements
- Deploy to Vercel
- Custom domain

---

## Common Patterns

### Fetching Data (Server Component)
```typescript
// app/products/page.tsx
import { createClient } from '@/lib/supabase'

export default async function ProductsPage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')

  return <ProductGrid products={products} />
}
```

### Client Component with State
```typescript
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Using Cart Store (Zustand)
```typescript
'use client'

import { useCartStore } from '@/store/cartStore'

export default function AddToCartButton({ product }) {
  const addItem = useCartStore(state => state.addItem)
  
  return (
    <button onClick={() => addItem(product)}>
      Add to Cart
    </button>
  )
}
```

### API Route Example
```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const { items } = await request.json()
  
  const session = await stripe.checkout.sessions.create({
    // ... configuration
  })
  
  return NextResponse.json({ url: session.url })
}
```

---

## Testing Strategy

### Manual Testing (Current Phase)
- Test all features in browser
- Check mobile responsiveness in Chrome DevTools
- Test with Stripe test cards
- Verify database updates

### Automated Testing (Future)
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright (optional, later stage)

---

## Performance Guidelines

- Use Next.js `<Image>` component for all images
- Optimize images before upload (WebP, compressed)
- Lazy load components below the fold
- Minimize client-side JavaScript
- Use Server Components when possible
- Implement loading states
- Cache API responses when appropriate

---

## Accessibility

- Use semantic HTML elements
- Include alt text for images
- Ensure keyboard navigation works
- Use proper heading hierarchy (h1, h2, h3)
- Maintain good color contrast
- Add ARIA labels when needed

---

## Security Best Practices

- Never expose secret keys in client code
- Validate all user input
- Use environment variables for secrets
- Implement rate limiting on API routes
- Sanitize database inputs
- Use Stripe for payment processing (never store credit cards)
- Keep dependencies updated

---

## Git Workflow

### Branch Strategy
- `main` - production-ready code
- `feature/[name]` - new features
- `fix/[name]` - bug fixes

### Commit Message Format
```
type: description

Types: feat, fix, docs, style, refactor, test
Examples:
- feat: add shopping cart functionality
- fix: resolve checkout button not working
- docs: update README with setup instructions
```

### Before Committing
- Test locally
- Run linter: `npm run lint`
- Check build: `npm run build`
- Remove console.logs
- Update relevant documentation

---

## Deployment

### Production Checklist
- All tests passing
- Environment variables set in Vercel
- Custom domain configured (if applicable)
- Stripe webhooks configured
- SEO metadata added
- Analytics installed
- Error monitoring active

### Continuous Deployment
- Push to `main` → Auto deploy to production
- Push to feature branch → Preview deployment
- All deployments via Vercel

---

## Resources

### Documentation
- Next.js: nextjs.org/docs
- React: react.dev
- Tailwind CSS: tailwindcss.com/docs
- Supabase: supabase.com/docs
- Stripe: stripe.com/docs
- Vercel: vercel.com/docs

### Community
- Stack Overflow: Use tags `next.js`, `react`, `typescript`
- Discord: Next.js, Reactiflux servers
- GitHub Discussions: Next.js repo

---

## Working with Claude Code

### Effective Prompting
- Reference files with `@filename`
- Be specific about requirements
- Mention mobile responsiveness
- Ask for TypeScript types
- Request error handling

### Example Prompts
```
Create a ProductCard component that displays:
- Product image (use Next.js Image)
- Product name
- Price formatted as USD
- "Add to Cart" button
Use Tailwind CSS and TypeScript
```

### Review Generated Code
- Always read and understand code before using
- Check for security issues
- Verify TypeScript types
- Test thoroughly
- Ask Claude to explain unclear parts

---

## Current Focus

**Current Phase:** [Update as you progress]
**Next Milestone:** [What you're working toward]
**Known Issues:** [Track bugs or problems]
**Learning Goals:** [What you're trying to learn this week]

---

## Notes for Claude

When helping with this project:
1. Always use TypeScript
2. Prefer Server Components unless client features needed
3. Use Tailwind CSS for styling
4. Follow mobile-first responsive design
5. Include error handling
6. Add TypeScript interfaces
7. Use async/await, not .then()
8. Keep components small and focused
9. Explain complex code in comments
10. Consider beginner skill level - explain why, not just how

---

**Last Updated:** [Current Date]
**Project Status:** In Development
**Developer Level:** Beginner
**Support:** Use custom Claude Code commands in `.claude/prompts/`
