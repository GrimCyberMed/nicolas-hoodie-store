# Deployment Guide - Nicolas Hoodie Store

## 🚀 Quick Deployment to Vercel + Supabase

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Supabase account (free tier available)

---

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - **Name**: nicolas-hoodie-store
   - **Database Password**: (generate strong password - save it!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes for setup

### 1.2 Run Database Schema
1. In your Supabase project, go to **SQL Editor**
2. Click "New query"
3. Copy entire contents of `database/schema.sql`
4. Paste into SQL Editor
5. Click "Run" (bottom right)
6. Verify success (should see "Success. No rows returned")

### 1.3 Get API Credentials
1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not done)
```bash
cd C:\Users\Admin\Documents\OpenCode-Agents\VS-Code\Nicolas
git init
git add .
git commit -m "Initial commit - Nicolas Hoodie Store"
```

### 2.2 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Name: `nicolas-hoodie-store`
4. Description: "Modern e-commerce platform for hoodies"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README
7. Click "Create repository"

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/nicolas-hoodie-store.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Click "Import"

### 3.2 Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (leave as is)
3. **Build Command**: `npm run build` (auto-filled)
4. **Output Directory**: `.next` (auto-filled)

### 3.3 Add Environment Variables
Click "Environment Variables" and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

**Important**: Use the values from Step 1.3

### 3.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Click "Visit" to see your live site!

---

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Domain in Vercel
1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Enter your domain (e.g., `nicolashoodies.com`)
4. Click "Add"

### 4.2 Update DNS Records
Add these records at your domain registrar:

**For root domain (nicolashoodies.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 Wait for Verification
- DNS propagation: 24-48 hours
- SSL certificate: Automatic (Let's Encrypt)

---

## Step 5: Post-Deployment Setup

### 5.1 Create Admin User
Run this SQL in Supabase SQL Editor:

```sql
-- First, create a user in Supabase Auth (do this in Authentication tab)
-- Then run this with the user's UUID:

INSERT INTO admin_users (user_id, email, role)
VALUES ('user-uuid-from-auth', 'admin@example.com', 'admin');
```

### 5.2 Test the Site
1. Visit your deployed URL
2. Test these features:
   - ✅ Homepage loads
   - ✅ Products page shows items
   - ✅ Search and filters work
   - ✅ Add to cart works
   - ✅ Cart persists on refresh
   - ✅ Theme toggle works
   - ✅ Admin dashboard accessible

### 5.3 Add Sample Products (if needed)
The schema includes 6 sample products. If you want more:

1. Go to your deployed site
2. Visit `/admin`
3. Click "Add Product"
4. Fill in the form
5. Submit

---

## Step 6: Set Up Stripe (Optional - for payments)

### 6.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for account
3. Activate your account

### 6.2 Get API Keys
1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 6.3 Add to Vercel
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```
3. Redeploy (Vercel will auto-redeploy)

---

## Troubleshooting

### Build Fails
**Error**: "Missing environment variables"
- **Fix**: Add all required env vars in Vercel settings
- Redeploy after adding

**Error**: "Module not found"
- **Fix**: Run `npm install` locally
- Commit `package-lock.json`
- Push to GitHub

### Database Connection Fails
**Error**: "Database not configured"
- **Fix**: Check Supabase URL and key are correct
- Ensure they start with `NEXT_PUBLIC_`
- Redeploy after fixing

### Products Not Showing
**Error**: Empty product list
- **Fix**: Run `database/schema.sql` in Supabase
- Check sample data was inserted
- Verify RLS policies are set

### Admin Access Denied
**Error**: Can't access `/admin`
- **Fix**: Create admin user in `admin_users` table
- Use correct user UUID from Supabase Auth

---

## Monitoring & Maintenance

### Vercel Analytics
1. Go to project → **Analytics**
2. View:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Supabase Monitoring
1. Go to project → **Database**
2. Check:
   - Table sizes
   - Query performance
   - Storage usage

### Automatic Deployments
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests
- Rollback available in Vercel dashboard

---

## Production Checklist

Before going live:

### Security
- [ ] Environment variables set correctly
- [ ] Supabase RLS policies enabled
- [ ] Admin routes protected
- [ ] API routes validated
- [ ] No sensitive data in code

### Performance
- [ ] Images optimized
- [ ] Lighthouse score > 90
- [ ] Mobile responsive
- [ ] Fast page loads (< 3s)

### Functionality
- [ ] All pages load correctly
- [ ] Search works
- [ ] Filters work
- [ ] Cart persists
- [ ] Theme toggle works
- [ ] Admin CRUD works

### SEO
- [ ] Meta tags added
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Open Graph tags
- [ ] Structured data

### Legal
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie consent
- [ ] GDPR compliance (if EU)

---

## Scaling Considerations

### When to Upgrade

**Supabase Free Tier Limits:**
- 500MB database
- 1GB file storage
- 2GB bandwidth/month

**Upgrade when:**
- > 10,000 products
- > 1,000 orders/month
- > 100GB bandwidth/month

**Vercel Free Tier Limits:**
- 100GB bandwidth/month
- 6,000 build minutes/month

**Upgrade when:**
- > 100,000 page views/month
- Need team collaboration
- Want advanced analytics

---

## Backup Strategy

### Automatic Backups
- Supabase: Daily automatic backups (7 days retention)
- Vercel: Git-based (infinite history)

### Manual Backup
```bash
# Backup database
# In Supabase Dashboard → Database → Backups → Download

# Backup code
git push origin main
```

---

## Support Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Issues
- Check `AGENTS.md` for code standards
- Review `database/README.md` for schema help
- See `WORKFLOW.md` for development guide

---

## 🎉 Congratulations!

Your Nicolas Hoodie Store is now live!

**Next Steps:**
1. Share your site URL
2. Add more products
3. Configure Stripe for payments
4. Set up email notifications
5. Add analytics tracking
6. Market your store!

---

**Deployment Version**: 1.0.0  
**Last Updated**: Phase 4 Complete  
**Status**: Production Ready ✅
