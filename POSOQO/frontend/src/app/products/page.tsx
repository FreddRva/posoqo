"use client";

import { useState, useEffect, Suspense } from "react";
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

function ProductsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { updateRecentlyViewed: addToRecentlyViewed } = useRecentlyViewed();
  const { addToCart } = useCart();

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

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || product.image || ''
      });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Efectos de fondo galácticos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header galáctico */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2 text-blue-400 text-sm font-semibold mb-6">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>GALAXIA DE PRODUCTOS</span>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 leading-tight">
            Productos
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Descubre una galaxia infinita de productos excepcionales diseñados para elevar tu experiencia
          </p>
        </motion.div>

        {/* Filtros */}
        <ProductFilters
          categories={categories}
          subcategories={subcategories}
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
        />

        {/* Controles galácticos */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-400/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-blue-400 font-semibold">Productos Encontrados</span>
                <div className="text-2xl font-bold text-white">
                  {products.length}
                </div>
                <div className="text-gray-400">productos</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowMap(!showMap)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                showMap
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 text-gray-300 border border-gray-600/30 hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-400/30 hover:text-blue-400'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span>Mapa Galáctico</span>
            </motion.button>
          </div>
        </motion.div>

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
                <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-400/20 p-6 relative overflow-hidden">
                  {/* Efectos de fondo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Mapa Galáctico</h3>
                    </div>
                    <div className="h-80 rounded-2xl overflow-hidden border border-blue-400/20">
                      <Map
                        orderId=""
                        lat={-13.1631}
                        lng={-74.2247}
                        location="Ayacucho, Perú"
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">Ubicación Activa</span>
                    </div>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center relative overflow-hidden">
        {/* Efectos de fondo galácticos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400/30 border-t-blue-400 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 border-t-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Explorando la Galaxia
          </h2>
          <p className="text-gray-300">Cargando productos increíbles...</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}