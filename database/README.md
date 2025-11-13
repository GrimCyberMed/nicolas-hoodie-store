# Database Schema Documentation

## Overview

This directory contains the database schema for the Nicolas Hoodie Store. The schema is designed for Supabase (PostgreSQL) and includes all necessary tables, indexes, triggers, and Row Level Security (RLS) policies.

## Quick Start

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Run the Schema

1. Open your Supabase project
2. Go to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and click **Run**

### 3. Verify Installation

Run this query to check if tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- products
- orders
- order_items
- categories
- product_images
- admin_users

## Tables

### 1. Products

Main product catalog table.

**Columns:**
- `id` - UUID primary key
- `name` - Product name (required)
- `description` - Product description
- `price` - Product price (required)
- `sale_price` - Sale price (optional)
- `image_url` - Main product image (required)
- `stock_quantity` - Available stock
- `category` - Product category
- `size` - Product size (XS, S, M, L, XL, XXL)
- `color` - Product color
- `tags` - Array of tags
- `featured` - Featured product flag
- `on_sale` - On sale flag
- `sku` - Stock Keeping Unit (unique)
- `slug` - URL-friendly identifier (unique)
- `status` - published/draft
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Indexes:**
- Category, price, featured, on_sale, slug, status
- Full-text search on name and description

### 2. Orders

Customer orders.

**Columns:**
- `id` - UUID primary key
- `user_id` - Reference to auth.users (optional)
- `customer_email` - Customer email (required)
- `customer_name` - Customer name
- `status` - Order status (pending, processing, completed, cancelled)
- `total` - Total amount
- `subtotal` - Subtotal before tax/shipping
- `tax` - Tax amount
- `shipping` - Shipping cost
- `stripe_payment_id` - Stripe payment ID
- `stripe_session_id` - Stripe session ID
- `shipping_address` - JSONB shipping address
- `billing_address` - JSONB billing address
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 3. Order Items

Items within orders.

**Columns:**
- `id` - UUID primary key
- `order_id` - Reference to orders
- `product_id` - Reference to products
- `quantity` - Item quantity
- `price` - Price at time of purchase
- `product_name` - Product name snapshot
- `product_image` - Product image snapshot
- `created_at` - Creation timestamp

### 4. Categories

Product categories (future expansion).

**Columns:**
- `id` - UUID primary key
- `name` - Category name (unique)
- `slug` - URL-friendly identifier (unique)
- `description` - Category description
- `parent_id` - Parent category (for subcategories)
- `image_url` - Category image
- `sort_order` - Display order
- `created_at` - Creation timestamp

### 5. Product Images

Multiple images per product.

**Columns:**
- `id` - UUID primary key
- `product_id` - Reference to products
- `image_url` - Image URL
- `alt_text` - Alt text for accessibility
- `sort_order` - Display order
- `is_primary` - Primary image flag
- `created_at` - Creation timestamp

### 6. Admin Users

Admin user management.

**Columns:**
- `id` - UUID primary key
- `user_id` - Reference to auth.users (unique)
- `email` - Admin email (unique)
- `role` - Admin role
- `created_at` - Creation timestamp

## Row Level Security (RLS)

### Products
- **Read**: Public (everyone)
- **Write**: Admins only

### Orders
- **Read**: Own orders (users) or all (admins)
- **Create**: Authenticated users
- **Update**: Admins only

### Order Items
- **Read**: Follow order permissions

### Categories
- **Read**: Public
- **Write**: Admins only

### Product Images
- **Read**: Public
- **Write**: Admins only

### Admin Users
- **Read**: Admins only

## Views

### product_stats
Statistics about products:
- Total products
- In stock count
- Out of stock count
- Featured count
- On sale count
- Average/min/max price
- Total stock

### order_stats
Statistics about orders:
- Total orders
- Pending/completed counts
- Total revenue
- Average order value
- Unique customers

## Sample Data

The schema includes sample data:
- 6 sample products
- 4 categories

To skip sample data, remove the INSERT statements before running.

## Environment Variables

After setting up the database, update your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Admin Setup

To make a user an admin:

```sql
INSERT INTO admin_users (user_id, email, role)
VALUES ('user-uuid-here', 'admin@example.com', 'admin');
```

Replace `user-uuid-here` with the actual user UUID from `auth.users`.

## Maintenance

### Update Product Stock

```sql
UPDATE products 
SET stock_quantity = stock_quantity - 1 
WHERE id = 'product-id';
```

### Mark Order as Completed

```sql
UPDATE orders 
SET status = 'completed' 
WHERE id = 'order-id';
```

### Get Low Stock Products

```sql
SELECT name, stock_quantity 
FROM products 
WHERE stock_quantity < 5 
AND status = 'published'
ORDER BY stock_quantity ASC;
```

## Troubleshooting

### RLS Policies Not Working

Check if RLS is enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Slow Queries

Check if indexes exist:

```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### Full-Text Search Not Working

Rebuild the search index:

```sql
REINDEX INDEX idx_products_search;
```

## Migration

If you need to update the schema later, create migration files:

```sql
-- migration_001_add_column.sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS new_column TEXT;
```

Run migrations in order.

## Backup

Supabase automatically backs up your database. To create a manual backup:

1. Go to Supabase Dashboard
2. Settings → Database
3. Click "Download Backup"

## Support

For issues:
1. Check Supabase logs
2. Verify RLS policies
3. Check environment variables
4. Review SQL errors in Supabase SQL Editor

---

**Schema Version:** 1.0.0  
**Last Updated:** Phase 3 Complete  
**Compatible With:** Supabase PostgreSQL 15+
