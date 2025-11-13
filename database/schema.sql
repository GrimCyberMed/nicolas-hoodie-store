-- ============================================
-- NICOLAS HOODIE STORE - DATABASE SCHEMA
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PRODUCTS TABLE (Enhanced)
-- ============================================

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns for enhanced functionality
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS size VARCHAR(10),
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS on_sale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_on_sale ON products(on_sale);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_products_search 
ON products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================
-- 2. ORDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  status TEXT DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 3. ORDER ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- 4. CATEGORIES TABLE (Future expansion)
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- ============================================
-- 5. PRODUCT IMAGES TABLE (Multiple images)
-- ============================================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- ============================================
-- 6. ADMIN USERS TABLE (Simple admin auth)
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- ============================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY "Products are insertable by admins" 
  ON products FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Products are updatable by admins" 
  ON products FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Products are deletable by admins" 
  ON products FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Orders: Users can view their own, admins can view all
CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Orders are insertable by authenticated users" 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Orders are updatable by admins" 
  ON orders FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Order Items: Follow order permissions
CREATE POLICY "Order items are viewable with order" 
  ON order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
    )
  );

-- Categories: Public read, admin write
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  USING (true);

CREATE POLICY "Categories are manageable by admins" 
  ON categories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Product Images: Public read, admin write
CREATE POLICY "Product images are viewable by everyone" 
  ON product_images FOR SELECT 
  USING (true);

CREATE POLICY "Product images are manageable by admins" 
  ON product_images FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Admin Users: Only viewable by admins
CREATE POLICY "Admin users are viewable by admins" 
  ON admin_users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 9. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample products
INSERT INTO products (name, description, price, image_url, stock_quantity, category, size, color, featured, sku, slug, status) 
VALUES
  (
    'Classic Black Hoodie', 
    'Premium heavyweight cotton hoodie in timeless black. Features a kangaroo pocket, adjustable drawstring hood, and ribbed cuffs for the perfect fit.', 
    59.99, 
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 
    25, 
    'Classic',
    'M',
    'Black',
    true,
    'CBH-001',
    'classic-black-hoodie',
    'published'
  ),
  (
    'Navy Blue Essential', 
    'Comfortable everyday hoodie with kangaroo pocket. Made from soft cotton blend for all-day comfort.', 
    49.99, 
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', 
    30, 
    'Essential',
    'L',
    'Navy',
    true,
    'NBE-002',
    'navy-blue-essential',
    'published'
  ),
  (
    'Grey Minimalist', 
    'Sleek minimalist design for modern style. Clean lines and premium fabric make this a wardrobe staple.', 
    54.99, 
    'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800', 
    20, 
    'Modern',
    'M',
    'Grey',
    false,
    'GM-003',
    'grey-minimalist',
    'published'
  ),
  (
    'White Premium Hoodie', 
    'Luxury white hoodie with superior craftsmanship. Perfect for layering or wearing solo.', 
    69.99, 
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800', 
    15, 
    'Premium',
    'L',
    'White',
    true,
    'WPH-004',
    'white-premium-hoodie',
    'published'
  ),
  (
    'Red Statement Hoodie', 
    'Bold red hoodie that makes a statement. High-quality fabric with vibrant color that lasts.', 
    64.99, 
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 
    18, 
    'Modern',
    'XL',
    'Red',
    false,
    'RSH-005',
    'red-statement-hoodie',
    'published'
  ),
  (
    'Charcoal Classic', 
    'Versatile charcoal hoodie for any occasion. Timeless design meets modern comfort.', 
    52.99, 
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', 
    22, 
    'Classic',
    'M',
    'Grey',
    false,
    'CC-006',
    'charcoal-classic',
    'published'
  )
ON CONFLICT (sku) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, description, sort_order)
VALUES
  ('Classic', 'classic', 'Timeless hoodie designs that never go out of style', 1),
  ('Modern', 'modern', 'Contemporary styles for the fashion-forward', 2),
  ('Essential', 'essential', 'Everyday basics you can count on', 3),
  ('Premium', 'premium', 'Luxury hoodies with superior quality', 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 10. USEFUL VIEWS (Optional)
-- ============================================

-- View for product statistics
CREATE OR REPLACE VIEW product_stats AS
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE stock_quantity > 0) as in_stock,
  COUNT(*) FILTER (WHERE stock_quantity = 0) as out_of_stock,
  COUNT(*) FILTER (WHERE featured = true) as featured_count,
  COUNT(*) FILTER (WHERE on_sale = true) as on_sale_count,
  AVG(price) as average_price,
  MIN(price) as min_price,
  MAX(price) as max_price,
  SUM(stock_quantity) as total_stock
FROM products
WHERE status = 'published';

-- View for order statistics
CREATE OR REPLACE VIEW order_stats AS
SELECT 
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
  SUM(total) as total_revenue,
  AVG(total) as average_order_value,
  COUNT(DISTINCT customer_email) as unique_customers
FROM orders;

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- Your database is now ready for the Nicolas Hoodie Store!
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Configure environment variables
-- 3. Test the application
-- ============================================
