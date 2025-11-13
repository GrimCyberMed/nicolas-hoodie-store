# Development Workflow - Nicolas Hoodie Store

## 🚀 Quick Start

### Daily Development
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Changes auto-reload
```

### Before Committing
```bash
# 1. Check for TypeScript errors
npm run build

# 2. Run linter
npm run lint

# 3. Fix linting issues automatically
npm run lint -- --fix
```

## 📋 Development Phases

### ✅ Phase 1: Theme System & Core Components (COMPLETED)
- [x] Dark/Light theme system with CSS variables
- [x] Theme store (Zustand) with localStorage persistence
- [x] ThemeProvider and ThemeToggle components
- [x] Core UI components (Button, Input, Card, Spinner)
- [x] Header component with navigation
- [x] Footer component
- [x] Updated Tailwind config for theme colors
- [x] Folder structure established

**Test Theme System:**
```bash
npm run dev
# Click the sun/moon icon in header
# Refresh page - theme should persist
# Check both light and dark modes
```

### 🔄 Phase 2: Shopping Cart (NEXT)
**Tasks:**
- [ ] Create cart store (Zustand) with persistence
- [ ] Build CartIcon component with badge
- [ ] Build CartDrawer slide-out component
- [ ] Create CartItem component
- [ ] Create cart page (/cart)
- [ ] Add "Add to Cart" functionality to ProductCard
- [ ] Test cart persistence

**Files to Create:**
- `src/store/cartStore.ts`
- `src/components/cart/CartIcon.tsx`
- `src/components/cart/CartDrawer.tsx`
- `src/components/cart/CartItem.tsx`
- `src/app/cart/page.tsx`

### 🔄 Phase 3: Inventory Page with Filters
**Tasks:**
- [ ] Create filter store (Zustand)
- [ ] Build SearchBar with debounce
- [ ] Create FilterPanel (left sidebar)
- [ ] Build ProductGrid component
- [ ] Create Pagination component
- [ ] Build products page (/products)
- [ ] Create API endpoint (/api/products)
- [ ] Update database schema

### 🔄 Phase 4: Admin Dashboard
**Tasks:**
- [ ] Create admin layout
- [ ] Build dashboard overview
- [ ] Create ProductForm component
- [ ] Implement ImageUpload
- [ ] Add admin API routes
- [ ] Add authentication middleware

## 🛠️ Component Development Workflow

### 1. Create Component
```typescript
// src/components/[category]/ComponentName.tsx
'use client'; // Only if needed

import { ComponentProps } from 'react';

interface ComponentNameProps {
  // Define props
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
}
```

### 2. Test Component
- Add to existing page
- Check light and dark modes
- Test mobile responsiveness
- Verify TypeScript types

### 3. Build & Verify
```bash
npm run build
# Should complete with no errors
```

## 📁 File Organization

### Where to Put Files
- **UI Components**: `src/components/ui/` (Button, Input, Card, etc.)
- **Layout Components**: `src/components/layout/` (Header, Footer, etc.)
- **Feature Components**: `src/components/[feature]/` (cart, products, admin)
- **Pages**: `src/app/[route]/page.tsx`
- **API Routes**: `src/app/api/[endpoint]/route.ts`
- **Stores**: `src/store/[name]Store.ts`
- **Hooks**: `src/hooks/use[Name].ts`
- **Types**: `src/types/[name].ts`
- **Utils**: `src/lib/[name].ts`

## 🎨 Styling Guidelines

### Use Theme Colors
```tsx
// ✅ Good - Uses theme colors
<div className="bg-background text-foreground border-border">

// ❌ Bad - Hardcoded colors
<div className="bg-white text-black border-gray-200">
```

### Mobile-First Responsive
```tsx
// ✅ Good - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ Bad - Desktop first
<div className="grid grid-cols-3 md:grid-cols-1">
```

## 🔍 Testing Checklist

### Before Marking Task Complete
- [ ] Component renders without errors
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] TypeScript types defined
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] Lint passes (`npm run lint`)

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Theme Not Working
- Check `data-theme` attribute on `<html>` element
- Verify ThemeProvider wraps app in layout.tsx
- Check browser localStorage for 'theme-storage'
- Clear browser cache

### Import Errors
- Verify `@/` alias in tsconfig.json
- Check file path is correct
- Ensure file has proper export

## 📊 Progress Tracking

### Completed (4/20 tasks)
✅ Theme system
✅ Core UI components
✅ Header component
✅ Footer component

### In Progress (0/20 tasks)
🔄 None currently

### Next Up (2/20 tasks)
⏭️ Shopping cart store
⏭️ Cart components

## 🎯 Current Focus

**Week 1 Goal**: Complete Phase 1 & 2
- ✅ Theme system (DONE)
- 🔄 Shopping cart (NEXT)

**Success Criteria**:
- Dark/light mode works perfectly
- Cart persists across page refreshes
- Can add/remove items from cart
- Cart icon shows item count

## 📝 Notes

### Dependencies Installed
- `zustand` - State management
- `clsx` - Class name utility
- `tailwind-merge` - Merge Tailwind classes
- `@supabase/supabase-js` - Database
- `@stripe/stripe-js` - Payments

### Environment Variables Needed
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

---

**Last Updated**: Phase 1 Completed
**Next Milestone**: Shopping Cart Implementation
