// types/dashboard.ts
export interface Category {
  id: string;
  name: string;
  parent_id?: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  category_id?: string;
  subcategory_id?: string;
  estilo?: string;
  abv?: string;
  ibu?: string;
  color?: string;
  is_active?: boolean;
  is_featured?: boolean;
  stock?: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  subcategory_id: string;
  estilo: string;
  abv: string;
  ibu: string;
  color: string;
  is_active: boolean;
  is_featured: boolean;
  stock: number;
}

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  subcategories: Category[];
  onSave: (product: ProductFormData) => void;
  loading?: boolean;
}

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

export interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Category[];
  onClearFilters: () => void;
}

export interface ProductStatsProps {
  total: number;
  active: number;
  featured: number;
  outOfStock: number;
}

export interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  loading?: boolean;
}
