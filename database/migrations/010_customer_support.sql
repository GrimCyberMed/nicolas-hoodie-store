-- ============================================
-- CUSTOMER SUPPORT SYSTEM MIGRATION
-- Phase 12: Support Tickets & FAQ
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. SUPPORT TICKETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number VARCHAR(20) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Contact Info (for non-logged-in users)
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(100),
  
  -- Ticket Details
  subject VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'order_issue', 'product_question', 'shipping', 'returns', 
    'payment', 'account', 'technical', 'feedback', 'other'
  )),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  
  -- Related Order (optional)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);

-- ============================================
-- 2. TICKET MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'admin', 'system')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachments JSONB, -- Array of attachment URLs
  is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to customer
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender ON ticket_messages(sender_id);

-- ============================================
-- 3. FAQ TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS faq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'orders', 'shipping', 'returns', 'payments', 'products', 'account', 'general'
  )),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_items_active ON faq_items(is_active);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view own ticket messages" ON ticket_messages;
DROP POLICY IF EXISTS "Users can create messages on own tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON ticket_messages;
DROP POLICY IF EXISTS "Anyone can view active FAQs" ON faq_items;
DROP POLICY IF EXISTS "Admins can manage FAQs" ON faq_items;

-- Support Tickets Policies
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id OR customer_email = auth.email());

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Ticket Messages Policies
CREATE POLICY "Users can view own ticket messages"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id AND (user_id = auth.uid() OR customer_email = auth.email())
    )
    AND is_internal = false
  );

CREATE POLICY "Users can create messages on own tickets"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id AND (user_id = auth.uid() OR customer_email = auth.email())
    )
    AND sender_type = 'customer'
  );

CREATE POLICY "Admins can manage all messages"
  ON ticket_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- FAQ Policies
CREATE POLICY "Anyone can view active FAQs"
  ON faq_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
  ON faq_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  v_number VARCHAR(20);
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate format: TKT-YYYYMMDD-XXXX
    v_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM support_tickets WHERE ticket_number = v_number) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_ticket_created ON support_tickets;
CREATE TRIGGER on_ticket_created
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Function to update ticket timestamp
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON ticket_messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_timestamp();

-- ============================================
-- 6. DEFAULT FAQ ITEMS
-- ============================================

INSERT INTO faq_items (question, answer, category, sort_order) VALUES
  ('How do I track my order?', 'You can track your order by logging into your account and visiting the Orders page. You''ll find tracking information for all shipped orders there.', 'orders', 1),
  ('What is your return policy?', 'We offer a 30-day return policy for unworn items with original tags. Simply contact our support team to initiate a return.', 'returns', 1),
  ('How long does shipping take?', 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available at checkout for an additional fee.', 'shipping', 1),
  ('What payment methods do you accept?', 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.', 'payments', 1),
  ('How do I change my password?', 'Go to your Profile page and click on "Change Password". You''ll need to enter your current password and then your new password twice.', 'account', 1),
  ('Do you ship internationally?', 'Yes! We ship to most countries worldwide. Shipping costs and delivery times vary by location.', 'shipping', 2),
  ('How do I use a discount code?', 'Enter your discount code in the "Promo Code" field during checkout and click "Apply". The discount will be reflected in your order total.', 'orders', 2),
  ('What sizes do you offer?', 'Our hoodies come in sizes XS through 3XL. Check the size guide on each product page for detailed measurements.', 'products', 1),
  ('How do I earn loyalty points?', 'You earn 1 point for every dollar spent. Points can be redeemed for discounts on future purchases. Higher loyalty tiers earn bonus multipliers!', 'account', 2),
  ('Can I cancel my order?', 'Orders can be cancelled within 1 hour of placement. After that, please contact support and we''ll do our best to help.', 'orders', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Create admin support dashboard
-- 2. Create customer support page
-- 3. Add email notifications for tickets
-- 4. Implement live chat (optional)
-- ============================================
