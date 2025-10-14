"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Grid3X3, List, MapPin } from "lucide-react";

// Componentes
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductList } from "@/components/products/ProductList";
import { useProducts } from "@/hooks/useProducts";
import { useNotifications as useToast } from "@/components/NotificationSystem";
import { useRecentlyViewed } from "@/lib/recentlyViewedContext";
import { useCart } from "@/hooks/useCart";

// Componentes dinámicos
const Map = dynamic(() => import("@/components/OrderMap"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-stone-800 rounded-lg animate-pulse"></div>
});

export default function ProductsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();
  const { addItem: addToCart } = useCart();

  const {
    products,
    categories,
    subcategories,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch
  } = useProducts();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);

  // Cargar favoritos del localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Guardar favoritos en localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Manejar búsqueda desde URL
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      updateFilters({ search });
    }
  }, [searchParams, updateFilters]);

  const handleAddToCart = (product: any) => {
    try {
      addToCart({ product, quantity: 1 });
      showSuccess('Producto agregado', `${product.name} agregado al carrito`);
    } catch (error) {
      showError('Error', 'No se pudo agregar el producto al carrito');
    }
  };

  const handleToggleFavorite = (product: any) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(product.id);
      if (isFavorite) {
        showSuccess('Eliminado', `${product.name} eliminado de favoritos`);
        return prev.filter(id => id !== product.id);
      } else {
        showSuccess('Agregado', `${product.name} agregado a favoritos`);
        return [...prev, product.id];
      }
    });
  };

  const handleViewDetails = (product: any) => {
    addToRecentlyViewed(product);
    // Aquí podrías navegar a una página de detalles o abrir un modal
    console.log('Ver detalles de:', product.name);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar productos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Productos</h1>
          <p className="text-gray-600">
            Encuentra los mejores productos para tu negocio
          </p>
        </div>

        {/* Filtros */}
        <ProductFilters
          categories={categories}
          subcategories={subcategories}
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
        />

        {/* Controles adicionales */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showMap
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Mapa</span>
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de productos */}
          <div className={`${showMap ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <ProductList
              products={products}
              viewMode={filters.viewMode}
              loading={loading}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              onViewDetails={handleViewDetails}
              favorites={favorites}
            />
          </div>

          {/* Mapa */}
          {showMap && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
                  <div className="h-64">
                    <Map
                      orderId=""
                      lat={-13.1631}
                      lng={-74.2247}
                      location="Ayacucho, Perú"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}