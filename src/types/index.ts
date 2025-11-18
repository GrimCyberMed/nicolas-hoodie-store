// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image_url: string;
  stock_quantity: number;
  category?: string;
  size?: string;
  color?: string;
  tags?: string[];
  featured?: boolean;
  on_sale?: boolean;
  sku?: string;
  slug?: string;
  status?: 'published' | 'draft';
  created_at: string;
  updated_at?: string;
}

// Cart Types
export interface CartItem extends Product {
  quantity: number;
}

// Order Types
export interface Order {
  id: string;
  user_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal?: number;
  discount_amount?: number;
  shipping_cost?: number;
  shipping_address?: ShippingAddress;
  payment_method?: string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

// Shipping Types
export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// Checkout Types
export interface CheckoutData {
  shipping_address: ShippingAddress;
  billing_same_as_shipping: boolean;
  billing_address?: ShippingAddress;
  payment_method: 'card' | 'paypal';
  discount_code?: string;
}

// Customer Types
export interface Customer {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

// Contact Form Types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

// Auth Types
export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role?: 'admin' | 'customer';
  created_at: string;
}
