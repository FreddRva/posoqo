"use client";

import React, { useRef, Suspense } from "react";
import { Montserrat, Playfair_Display, Inter } from "next/font/google";
import { useSession } from "next-auth/react";

// Components
import Footer from "@/components/Footer";
import ProductModal from "@/components/ProductModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MainLoadingSkeleton } from "@/components/LoadingStates";
import { useHomeData } from "@/hooks/useHomeData";

// Homepage Components
import { HeroSection } from "@/components/homepage/HeroSection";
import { TraditionSection } from "@/components/homepage/TraditionSection";
import { FeaturedProducts } from "@/components/homepage/FeaturedProducts";
import { ServicesSection } from "@/components/homepage/ServicesSection";
import { ClubSection } from "@/components/homepage/ClubSection";
import { ContactSection } from "@/components/homepage/ContactSection";

// Types
import { Product, Service } from "@/types/homepage";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

// Componente principal optimizado
function HomePageContent() {
  const productosRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  
  // Hook personalizado para datos de la página
  const { data, loading, error, refetch } = useHomeData();

  // Estado para el modal de producto
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Handlers
  const handleScrollToProducts = () => {
    productosRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleJoinClub = () => {
    // Lógica para unirse al club
    console.log('Join club clicked');
  };

  const handleContact = () => {
    // Lógica para contacto
    console.log('Contact clicked');
  };

  return (
    <div className={`min-h-screen bg-black ${montserrat.className}`}>
      {/* Hero Section */}
      <HeroSection onScrollToProducts={handleScrollToProducts} />

      {/* Tradition Section - Nueva sección */}
      <TraditionSection />

      {/* Sección de productos destacados - Cervezas */}
      <div ref={productosRef}>
        <FeaturedProducts
          products={data?.featuredCervezas || []}
          title="Cervezas"
          description="Nuestras cervezas artesanales más populares"
          onProductClick={handleProductClick}
          loading={loading}
          error={error}
          onRetry={refetch}
        />
      </div>

      {/* Sección de comidas destacadas */}
      <FeaturedProducts
        products={data?.featuredComidas || []}
        title="Comidas"
        description="Deliciosos platos que acompañan perfectamente nuestras cervezas"
        onProductClick={handleProductClick}
        loading={loading}
        error={error}
        onRetry={refetch}
      />

      {/* Sección de servicios */}
      <ServicesSection
        services={data?.services || []}
        loading={loading}
        error={error}
        onRetry={refetch}
      />


      {/* Club de miembros */}
      <section id="club">
        <ClubSection />
      </section>

      {/* Sección de contacto */}
      <section id="contacto">
        <ContactSection />
      </section>

      {/* Footer */}
      <Footer />

      {/* Modal de producto */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

// Componente principal con Error Boundary y Suspense
export default function HomePage() {
  return (
    <ErrorBoundary errorBoundaryName="HomePage">
      <Suspense fallback={<MainLoadingSkeleton />}>
        <HomePageContent />
      </Suspense>
    </ErrorBoundary>
  );
}