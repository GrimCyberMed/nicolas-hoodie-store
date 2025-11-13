# Implementation Plan: Nicolas Hoodie Store - Complete E-Commerce Platform

## 📋 Project Status

**Current Phase:** Deployment Complete ✅  
**Next Phase:** Feature Enhancements (Phases 5-10)

### Completed Phases (1-4)
- ✅ Phase 1: Foundation (Theme system, UI components, Layout)
- ✅ Phase 2: Shopping Cart (Zustand, persistent storage, cart drawer)
- ✅ Phase 3: Product Catalog (Filtering, search, pagination, API)
- ✅ Phase 4: Admin Dashboard (Product CRUD, database schema, orders page)
- ✅ Deployment: Supabase + Vercel (Live at production)

---

## 🚀 NEW FEATURE ROADMAP (Phases 5-10)

### **PHASE 5: Authentication & Authorization** 🔐
**Priority:** HIGH | **Estimated Time:** 1-2 weeks

#### Issues Identified:
- ❌ No login/signup page or buttons
- ❌ No way to access admin page (unprotected routes)
- ❌ No user role system

#### Tasks:
1. **Setup Supabase Authentication**
   - Configure email/password authentication
   - Set up OAuth providers (Google, GitHub - optional)
   - Create auth helper functions

2. **Create Login/Signup Pages**
   - `/auth/login` - Login form with validation
   - `/auth/signup` - Registration form
   - `/auth/forgot-password` - Password reset
   - Form validation with Zod
   - Error handling and user feedback

3. **User Roles System**
   - Create `user_roles` table in database
   - Add `role` column to users (admin, customer)
   - Create RLS policies for role-based access

4. **Authentication Middleware**
   - Protect `/admin/*` routes
   - Redirect unauthenticated users to login
   - Check user role for admin access

5. **UI Updates**
   - Add Login/Signup buttons to Header
   - Add user profile dropdown (when logged in)
   - Show/hide admin link based on role
   - Add logout functionality

6. **User Profile Page**
   - `/profile` - User dashboard
   - Order history
   - Account settings
   - Address management

**Database Schema:**
```sql
-- Add role to users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

---

### **PHASE 6: Discount & Coupon System** 🎟️
**Priority:** HIGH | **Estimated Time:** 2-3 weeks

#### Features Requested:
- ✅ Admin can create discount codes
- ✅ Multiple discount types (%, fixed amount, conditional)
- ✅ Discount code field at checkout
- ✅ Buy X Get Y free promotions
- ✅ Minimum purchase requirements

#### Tasks:

1. **Database Schema**
   - Create `discount_codes` table
   - Create `discount_usage` table (track usage)
   - Add indexes for performance

2. **Discount Types Implementation**
   - **Percentage Discount** (e.g., 20% off)
   - **Fixed Amount** (e.g., €10 off)
   - **Minimum Purchase** (e.g., €5 off orders over €50)
   - **Buy X Get Y Free** (e.g., Buy 2 Get 1 Free)
   - **Free Shipping** (future)

3. **Admin Discount Management**
   - `/admin/discounts` - List all discount codes
   - `/admin/discounts/new` - Create new discount
   - `/admin/discounts/[id]/edit` - Edit discount
   - Discount form with validation
   - Set expiration dates
   - Usage limits (total uses, per user)
   - Active/inactive toggle

4. **Checkout Integration**
   - Add discount code input field
   - Validate discount code (API endpoint)
   - Apply discount to cart total
   - Show discount breakdown
   - Handle multiple discount rules

5. **API Endpoints**
   - `POST /api/discounts/validate` - Validate code
   - `GET /api/admin/discounts` - List discounts
   - `POST /api/admin/discounts` - Create discount
   - `PUT /api/admin/discounts/[id]` - Update discount
   - `DELETE /api/admin/discounts/[id]` - Delete discount

6. **Discount Logic**
   - Calculate discount amount
   - Check eligibility (min purchase, product restrictions)
   - Track usage count
   - Prevent stacking (if configured)

**Database Schema:**
```sql
CREATE TABLE discount_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'min_purchase')),
  
  -- Discount values
  percentage_off DECIMAL(5,2), -- For percentage type (e.g., 20.00 = 20%)
  fixed_amount_off DECIMAL(10,2), -- For fixed amount (e.g., 10.00 = €10)
  min_purchase_amount DECIMAL(10,2), -- Minimum purchase required
  buy_quantity INTEGER, -- For Buy X Get Y (X value)
  get_quantity INTEGER, -- For Buy X Get Y (Y value)
  
  -- Usage limits
  max_uses INTEGER, -- NULL = unlimited
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Restrictions
  applicable_products UUID[], -- NULL = all products
  applicable_categories TEXT[], -- NULL = all categories
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discount_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX idx_discount_usage_user ON discount_usage(user_id);
CREATE INDEX idx_discount_usage_code ON discount_usage(discount_code_id);
```

---

### **PHASE 7: Loyalty Points System** 🎁
**Priority:** MEDIUM | **Estimated Time:** 1-2 weeks

#### Features:
- ✅ Earn points on purchases
- ✅ Redeem points for discounts
- ✅ Points history tracking
- ✅ Admin configurable point rules

#### Tasks:

1. **Database Schema**
   - Create `loyalty_points` table
   - Create `loyalty_transactions` table
   - Create `loyalty_settings` table

2. **Points Earning System**
   - Configure points per euro spent (e.g., 1 point per €1)
   - Award points after order completion
   - Bonus points for specific actions (signup, referral)

3. **Points Redemption**
   - Convert points to discount (e.g., 100 points = €1)
   - Apply points at checkout
   - Minimum points required for redemption

4. **User Dashboard**
   - Display current points balance
   - Points history (earned/redeemed)
   - Points expiration dates (optional)

5. **Admin Management**
   - `/admin/loyalty` - Configure loyalty program
   - Set points earning rate
   - Set redemption rate
   - View user points balances
   - Manual point adjustments

**Database Schema:**
```sql
CREATE TABLE loyalty_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  points_per_euro DECIMAL(10,2) DEFAULT 1.00, -- 1 point per €1
  euros_per_point DECIMAL(10,4) DEFAULT 0.01, -- 100 points = €1
  min_points_redemption INTEGER DEFAULT 100,
  points_expiry_days INTEGER, -- NULL = never expire
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE loyalty_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE loyalty_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL, -- Positive = earned, Negative = redeemed
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  order_id UUID REFERENCES orders(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX idx_loyalty_transactions_user ON loyalty_transactions(user_id);
```

---

### **PHASE 8: Advertisement System** 📢
**Priority:** MEDIUM | **Estimated Time:** 1 week

#### Features Requested:
- ✅ Left and right sidebar advertisements
- ✅ Admin can upload/manage ads
- ✅ Clickable ads with tracking

#### Tasks:

1. **Database Schema**
   - Create `advertisements` table
   - Track ad clicks and impressions

2. **Advertisement Slots**
   - Left sidebar (desktop only)
   - Right sidebar (desktop only)
   - Banner ads (optional)
   - Responsive design (hide on mobile)

3. **Admin Management**
   - `/admin/advertisements` - List all ads
   - `/admin/advertisements/new` - Create ad
   - Upload image
   - Set link URL
   - Set position (left/right/banner)
   - Schedule ads (start/end dates)
   - Active/inactive toggle

4. **Frontend Components**
   - `<AdSlot>` component
   - Lazy loading for performance
   - Click tracking
   - Impression tracking

5. **Ad Rotation**
   - Multiple ads per slot
   - Random rotation
   - Weighted rotation (priority)
   - Time-based scheduling

**Database Schema:**
```sql
CREATE TABLE advertisements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  position VARCHAR(20) NOT NULL CHECK (position IN ('left_sidebar', 'right_sidebar', 'banner_top', 'banner_bottom')),
  priority INTEGER DEFAULT 0, -- Higher = more likely to show
  
  -- Scheduling
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Analytics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ad_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  advertisement_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('impression', 'click')),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_advertisements_position ON advertisements(position);
CREATE INDEX idx_advertisements_active ON advertisements(is_active);
CREATE INDEX idx_ad_analytics_ad ON ad_analytics(advertisement_id);
```

---

### **PHASE 9: Holiday Theme System** 🎄
**Priority:** MEDIUM | **Estimated Time:** 2 weeks

#### Features Requested:
- ✅ Admin can change site theme
- ✅ Holiday presets (Black Friday, Christmas, Easter, etc.)
- ✅ Custom theme colors and logos
- ✅ Scheduled theme activation

#### Tasks:

1. **Database Schema**
   - Create `site_themes` table
   - Store theme configurations

2. **Theme Presets**
   - **Black Friday** (dark theme, red accents)
   - **Christmas** (red/green, snow effects)
   - **Easter** (pastel colors, spring theme)
   - **Halloween** (orange/black, spooky)
   - **Valentine's Day** (pink/red, hearts)
   - **Summer Sale** (bright colors, beach theme)
   - **Default** (original theme)

3. **Theme Customization**
   - Primary color
   - Secondary color
   - Background color
   - Text color
   - Logo upload
   - Banner image
   - Custom CSS (advanced)

4. **Admin Theme Manager**
   - `/admin/themes` - Theme management
   - Select active theme
   - Preview themes
   - Schedule theme changes
   - Create custom themes

5. **Theme Scheduling**
   - Auto-activate on specific dates
   - Revert to default after event
   - Multiple scheduled themes

6. **Frontend Implementation**
   - Dynamic CSS variables
   - Theme context provider
   - Smooth theme transitions
   - Cache theme settings

**Database Schema:**
```sql
CREATE TABLE site_themes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Colors (CSS variables)
  primary_color VARCHAR(7) DEFAULT '#000000',
  secondary_color VARCHAR(7) DEFAULT '#ffffff',
  accent_color VARCHAR(7) DEFAULT '#ff0000',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#000000',
  
  -- Assets
  logo_url TEXT,
  banner_url TEXT,
  favicon_url TEXT,
  
  -- Custom CSS
  custom_css TEXT,
  
  -- Scheduling
  auto_activate_start TIMESTAMPTZ,
  auto_activate_end TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT false,
  is_preset BOOLEAN DEFAULT false, -- True for built-in themes
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert preset themes
INSERT INTO site_themes (name, slug, primary_color, secondary_color, accent_color, is_preset) VALUES
('Default', 'default', '#000000', '#ffffff', '#3b82f6', true),
('Black Friday', 'black-friday', '#000000', '#ff0000', '#fbbf24', true),
('Christmas', 'christmas', '#dc2626', '#16a34a', '#fbbf24', true),
('Easter', 'easter', '#fbbf24', '#a855f7', '#ec4899', true),
('Halloween', 'halloween', '#f97316', '#000000', '#a855f7', true),
('Valentines', 'valentines', '#ec4899', '#f43f5e', '#fbbf24', true);

CREATE INDEX idx_site_themes_active ON site_themes(is_active);
CREATE INDEX idx_site_themes_slug ON site_themes(slug);
```

---

### **PHASE 10: Complete Checkout System** 💳
**Priority:** HIGH | **Estimated Time:** 2-3 weeks

#### Features:
- ✅ Full checkout flow
- ✅ Shipping address form
- ✅ Payment integration (Stripe/PayPal)
- ✅ Order confirmation
- ✅ Email notifications

#### Tasks:

1. **Checkout Page**
   - `/checkout` - Multi-step checkout
   - Step 1: Cart review
   - Step 2: Shipping address
   - Step 3: Payment method
   - Step 4: Order confirmation

2. **Shipping Address**
   - Address form with validation
   - Save multiple addresses
   - Set default address
   - Address autocomplete (Google Places API)

3. **Payment Integration**
   - Stripe integration
   - PayPal integration (optional)
   - Credit card form
   - Payment validation
   - Secure payment processing

4. **Order Processing**
   - Create order in database
   - Update inventory
   - Apply discounts
   - Award loyalty points
   - Generate order number

5. **Order Confirmation**
   - Confirmation page
   - Order summary
   - Estimated delivery
   - Download invoice (PDF)

6. **Email Notifications**
   - Order confirmation email
   - Shipping notification
   - Delivery confirmation
   - Email templates (HTML)

**Database Schema:**
```sql
CREATE TABLE shipping_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_id UUID REFERENCES shipping_addresses(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_used INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;

CREATE INDEX idx_shipping_addresses_user ON shipping_addresses(user_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

---

## 📊 Implementation Priority

### **Immediate (Start Now)**
1. ✅ **Phase 5: Authentication** - Critical for security
2. ✅ **Phase 10: Checkout** - Core e-commerce functionality

### **High Priority (Next 2 weeks)**
3. ✅ **Phase 6: Discount System** - Revenue optimization
4. ✅ **Phase 8: Advertisements** - Monetization

### **Medium Priority (Next 4 weeks)**
5. ✅ **Phase 7: Loyalty System** - Customer retention
6. ✅ **Phase 9: Theme System** - Marketing flexibility

---

## 🎯 Success Metrics

### Phase 5 (Authentication)
- [ ] Users can register and login
- [ ] Admin routes are protected
- [ ] Role-based access control works
- [ ] User profile page functional

### Phase 6 (Discounts)
- [ ] Admin can create all discount types
- [ ] Discount codes validate correctly
- [ ] Discounts apply to cart total
- [ ] Usage tracking works

### Phase 7 (Loyalty)
- [ ] Points awarded on purchases
- [ ] Points redeemable at checkout
- [ ] Points history visible to users
- [ ] Admin can configure settings

### Phase 8 (Advertisements)
- [ ] Ads display in sidebars
- [ ] Admin can upload/manage ads
- [ ] Click tracking works
- [ ] Ad rotation functional

### Phase 9 (Themes)
- [ ] Theme presets available
- [ ] Admin can activate themes
- [ ] Theme scheduling works
- [ ] Custom themes can be created

### Phase 10 (Checkout)
- [ ] Full checkout flow works
- [ ] Payment processing successful
- [ ] Orders created in database
- [ ] Confirmation emails sent

---

## 🔧 Technical Stack

### Current Stack
- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Storage:** Supabase Storage

### New Additions
- **Authentication:** Supabase Auth
- **Payments:** Stripe API
- **Email:** SendGrid / Resend
- **Analytics:** Google Analytics (optional)

---

## 📝 Development Guidelines

### Code Quality
- Write TypeScript for all new code
- Use ESLint and Prettier
- Add JSDoc comments for complex functions
- Write unit tests for critical logic

### Git Workflow
- Create feature branches: `feature/phase-5-auth`
- Commit frequently with clear messages
- Create pull requests for review
- Tag releases: `v2.0.0`, `v2.1.0`, etc.

### Testing
- Test each feature thoroughly before moving on
- Test on multiple devices (desktop, tablet, mobile)
- Test edge cases and error scenarios
- User acceptance testing

---

## 🚀 Getting Started

### Next Steps:
1. **Review this plan** - Understand all phases
2. **Start Phase 5** - Authentication (highest priority)
3. **Create feature branch** - `git checkout -b feature/phase-5-auth`
4. **Follow task list** - Complete tasks in order
5. **Test thoroughly** - Before moving to next phase
6. **Deploy updates** - Push to production incrementally

### Estimated Timeline:
- **Phase 5:** 1-2 weeks
- **Phase 6:** 2-3 weeks
- **Phase 7:** 1-2 weeks
- **Phase 8:** 1 week
- **Phase 9:** 2 weeks
- **Phase 10:** 2-3 weeks

**Total:** 9-13 weeks (2-3 months)

---

## 📞 Support & Questions

If you need clarification on any phase or task:
1. Reference this document: `@IMPLEMENTATION-PLAN.md`
2. Ask specific questions about implementation
3. Request code examples or guidance
4. Review completed phases for patterns

---

**Let's build an amazing e-commerce platform! 🚀**

**Ready to start Phase 5?** Type "Start Phase 5" to begin!
