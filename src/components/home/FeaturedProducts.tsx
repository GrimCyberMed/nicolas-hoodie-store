'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/modules/catalog/ProductCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=3&sortBy=featured');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-secondary text-lg">
            Check out our most popular hoodies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/products">
            <Button variant="primary" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
