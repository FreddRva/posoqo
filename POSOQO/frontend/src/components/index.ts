// components/index.ts
// Shared components
export * from './shared';

// UI components
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
export { default as ProductModal } from './ProductModal';
export { default as FeaturedFoods } from './FeaturedFoods';
export { default as CheckoutMap } from './CheckoutMap';
export { default as OrderMap } from './OrderMap';
export { default as WhatsappButton } from './WhatsappButton';
export { default as DashboardWrapper } from './DashboardWrapper';
export { NotificationProvider } from './NotificationSystem';

// Loading components
export * from './LoadingStates';
export { default as LoadingSpinner } from './LoadingSpinner';

// Error components
export { default as ErrorBoundary } from './ErrorBoundary';
export { ErrorBoundaryProvider } from './ErrorBoundaryProvider';
export * from './ErrorBoundaries';

// Homepage components
export { HeroSection } from './homepage/HeroSection';
export { FeaturedProducts } from './homepage/FeaturedProducts';
export { ServicesSection } from './homepage/ServicesSection';
export { ClubSection } from './homepage/ClubSection';
export { ContactSection } from './homepage/ContactSection';

// Dashboard components
export { ProductStats } from './dashboard/ProductStats';
export { ProductFilters } from './dashboard/ProductFilters';
export { ProductCard } from './dashboard/ProductCard';
export { ImageUpload } from './dashboard/ImageUpload';
export { ProductModal as DashboardProductModal } from './dashboard/ProductModal';

// Checkout components
export { default as ProfileForm } from './checkout/ProfileForm';
export { default as AddressForm } from './checkout/AddressForm';
export { default as OrderSummary } from './checkout/OrderSummary';
