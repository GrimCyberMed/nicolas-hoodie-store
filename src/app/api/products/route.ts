import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST create product
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        description: body.description,
        price: body.price,
        sale_price: body.sale_price,
        image_url: body.image_url,
        stock_quantity: body.stock_quantity,
        category: body.category,
        size: body.size,
        color: body.color,
        sku: body.sku,
        slug: body.slug,
        featured: body.featured,
        on_sale: body.on_sale,
        status: body.status || 'published',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET products list
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { 
          error: 'Database not configured',
          products: [],
          pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 12 },
          filters: { availableCategories: [], priceRange: { min: 0, max: 1000 }, availableColors: [], availableSizes: [] }
        },
        { status: 503 }
      );
    }
    const searchParams = request.nextUrl.searchParams;
    
    // Get filter parameters
    const search = searchParams.get('search') || '';
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000');
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
    const inStockOnly = searchParams.get('inStockOnly') === 'true';
    const onSaleOnly = searchParams.get('onSaleOnly') === 'true';
    const sortBy = searchParams.get('sortBy') || 'featured';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build query
    let query = supabase.from('products').select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply category filter
    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    // Apply price range filter
    query = query.gte('price', minPrice).lte('price', maxPrice);

    // Apply stock filter
    if (inStockOnly) {
      query = query.gt('stock_quantity', 0);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('name', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('name', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        // Featured - you can add a 'featured' column later
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: products, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Get available filter options
    const { data: allProducts } = await supabase
      .from('products')
      .select('category, price');

    const availableCategories = allProducts
      ? [...new Set(allProducts.map((p: any) => p.category).filter(Boolean))]
      : [];

    const prices = allProducts?.map((p: any) => p.price) || [];
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 1000,
    };

    return NextResponse.json({
      products: products || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalItems: count || 0,
        itemsPerPage: limit,
      },
      filters: {
        availableCategories,
        priceRange,
        availableColors: ['Black', 'Navy', 'Grey', 'White', 'Red'],
        availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
