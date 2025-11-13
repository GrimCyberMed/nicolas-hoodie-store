# Agent Guidelines - Nicolas Hoodie Store

## Build Commands
- **Dev**: `npm run dev` (starts Next.js dev server on port 3000)
- **Build**: `npm run build` (type-checks and builds for production)
- **Lint**: `npm run lint` (runs ESLint)
- **Start**: `npm start` (runs production build)

## Code Style

**TypeScript**: Use strict mode. Define interfaces for all props/data. Avoid `any`. Export types from `src/types/`.

**Imports**: Use `@/` alias for src imports. Order: React → Next.js → External → Internal → Types → Styles.

**Components**: Functional only. Server Components by default. Add `'use client'` only when needed (state, events, hooks). PascalCase filenames.

**Naming**: Components: `ProductCard.tsx`, Utils: `formatPrice.ts`, Types: `Product` interface, Variables: camelCase.

**Styling**: Tailwind CSS only. Mobile-first (base → `md:` → `lg:`). Group classes: layout → spacing → colors → effects.

**State**: `useState` for local, Zustand for global (cart). Server Components for data fetching (no useState for API data).

**Error Handling**: Always handle errors in async functions. Use try/catch. Log errors with `console.error`. Show user-friendly messages.

**Formatting**: 2-space indent. Single quotes. Semicolons. Destructure props. Use async/await (not `.then()`).
