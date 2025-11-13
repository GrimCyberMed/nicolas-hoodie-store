'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchBar } from '@/components/products/SearchBar';
import { FilterPanel } from '@/components/products/FilterPanel';
import { SortDropdown } from '@/components/products/SortDropdown';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Pagination } from '@/components/products/Pagination';
import { useFilterStore } from '@/store/filterStore';
import { Product } from '@/types';

interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters: {
    availableCategories: string[];
    priceRange: { min: number; max: number };
    availableColors: string[];
    availableSizes: string[];
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    searchQuery,
    categories,
    priceRange,
    colors,
    sizes,
    inStockOnly,
    onSaleOnly,
    sortBy,
    currentPage,
    itemsPerPage,
  } = useFilterStore();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      try {
        const params = new URLSearchParams({
          search: searchQuery,
          categories: categories.join(','),
          minPrice: priceRange.min.toString(),
          maxPrice: priceRange.max.toString(),
          colors: colors.join(','),
          sizes: sizes.join(','),
          inStockOnly: inStockOnly.toString(),
          onSaleOnly: onSaleOnly.toString(),
          sortBy,
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        });

        const response = await fetch(`/api/products?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data: ProductsResponse = await response.json();
        setProducts(data.products);
        setTotalItems(data.pagination.totalItems);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    categories,
    priceRange,
    colors,
    sizes,
    inStockOnly,
    onSaleOnly,
    sortBy,
    currentPage,
    itemsPerPage,
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">All Products</h1>
            <p className="text-secondary">
              Discover our collection of premium hoodies
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar */}
            <aside className="lg:col-span-1">
              <FilterPanel />
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-secondary">
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      Showing {products.length} of {totalItems} products
                    </>
                  )}
                </p>
                <SortDropdown />
              </div>

              {/* Products */}
              <ProductGrid products={products} isLoading={isLoading} />

              {/* Pagination */}
              {!isLoading && <Pagination totalItems={totalItems} />}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
