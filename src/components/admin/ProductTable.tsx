'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-secondary mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="text-lg font-semibold text-foreground mb-2">No products yet</h3>
        <p className="text-secondary mb-4">Get started by adding your first product</p>
        <Link href="/admin/products/new">
          <Button variant="primary">Add Product</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Product</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">SKU</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Category</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Price</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Stock</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Status</th>
            <th className="text-right py-4 px-4 text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-sm text-secondary truncate">{product.description?.substring(0, 50)}...</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-foreground font-mono">{product.sku || 'N/A'}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-foreground">{product.category || 'Uncategorized'}</span>
              </td>
              <td className="py-4 px-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</p>
                  {product.on_sale && product.sale_price && (
                    <p className="text-xs text-secondary line-through">{formatPrice(product.sale_price)}</p>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock_quantity === 0
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : product.stock_quantity < 5
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  {product.stock_quantity} units
                </span>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}
                >
                  {product.status || 'published'}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <button
                      className="p-2 text-secondary hover:text-accent transition-colors"
                      title="Edit product"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        onDelete(product.id);
                      }
                    }}
                    className="p-2 text-secondary hover:text-red-500 transition-colors"
                    title="Delete product"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
