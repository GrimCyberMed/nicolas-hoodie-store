# Deployment Guide: From Local to Live

## Overview

This guide walks you through deploying your hoodie store to the internet using Vercel.

**What you'll learn:**
- Deploy to Vercel (free tier)
- Connect custom domain
- Set up environment variables
- Continuous deployment from GitHub

**Time:** 15-30 minutes

---

## Prerequisites Checklist

Before deploying:
- [ ] Code works locally (`npm run dev`)
- [ ] All features tested
- [ ] Environment variables documented
- [ ] Code pushed to GitHub
- [ ] `.env.local` in `.gitignore`

---

## Step 1: Prepare for Deployment

### 1. Test Production Build Locally

```bash
# Build for production
npm run build

# If build fails, fix errors before deploying
# Common issues:
# - TypeScript errors
# - Unused imports
# - Missing dependencies

# Test production build
npm start

# Visit: http://localhost:3000
# Test everything works
```

**✅ Checkpoint:** Production build succeeds and site works

### 2. Clean Up Code

```bash
# Remove console.logs
# Fix ESLint warnings
npm run lint

# Commit changes
git add .
git commit -m "Prepare for deployment"
git push
```

### 3. Document Environment Variables

Create `.env.example`:

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
```

**📝 NOTE:** Never commit actual secrets! This file shows what variables are needed.

---

## Step 2: Deploy to Vercel

### Create Vercel Account

1. Go to: vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access GitHub

### Import Your Project

1. **Dashboard → "Add New" → "Project"**

2. **Import Git Repository**
   - Find your `hoodie-store` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable from your `.env.local`:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL = [paste value]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [paste value]
   STRIPE_SECRET_KEY = [paste value]
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = [paste value]
   ```

5. **Deploy!**
   - Click "Deploy"
   - Wait 1-3 minutes
   - 🎉 Your site is live!

**✅ Checkpoint:** See "Congratulations!" page with live URL

---

## Step 3: Test Deployment

### Visit Your Live Site

Vercel provides URL: `your-project.vercel.app`

### Test Checklist

- [ ] Homepage loads
- [ ] Product pages display
- [ ] Images load correctly
- [ ] Navigation works
- [ ] Shopping cart functions
- [ ] Can add products to cart
- [ ] Checkout page loads
- [ ] **DON'T TEST REAL PAYMENTS YET** (use test mode first)

**📝 NOTE:** If something's broken, check Vercel deployment logs (Dashboard → Deployments → Click deployment → Function Logs)

---

## Step 4: Configure Stripe Webhooks

Stripe needs to notify your site when payments complete.

### Get Webhook URL

Your webhook endpoint: `https://your-project.vercel.app/api/webhooks/stripe`

### Add Webhook in Stripe

1. **Stripe Dashboard → Developers → Webhooks**

2. **Add Endpoint**
   - Endpoint URL: `https://your-project.vercel.app/api/webhooks/stripe`
   - Events to send: `checkout.session.completed`, `payment_intent.succeeded`

3. **Get Signing Secret**
   - Click on your webhook
   - Reveal "Signing secret"
   - Copy it

4. **Add to Vercel**
   - Vercel Dashboard → Project Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET = [paste secret]`
   - Click "Save"
   - Redeploy (Dashboard → Deployments → ⋯ → Redeploy)

**✅ Checkpoint:** Webhook shows "✓" in Stripe dashboard

---

## Step 5: Test Complete Purchase Flow

### Use Stripe Test Mode

**Test Card:** 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Test Process

1. Add product to cart
2. Go to checkout
3. Fill in test information
4. Use test card number
5. Complete purchase
6. Check:
   - Order confirmation page shows
   - Email received (if configured)
   - Order appears in Supabase database
   - Webhook succeeded in Stripe dashboard

**✅ Checkpoint:** Full purchase flow works end-to-end

---

## Step 6: Connect Custom Domain (Optional)

### Purchase Domain

**Recommended Registrars:**
- Namecheap: ~$12/year
- Google Domains: ~$12/year
- Cloudflare: ~$10/year

### Add Domain to Vercel

1. **Vercel Dashboard → Project → Settings → Domains**

2. **Add Domain**
   - Enter: `yourdomain.com`
   - Click "Add"

3. **Configure DNS**
   
   Vercel shows instructions. Typically:
   
   **Option A: Using Vercel Nameservers (Easiest)**
   - Copy nameservers from Vercel
   - Go to domain registrar
   - Replace nameservers with Vercel's
   - Wait 24-48 hours for propagation

   **Option B: Using CNAME (Faster)**
   - Add CNAME record in domain registrar:
     - Name: `www` or `@`
     - Value: `cname.vercel-dns.com`
   - Wait 15 minutes - 2 hours

4. **Add www Subdomain**
   - Vercel Dashboard → Add Domain → `www.yourdomain.com`
   - Set redirect: `www.yourdomain.com` → `yourdomain.com`

**✅ Checkpoint:** Your site loads at custom domain

---

## Step 7: Enable Production Mode

### ⚠️ IMPORTANT: Free Tier Limitation

**Vercel Free Tier = Hobby Plan**
- ❌ No commercial use allowed
- ✅ Perfect for learning and testing
- 💡 Must upgrade to Pro before selling

### Upgrade to Pro (When Ready to Sell)

**Cost:** $20/month

**When to upgrade:**
- Ready to accept real payments
- Start marketing your store
- Before first sale

**How to upgrade:**
1. Vercel Dashboard → Settings → Billing
2. Click "Upgrade to Pro"
3. Add payment method
4. Confirm

### Switch Stripe to Live Mode

**Only after upgrading Vercel to Pro:**

1. **Stripe Dashboard → Toggle to "Live Mode"**

2. **Get Live API Keys**
   - Developers → API Keys
   - Copy "Publishable key" and "Secret key"

3. **Update Vercel Environment Variables**
   - Replace test keys with live keys
   - Update webhook secret (create new live webhook)

4. **Redeploy**

**✅ Checkpoint:** Can accept real payments

---

## Continuous Deployment

### Automatic Deployments

Once set up, deployment is automatic:

1. **Make changes locally**
2. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Update product page"
   git push
   ```
3. **Vercel automatically deploys** (1-3 minutes)
4. **Visit your site** - changes are live!

### Preview Deployments

Every branch gets its own preview URL:

```bash
# Create feature branch
git checkout -b feature/new-page

# Make changes, commit, push
git push -u origin feature/new-page
```

Vercel creates preview: `your-project-git-feature-new-page.vercel.app`

**Benefits:**
- Test before merging to main
- Share with others for feedback
- Preview URL in GitHub pull requests

---

## Monitoring & Maintenance

### Check Site Health

**Vercel Analytics (Free):**
- Dashboard → Analytics
- See page views, visitors, top pages

**Vercel Speed Insights:**
- Dashboard → Speed Insights  
- Monitor performance scores

**Custom Analytics:**
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Check Errors

**Vercel Logs:**
- Dashboard → Project → Deployments
- Click deployment → Function Logs
- See real-time errors and warnings

**Set Up Alerts:**
- Dashboard → Project → Settings → Notifications
- Enable email notifications for failed deployments

---

## Troubleshooting

### Build Fails

**Check Build Logs:**
1. Dashboard → Deployments → Failed deployment
2. Click "View Function Logs"
3. Read error message

**Common Issues:**
- TypeScript errors → Fix locally first
- Missing dependencies → Check `package.json`
- Environment variables missing → Add in Vercel
- Build timeout → Reduce bundle size

**Fix:**
```bash
# Test locally
npm run build

# Fix errors, then push
git add .
git commit -m "Fix build errors"
git push
```

### Site Loads but Features Broken

**Check Environment Variables:**
- Vercel Dashboard → Settings → Environment Variables
- Verify all secrets are set
- No typos in variable names
- Redeploy after changes

**Check Function Logs:**
- Real-time errors show here
- Look for API errors, database connection issues

### Database Connection Issues

**Supabase:**
- Verify URL and keys are correct
- Check Supabase dashboard for service status
- Test connection locally first

**Stripe:**
- Verify API keys match mode (test vs live)
- Check webhook endpoint is correct
- Test webhooks in Stripe dashboard

### Domain Not Working

**Check DNS:**
- Use: dnschecker.org
- Enter your domain
- Should point to Vercel IPs

**Wait Time:**
- DNS propagation: 15 min - 48 hours
- Be patient!

**Verify SSL:**
- Should show 🔒 in browser
- Vercel provides automatic SSL

---

## Performance Optimization

### Before Launch

1. **Optimize Images**
   - Use Next.js `<Image>` component
   - Compress before upload (TinyPNG)
   - Use WebP format

2. **Run Lighthouse**
   - Chrome DevTools → Lighthouse
   - Aim for 80+ on all scores

3. **Minify CSS/JS**
   - Next.js does this automatically
   - Check bundle size: `npm run build` shows sizes

### After Launch

1. **Monitor Core Web Vitals**
   - Vercel Speed Insights
   - Google Search Console

2. **Check Loading Speed**
   - Target: Under 2.5 seconds
   - Test on mobile networks

3. **Optimize as Needed**
   - Add loading states
   - Implement code splitting
   - Lazy load components

---

## Security Checklist

Before going live:

- [ ] All API keys in environment variables
- [ ] `.env.local` in `.gitignore`
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Stripe webhooks configured
- [ ] Database has proper access rules
- [ ] No console.logs with sensitive data
- [ ] Error messages don't leak secrets
- [ ] CORS configured correctly
- [ ] Rate limiting on API routes

---

## Cost Breakdown

### Free Tier (Development)
- Vercel Hobby: $0
- GitHub: $0
- Supabase Free: $0
- Stripe: $0 (pay only on transactions)
- **Total: $0/month**

### Production (With Sales)
- Vercel Pro: $20/month
- Domain: $1/month (~$12/year)
- Supabase Free: $0 (until you need more)
- Stripe: 2.9% + $0.30 per transaction
- **Total: ~$21/month + transaction fees**

### When to Upgrade Services

**Supabase Pro ($25/mo):**
- Database > 500MB
- More than 50,000 active users/month

**Vercel Enterprise:**
- High traffic (millions of requests)
- Team collaboration features

---

## Next Steps

After deployment:

1. ✅ Test everything thoroughly
2. ✅ Set up monitoring
3. ✅ Configure domain
4. ✅ Enable analytics
5. ✅ Share with friends for feedback
6. ✅ Prepare for launch marketing

**You're live! Time to sell some hoodies!** 🎉

---

## Quick Reference

### Common Commands

```bash
# Test production build locally
npm run build && npm start

# Deploy (automatic via git push)
git push

# Force redeploy
# Vercel Dashboard → Deployments → ⋯ → Redeploy

# View logs
# Vercel Dashboard → Function Logs
```

### Useful Links

- Vercel Dashboard: vercel.com/dashboard
- Stripe Dashboard: dashboard.stripe.com
- Supabase Dashboard: app.supabase.com
- Deployment Logs: [Your Vercel Project] → Deployments
- DNS Checker: dnschecker.org

---

**Congratulations!** Your site is now live on the internet! 🚀

Time to start marketing and making sales!
