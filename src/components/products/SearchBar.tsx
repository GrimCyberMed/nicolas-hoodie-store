'use client';

import { useState, useEffect } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useDebounce } from '@/hooks/useDebounce';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useFilterStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 500);

  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search hint */}
      {localQuery !== debouncedQuery && (
        <div className="absolute right-0 top-full mt-1 text-xs text-secondary">
          Searching...
        </div>
      )}
    </div>
  );
}
