'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  call_to_action: string;
  position: 'left_sidebar' | 'right_sidebar' | 'banner_top' | 'banner_bottom';
  priority: number;
  target_page: 'all' | 'home' | 'products' | 'product_detail' | 'cart' | 'checkout';
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  impressions: number;
  clicks: number;
  created_at: string;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    image_url: string;
    link_url: string;
    call_to_action: string;
    position: 'left_sidebar' | 'right_sidebar' | 'banner_top' | 'banner_bottom';
    priority: number;
    target_page: 'all' | 'home' | 'products' | 'product_detail' | 'cart' | 'checkout';
    start_date: string;
    end_date: string | null;
    is_active: boolean;
  }>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    call_to_action: 'Learn More',
    position: 'right_sidebar',
    priority: 0,
    target_page: 'all',
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    is_active: true,
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAd) {
        const { error } = await supabase
          .from('advertisements')
          .update(formData)
          .eq('id', editingAd.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert([formData]);

        if (error) throw error;
      }

      resetForm();
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      alert('Failed to save advertisement');
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      image_url: ad.image_url,
      link_url: ad.link_url,
      call_to_action: ad.call_to_action,
      position: ad.position,
      priority: ad.priority,
      target_page: ad.target_page,
      start_date: ad.start_date.split('T')[0],
      end_date: ad.end_date ? ad.end_date.split('T')[0] : null,
      is_active: ad.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Failed to delete advertisement');
    }
  };

  const toggleActive = async (ad: Advertisement) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !ad.is_active })
        .eq('id', ad.id);

      if (error) throw error;
      fetchAds();
    } catch (error) {
      console.error('Error toggling ad:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      call_to_action: 'Learn More',
      position: 'right_sidebar',
      priority: 0,
      target_page: 'all',
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      is_active: true,
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const calculateCTR = (ad: Advertisement) => {
    if (ad.impressions === 0) return '0.00';
    return ((ad.clicks / ad.impressions) * 100).toFixed(2);
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
          <h1 className="text-3xl font-bold text-foreground">Advertisements</h1>
          <p className="text-muted-foreground mt-1">Manage sidebar and banner advertisements</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Create Advertisement
        </Button>
      </div>

      {/* Ad Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {editingAd ? 'Edit Advertisement' : 'New Advertisement'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  required
                  placeholder="Summer Sale!"
                />
              </div>

              {/* Call to Action */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Call to Action *
                </label>
                <input
                  type="text"
                  value={formData.call_to_action}
                  onChange={(e) => setFormData({ ...formData, call_to_action: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  required
                  placeholder="Shop Now"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Link URL *
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  required
                  placeholder="https://example.com/sale"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                >
                  <option value="left_sidebar">Left Sidebar</option>
                  <option value="right_sidebar">Right Sidebar</option>
                  <option value="banner_top">Banner Top</option>
                  <option value="banner_bottom">Banner Bottom</option>
                </select>
              </div>

              {/* Target Page */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Target Page *
                </label>
                <select
                  value={formData.target_page}
                  onChange={(e) => setFormData({ ...formData, target_page: e.target.value as any })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                >
                  <option value="all">All Pages</option>
                  <option value="home">Home</option>
                  <option value="products">Products</option>
                  <option value="product_detail">Product Detail</option>
                  <option value="cart">Cart</option>
                  <option value="checkout">Checkout</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  placeholder="0"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
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
                placeholder="Internal description for this ad"
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
                Active (show this ad)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit">
                {editingAd ? 'Update' : 'Create'} Advertisement
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Ads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ads.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            No advertisements created yet. Click "Create Advertisement" to get started.
          </div>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="bg-card border border-border rounded-lg p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg">{ad.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-foreground">
                      {ad.position.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ad.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {ad.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {ad.image_url && (
                <div className="relative h-48 bg-muted rounded-lg overflow-hidden mb-4">
                  <Image
                    src={ad.image_url}
                    alt={ad.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{ad.impressions}</div>
                  <div className="text-xs text-muted-foreground">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{ad.clicks}</div>
                  <div className="text-xs text-muted-foreground">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{calculateCTR(ad)}%</div>
                  <div className="text-xs text-muted-foreground">CTR</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div><strong className="text-foreground">CTA:</strong> {ad.call_to_action}</div>
                <div><strong className="text-foreground">Target:</strong> {ad.target_page}</div>
                <div><strong className="text-foreground">Priority:</strong> {ad.priority}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(ad)}
                  className="flex-1 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(ad)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                >
                  {ad.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
