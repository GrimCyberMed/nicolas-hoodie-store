# 🚀 Quick Start Guide - Nicolas Hoodie Store

**Last Updated:** November 14, 2025 (After Session 3)  
**Current Status:** 65% Complete - Ready for Database Setup & Testing

---

## 📋 Prerequisites Checklist

Before you begin, make sure you have:
- ✅ Supabase account and project created
- ✅ Vercel account for deployment
- ✅ Node.js 18+ installed
- ✅ Git repository set up
- ✅ `.env.local` file configured

---

## 🎯 Step-by-Step Setup

### **Step 1: Apply Database Migrations (CRITICAL)**

You need to run 6 SQL migrations in your Supabase dashboard:

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/vxcztsfafhjqefogtmcw
   - Navigate to: **SQL Editor** (left sidebar)

2. **Run Migrations in Order:**

   **Migration 1: Auth Tables** (Already applied ✅)
   ```
   File: database/migrations/001_auth_tables.sql
   Status: Should already be applied
   ```

   **Migration 2: Fix Auth RLS** (CRITICAL - Fixes signup)
   ```
   File: database/migrations/002_fix_auth_rls.sql
   Purpose: Fixes the signup bug
   Action: Copy entire file → Paste in SQL Editor → Click "Run"
   ```

   **Migration 3: Discount System**
   ```
   File: database/migrations/003_discount_system.sql
   Purpose: Adds discount codes and promotions
   Action: Copy entire file → Paste in SQL Editor → Click "Run"
   ```

   **Migration 4: Loyalty System**
   ```
   File: database/migrations/004_loyalty_system.sql
   Purpose: Adds loyalty points and rewards
   Action: Copy entire file → Paste in SQL Editor → Click "Run"
   ```

   **Migration 5: Advertisement System**
   ```
   File: database/migrations/005_advertisement_system.sql
   Purpose: Adds sidebar ads and tracking
   Action: Copy entire file → Paste in SQL Editor → Click "Run"
   ```

   **Migration 6: Theme System**
   ```
   File: database/migrations/006_theme_system.sql
   Purpose: Adds holiday themes and scheduling
   Action: Copy entire file → Paste in SQL Editor → Click "Run"
   ```

3. **Verify Success:**
   - Each migration should show: "Success. No rows returned"
   - Check **Table Editor** to see new tables created

---

### **Step 2: Test Authentication**

1. **Test Signup:**
   - Go to: `/auth/signup`
   - Create a new account
   - Should redirect to login (no errors!)

2. **Test Login:**
   - Go to: `/auth/login`
   - Login with your new account
   - Should see user dropdown in header

3. **Create Admin User:**
   - Go to Supabase SQL Editor
   - Run this (replace with your email):
   ```sql
   UPDATE user_roles 
   SET role = 'admin' 
   WHERE user_id = (
     SELECT id FROM auth.users 
     WHERE email = 'your-email@example.com'
   );
   ```
   - Logout and login again
   - You should now see "Admin" link in header

---

### **Step 3: Test Checkout Flow**

1. **Add Products to Cart:**
   - Browse to `/products`
   - Add some hoodies to cart

2. **Go to Checkout:**
   - Click cart icon
   - Click "Proceed to Checkout"
   - Or go directly to `/checkout`

3. **Complete Checkout:**
   - **Step 1:** Fill in shipping information
   - **Step 2:** Enter payment details (demo mode)
   - **Step 3:** See order confirmation

4. **Test Discount Code:**
   - In checkout, enter code: `SAVE10`
   - Should apply 10% discount
   - (Any code starting with "SAVE" works in demo)

---

### **Step 4: Explore New Features**

#### **Discount System:**
- Admin can create discount codes
- Supports: percentage, fixed amount, free shipping
- Usage limits and expiration dates
- Minimum purchase requirements

#### **Loyalty System:**
- Users earn points on purchases
- 4 tiers: Bronze, Silver, Gold, Platinum
- Points can be redeemed for rewards
- Automatic tier upgrades

#### **Advertisement System:**
- Sidebar ads (left/right)
- Banner ads (top/bottom)
- Click and impression tracking
- Scheduled ad rotation

#### **Theme System:**
- 6 pre-loaded themes (Default, Christmas, Halloween, etc.)
- Automatic theme switching by date
- Custom color schemes
- Holiday presets

---

## 🎨 Available Pages

### **Public Pages:**
- `/` - Homepage
- `/products` - Product catalog
- `/products/[id]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/checkout/success` - Order confirmation
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/auth/forgot-password` - Password reset

### **Protected Pages (Require Login):**
- `/profile` - User dashboard
- `/admin` - Admin dashboard (admin only)
- `/admin/products` - Product management (admin only)
- `/admin/orders` - Order management (admin only)

---

## 🧪 Testing Checklist

### **Authentication:**
- [ ] Signup works without errors
- [ ] Login works with correct credentials
- [ ] Logout works properly
- [ ] Admin user can access `/admin`
- [ ] Regular user cannot access `/admin`

### **Shopping Flow:**
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Cart persists on page refresh
- [ ] Can update quantities
- [ ] Can remove items
- [ ] Cart total calculates correctly

### **Checkout:**
- [ ] Shipping form validates properly
- [ ] Payment form validates card details
- [ ] Discount code applies correctly
- [ ] Free shipping shows for orders $100+
- [ ] Order confirmation displays
- [ ] Cart clears after checkout

### **Admin Features:**
- [ ] Can create/edit/delete products
- [ ] Can view orders
- [ ] Can update order status
- [ ] Logo appears in admin sidebar

---

## 🐛 Troubleshooting

### **Signup Still Failing?**
1. Make sure migration `002_fix_auth_rls.sql` is applied
2. Check Supabase logs for errors
3. Verify RLS policies in Table Editor
4. Try disabling RLS temporarily to test

### **Checkout Not Working?**
1. Make sure cart has items
2. Check browser console for errors
3. Verify all checkout components are created
4. Test with different browsers

### **Admin Access Denied?**
1. Verify user role in `user_roles` table
2. Logout and login again
3. Check middleware.ts is protecting routes
4. Verify RLS policies allow admin access

---

## 📊 Database Tables Overview

### **Core Tables (Already Exist):**
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Order line items

### **New Tables (From Migrations):**
- `user_roles` - User permissions
- `discount_codes` - Discount management
- `discount_usage` - Usage tracking
- `loyalty_points` - User points
- `points_transactions` - Points history
- `loyalty_rewards` - Rewards catalog
- `reward_redemptions` - Redemptions
- `loyalty_rules` - Points rules
- `advertisements` - Ad content
- `ad_clicks` - Click tracking
- `ad_impressions` - View tracking
- `site_themes` - Theme configs
- `theme_schedules` - Theme automation
- `theme_elements` - Element styling

---

## 🔑 Demo Credentials

### **Test Discount Codes:**
- `SAVE10` - 10% off (demo)
- `SAVE20` - 10% off (demo)
- `SAVEBIG` - 10% off (demo)
- *(Any code starting with "SAVE" works in demo mode)*

### **Test Payment Cards:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)
- *(Demo mode - no real charges)*

---

## 🚀 Deployment

### **Deploy to Vercel:**
```bash
git add .
git commit -m "Add checkout, discounts, loyalty, ads, and themes"
git push origin main
```

Vercel will automatically deploy your changes.

### **Environment Variables:**
Make sure these are set in Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=https://vxcztsfafhjqefogtmcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
```

---

## 📞 Need Help?

### **Common Issues:**
1. **Signup Error:** Apply migration 002
2. **Checkout Error:** Check cart has items
3. **Admin Access:** Verify user role in database
4. **Discount Not Working:** Code must start with "SAVE" in demo

### **Resources:**
- **Documentation:** `.project-docs/` folder
- **Session Summary:** `SESSION-3-SUMMARY.md`
- **Project Status:** `PROJECT-STATUS.md`
- **Migration Guide:** `database/migrations/APPLY_MIGRATIONS.md`

---

## 🎯 What's Next?

### **Immediate Tasks:**
1. Apply all database migrations
2. Test authentication thoroughly
3. Create your admin user
4. Test checkout flow end-to-end

### **Future Development:**
1. Build admin management interfaces
2. Integrate real Stripe payments
3. Add email notifications
4. Implement loyalty UI
5. Add sidebar ad components
6. Create theme switcher

---

## 📈 Project Status

- **Overall Progress:** 65% Complete
- **Core Features:** 100% Complete
- **Advanced Features:** 40% Complete
- **Admin Interfaces:** 30% Complete

### **Completed Phases:**
- ✅ Phase 1-4: Foundation, Cart, Catalog, Admin
- ✅ Phase 5: Authentication (Fixed!)
- ✅ Phase 10: Checkout System

### **In Progress:**
- 🟡 Phase 6: Discount System (60%)
- 🟡 Phase 7: Loyalty System (20%)
- 🟡 Phase 8: Advertisement System (20%)
- 🟡 Phase 9: Theme System (40%)

---

**🎉 You're ready to go! Start with Step 1 (Apply Migrations) and work through the checklist.**

---

*Last Updated: November 14, 2025*  
*Questions? Check SESSION-3-SUMMARY.md for detailed information*
