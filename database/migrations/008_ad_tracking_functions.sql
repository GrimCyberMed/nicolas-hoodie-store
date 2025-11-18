-- ============================================
-- ADVERTISEMENT TRACKING FUNCTIONS
-- Phase 10: Ad Impression & Click Tracking
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. INCREMENT IMPRESSIONS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE advertisements
  SET impressions = impressions + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. INCREMENT CLICKS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE advertisements
  SET clicks = clicks + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. GRANT PERMISSIONS
-- ============================================

-- Allow anonymous and authenticated users to call these functions
GRANT EXECUTE ON FUNCTION increment_ad_impressions(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_ad_impressions(UUID) TO authenticated;

GRANT EXECUTE ON FUNCTION increment_ad_clicks(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_ad_clicks(UUID) TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- These functions allow tracking ad performance
-- without requiring direct table access
-- ============================================
