'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);

  const [formData, setFormData] = useState<{
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping';
    discount_value: number;
    min_purchase_amount: number;
    max_discount_amount: number | null;
    usage_limit: number | null;
    per_user_limit: number;
    valid_from: string;
    valid_until: string | null;
    is_active: boolean;
  }>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase_amount: 0,
    max_discount_amount: null,
    usage_limit: null,
    per_user_limit: 1,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: null,
    is_active: true,
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDiscount) {
        // Update existing discount
        const { error } = await supabase
          .from('discount_codes')
          .update(formData)
          .eq('id', editingDiscount.id);

        if (error) throw error;
      } else {
        // Create new discount
        const { error } = await supabase
          .from('discount_codes')
          .insert([formData]);

        if (error) throw error;
      }

      // Reset form and refresh
      resetForm();
      fetchDiscounts();
    } catch (error) {
      console.error('Error saving discount:', error);
      alert('Failed to save discount code');
    }
  };

  const handleEdit = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      min_purchase_amount: discount.min_purchase_amount,
      max_discount_amount: discount.max_discount_amount,
      usage_limit: discount.usage_limit,
      per_user_limit: discount.per_user_limit,
      valid_from: discount.valid_from.split('T')[0],
      valid_until: discount.valid_until ? discount.valid_until.split('T')[0] : null,
      is_active: discount.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      alert('Failed to delete discount code');
    }
  };

  const toggleActive = async (discount: DiscountCode) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !discount.is_active })
        .eq('id', discount.id);

      if (error) throw error;
      fetchDiscounts();
    } catch (error) {
      console.error('Error toggling discount:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase_amount: 0,
      max_discount_amount: null,
      usage_limit: null,
      per_user_limit: 1,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: null,
      is_active: true,
    });
    setEditingDiscount(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discount Codes</h1>
          <p className="text-muted-foreground mt-1">Manage promotional discount codes</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Create Discount Code
        </Button>
      </div>

      {/* Discount Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {editingDiscount ? 'Edit Discount Code' : 'New Discount Code'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  required
                  placeholder="SAVE10"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Type *
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *
                </label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Min Purchase */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Minimum Purchase ($)
                </label>
                <input
                  type="number"
                  value={formData.min_purchase_amount}
                  onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  value={formData.usage_limit || ''}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  placeholder="Unlimited"
                  min="1"
                />
              </div>

              {/* Per User Limit */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Per User Limit
                </label>
                <input
                  type="number"
                  value={formData.per_user_limit}
                  onChange={(e) => setFormData({ ...formData, per_user_limit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  required
                  min="1"
                />
              </div>

              {/* Valid From */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Valid From *
                </label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  required
                />
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={formData.valid_until || ''}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || null })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                rows={3}
                placeholder="Internal description for this discount code"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm text-foreground">
                Active (users can use this code)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit">
                {editingDiscount ? 'Update' : 'Create'} Discount Code
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Discounts List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {discounts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No discount codes created yet. Click "Create Discount Code" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {discounts.map((discount) => (
                  <tr key={discount.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">{discount.code}</div>
                      {discount.description && (
                        <div className="text-sm text-muted-foreground">{discount.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground capitalize">
                      {discount.discount_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {discount.discount_type === 'percentage' 
                        ? `${discount.discount_value}%`
                        : `$${discount.discount_value}`
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {discount.usage_count} / {discount.usage_limit || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(discount)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          discount.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="text-accent hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
