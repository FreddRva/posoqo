"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Clock, Eye, Trash2, ShoppingCart } from 'lucide-react';
import { useRecentlyViewed, RecentlyViewedItem } from '@/hooks/useRecentlyViewed';
import { useCart } from '@/contexts/CartContext';

interface RecentlyViewedProps {
  onAddToCart?: (product: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
}

export default function RecentlyViewed({ onAddToCart }: RecentlyViewedProps) {
  const { recentlyViewed, removeFromRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { addToCart } = useCart();

  const handleAddToCart = async (product: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        category: product.category
      });
      if (onAddToCart) {
        onAddToCart(product);
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
    }
  };

  if (recentlyViewed.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-black/80 backdrop-blur-xl rounded-2xl border border-blue-400/20 p-8 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600/30">
          <Clock className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          No hay productos vistos recientemente
        </h3>
        <p className="text-gray-400">
          Los productos que veas aparecerán aquí
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-black/80 backdrop-blur-xl rounded-2xl border border-blue-400/20 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Vistos Recientemente</h3>
            <p className="text-sm text-gray-400">
              {recentlyViewed.length} {recentlyViewed.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearRecentlyViewed}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Lista de productos */}
      <div className="space-y-4">
        {recentlyViewed.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl p-4 hover:from-gray-700/50 hover:to-gray-600/30 transition-all duration-300 border border-gray-600/20 hover:border-blue-400/30"
          >
            <div className="flex items-center gap-4">
              {/* Imagen */}
              <div className="relative flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600/30"
                >
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </motion.div>
                
                {/* Badge de tiempo */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Clock className="w-2 h-2 text-white" />
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold truncate group-hover:text-blue-300 transition-colors duration-300">
                  {item.name}
                </h4>
                
                {item.category && (
                  <p className="text-xs text-gray-400 truncate">
                    {item.category}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                    S/ {item.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.viewedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAddToCart(item)}
                  className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                >
                  <ShoppingCart className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromRecentlyViewed(item.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Línea de separación */}
            <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
