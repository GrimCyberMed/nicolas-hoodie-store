# Database Migrations

This folder contains database migration files for the Nicolas Hoodie Store.

## How to Run Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vxcztsfafhjqefogtmcw
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste into the SQL Editor
5. Click **Run** to execute

## Migration Files

### 001_auth_tables.sql
**Status:** Ready to run  
**Purpose:** Authentication & Authorization System  
**Includes:**
- `user_roles` table for managing user permissions
- Row Level Security (RLS) policies
- Helper functions (`is_admin`, `get_user_role`)
- Auto-trigger to create default customer role
- Orders table RLS policies

**Run this migration to enable:**
- User authentication
- Admin/Customer role system
- Protected admin routes
- User-specific order viewing

## Creating Your First Admin User

After running migration `001_auth_tables.sql`:

1. Sign up through the app with your email
2. Go to Supabase SQL Editor
3. Run this query (replace with your email):

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## Migration Order

Run migrations in numerical order:
1. `001_auth_tables.sql` - Authentication system
2. (Future migrations will be added here)

## Rollback

If you need to rollback a migration, see the rollback section in each migration file.
