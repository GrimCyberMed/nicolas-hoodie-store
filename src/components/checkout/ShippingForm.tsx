'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { ShippingAddress } from '@/types';

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void;
  initialData?: ShippingAddress | null;
}

export function ShippingForm({ onSubmit, initialData }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>(
    initialData || {
      full_name: '',
      email: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ShippingAddress]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Shipping Information</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
          />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Address Line 1 */}
        <div>
          <label htmlFor="address_line1" className="block text-sm font-medium text-foreground mb-1">
            Address Line 1 *
          </label>
          <input
            type="text"
            id="address_line1"
            name="address_line1"
            value={formData.address_line1}
            onChange={handleChange}
            placeholder="Street address, P.O. box"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
          />
          {errors.address_line1 && <p className="text-red-500 text-sm mt-1">{errors.address_line1}</p>}
        </div>

        {/* Address Line 2 */}
        <div>
          <label htmlFor="address_line2" className="block text-sm font-medium text-foreground mb-1">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            id="address_line2"
            name="address_line2"
            value={formData.address_line2}
            onChange={handleChange}
            placeholder="Apartment, suite, unit, building, floor, etc."
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-foreground mb-1">
              State *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-foreground mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
            {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-foreground mb-1">
            Country *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other</option>
          </select>
          {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button type="submit" className="w-full">
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
