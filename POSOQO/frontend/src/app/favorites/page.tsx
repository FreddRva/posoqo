"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { HeartIcon, ShoppingCartIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ProductDetailModal } from '@/components/products/ProductDetailModal';
import { Product } from '@/types/products';

export default function FavoritesPage() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasLoadedRef = useRef(false);

  const loadFavorites = useCallback(async () => {
    if (!session || !(session as any).accessToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [FAVORITES] No hay sesión, no se cargan favoritos');
      }
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiFetch<{ data: any[] }>('/protected/favorites', {
        authToken: (session as any).accessToken
      });
      // El backend devuelve { data: products }
      const products = (response as any).data || response || [];
      if (Array.isArray(products)) {
        // Normalizar imageURL a image_url para compatibilidad
        const normalizedProducts = products.map((p: any) => ({
          ...p,
          image_url: p.image_url || p.imageURL || p.image,
        }));
        setFavorites(normalizedProducts);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error cargando favoritos:', error);
      }
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Cargar favoritos solo una vez cuando hay sesión
  useEffect(() => {
    if (session && (session as any).accessToken && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadFavorites();
    } else if (!session) {
      hasLoadedRef.current = false;
      setFavorites([]);
      setLoading(false);
    }
  }, [session, loadFavorites]);

  const removeFromFavorites = async (productId: string) => {
    try {
      await apiFetch(`/protected/favorites/${productId}`, {
        method: 'DELETE',
        authToken: (session as any)?.accessToken
      });
      
      // Actualizar lista local
      setFavorites(prev => prev.filter(product => product.id !== productId));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removiendo de favoritos:', error);
      }
    }
  };

  const addToCart = async (product: Product) => {
    try {
      await apiFetch('/protected/cart/add', {
        method: 'POST',
        authToken: (session as any)?.accessToken,
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });
      
      setAddedToCart(product.id);
      setTimeout(() => setAddedToCart(null), 2000);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error agregando al carrito:', error);
      }
    }
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">Acceso Requerido</h1>
            <p className="text-stone-300 mb-8">Debes iniciar sesión para ver tus favoritos</p>
            <Link
              href="/login"
              className="px-6 py-3 bg-amber-400 text-stone-900 font-bold rounded-full hover:bg-amber-300 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden pt-20">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-6">
            <HeartIcon className="w-5 h-5" />
            <span>MIS FAVORITOS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-4">
            Productos Favoritos
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Tus productos favoritos guardados para compras futuras
          </p>
          {favorites.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-yellow-400/20">
              <span className="text-yellow-400 font-bold text-lg">{favorites.length}</span>
              <span className="text-gray-300 text-sm">producto{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400/30 border-t-yellow-400"></div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <motion.div 
            className="text-center py-16 sm:py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 mb-6">
              <HeartIcon className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent mb-4">No tienes favoritos aún</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Explora nuestros productos y agrega tus favoritos para verlos aquí
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-yellow-400/50"
            >
              <span>Explorar Productos</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {favorites.map((product, index) => (
              <motion.div
                key={product.id}
                className="group relative h-full bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-400/20 overflow-hidden hover:border-yellow-400/50 transition-all duration-500 hover:shadow-yellow-400/20"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                {/* Efecto de brillo dorado */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700"
                />
                
                {/* Línea superior dorada */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Botón remover favorito */}
                <motion.button
                  onClick={() => removeFromFavorites(product.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 z-30 p-2 rounded-full backdrop-blur-md bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-400/30 shadow-lg transition-all duration-300"
                  aria-label="Remover de favoritos"
                >
                  <TrashIcon className="w-4 h-4" />
                </motion.button>

                {/* Imagen */}
                <div className="relative overflow-hidden bg-black" style={{ minHeight: '280px', height: 'auto' }}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative w-full flex items-center justify-center p-6 sm:p-8"
                    style={{ minHeight: '280px' }}
                  >
                    <img
                      src={
                        product.image_url
                          ? (product.image_url.startsWith('http')
                              ? product.image_url
                              : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000'}${product.image_url}`)
                          : "/file.svg"
                      }
                      alt={product.name}
                      className="w-auto h-auto max-w-full max-h-[280px] object-contain"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = '/file.svg'; 
                      }}
                    />
                  </motion.div>
                  
                  {/* Overlay gradiente sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Contenido */}
                <div className="p-4 sm:p-6 relative z-10 bg-gradient-to-b from-black/80 to-black">
                  <h3 className="font-bold text-white mb-2 line-clamp-2 text-lg sm:text-xl group-hover:text-yellow-400 transition-colors duration-300">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                      S/ {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => addToCart(product)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        addedToCart === product.id
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                          : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-yellow-400/50'
                      }`}
                      disabled={addedToCart === product.id}
                    >
                      <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">{addedToCart === product.id ? "¡Agregado!" : "Agregar"}</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => openProductModal(product)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-yellow-300 hover:text-yellow-200 px-4 py-3 rounded-xl font-semibold transition-all duration-200 border border-yellow-400/20 hover:border-yellow-400/40"
                    >
                      <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal de detalles del producto */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeProductModal}
          onAddToCart={(product) => {
            addToCart(product);
            closeProductModal();
          }}
        />
      </div>
    </div>
  );
} 