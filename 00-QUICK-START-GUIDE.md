# 🚀 Hoodie E-Commerce Quick Start Guide

## 📋 OVERVIEW
**Goal:** Build a modern hoodie e-commerce website from zero to launch
**Timeline:** 12 weeks (2-3 hours/day)
**Tech Stack:** Next.js + Supabase + Stripe + Vercel
**Total Cost:** $150-300/year (domain + Claude Code)

---

## 🎯 PHASE 0: SETUP (Week 1)

### Day 1-2: Environment Setup
```bash
# Install Node.js (v18 or v20 LTS)
# Download from: https://nodejs.org

# Verify installation
node --version
npm --version

# Install VS Code
# Download from: https://code.visualstudio.com
```

**✅ Checkpoint:** Node and VS Code installed

### Day 3-4: Create Next.js Project
```bash
# Navigate to your project folder
cd C:\Users\Admin\Documents\VS-Code\Nicolas

# Create Next.js app
npx create-next-app@latest hoodie-store

# Options to select:
# ✓ TypeScript: Yes
# ✓ ESLint: Yes
# ✓ Tailwind CSS: Yes
# ✓ src/ directory: Yes
# ✓ App Router: Yes
# ✓ Import alias: No

cd hoodie-store
npm run dev
```

**✅ Checkpoint:** See "Hello World" at http://localhost:3000

### Day 5-7: Install Claude Code & Essential Tools
- Follow: `01-CLAUDE-CODE-INSTALLATION.md`
- Install VS Code extensions (see guide)
- Create `.claude/` context files
- Read `CLAUDE.md` project guide

**✅ Checkpoint:** Claude Code working in VS Code

---

## 🎨 PHASE 1: FRONTEND BASICS (Weeks 2-4)

### Week 2: React Fundamentals
**Learning Resources:**
- freeCodeCamp React Course (free): 10 hours
- Official React Docs: react.dev/learn

**Build:** Practice components in your project
```bash
# Use Claude Code with: /custom frontend-component
```

**📝 NOTE:** Don't skip fundamentals. Understanding components, props, and state is crucial.

**✅ Checkpoint:** Can create a component with props and state

### Week 3: Next.js Basics
**Learning Resources:**
- Next.js Tutorial: nextjs.org/learn (5 hours)

**Build:** 
- Homepage with hero section
- Product listing page
- Single product page

```bash
# Use Claude Code with: /custom page-layout
```

**📝 NOTE:** Next.js App Router is different from Pages Router. Use App Router (newer).

**✅ Checkpoint:** Have 3 working pages with routing

### Week 4: Styling & Responsiveness
**Learning Resources:**
- Tailwind CSS Docs: tailwindcss.com/docs

**Build:**
- Product card component
- Navigation header
- Footer
- Mobile-responsive layout

```bash
# Use Claude Code with: /custom style-component
```

**📝 NOTE:** Design for mobile first (50% of traffic is mobile)

**✅ Checkpoint:** Site looks good on phone, tablet, and desktop

---

## 🗄️ PHASE 2: BACKEND & DATABASE (Weeks 5-8)

### Week 5: Supabase Setup
**Steps:**
1. Create account: supabase.com
2. Create new project (takes ~2 minutes)
3. Copy API keys to `.env.local`

```bash
# Install Supabase client
npm install @supabase/supabase-js
```

**Build:** Products table in Supabase
```sql
-- Use Supabase SQL Editor
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**📝 NOTE:** Save your API keys in `.env.local`, NEVER commit to Git

**✅ Checkpoint:** Products table created, can query from Next.js

### Week 6: Data Fetching
**Build:**
- Fetch products from Supabase
- Display on product listing page
- Create product detail pages

```bash
# Use Claude Code with: /custom fetch-data
```

**📝 NOTE:** Use Server Components for data fetching (default in App Router)

**✅ Checkpoint:** Products display from real database

### Week 7-8: Shopping Cart
**Steps:**
1. Install Zustand: `npm install zustand`
2. Create cart store
3. Add "Add to Cart" buttons
4. Create cart page

```bash
# Use Claude Code with: /custom shopping-cart
```

**📝 NOTE:** Zustand is simpler than Redux. Perfect for beginners.

**✅ Checkpoint:** Can add products to cart, view cart, update quantities

---

## 💳 PHASE 3: PAYMENTS (Weeks 9-10)

### Week 9: Stripe Setup
**Steps:**
1. Create account: stripe.com
2. Get test API keys
3. Install: `npm install stripe @stripe/stripe-js`

**Build:** Checkout page with Stripe
```bash
# Use Claude Code with: /custom stripe-checkout
```

**📝 NOTE:** Use test mode! Test card: 4242 4242 4242 4242

**✅ Checkpoint:** Can process test payment

### Week 10: Order Processing
**Build:**
- Webhook endpoint for Stripe
- Order confirmation page
- Email notifications (Resend)

```bash
# Use Claude Code with: /custom webhooks
```

**📝 NOTE:** Webhooks handle payment confirmation. Critical for reliability.

**✅ Checkpoint:** Complete purchase flow working

---

## 🚢 PHASE 4: POLISH & DEPLOY (Weeks 11-12)

### Week 11: Polish
**Tasks:**
- Optimize images (use Next.js Image)
- Add loading states
- Error handling
- Contact form (Web3Forms)
- SEO (metadata, sitemap)

**📝 NOTE:** Use Lighthouse in Chrome DevTools to check performance

**✅ Checkpoint:** Lighthouse score 80+ on all metrics

### Week 12: Deploy to Production
**Steps:**
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!
5. Test everything

**📝 NOTE:** Vercel free tier doesn't allow commercial use. Upgrade to Pro ($20/mo) for real sales.

**✅ Checkpoint:** Live site at custom domain

---

## 📅 DETAILED TIMELINE

### Month 1: Foundation
- **Week 1:** Setup, environment, tools
- **Week 2:** React basics, first components
- **Week 3:** Next.js, routing, pages
- **Week 4:** Styling, responsive design

### Month 2: Backend
- **Week 5:** Supabase database setup
- **Week 6:** Data fetching, product pages
- **Week 7:** Shopping cart - Part 1
- **Week 8:** Shopping cart - Part 2

### Month 3: Payments & Launch
- **Week 9:** Stripe integration
- **Week 10:** Order processing, webhooks
- **Week 11:** Polish, optimize, test
- **Week 12:** Deploy, go live!

---

## 🎓 LEARNING RESOURCES

### Free Courses
1. **freeCodeCamp React** (10 hours)
2. **Next.js Tutorial** (5 hours)
3. **Tailwind CSS Docs** (self-paced)
4. **Stripe Documentation** (excellent guides)

### When Stuck
1. Read error message carefully
2. Google: "[error message] next.js"
3. Check official docs
4. Ask Claude Code
5. Post on Stack Overflow
6. Ask in Discord: Reactiflux, Next.js Discord

---

## ⚠️ COMMON MISTAKES TO AVOID

### 1. Tutorial Hell
**Symptom:** Watching courses endlessly without building
**Fix:** Follow 70/30 rule - 70% building, 30% learning

### 2. Overengineering
**Symptom:** Building complex features before basic cart works
**Fix:** Ship MVP first, add features later

### 3. Skipping Mobile Testing
**Symptom:** Site looks good on desktop but broken on phone
**Fix:** Test on mobile throughout development (Chrome DevTools)

### 4. Committing Secrets
**Symptom:** API keys visible on GitHub
**Fix:** Always use .env.local and add to .gitignore

### 5. Not Using Git
**Symptom:** Afraid to break code, can't undo changes
**Fix:** Commit after every working feature

---

## 🛠️ TOOLS CHECKLIST

### Required (Free Tier Sufficient)
- [ ] VS Code
- [ ] Node.js (v18 or v20)
- [ ] Git
- [ ] GitHub account
- [ ] Supabase account
- [ ] Stripe account (test mode)
- [ ] Vercel account

### Recommended
- [ ] Claude Code ($20/mo or $5 API credits)
- [ ] GitHub Desktop (if CLI is intimidating)
- [ ] Figma (for design mockups)

### For Production
- [ ] Domain name ($12/year)
- [ ] Vercel Pro ($20/mo for commercial use)
- [ ] Resend account (email notifications)

---

## 📊 SUCCESS METRICS

### MVP Launch (Week 12)
- ✅ 5-10 products displayed
- ✅ Shopping cart functional
- ✅ Can process payments
- ✅ Mobile responsive
- ✅ Lighthouse score 80+

### First Month Post-Launch
- 🎯 500+ visitors
- 🎯 2%+ conversion rate
- 🎯 10+ sales
- 🎯 Under 70% cart abandonment

### Three Months Post-Launch
- 🎯 2,000+ monthly visitors
- 🎯 50+ monthly sales
- 🎯 $1,000+ monthly revenue
- 🎯 20%+ repeat customers

---

## 🚨 NEED HELP?

### Check These Files:
- `CLAUDE.md` - Project context for Claude Code
- `02-GIT-WORKFLOW.md` - Git commands and workflow
- `03-DEPLOYMENT-GUIDE.md` - Deploy to Vercel
- `.claude/prompts/` - Ready-to-use Claude Code commands

### Emergency Fixes:
```bash
# Something broken? Revert last commit
git revert HEAD

# Nuclear option: reset to last working version
git reset --hard HEAD~1

# Dependencies messed up?
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 YOU'VE GOT THIS!

Remember:
- Every expert was once a beginner
- Making mistakes is part of learning
- Ship imperfect code and iterate
- Progress compounds daily
- The best time to start is NOW

**Ready? Run:** `npm run dev` and start building! 🚀
