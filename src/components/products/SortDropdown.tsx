'use client';

import { useFilterStore, SortOption } from '@/store/filterStore';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'newest', label: 'Newest First' },
];

export function SortDropdown() {
  const { sortBy, setSortBy } = useFilterStore();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-foreground whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sort"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
