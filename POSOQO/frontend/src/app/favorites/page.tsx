"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { HeartIcon, ShoppingCartIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  imageURL?: string; // Campo que devuelve el backend
  category?: string;
  category_id?: string;
}

export default function FavoritesPage() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const loadFavorites = async () => {
    if (!session) {
      console.log('🔍 [FAVORITES] No hay sesión, no se cargan favoritos');
      return;
    }
    
    console.log('🔍 [FAVORITES] Cargando favoritos...', {
      hasAccessToken: !!session.accessToken,
      session: session
    });
    
    try {
      setLoading(true);
      const response = await apiFetch<{ data: any[] }>('/protected/favorites', {
        authToken: session.accessToken
      });
      console.log('🔍 [FAVORITES] Respuesta del backend:', response);
      if (response.data) {
        // Los productos ya vienen directamente en response.data
        console.log('🔍 [FAVORITES] Productos encontrados:', response.data.length);
        setFavorites(response.data);
      } else {
        console.log('🔍 [FAVORITES] No hay data en la respuesta');
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [session]);

  const removeFromFavorites = async (productId: string) => {
    try {
      await apiFetch(`/protected/favorites/${productId}`, {
        method: 'DELETE',
        authToken: session?.accessToken
      });
      
      // Actualizar lista local
      setFavorites(prev => prev.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error removiendo de favoritos:', error);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      await apiFetch('/protected/cart/add', {
        method: 'POST',
        authToken: session?.accessToken,
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });
      
      setAddedToCart(product.id);
      setTimeout(() => setAddedToCart(null), 2000);
    } catch (error) {
      console.error('Error agregando al carrito:', error);
    }
  };

  const openProductModal = (product: Product) => {
    // Implementar modal de producto
    console.log('Abrir modal para:', product.name);
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
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
            ❤️ Mis Favoritos
          </h1>
          <p className="text-stone-300 text-lg">
            Tus productos favoritos guardados para compras futuras
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : favorites.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-6xl mb-6">💔</div>
            <h2 className="text-2xl font-bold text-stone-300 mb-4">No tienes favoritos aún</h2>
            <p className="text-stone-400 mb-8">
              Explora nuestros productos y agrega tus favoritos para verlos aquí
            </p>
            <Link
              href="/products"
              className="px-6 py-3 bg-amber-400 text-stone-900 font-bold rounded-full hover:bg-amber-300 transition-colors"
            >
              Explorar Productos
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {favorites.map((product, index) => (
              <motion.div
                key={product.id}
                className="bg-stone-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-yellow-400/20 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Botón remover favorito */}
                <button
                  onClick={() => removeFromFavorites(product.id)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all text-red-500 hover:text-red-400 bg-stone-800/70 hover:bg-stone-700/70"
                  aria-label="Remover de favoritos"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>

                {/* Imagen */}
                <div className="bg-stone-800 rounded-xl border border-yellow-400/10 shadow-inner flex items-center justify-center overflow-hidden aspect-square mb-4">
                  <img
                    src={
                      (product.imageURL || product.image_url)
                        ? ((product.imageURL || product.image_url || '').startsWith('http')
                            ? (product.imageURL || product.image_url || '')
                            : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000'}${product.imageURL || product.image_url || ''}`)
                        : "/file.svg"
                    }
                    alt={product.name}
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { 
                      (e.target as HTMLImageElement).src = '/file.svg'; 
                    }}
                  />
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="font-bold text-yellow-100 text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-yellow-200 mb-3 text-sm line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-green-400 text-xl">
                      S/ {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        addedToCart === product.id
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-400 text-stone-900 hover:bg-yellow-300'
                      }`}
                      disabled={addedToCart === product.id}
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      {addedToCart === product.id ? "¡Agregado!" : "Agregar"}
                    </button>
                    
                    <button
                      onClick={() => openProductModal(product)}
                      className="flex items-center justify-center gap-2 bg-stone-700 text-yellow-300 hover:bg-stone-600 px-3 py-2 rounded-lg font-semibold transition-all duration-200"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Contador de favoritos */}
        {favorites.length > 0 && (
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-stone-400">
              Tienes <span className="text-yellow-400 font-bold">{favorites.length}</span> producto{favorites.length !== 1 ? 's' : ''} en favoritos
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 