'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface ProductFormProps {
  product?: Product;
  isEdit?: boolean;
}

const CATEGORIES = ['Classic', 'Modern', 'Essential', 'Premium'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'Navy', 'Grey', 'White', 'Red'];

export function ProductForm({ product, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    sale_price: product?.sale_price?.toString() || '',
    image_url: product?.image_url || '',
    stock_quantity: product?.stock_quantity?.toString() || '0',
    category: product?.category || '',
    size: product?.size || '',
    color: product?.color || '',
    sku: product?.sku || '',
    slug: product?.slug || '',
    featured: product?.featured || false,
    on_sale: product?.on_sale || false,
    status: product?.status || 'published',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEdit ? `/api/products/${product?.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
          stock_quantity: parseInt(formData.stock_quantity),
        }),
      });

      if (response.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug });
  };

  const generateSKU = () => {
    const prefix = formData.category?.substring(0, 3).toUpperCase() || 'PRD';
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData({ ...formData, sku: `${prefix}-${random}` });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <Input
                label="Product Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Classic Black Hoodie"
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price *"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="0.00"
                />

                <Input
                  label="Sale Price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <Input
                label="Image URL *"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                required
                placeholder="https://example.com/image.jpg"
              />

              {formData.image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Inventory</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    SKU
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="PRD-001"
                    />
                    <Button type="button" onClick={generateSKU} variant="outline">
                      Generate
                    </Button>
                  </div>
                </div>

                <Input
                  label="Stock Quantity *"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Organization</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select size</option>
                  {SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Color
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select color</option>
                  {COLORS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Slug
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="product-slug"
                  />
                  <Button type="button" onClick={generateSlug} variant="outline">
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-sm text-foreground">Featured Product</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.on_sale}
                  onChange={(e) => setFormData({ ...formData, on_sale: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-sm text-foreground">On Sale</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
