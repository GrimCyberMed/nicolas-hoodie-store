'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    openCart();
  };

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 5;

  return (
    <div className="group relative bg-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-border">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-xl font-bold">Out of Stock</span>
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Only {product.stock_quantity} left!
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent">
            {product.name}
          </h3>
          <p className="text-secondary text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {!isOutOfStock && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
