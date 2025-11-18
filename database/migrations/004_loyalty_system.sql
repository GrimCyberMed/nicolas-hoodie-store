-- ============================================
-- LOYALTY POINTS SYSTEM MIGRATION
-- Phase 7: Customer Loyalty & Rewards
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. LOYALTY POINTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points_balance INTEGER DEFAULT 0 NOT NULL,
  lifetime_points INTEGER DEFAULT 0 NOT NULL, -- Total points ever earned
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON loyalty_points(tier);

-- ============================================
-- 2. POINTS TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL, -- Positive for earning, negative for spending
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
    'purchase', 'signup_bonus', 'referral', 'review', 'birthday', 
    'redemption', 'expired', 'admin_adjustment'
  )),
  description TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ, -- Points expiration date
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_order ON points_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_expires ON points_transactions(expires_at);

-- ============================================
-- 3. LOYALTY REWARDS CATALOG
-- ============================================

CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type VARCHAR(30) NOT NULL CHECK (reward_type IN (
    'discount_percentage', 'discount_fixed', 'free_product', 'free_shipping', 'custom'
  )),
  reward_value DECIMAL(10, 2), -- Discount amount or product value
  product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- For free product rewards
  min_tier VARCHAR(20) DEFAULT 'bronze' CHECK (min_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER, -- NULL = unlimited
  times_redeemed INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_tier ON loyalty_rewards(min_tier);

-- ============================================
-- 4. REWARD REDEMPTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES loyalty_rewards(id) ON DELETE SET NULL NOT NULL,
  points_spent INTEGER NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'expired', 'cancelled')),
  redemption_code VARCHAR(50) UNIQUE, -- Generated code for the reward
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward ON reward_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_code ON reward_redemptions(redemption_code);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);

-- ============================================
-- 5. LOYALTY RULES CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS loyalty_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN (
    'points_per_dollar', 'signup_bonus', 'birthday_bonus', 'review_bonus', 
    'referral_bonus', 'tier_multiplier'
  )),
  points_value INTEGER NOT NULL,
  tier VARCHAR(20) CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rules
INSERT INTO loyalty_rules (rule_name, rule_type, points_value, tier) VALUES
  ('Points per dollar spent', 'points_per_dollar', 1, NULL),
  ('Welcome bonus', 'signup_bonus', 100, NULL),
  ('Birthday bonus', 'birthday_bonus', 200, NULL),
  ('Product review bonus', 'review_bonus', 50, NULL),
  ('Referral bonus', 'referral_bonus', 500, NULL),
  ('Silver tier multiplier', 'tier_multiplier', 2, 'silver'),
  ('Gold tier multiplier', 'tier_multiplier', 3, 'gold'),
  ('Platinum tier multiplier', 'tier_multiplier', 5, 'platinum')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. UPDATE ORDERS TABLE
-- ============================================

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_redeemed INTEGER DEFAULT 0;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for idempotency)
DROP POLICY IF EXISTS "Users can view own loyalty points" ON loyalty_points;
DROP POLICY IF EXISTS "Admins can view all loyalty points" ON loyalty_points;
DROP POLICY IF EXISTS "Users can view own transactions" ON points_transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON points_transactions;
DROP POLICY IF EXISTS "Anyone can view active rewards" ON loyalty_rewards;
DROP POLICY IF EXISTS "Admins can manage rewards" ON loyalty_rewards;
DROP POLICY IF EXISTS "Users can view own redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Users can create own redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Anyone can view active rules" ON loyalty_rules;
DROP POLICY IF EXISTS "Admins can manage rules" ON loyalty_rules;

-- Loyalty Points Policies
CREATE POLICY "Users can view own loyalty points"
  ON loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all loyalty points"
  ON loyalty_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Points Transactions Policies
CREATE POLICY "Users can view own transactions"
  ON points_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions"
  ON points_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Loyalty Rewards Policies
CREATE POLICY "Anyone can view active rewards"
  ON loyalty_rewards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage rewards"
  ON loyalty_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Reward Redemptions Policies
CREATE POLICY "Users can view own redemptions"
  ON reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
  ON reward_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Loyalty Rules Policies
CREATE POLICY "Anyone can view active rules"
  ON loyalty_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage rules"
  ON loyalty_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to initialize loyalty account for new user
CREATE OR REPLACE FUNCTION initialize_loyalty_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Create loyalty points record
  INSERT INTO loyalty_points (user_id, points_balance, lifetime_points)
  VALUES (NEW.id, 0, 0);
  
  -- Award signup bonus
  PERFORM award_points(NEW.id, 100, 'signup_bonus', 'Welcome bonus for joining!');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create loyalty account on user signup
DROP TRIGGER IF EXISTS on_user_created_loyalty ON auth.users;
CREATE TRIGGER on_user_created_loyalty
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_loyalty_account();

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR(30),
  p_description TEXT DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_expires_in_days INTEGER DEFAULT 365
)
RETURNS BOOLEAN AS $$
DECLARE
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Calculate expiration date
  v_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  
  -- Record transaction
  INSERT INTO points_transactions (user_id, points, transaction_type, description, order_id, expires_at)
  VALUES (p_user_id, p_points, p_transaction_type, p_description, p_order_id, v_expires_at);
  
  -- Update user's points balance
  UPDATE loyalty_points
  SET 
    points_balance = points_balance + p_points,
    lifetime_points = lifetime_points + p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Update tier based on lifetime points
  PERFORM update_user_tier(p_user_id);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem points
CREATE OR REPLACE FUNCTION redeem_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR(30),
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT points_balance INTO v_current_balance
  FROM loyalty_points
  WHERE user_id = p_user_id;
  
  -- Check if user has enough points
  IF v_current_balance < p_points THEN
    RAISE EXCEPTION 'Insufficient points balance';
  END IF;
  
  -- Record transaction (negative points)
  INSERT INTO points_transactions (user_id, points, transaction_type, description)
  VALUES (p_user_id, -p_points, p_transaction_type, p_description);
  
  -- Update user's points balance
  UPDATE loyalty_points
  SET 
    points_balance = points_balance - p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user tier
CREATE OR REPLACE FUNCTION update_user_tier(p_user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_lifetime_points INTEGER;
  v_new_tier VARCHAR(20);
BEGIN
  -- Get lifetime points
  SELECT lifetime_points INTO v_lifetime_points
  FROM loyalty_points
  WHERE user_id = p_user_id;
  
  -- Determine tier based on lifetime points
  IF v_lifetime_points >= 10000 THEN
    v_new_tier := 'platinum';
  ELSIF v_lifetime_points >= 5000 THEN
    v_new_tier := 'gold';
  ELSIF v_lifetime_points >= 2000 THEN
    v_new_tier := 'silver';
  ELSE
    v_new_tier := 'bronze';
  END IF;
  
  -- Update tier
  UPDATE loyalty_points
  SET tier = v_new_tier, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN v_new_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate points for purchase
CREATE OR REPLACE FUNCTION calculate_purchase_points(
  p_user_id UUID,
  p_order_total DECIMAL(10, 2)
)
RETURNS INTEGER AS $$
DECLARE
  v_base_points INTEGER;
  v_tier VARCHAR(20);
  v_multiplier INTEGER;
  v_total_points INTEGER;
BEGIN
  -- Get base points per dollar
  SELECT points_value INTO v_base_points
  FROM loyalty_rules
  WHERE rule_type = 'points_per_dollar' AND is_active = true
  LIMIT 1;
  
  -- Get user tier
  SELECT tier INTO v_tier
  FROM loyalty_points
  WHERE user_id = p_user_id;
  
  -- Get tier multiplier
  SELECT points_value INTO v_multiplier
  FROM loyalty_rules
  WHERE rule_type = 'tier_multiplier' AND tier = v_tier AND is_active = true;
  
  -- Calculate total points
  v_total_points := FLOOR(p_order_total * COALESCE(v_base_points, 1) * COALESCE(v_multiplier, 1));
  
  RETURN v_total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. SAMPLE LOYALTY REWARDS (OPTIONAL)
-- ============================================

/*
INSERT INTO loyalty_rewards (name, description, points_cost, reward_type, reward_value, min_tier) VALUES
  ('$5 Off Coupon', 'Get $5 off your next purchase', 500, 'discount_fixed', 5.00, 'bronze'),
  ('10% Off Coupon', 'Get 10% off your next purchase', 1000, 'discount_percentage', 10.00, 'bronze'),
  ('Free Shipping', 'Free shipping on your next order', 750, 'free_shipping', 0, 'bronze'),
  ('$25 Off Coupon', 'Get $25 off your next purchase', 2500, 'discount_fixed', 25.00, 'silver'),
  ('20% Off Coupon', 'Get 20% off your next purchase', 3000, 'discount_percentage', 20.00, 'gold');
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Create loyalty dashboard for users
-- 2. Add points display to user profile
-- 3. Create rewards redemption UI
-- 4. Implement points earning on purchases
-- ============================================
