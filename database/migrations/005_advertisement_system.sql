-- ============================================
-- ADVERTISEMENT SYSTEM MIGRATION
-- Phase 8: Sidebar Ads & Promotions
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADVERTISEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS advertisements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Ad Content
  image_url TEXT NOT NULL,
  link_url TEXT,
  call_to_action VARCHAR(50), -- e.g., "Shop Now", "Learn More"
  
  -- Placement
  position VARCHAR(20) NOT NULL CHECK (position IN ('left_sidebar', 'right_sidebar', 'banner_top', 'banner_bottom')),
  priority INTEGER DEFAULT 0, -- Higher priority = shown first
  
  -- Targeting
  target_page VARCHAR(50) CHECK (target_page IN ('all', 'home', 'products', 'product_detail', 'cart', 'checkout')),
  target_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Scheduling
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Analytics
  impressions INTEGER DEFAULT 0, -- Times shown
  clicks INTEGER DEFAULT 0, -- Times clicked
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_advertisements_position ON advertisements(position);
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_advertisements_priority ON advertisements(priority DESC);

-- ============================================
-- 2. AD CLICK TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advertisement_id UUID REFERENCES advertisements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad ON ad_clicks(advertisement_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_user ON ad_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_date ON ad_clicks(clicked_at);

-- ============================================
-- 3. AD IMPRESSIONS TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advertisement_id UUID REFERENCES advertisements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_url TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad ON ad_impressions(advertisement_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_date ON ad_impressions(viewed_at);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for idempotency)
DROP POLICY IF EXISTS "Anyone can view active ads" ON advertisements;
DROP POLICY IF EXISTS "Admins can manage all ads" ON advertisements;
DROP POLICY IF EXISTS "Anyone can insert ad clicks" ON ad_clicks;
DROP POLICY IF EXISTS "Admins can view all ad clicks" ON ad_clicks;
DROP POLICY IF EXISTS "Anyone can insert ad impressions" ON ad_impressions;
DROP POLICY IF EXISTS "Admins can view all ad impressions" ON ad_impressions;

-- Advertisements Policies
CREATE POLICY "Anyone can view active ads"
  ON advertisements FOR SELECT
  USING (
    is_active = true 
    AND start_date <= NOW() 
    AND (end_date IS NULL OR end_date >= NOW())
  );

CREATE POLICY "Admins can manage all ads"
  ON advertisements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Ad Clicks Policies
CREATE POLICY "Anyone can insert ad clicks"
  ON ad_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all ad clicks"
  ON ad_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Ad Impressions Policies
CREATE POLICY "Anyone can insert ad impressions"
  ON ad_impressions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all ad impressions"
  ON ad_impressions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get active ads for a position
CREATE OR REPLACE FUNCTION get_active_ads(
  p_position VARCHAR(20),
  p_page VARCHAR(50) DEFAULT 'all',
  p_category_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(100),
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  call_to_action VARCHAR(50),
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.description,
    a.image_url,
    a.link_url,
    a.call_to_action,
    a.priority
  FROM advertisements a
  WHERE 
    a.position = p_position
    AND a.is_active = true
    AND a.start_date <= NOW()
    AND (a.end_date IS NULL OR a.end_date >= NOW())
    AND (a.target_page = 'all' OR a.target_page = p_page)
    AND (a.target_category_id IS NULL OR a.target_category_id = p_category_id)
  ORDER BY a.priority DESC, RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record ad impression
CREATE OR REPLACE FUNCTION record_ad_impression(
  p_ad_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert impression record
  INSERT INTO ad_impressions (advertisement_id, user_id, page_url)
  VALUES (p_ad_id, p_user_id, p_page_url);
  
  -- Increment impressions counter
  UPDATE advertisements
  SET impressions = impressions + 1
  WHERE id = p_ad_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record ad click
CREATE OR REPLACE FUNCTION record_ad_click(
  p_ad_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert click record
  INSERT INTO ad_clicks (advertisement_id, user_id, ip_address, user_agent, referrer)
  VALUES (p_ad_id, p_user_id, p_ip_address, p_user_agent, p_referrer);
  
  -- Increment clicks counter
  UPDATE advertisements
  SET clicks = clicks + 1
  WHERE id = p_ad_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get ad analytics
CREATE OR REPLACE FUNCTION get_ad_analytics(p_ad_id UUID)
RETURNS TABLE (
  total_impressions BIGINT,
  total_clicks BIGINT,
  click_through_rate DECIMAL(5, 2),
  unique_viewers BIGINT,
  unique_clickers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT i.id)::BIGINT as total_impressions,
    COUNT(DISTINCT c.id)::BIGINT as total_clicks,
    CASE 
      WHEN COUNT(DISTINCT i.id) > 0 THEN 
        (COUNT(DISTINCT c.id)::DECIMAL / COUNT(DISTINCT i.id) * 100)
      ELSE 0
    END as click_through_rate,
    COUNT(DISTINCT i.user_id)::BIGINT as unique_viewers,
    COUNT(DISTINCT c.user_id)::BIGINT as unique_clickers
  FROM advertisements a
  LEFT JOIN ad_impressions i ON i.advertisement_id = a.id
  LEFT JOIN ad_clicks c ON c.advertisement_id = a.id
  WHERE a.id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. SAMPLE ADVERTISEMENTS (OPTIONAL)
-- ============================================

/*
-- Sample left sidebar ad
INSERT INTO advertisements (
  title, 
  description, 
  image_url, 
  link_url, 
  call_to_action, 
  position, 
  priority,
  target_page
) VALUES (
  'Winter Sale!',
  'Get 30% off all winter hoodies',
  '/ads/winter-sale.jpg',
  '/products?category=winter',
  'Shop Now',
  'left_sidebar',
  10,
  'all'
);

-- Sample right sidebar ad
INSERT INTO advertisements (
  title, 
  description, 
  image_url, 
  link_url, 
  call_to_action, 
  position, 
  priority,
  target_page
) VALUES (
  'New Arrivals',
  'Check out our latest hoodie designs',
  '/ads/new-arrivals.jpg',
  '/products?sort=newest',
  'Explore',
  'right_sidebar',
  5,
  'home'
);
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Create admin ad management interface
-- 2. Build sidebar ad components
-- 3. Implement ad rotation logic
-- 4. Add analytics dashboard
-- ============================================
