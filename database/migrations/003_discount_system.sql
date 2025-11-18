-- ============================================
-- DISCOUNT SYSTEM MIGRATION
-- Phase 6: Discount Codes & Promotions
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. DISCOUNT CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  
  -- Discount Type
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'buy_x_get_y', 'free_shipping')),
  
  -- Discount Value
  discount_value DECIMAL(10, 2) NOT NULL, -- Percentage (0-100) or fixed amount
  
  -- Conditions
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2), -- Cap for percentage discounts
  
  -- Buy X Get Y specific fields
  buy_quantity INTEGER, -- Buy X items
  get_quantity INTEGER, -- Get Y items free/discounted
  applicable_product_ids UUID[], -- Specific products this applies to
  
  -- Usage Limits
  usage_limit INTEGER, -- Total times code can be used (NULL = unlimited)
  usage_count INTEGER DEFAULT 0, -- Times code has been used
  per_user_limit INTEGER DEFAULT 1, -- Times each user can use it
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_dates ON discount_codes(valid_from, valid_until);

-- ============================================
-- 2. DISCOUNT USAGE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS discount_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discount_usage_code ON discount_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_user ON discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_order ON discount_usage(order_id);

-- ============================================
-- 3. UPDATE ORDERS TABLE FOR DISCOUNTS
-- ============================================

-- Add discount fields to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id),
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Update total calculation to include discount
-- total = subtotal - discount_amount + shipping_cost

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for idempotency)
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Only admins can manage discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Users can view own discount usage" ON discount_usage;
DROP POLICY IF EXISTS "Admins can view all discount usage" ON discount_usage;

-- Discount Codes Policies
CREATE POLICY "Anyone can view active discount codes"
  ON discount_codes FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Only admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Discount Usage Policies
CREATE POLICY "Users can view own discount usage"
  ON discount_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all discount usage"
  ON discount_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to validate discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_cart_total DECIMAL(10, 2)
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_id UUID,
  discount_amount DECIMAL(10, 2),
  error_message TEXT
) AS $$
DECLARE
  v_discount discount_codes%ROWTYPE;
  v_user_usage_count INTEGER;
  v_calculated_discount DECIMAL(10, 2);
BEGIN
  -- Get discount code
  SELECT * INTO v_discount
  FROM discount_codes
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
  FROM discount_usage
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
    -- Apply max discount cap if set
    IF v_discount.max_discount_amount IS NOT NULL THEN
      v_calculated_discount := LEAST(v_calculated_discount, v_discount.max_discount_amount);
    END IF;
  ELSIF v_discount.discount_type = 'fixed' THEN
    v_calculated_discount := v_discount.discount_value;
  ELSIF v_discount.discount_type = 'free_shipping' THEN
    v_calculated_discount := 0; -- Handled separately in checkout
  ELSE
    v_calculated_discount := 0;
  END IF;
  
  -- Return valid discount
  RETURN QUERY SELECT true, v_discount.id, v_calculated_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply discount code
CREATE OR REPLACE FUNCTION apply_discount_code(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_order_id UUID,
  p_discount_amount DECIMAL(10, 2)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_discount_id UUID;
BEGIN
  -- Get discount code ID
  SELECT id INTO v_discount_id
  FROM discount_codes
  WHERE code = p_code;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Record usage
  INSERT INTO discount_usage (discount_code_id, user_id, order_id, discount_amount)
  VALUES (v_discount_id, p_user_id, p_order_id, p_discount_amount);
  
  -- Increment usage count
  UPDATE discount_codes
  SET usage_count = usage_count + 1
  WHERE id = v_discount_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. SAMPLE DISCOUNT CODES (OPTIONAL)
-- ============================================

-- Uncomment to create sample discount codes

/*
-- 10% off everything
INSERT INTO discount_codes (code, description, discount_type, discount_value, min_purchase_amount)
VALUES ('WELCOME10', '10% off your first order', 'percentage', 10, 0);

-- $20 off orders over $100
INSERT INTO discount_codes (code, description, discount_type, discount_value, min_purchase_amount)
VALUES ('SAVE20', '$20 off orders over $100', 'fixed', 20, 100);

-- Free shipping
INSERT INTO discount_codes (code, description, discount_type, discount_value, min_purchase_amount)
VALUES ('FREESHIP', 'Free shipping on all orders', 'free_shipping', 0, 0);

-- Limited time 25% off (expires in 30 days)
INSERT INTO discount_codes (code, description, discount_type, discount_value, usage_limit, valid_until)
VALUES ('FLASH25', 'Flash sale - 25% off!', 'percentage', 25, 100, NOW() + INTERVAL '30 days');
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Create admin discount management UI
-- 2. Add discount code input to cart/checkout
-- 3. Implement discount validation in frontend
-- ============================================
