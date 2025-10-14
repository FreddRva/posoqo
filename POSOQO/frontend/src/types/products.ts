export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'popularity';
export type ViewMode = 'grid' | 'list';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  image_url?: string;
  category?: string;
  category_id?: string;
  subcategory_id?: string;
  subcategory?: string;
  stock?: number;
  rating?: number;
}

export interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
}

export interface FilterState {
  search: string;
  category: string;
  subcategory: string;
  sort: SortOption;
  viewMode: ViewMode;
  showMap: boolean;
  priceRange: [number, number];
}
