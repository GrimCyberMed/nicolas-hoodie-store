# 🚀 How to Apply Database Migrations

## Critical: Fix Authentication Signup Issue

### Step 1: Apply Migration 002_fix_auth_rls.sql

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/vxcztsfafhjqefogtmcw
   - Navigate to: **SQL Editor** (left sidebar)

2. **Run the Migration:**
   - Click "New Query"
   - Copy the entire contents of `002_fix_auth_rls.sql`
   - Paste into the SQL editor
   - Click "Run" button

3. **Verify Success:**
   - You should see: "Success. No rows returned"
   - Check for any error messages

### Step 2: Test Signup

1. **Go to your app:**
   - Navigate to: `/auth/signup`
   - Try creating a new account

2. **Expected Result:**
   - Account should be created successfully
   - You should be redirected to login page
   - No "Database error saving new user" message

### Step 3: Verify User Role Created

1. **Check in Supabase:**
   - Go to: **Table Editor** > `user_roles`
   - You should see a new row with:
     - `user_id`: Your new user's ID
     - `role`: 'customer'

## What This Migration Fixes

The original migration had a chicken-and-egg problem:
- **Problem:** INSERT policy required user to be admin
- **Issue:** New users couldn't get their first role created
- **Solution:** Allow trigger function to insert when `auth.uid()` IS NULL

## Next Steps After Migration

1. ✅ Test signup with a new email
2. ✅ Test login with the new account
3. ✅ Create your first admin user (see below)
4. ✅ Verify role-based access control

## Creating Your First Admin User

After you've successfully created a regular user account:

```sql
-- Run this in Supabase SQL Editor
-- Replace 'your-email@example.com' with your actual email

UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

Then logout and login again to see admin features!
