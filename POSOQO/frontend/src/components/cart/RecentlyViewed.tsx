"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Clock, Eye, Trash2, ShoppingCart } from 'lucide-react';
import { useRecentlyViewed } from '@/lib/recentlyViewedContext';
import { useCart } from '@/contexts/CartContext';

interface RecentlyViewedProps {
  onAddToCart?: (product: any) => void;
}

export default function RecentlyViewed({ onAddToCart }: RecentlyViewedProps) {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { addToCart } = useCart();

  const handleAddToCart = async (product: any) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-400/20 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-lg">
            <Eye className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Vistos Recientemente</h3>
            <p className="text-sm text-gray-400">
              {recentlyViewed.length} {recentlyViewed.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>

        {recentlyViewed.length > 0 && (
          <button
            onClick={clearRecentlyViewed}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lista de productos o estado vacío */}
      {recentlyViewed.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-400/20">
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No hay productos vistos recientemente
          </h3>
          <p className="text-gray-400">
            Los productos que veas aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentlyViewed.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Imagen */}
                <div className="relative flex-shrink-0">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black border border-white/10">
                    <Image
                      src={item.image_url || '/placeholder-product.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  
                  {/* Badge de tiempo */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/50">
                    <Clock className="w-2 h-2 text-black" />
                  </div>
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold truncate group-hover:text-yellow-400 transition-colors duration-200">
                    {item.name}
                  </h4>
                  
                  {item.category && (
                    <p className="text-xs text-gray-400 truncate">
                      {item.category}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                      S/ {item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Visto recientemente
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="p-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-lg transition-all duration-200 shadow-lg hover:shadow-yellow-400/50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
