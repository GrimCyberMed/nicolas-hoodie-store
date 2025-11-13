import { create } from 'zustand';

export type SortOption = 
  | 'featured'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'newest';

interface FilterState {
  // Filter values
  searchQuery: string;
  categories: string[];
  priceRange: { min: number; max: number };
  colors: string[];
  sizes: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sortBy: SortOption;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setColors: (colors: string[]) => void;
  toggleColor: (color: string) => void;
  setSizes: (sizes: string[]) => void;
  toggleSize: (size: string) => void;
  setInStockOnly: (value: boolean) => void;
  setOnSaleOnly: (value: boolean) => void;
  setSortBy: (sortBy: SortOption) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  clearFilters: () => void;
  resetPagination: () => void;
}

const initialState = {
  searchQuery: '',
  categories: [],
  priceRange: { min: 0, max: 1000 },
  colors: [],
  sizes: [],
  inStockOnly: false,
  onSaleOnly: false,
  sortBy: 'featured' as SortOption,
  currentPage: 1,
  itemsPerPage: 12,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  
  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
  },
  
  setCategories: (categories) => {
    set({ categories, currentPage: 1 });
  },
  
  toggleCategory: (category) => {
    set((state) => ({
      categories: state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category],
      currentPage: 1,
    }));
  },
  
  setPriceRange: (range) => {
    set({ priceRange: range, currentPage: 1 });
  },
  
  setColors: (colors) => {
    set({ colors, currentPage: 1 });
  },
  
  toggleColor: (color) => {
    set((state) => ({
      colors: state.colors.includes(color)
        ? state.colors.filter((c) => c !== color)
        : [...state.colors, color],
      currentPage: 1,
    }));
  },
  
  setSizes: (sizes) => {
    set({ sizes, currentPage: 1 });
  },
  
  toggleSize: (size) => {
    set((state) => ({
      sizes: state.sizes.includes(size)
        ? state.sizes.filter((s) => s !== size)
        : [...state.sizes, size],
      currentPage: 1,
    }));
  },
  
  setInStockOnly: (value) => {
    set({ inStockOnly: value, currentPage: 1 });
  },
  
  setOnSaleOnly: (value) => {
    set({ onSaleOnly: value, currentPage: 1 });
  },
  
  setSortBy: (sortBy) => {
    set({ sortBy, currentPage: 1 });
  },
  
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },
  
  setItemsPerPage: (count) => {
    set({ itemsPerPage: count, currentPage: 1 });
  },
  
  clearFilters: () => {
    set(initialState);
  },
  
  resetPagination: () => {
    set({ currentPage: 1 });
  },
}));
