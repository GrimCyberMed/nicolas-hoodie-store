-- ============================================
-- FIX SUPABASE LINTER ISSUES
-- Fixes 2 errors and 18 warnings from Supabase linter
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. FIX SECURITY DEFINER VIEWS (2 ERRORS)
-- ============================================

-- Drop and recreate order_stats view WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.order_stats;
CREATE VIEW public.order_stats AS
SELECT 
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as average_order_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM public.orders;

-- Drop and recreate product_stats view WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.product_stats;
CREATE VIEW public.product_stats AS
SELECT 
  p.id,
  p.name,
  p.stock_quantity,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.price * oi.quantity) as total_revenue
FROM public.products p
LEFT JOIN public.order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name, p.stock_quantity;

-- ============================================
-- 2. FIX FUNCTION SEARCH PATHS (18 WARNINGS)
-- ============================================

-- Fix: validate_discount_code
CREATE OR REPLACE FUNCTION public.validate_discount_code(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_cart_total DECIMAL(10, 2)
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_id UUID,
  discount_amount DECIMAL(10, 2),
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_discount discount_codes%ROWTYPE;
  v_user_usage_count INTEGER;
  v_calculated_discount DECIMAL(10, 2);
BEGIN
  -- Get discount code
  SELECT * INTO v_discount
  FROM public.discount_codes
  WHERE code = p_code AND is_active = true;
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Invalid discount code';
    RETURN;
  END IF;
  
  -- Check validity dates
  IF v_discount.valid_from > NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Discount code not yet valid';
    RETURN;
  END IF;
  
  IF v_discount.valid_until IS NOT NULL AND v_discount.valid_until < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Discount code has expired';
    RETURN;
  END IF;
  
  -- Check usage limit
  IF v_discount.usage_limit IS NOT NULL AND v_discount.usage_count >= v_discount.usage_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Discount code usage limit reached';
    RETURN;
  END IF;
  
  -- Check per-user limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM public.discount_usage
  WHERE discount_code_id = v_discount.id AND user_id = p_user_id;
  
  IF v_user_usage_count >= v_discount.per_user_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'You have already used this discount code';
    RETURN;
  END IF;
  
  -- Check minimum purchase amount
  IF p_cart_total < v_discount.min_purchase_amount THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 
      'Minimum purchase amount of $' || v_discount.min_purchase_amount || ' required';
    RETURN;
  END IF;
  
  -- Calculate discount amount
  IF v_discount.discount_type = 'percentage' THEN
    v_calculated_discount := (p_cart_total * v_discount.discount_value / 100);
    IF v_discount.max_discount_amount IS NOT NULL THEN
      v_calculated_discount := LEAST(v_calculated_discount, v_discount.max_discount_amount);
    END IF;
  ELSIF v_discount.discount_type = 'fixed' THEN
    v_calculated_discount := v_discount.discount_value;
  ELSIF v_discount.discount_type = 'free_shipping' THEN
    v_calculated_discount := 0;
  ELSE
    v_calculated_discount := 0;
  END IF;
  
  RETURN QUERY SELECT true, v_discount.id, v_calculated_discount, NULL::TEXT;
END;
$$;

-- Fix: apply_discount_code
CREATE OR REPLACE FUNCTION public.apply_discount_code(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_order_id UUID,
  p_discount_amount DECIMAL(10, 2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_discount_id UUID;
BEGIN
  SELECT id INTO v_discount_id
  FROM public.discount_codes
  WHERE code = p_code;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.discount_usage (discount_code_id, user_id, order_id, discount_amount)
  VALUES (v_discount_id, p_user_id, p_order_id, p_discount_amount);
  
  UPDATE public.discount_codes
  SET usage_count = usage_count + 1
  WHERE id = v_discount_id;
  
  RETURN true;
END;
$$;

-- Fix: initialize_loyalty_account
CREATE OR REPLACE FUNCTION public.initialize_loyalty_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.loyalty_points (user_id, points_balance, lifetime_points)
  VALUES (NEW.id, 0, 0);
  
  PERFORM public.award_points(NEW.id, 100, 'signup_bonus', 'Welcome bonus for joining!');
  
  RETURN NEW;
END;
$$;

-- Fix: award_points
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR(30),
  p_description TEXT DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_expires_in_days INTEGER DEFAULT 365
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  
  INSERT INTO public.points_transactions (user_id, points, transaction_type, description, order_id, expires_at)
  VALUES (p_user_id, p_points, p_transaction_type, p_description, p_order_id, v_expires_at);
  
  UPDATE public.loyalty_points
  SET 
    points_balance = points_balance + p_points,
    lifetime_points = lifetime_points + p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  PERFORM public.update_user_tier(p_user_id);
  
  RETURN true;
END;
$$;

-- Fix: redeem_points
CREATE OR REPLACE FUNCTION public.redeem_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR(30),
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  SELECT points_balance INTO v_current_balance
  FROM public.loyalty_points
  WHERE user_id = p_user_id;
  
  IF v_current_balance < p_points THEN
    RAISE EXCEPTION 'Insufficient points balance';
  END IF;
  
  INSERT INTO public.points_transactions (user_id, points, transaction_type, description)
  VALUES (p_user_id, -p_points, p_transaction_type, p_description);
  
  UPDATE public.loyalty_points
  SET 
    points_balance = points_balance - p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$;

-- Fix: update_user_tier
CREATE OR REPLACE FUNCTION public.update_user_tier(p_user_id UUID)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_lifetime_points INTEGER;
  v_new_tier VARCHAR(20);
BEGIN
  SELECT lifetime_points INTO v_lifetime_points
  FROM public.loyalty_points
  WHERE user_id = p_user_id;
  
  IF v_lifetime_points >= 10000 THEN
    v_new_tier := 'platinum';
  ELSIF v_lifetime_points >= 5000 THEN
    v_new_tier := 'gold';
  ELSIF v_lifetime_points >= 2000 THEN
    v_new_tier := 'silver';
  ELSE
    v_new_tier := 'bronze';
  END IF;
  
  UPDATE public.loyalty_points
  SET tier = v_new_tier, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN v_new_tier;
END;
$$;

-- Fix: calculate_purchase_points
CREATE OR REPLACE FUNCTION public.calculate_purchase_points(
  p_user_id UUID,
  p_order_total DECIMAL(10, 2)
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_base_points INTEGER;
  v_tier VARCHAR(20);
  v_multiplier INTEGER;
  v_total_points INTEGER;
BEGIN
  SELECT points_value INTO v_base_points
  FROM public.loyalty_rules
  WHERE rule_type = 'points_per_dollar' AND is_active = true
  LIMIT 1;
  
  SELECT tier INTO v_tier
  FROM public.loyalty_points
  WHERE user_id = p_user_id;
  
  SELECT points_value INTO v_multiplier
  FROM public.loyalty_rules
  WHERE rule_type = 'tier_multiplier' AND tier = v_tier AND is_active = true;
  
  v_total_points := FLOOR(p_order_total * COALESCE(v_base_points, 1) * COALESCE(v_multiplier, 1));
  
  RETURN v_total_points;
END;
$$;

-- Fix: get_active_ads
CREATE OR REPLACE FUNCTION public.get_active_ads(
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
  FROM public.advertisements a
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
$$;

-- Fix: record_ad_impression
CREATE OR REPLACE FUNCTION public.record_ad_impression(
  p_ad_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.ad_impressions (advertisement_id, user_id, page_url)
  VALUES (p_ad_id, p_user_id, p_page_url);
  
  UPDATE public.advertisements
  SET impressions = impressions + 1
  WHERE id = p_ad_id;
  
  RETURN true;
END;
$$;

-- Fix: record_ad_click
CREATE OR REPLACE FUNCTION public.record_ad_click(
  p_ad_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.ad_clicks (advertisement_id, user_id, ip_address, user_agent, referrer)
  VALUES (p_ad_id, p_user_id, p_ip_address, p_user_agent, p_referrer);
  
  UPDATE public.advertisements
  SET clicks = clicks + 1
  WHERE id = p_ad_id;
  
  RETURN true;
END;
$$;

-- Fix: get_ad_analytics
CREATE OR REPLACE FUNCTION public.get_ad_analytics(p_ad_id UUID)
RETURNS TABLE (
  total_impressions BIGINT,
  total_clicks BIGINT,
  click_through_rate DECIMAL(5, 2),
  unique_viewers BIGINT,
  unique_clickers BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
  FROM public.advertisements a
  LEFT JOIN public.ad_impressions i ON i.advertisement_id = a.id
  LEFT JOIN public.ad_clicks c ON c.advertisement_id = a.id
  WHERE a.id = p_ad_id;
END;
$$;

-- Fix: get_active_theme
CREATE OR REPLACE FUNCTION public.get_active_theme()
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
  FROM public.site_themes t
  WHERE 
    t.is_active = true
    AND (t.start_date IS NULL OR t.start_date <= NOW())
    AND (t.end_date IS NULL OR t.end_date >= NOW())
  ORDER BY t.priority DESC, t.created_at DESC
  LIMIT 1;
END;
$$;

-- Fix: activate_theme
CREATE OR REPLACE FUNCTION public.activate_theme(p_theme_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.site_themes
  SET is_active = false
  WHERE is_active = true AND id != p_theme_id;
  
  UPDATE public.site_themes
  SET is_active = true, updated_at = NOW()
  WHERE id = p_theme_id;
  
  RETURN true;
END;
$$;

-- Fix: check_scheduled_themes
CREATE OR REPLACE FUNCTION public.check_scheduled_themes()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_theme_id UUID;
  v_current_time TIME;
  v_current_date DATE;
  v_current_dow INTEGER;
BEGIN
  v_current_time := CURRENT_TIME;
  v_current_date := CURRENT_DATE;
  v_current_dow := EXTRACT(DOW FROM NOW())::INTEGER;
  
  SELECT ts.theme_id INTO v_theme_id
  FROM public.theme_schedules ts
  JOIN public.site_themes st ON st.id = ts.theme_id
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
  
  IF v_theme_id IS NOT NULL THEN
    PERFORM public.activate_theme(v_theme_id);
  END IF;
END;
$$;

-- Fix: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Fix: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$;

-- Fix: get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(user_role, 'customer');
END;
$$;

-- Fix: create_default_user_role
CREATE OR REPLACE FUNCTION public.create_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user role: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All 2 errors and 18 warnings should now be resolved!
-- Re-run the Supabase linter to verify.
-- ============================================
