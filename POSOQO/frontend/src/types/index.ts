// types/index.ts
export * from './checkout';

// Exportar tipos de homepage con alias para evitar conflictos
export type { 
  Product as HomepageProduct,
  Service as HomepageService,
  HomeData,
  HeroSectionProps,
  FeaturedProductsProps,
  ServicesSectionProps,
  ClubSectionProps,
  ContactSectionProps
} from './homepage';

// Exportar tipos de dashboard con alias para evitar conflictos
export type {
  Category as DashboardCategory,
  Product as DashboardProduct,
  ProductFormData,
  ProductModalProps,
  ProductCardProps,
  ProductFiltersProps,
  ProductStatsProps,
  ImageUploadProps
} from './dashboard';
