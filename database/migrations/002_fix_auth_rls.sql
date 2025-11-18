-- ============================================
-- FIX AUTHENTICATION RLS POLICIES
-- Fixes the chicken-and-egg problem with user signup
-- ============================================
-- Run this in your Supabase SQL Editor AFTER 001_auth_tables.sql
-- This migration is IDEMPOTENT - safe to run multiple times
-- ============================================

-- ============================================
-- 1. DROP ALL EXISTING POLICIES (for clean slate)
-- ============================================

-- Drop user_roles policies
DROP POLICY IF EXISTS "Only admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Allow trigger to insert new user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON user_roles;

-- Drop orders policies (in case they exist from 001)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Only admins can update orders" ON orders;
DROP POLICY IF EXISTS "Only admins can delete orders" ON orders;

-- ============================================
-- 2. RECREATE USER_ROLES POLICIES
-- ============================================

-- Policy: Users can view their own role
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Allow trigger function to insert new user roles
-- This allows the SECURITY DEFINER trigger to bypass RLS
CREATE POLICY "Allow trigger to insert new user roles"
  ON user_roles FOR INSERT
  WITH CHECK (
    -- Allow if being inserted by the trigger (no current user yet)
    auth.uid() IS NULL
    OR
    -- Or if current user is an admin
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update roles
CREATE POLICY "Only admins can update roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
  ON user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 3. RECREATE ORDERS POLICIES
-- ============================================

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    is_admin(auth.uid())
  );

-- Policy: Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Only admins can update orders
CREATE POLICY "Only admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin(auth.uid()));

-- Policy: Only admins can delete orders
CREATE POLICY "Only admins can delete orders"
  ON orders FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- 3. VERIFY TRIGGER FUNCTION
-- ============================================

-- Recreate the trigger function to ensure it has proper permissions
CREATE OR REPLACE FUNCTION create_default_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with explicit role to avoid any ambiguity
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create user role: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_role();

-- ============================================
-- 4. GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant the trigger function permission to insert into user_roles
GRANT INSERT ON user_roles TO postgres;
GRANT INSERT ON user_roles TO authenticated;
GRANT INSERT ON user_roles TO service_role;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- This should fix the signup issue!
-- Test by creating a new user account.
-- ============================================
