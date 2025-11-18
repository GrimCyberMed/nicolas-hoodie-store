-- ============================================
-- THEME SYSTEM MIGRATION
-- Phase 9: Holiday Themes & Customization
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. SITE THEMES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS site_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Theme Type
  theme_type VARCHAR(30) NOT NULL CHECK (theme_type IN (
    'default', 'holiday', 'seasonal', 'promotional', 'custom'
  )),
  
  -- Color Scheme
  primary_color VARCHAR(7), -- Hex color
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  
  -- Additional Styling
  font_family VARCHAR(100),
  border_radius VARCHAR(20), -- e.g., 'rounded', 'sharp', 'pill'
  
  -- Assets
  logo_url TEXT,
  favicon_url TEXT,
  background_image_url TEXT,
  banner_image_url TEXT,
  
  -- Custom CSS
  custom_css TEXT,
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  
  -- Priority (higher = takes precedence)
  priority INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_themes_active ON site_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_site_themes_dates ON site_themes(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_site_themes_priority ON site_themes(priority DESC);
CREATE INDEX IF NOT EXISTS idx_site_themes_type ON site_themes(theme_type);

-- ============================================
-- 2. THEME SCHEDULES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS theme_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID REFERENCES site_themes(id) ON DELETE CASCADE NOT NULL,
  schedule_name VARCHAR(100) NOT NULL,
  
  -- Recurrence
  recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('once', 'daily', 'weekly', 'monthly', 'yearly')),
  
  -- Date/Time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  start_time TIME,
  end_time TIME,
  
  -- Days of week (for weekly recurrence)
  days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
  
  -- Specific dates (for yearly recurrence like holidays)
  specific_dates DATE[],
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_theme_schedules_theme ON theme_schedules(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_schedules_active ON theme_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_theme_schedules_dates ON theme_schedules(start_date, end_date);

-- ============================================
-- 3. THEME ELEMENTS TABLE
-- ============================================
-- For granular control over specific UI elements

CREATE TABLE IF NOT EXISTS theme_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID REFERENCES site_themes(id) ON DELETE CASCADE NOT NULL,
  element_name VARCHAR(100) NOT NULL, -- e.g., 'header', 'footer', 'button', 'card'
  element_styles JSONB NOT NULL, -- CSS properties as JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_id, element_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_theme_elements_theme ON theme_elements(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_elements_name ON theme_elements(element_name);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE site_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_elements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for idempotency)
DROP POLICY IF EXISTS "Anyone can view active themes" ON site_themes;
DROP POLICY IF EXISTS "Admins can manage all themes" ON site_themes;
DROP POLICY IF EXISTS "Anyone can view active schedules" ON theme_schedules;
DROP POLICY IF EXISTS "Admins can manage all schedules" ON theme_schedules;
DROP POLICY IF EXISTS "Anyone can view theme elements" ON theme_elements;
DROP POLICY IF EXISTS "Admins can manage theme elements" ON theme_elements;

-- Site Themes Policies
CREATE POLICY "Anyone can view active themes"
  ON site_themes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all themes"
  ON site_themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Theme Schedules Policies
CREATE POLICY "Anyone can view active schedules"
  ON theme_schedules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all schedules"
  ON theme_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Theme Elements Policies
CREATE POLICY "Anyone can view theme elements"
  ON theme_elements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM site_themes
      WHERE id = theme_id AND is_active = true
    )
  );

CREATE POLICY "Admins can manage theme elements"
  ON theme_elements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get current active theme
CREATE OR REPLACE FUNCTION get_active_theme()
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  theme_type VARCHAR(30),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  font_family VARCHAR(100),
  border_radius VARCHAR(20),
  logo_url TEXT,
  favicon_url TEXT,
  background_image_url TEXT,
  banner_image_url TEXT,
  custom_css TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.theme_type,
    t.primary_color,
    t.secondary_color,
    t.accent_color,
    t.background_color,
    t.text_color,
    t.font_family,
    t.border_radius,
    t.logo_url,
    t.favicon_url,
    t.background_image_url,
    t.banner_image_url,
    t.custom_css
  FROM site_themes t
  WHERE 
    t.is_active = true
    AND (t.start_date IS NULL OR t.start_date <= NOW())
    AND (t.end_date IS NULL OR t.end_date >= NOW())
  ORDER BY t.priority DESC, t.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate a theme
CREATE OR REPLACE FUNCTION activate_theme(p_theme_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Deactivate all other themes
  UPDATE site_themes
  SET is_active = false
  WHERE is_active = true AND id != p_theme_id;
  
  -- Activate the specified theme
  UPDATE site_themes
  SET is_active = true, updated_at = NOW()
  WHERE id = p_theme_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check scheduled themes and auto-activate
CREATE OR REPLACE FUNCTION check_scheduled_themes()
RETURNS VOID AS $$
DECLARE
  v_theme_id UUID;
  v_current_time TIME;
  v_current_date DATE;
  v_current_dow INTEGER;
BEGIN
  v_current_time := CURRENT_TIME;
  v_current_date := CURRENT_DATE;
  v_current_dow := EXTRACT(DOW FROM NOW())::INTEGER;
  
  -- Find highest priority scheduled theme that should be active now
  SELECT ts.theme_id INTO v_theme_id
  FROM theme_schedules ts
  JOIN site_themes st ON st.id = ts.theme_id
  WHERE 
    ts.is_active = true
    AND ts.start_date <= NOW()
    AND ts.end_date >= NOW()
    AND (
      ts.recurrence_type = 'once'
      OR (ts.recurrence_type = 'weekly' AND v_current_dow = ANY(ts.days_of_week))
      OR (ts.recurrence_type = 'yearly' AND v_current_date = ANY(ts.specific_dates))
    )
    AND (ts.start_time IS NULL OR v_current_time >= ts.start_time)
    AND (ts.end_time IS NULL OR v_current_time <= ts.end_time)
  ORDER BY st.priority DESC
  LIMIT 1;
  
  -- If a scheduled theme is found, activate it
  IF v_theme_id IS NOT NULL THEN
    PERFORM activate_theme(v_theme_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. DEFAULT THEMES
-- ============================================

-- Insert default theme
INSERT INTO site_themes (
  name, 
  description, 
  theme_type, 
  is_default, 
  is_active,
  primary_color,
  secondary_color,
  accent_color,
  priority
) VALUES (
  'Default Theme',
  'The standard Nicolas Hoodie Store theme',
  'default',
  true,
  true,
  '#3B82F6', -- Blue
  '#6B7280', -- Gray
  '#10B981', -- Green
  0
) ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 7. HOLIDAY THEME PRESETS
-- ============================================

-- Christmas Theme
INSERT INTO site_themes (
  name,
  description,
  theme_type,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  text_color,
  priority
) VALUES (
  'Christmas',
  'Festive Christmas theme with red and green colors',
  'holiday',
  '#DC2626', -- Red
  '#16A34A', -- Green
  '#FCD34D', -- Gold
  '#FEF3C7', -- Light cream
  '#1F2937', -- Dark gray
  10
) ON CONFLICT (name) DO NOTHING;

-- Halloween Theme
INSERT INTO site_themes (
  name,
  description,
  theme_type,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  text_color,
  priority
) VALUES (
  'Halloween',
  'Spooky Halloween theme with orange and black',
  'holiday',
  '#F97316', -- Orange
  '#1F2937', -- Dark gray/black
  '#A855F7', -- Purple
  '#18181B', -- Very dark
  '#F3F4F6', -- Light gray
  10
) ON CONFLICT (name) DO NOTHING;

-- Valentine's Day Theme
INSERT INTO site_themes (
  name,
  description,
  theme_type,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  text_color,
  priority
) VALUES (
  'Valentine''s Day',
  'Romantic Valentine''s Day theme with pink and red',
  'holiday',
  '#EC4899', -- Pink
  '#DC2626', -- Red
  '#FDE68A', -- Light yellow
  '#FEF2F2', -- Light pink
  '#1F2937', -- Dark gray
  10
) ON CONFLICT (name) DO NOTHING;

-- Black Friday Theme
INSERT INTO site_themes (
  name,
  description,
  theme_type,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  text_color,
  priority
) VALUES (
  'Black Friday',
  'High-contrast Black Friday sale theme',
  'promotional',
  '#000000', -- Black
  '#FCD34D', -- Gold
  '#DC2626', -- Red
  '#111827', -- Very dark gray
  '#FFFFFF', -- White
  15
) ON CONFLICT (name) DO NOTHING;

-- Summer Theme
INSERT INTO site_themes (
  name,
  description,
  theme_type,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  text_color,
  priority
) VALUES (
  'Summer',
  'Bright and sunny summer theme',
  'seasonal',
  '#F59E0B', -- Amber/Orange
  '#06B6D4', -- Cyan
  '#FCD34D', -- Yellow
  '#FEF3C7', -- Light cream
  '#1F2937', -- Dark gray
  5
) ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. SAMPLE THEME SCHEDULES
-- ============================================

/*
-- Schedule Christmas theme for December
INSERT INTO theme_schedules (
  theme_id,
  schedule_name,
  recurrence_type,
  start_date,
  end_date,
  specific_dates
) VALUES (
  (SELECT id FROM site_themes WHERE name = 'Christmas'),
  'Christmas Season',
  'yearly',
  '2025-12-01'::TIMESTAMPTZ,
  '2025-12-26'::TIMESTAMPTZ,
  ARRAY['12-01', '12-25']::DATE[]
);

-- Schedule Halloween theme for October
INSERT INTO theme_schedules (
  theme_id,
  schedule_name,
  recurrence_type,
  start_date,
  end_date,
  specific_dates
) VALUES (
  (SELECT id FROM site_themes WHERE name = 'Halloween'),
  'Halloween Season',
  'yearly',
  '2025-10-15'::TIMESTAMPTZ,
  '2025-10-31'::TIMESTAMPTZ,
  ARRAY['10-31']::DATE[]
);
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Create admin theme manager interface
-- 2. Build theme preview functionality
-- 3. Implement theme switching logic in frontend
-- 4. Set up cron job to check scheduled themes
-- ============================================
