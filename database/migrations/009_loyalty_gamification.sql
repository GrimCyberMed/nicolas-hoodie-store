-- ============================================
-- LOYALTY GAMIFICATION SYSTEM
-- Phase 11: Milestones, Level-Up Rewards & XP
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. UPDATE LOYALTY_POINTS TABLE
-- ============================================

-- Add new columns for gamification
ALTER TABLE loyalty_points 
  ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp_to_next_level INTEGER DEFAULT 200;

-- ============================================
-- 2. LOYALTY LEVELS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS loyalty_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  min_spending DECIMAL(10, 2) NOT NULL, -- Minimum total spending to reach this level
  points_multiplier DECIMAL(3, 2) DEFAULT 1.0, -- Points earning multiplier
  icon VARCHAR(10), -- Emoji or icon code
  color VARCHAR(7), -- Hex color for the level
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default levels (based on spending)
INSERT INTO loyalty_levels (level_number, name, tier, min_spending, points_multiplier, icon, color) VALUES
  (1, 'Newcomer', 'bronze', 0, 1.0, '🌱', '#CD7F32'),
  (2, 'Regular', 'bronze', 50, 1.0, '⭐', '#CD7F32'),
  (3, 'Enthusiast', 'bronze', 100, 1.1, '🔥', '#CD7F32'),
  (4, 'Fan', 'silver', 200, 1.2, '💫', '#C0C0C0'),
  (5, 'Supporter', 'silver', 350, 1.3, '🌟', '#C0C0C0'),
  (6, 'Advocate', 'silver', 500, 1.4, '✨', '#C0C0C0'),
  (7, 'Champion', 'gold', 750, 1.5, '🏆', '#FFD700'),
  (8, 'Elite', 'gold', 1000, 1.7, '👑', '#FFD700'),
  (9, 'Legend', 'platinum', 1500, 2.0, '💎', '#E5E4E2'),
  (10, 'VIP', 'platinum', 2500, 2.5, '🌈', '#E5E4E2')
ON CONFLICT (level_number) DO NOTHING;

-- ============================================
-- 3. LEVEL UP REWARDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS level_up_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INTEGER REFERENCES loyalty_levels(level_number) ON DELETE CASCADE NOT NULL,
  reward_type VARCHAR(30) NOT NULL CHECK (reward_type IN (
    'discount_percentage', 'discount_fixed', 'free_product', 'free_shipping', 'bonus_points', 'custom'
  )),
  reward_value DECIMAL(10, 2), -- Amount or percentage
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(level_number)
);

-- Insert default level-up rewards
INSERT INTO level_up_rewards (level_number, reward_type, reward_value, description) VALUES
  (2, 'bonus_points', 50, 'Welcome bonus: 50 extra points!'),
  (3, 'discount_percentage', 5, '5% off your next purchase'),
  (4, 'free_shipping', 0, 'Free shipping on your next order'),
  (5, 'discount_percentage', 10, '10% off your next purchase'),
  (6, 'bonus_points', 200, 'Loyalty bonus: 200 extra points!'),
  (7, 'discount_percentage', 15, '15% off your next purchase'),
  (8, 'discount_fixed', 25, '$25 off your next purchase'),
  (9, 'discount_percentage', 20, '20% off your next purchase'),
  (10, 'discount_fixed', 50, 'VIP reward: $50 off your next purchase!')
ON CONFLICT (level_number) DO NOTHING;

-- ============================================
-- 4. SPENDING MILESTONES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS spending_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  spending_threshold DECIMAL(10, 2) NOT NULL, -- Amount needed to unlock
  reward_type VARCHAR(30) NOT NULL CHECK (reward_type IN (
    'discount_percentage', 'discount_fixed', 'free_product', 'free_shipping', 'bonus_points', 'badge', 'custom'
  )),
  reward_value DECIMAL(10, 2),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  badge_icon VARCHAR(10), -- Emoji for achievement badge
  badge_color VARCHAR(7), -- Hex color
  is_active BOOLEAN DEFAULT true,
  is_repeatable BOOLEAN DEFAULT false, -- Can be earned multiple times
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default milestones
INSERT INTO spending_milestones (name, description, spending_threshold, reward_type, reward_value, badge_icon, badge_color, sort_order) VALUES
  ('First Purchase', 'Complete your first purchase', 1, 'bonus_points', 25, '🎉', '#10B981', 1),
  ('Getting Started', 'Spend $25 total', 25, 'discount_percentage', 5, '🚀', '#3B82F6', 2),
  ('Hoodie Lover', 'Spend $50 total', 50, 'bonus_points', 50, '❤️', '#EF4444', 3),
  ('Dedicated Fan', 'Spend $100 total', 100, 'discount_percentage', 10, '⭐', '#F59E0B', 4),
  ('Super Supporter', 'Spend $200 total', 200, 'free_shipping', 0, '🌟', '#8B5CF6', 5),
  ('Style Master', 'Spend $350 total', 350, 'discount_fixed', 15, '👔', '#EC4899', 6),
  ('Collection Builder', 'Spend $500 total', 500, 'discount_percentage', 15, '📦', '#14B8A6', 7),
  ('Elite Shopper', 'Spend $750 total', 750, 'bonus_points', 300, '💎', '#6366F1', 8),
  ('Hoodie Legend', 'Spend $1000 total', 1000, 'discount_fixed', 50, '👑', '#F97316', 9),
  ('Ultimate VIP', 'Spend $2000 total', 2000, 'discount_percentage', 25, '🏆', '#DC2626', 10)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. USER MILESTONE PROGRESS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_id UUID REFERENCES spending_milestones(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,
  redemption_code VARCHAR(50) UNIQUE,
  UNIQUE(user_id, milestone_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_milestones_user ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_milestone ON user_milestones(milestone_id);

-- ============================================
-- 6. USER LEVEL HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_level_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  old_level INTEGER,
  new_level INTEGER NOT NULL,
  reward_claimed BOOLEAN DEFAULT false,
  redemption_code VARCHAR(50) UNIQUE,
  leveled_up_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_level_history_user ON user_level_history(user_id);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE loyalty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_up_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_level_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view levels" ON loyalty_levels;
DROP POLICY IF EXISTS "Admins can manage levels" ON loyalty_levels;
DROP POLICY IF EXISTS "Anyone can view level rewards" ON level_up_rewards;
DROP POLICY IF EXISTS "Admins can manage level rewards" ON level_up_rewards;
DROP POLICY IF EXISTS "Anyone can view milestones" ON spending_milestones;
DROP POLICY IF EXISTS "Admins can manage milestones" ON spending_milestones;
DROP POLICY IF EXISTS "Users can view own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Users can view own level history" ON user_level_history;

-- Loyalty Levels Policies
CREATE POLICY "Anyone can view levels"
  ON loyalty_levels FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage levels"
  ON loyalty_levels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Level Up Rewards Policies
CREATE POLICY "Anyone can view level rewards"
  ON level_up_rewards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage level rewards"
  ON level_up_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Spending Milestones Policies
CREATE POLICY "Anyone can view milestones"
  ON spending_milestones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage milestones"
  ON spending_milestones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- User Milestones Policies
CREATE POLICY "Users can view own milestones"
  ON user_milestones FOR SELECT
  USING (auth.uid() = user_id);

-- User Level History Policies
CREATE POLICY "Users can view own level history"
  ON user_level_history FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to calculate user level based on total spending
CREATE OR REPLACE FUNCTION calculate_user_level(p_total_spent DECIMAL(10, 2))
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER;
BEGIN
  SELECT level_number INTO v_level
  FROM loyalty_levels
  WHERE min_spending <= p_total_spent
  ORDER BY min_spending DESC
  LIMIT 1;
  
  RETURN COALESCE(v_level, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user progress after purchase
CREATE OR REPLACE FUNCTION update_loyalty_progress(
  p_user_id UUID,
  p_order_total DECIMAL(10, 2)
)
RETURNS JSONB AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_old_spent DECIMAL(10, 2);
  v_new_spent DECIMAL(10, 2);
  v_points_earned INTEGER;
  v_multiplier DECIMAL(3, 2);
  v_new_milestones UUID[];
  v_result JSONB;
BEGIN
  -- Get current user stats
  SELECT current_level, total_spent INTO v_old_level, v_old_spent
  FROM loyalty_points
  WHERE user_id = p_user_id;
  
  -- Calculate new total spent
  v_new_spent := COALESCE(v_old_spent, 0) + p_order_total;
  
  -- Calculate new level
  v_new_level := calculate_user_level(v_new_spent);
  
  -- Get points multiplier for current level
  SELECT points_multiplier INTO v_multiplier
  FROM loyalty_levels
  WHERE level_number = COALESCE(v_old_level, 1);
  
  -- Calculate points earned (1 point per dollar * multiplier)
  v_points_earned := FLOOR(p_order_total * COALESCE(v_multiplier, 1));
  
  -- Update loyalty points
  UPDATE loyalty_points
  SET 
    total_spent = v_new_spent,
    current_level = v_new_level,
    points_balance = points_balance + v_points_earned,
    lifetime_points = lifetime_points + v_points_earned,
    tier = (SELECT tier FROM loyalty_levels WHERE level_number = v_new_level),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record level up if applicable
  IF v_new_level > COALESCE(v_old_level, 1) THEN
    INSERT INTO user_level_history (user_id, old_level, new_level, redemption_code)
    VALUES (p_user_id, v_old_level, v_new_level, 'LVL-' || upper(substr(md5(random()::text), 1, 8)));
  END IF;
  
  -- Check for new milestones
  INSERT INTO user_milestones (user_id, milestone_id, redemption_code)
  SELECT 
    p_user_id, 
    sm.id,
    'MS-' || upper(substr(md5(random()::text), 1, 8))
  FROM spending_milestones sm
  WHERE sm.spending_threshold <= v_new_spent
    AND sm.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM user_milestones um
      WHERE um.user_id = p_user_id AND um.milestone_id = sm.id
    )
  RETURNING milestone_id INTO v_new_milestones;
  
  -- Build result
  v_result := jsonb_build_object(
    'points_earned', v_points_earned,
    'new_total_spent', v_new_spent,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'leveled_up', v_new_level > COALESCE(v_old_level, 1),
    'new_milestones', COALESCE(array_length(v_new_milestones, 1), 0)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user loyalty dashboard data
CREATE OR REPLACE FUNCTION get_loyalty_dashboard(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_user_data RECORD;
  v_current_level RECORD;
  v_next_level RECORD;
BEGIN
  -- Get user loyalty data
  SELECT * INTO v_user_data
  FROM loyalty_points
  WHERE user_id = p_user_id;
  
  -- Get current level info
  SELECT * INTO v_current_level
  FROM loyalty_levels
  WHERE level_number = COALESCE(v_user_data.current_level, 1);
  
  -- Get next level info
  SELECT * INTO v_next_level
  FROM loyalty_levels
  WHERE level_number = COALESCE(v_user_data.current_level, 1) + 1;
  
  -- Build result
  v_result := jsonb_build_object(
    'points_balance', COALESCE(v_user_data.points_balance, 0),
    'lifetime_points', COALESCE(v_user_data.lifetime_points, 0),
    'total_spent', COALESCE(v_user_data.total_spent, 0),
    'tier', COALESCE(v_user_data.tier, 'bronze'),
    'current_level', jsonb_build_object(
      'number', v_current_level.level_number,
      'name', v_current_level.name,
      'tier', v_current_level.tier,
      'icon', v_current_level.icon,
      'color', v_current_level.color,
      'multiplier', v_current_level.points_multiplier
    ),
    'next_level', CASE WHEN v_next_level IS NOT NULL THEN jsonb_build_object(
      'number', v_next_level.level_number,
      'name', v_next_level.name,
      'spending_required', v_next_level.min_spending,
      'spending_remaining', v_next_level.min_spending - COALESCE(v_user_data.total_spent, 0),
      'progress_percent', LEAST(100, ROUND((COALESCE(v_user_data.total_spent, 0) / v_next_level.min_spending) * 100))
    ) ELSE NULL END
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION calculate_user_level(DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION update_loyalty_progress(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_loyalty_dashboard(UUID) TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Create customer loyalty dashboard UI
-- 2. Update admin loyalty management page
-- 3. Integrate with checkout to award points
-- 4. Add level-up celebration animations
-- ============================================
