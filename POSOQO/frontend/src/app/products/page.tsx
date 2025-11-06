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
import { ProductDetailModal } from "@/components/products/ProductDetailModal";
import { useProducts } from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/lib/recentlyViewedContext";
import { useCart } from "@/contexts/CartContext";
import { apiFetch } from "@/lib/api";
import RecentlyViewed from "@/components/cart/RecentlyViewed";

// Componentes dinámicos
const Map = dynamic(() => import("@/components/OrderMap"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-stone-800 rounded-lg animate-pulse"></div>
});

function ProductsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
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
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar favoritos desde el backend si el usuario está autenticado
  useEffect(() => {
    const loadFavorites = async () => {
      if (session && (session as any).accessToken) {
        try {
          const response = await apiFetch<{ data: any[] }>('/protected/favorites', {
            authToken: (session as any).accessToken
          });
          if (response.data && Array.isArray(response.data)) {
            const favoriteIds = response.data.map((product: any) => product.id);
            setFavorites(favoriteIds);
            // También guardar en localStorage como backup
            localStorage.setItem('favorites', JSON.stringify(favoriteIds));
          }
        } catch (error) {
          console.error('Error cargando favoritos:', error);
          // Si falla, intentar cargar desde localStorage
          const savedFavorites = localStorage.getItem('favorites');
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
          }
        }
      } else {
        // Si no hay sesión, cargar desde localStorage
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      }
    };
    loadFavorites();
  }, [session]);

  // Guardar favoritos en localStorage como backup
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
      // CartContext ya maneja las notificaciones, no necesitamos duplicar
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      // CartContext ya maneja las notificaciones de error
    }
  };

  const handleToggleFavorite = async (product: any) => {
    const isFavorite = favorites.includes(product.id);
    const accessToken = (session as any)?.accessToken;

    // Si el usuario está autenticado, guardar en el backend
    if (session && accessToken) {
      try {
        if (isFavorite) {
          // Remover de favoritos
          await apiFetch(`/protected/favorites/${product.id}`, {
            method: 'DELETE',
            authToken: accessToken
          });
          setFavorites(prev => prev.filter(id => id !== product.id));
        } else {
          // Agregar a favoritos
          await apiFetch('/protected/favorites', {
            method: 'POST',
            authToken: accessToken,
            body: JSON.stringify({ product_id: product.id })
          });
          setFavorites(prev => [...prev, product.id]);
        }
      } catch (error) {
        console.error('Error actualizando favoritos:', error);
        alert('Error al actualizar favoritos. Por favor intenta nuevamente.');
      }
    } else {
      // Si no está autenticado, solo usar localStorage
      setFavorites(prev => {
        if (isFavorite) {
          return prev.filter(id => id !== product.id);
        } else {
          return [...prev, product.id];
        }
      });
      if (!isFavorite) {
        alert('Inicia sesión para guardar tus favoritos permanentemente');
      }
    }
  };

  const handleViewDetails = (product: any) => {
    // Agregar a visto recientemente
    addToRecentlyViewed(product);
    
    // Mostrar modal profesional
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="text-center relative z-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-4">
            Error al cargar productos
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <motion.button 
            onClick={refetch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-lg"
          >
            Reintentar
          </motion.button>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header profesional */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-6">
            <span>NUESTROS PRODUCTOS</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-4 leading-tight">
            Productos
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Descubre nuestra selección de cervezas artesanales y deliciosos platos
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

        {/* Controles profesionales */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-yellow-400/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-400 font-semibold">Productos Encontrados</span>
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
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/25'
                  : 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 text-gray-300 border border-gray-600/30 hover:from-yellow-500/20 hover:to-amber-500/20 hover:border-yellow-400/30 hover:text-yellow-400'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span>Mapa</span>
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
                <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-400/20 p-6 relative overflow-hidden">
                  {/* Efectos de fondo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-yellow-400/5 rounded-3xl" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-black" />
            </div>
                      <h3 className="text-xl font-bold text-white">Ubicación</h3>
          </div>
                    <div className="h-80 rounded-2xl overflow-hidden border border-yellow-400/20">
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

        {/* Visto Recientemente */}
        <div className="mt-12">
          <RecentlyViewed />
                    </div>
                  </div>

        {/* Modal de detalles del producto */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400/30 border-t-yellow-400 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-2">
            Cargando Productos
          </h2>
          <p className="text-gray-300">Por favor espera...</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}