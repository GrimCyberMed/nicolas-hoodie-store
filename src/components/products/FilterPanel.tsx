'use client';

import { useFilterStore } from '@/store/filterStore';
import { Button } from '@/components/ui/Button';

const CATEGORIES = ['Classic', 'Modern', 'Essential', 'Premium'];
const COLORS = ['Black', 'Navy', 'Grey', 'White', 'Red'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $150', min: 100, max: 150 },
  { label: 'Over $150', min: 150, max: 1000 },
];

export function FilterPanel() {
  const {
    categories,
    toggleCategory,
    colors,
    toggleColor,
    sizes,
    toggleSize,
    priceRange,
    setPriceRange,
    inStockOnly,
    setInStockOnly,
    onSaleOnly,
    setOnSaleOnly,
    clearFilters,
  } = useFilterStore();

  const hasActiveFilters =
    categories.length > 0 ||
    colors.length > 0 ||
    sizes.length > 0 ||
    inStockOnly ||
    onSaleOnly ||
    priceRange.min > 0 ||
    priceRange.max < 1000;

  return (
    <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Category</h3>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Price Range</h3>
          <div className="space-y-2">
            {PRICE_RANGES.map((range) => (
              <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="priceRange"
                  checked={priceRange.min === range.min && priceRange.max === range.max}
                  onChange={() => setPriceRange({ min: range.min, max: range.max })}
                  className="w-4 h-4 border-border text-accent focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Color Filter */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Color</h3>
          <div className="space-y-2">
            {COLORS.map((color) => (
              <label key={color} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={colors.includes(color)}
                  onChange={() => toggleColor(color)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                  {color}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Size Filter */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Size</h3>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  sizes.includes(size)
                    ? 'border-accent bg-accent text-background'
                    : 'border-border bg-background text-foreground hover:border-accent'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Filters */}
        <div className="pt-6 border-t border-border space-y-3">
          <h3 className="text-sm font-semibold text-foreground mb-3">Availability</h3>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
            />
            <span className="text-sm text-foreground group-hover:text-accent transition-colors">
              In Stock Only
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={onSaleOnly}
              onChange={(e) => setOnSaleOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
            />
            <span className="text-sm text-foreground group-hover:text-accent transition-colors">
              On Sale
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
