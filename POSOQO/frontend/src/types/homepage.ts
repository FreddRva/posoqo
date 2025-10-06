// types/homepage.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  image?: string;
  category?: string;
  style?: string;
  abv?: string;
  ibu?: string;
  color?: string;
  image_url?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface HomeData {
  featuredCervezas: Product[];
  featuredComidas: Product[];
  services: Service[];
}

export interface HeroSectionProps {
  onScrollToProducts: () => void;
}

export interface FeaturedProductsProps {
  products: Product[];
  title: string;
  description: string;
  onProductClick: (product: Product) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export interface ServicesSectionProps {
  services: Service[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export interface ClubSectionProps {
  onJoinClub: () => void;
}

export interface ContactSectionProps {
  onContact: () => void;
}
