import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only throw error in production or when actually using Supabase
const isConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // Fallback for build time

// Helper function to fetch all products
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data;
}

// Helper function to fetch a single product
export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data;
}

// Helper function to update product stock
export async function updateProductStock(productId: string, quantity: number) {
  const { data, error } = await supabase
    .from('products')
    .update({ stock_quantity: quantity })
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating stock:', error);
    throw error;
  }

  return data;
}
