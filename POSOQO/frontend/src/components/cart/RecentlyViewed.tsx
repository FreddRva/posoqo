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

  if (recentlyViewed.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay productos vistos recientemente
        </h3>
        <p className="text-gray-600">
          Los productos que veas aparecerán aquí
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Vistos Recientemente</h3>
            <p className="text-sm text-gray-600">
              {recentlyViewed.length} {recentlyViewed.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>

        <button
          onClick={clearRecentlyViewed}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Lista de productos */}
      <div className="space-y-4">
        {recentlyViewed.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
          >
            <div className="flex items-center gap-4">
              {/* Imagen */}
              <div className="relative flex-shrink-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <Image
                    src={item.image_url || '/placeholder-product.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                
                {/* Badge de tiempo */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                  <Clock className="w-2 h-2 text-white" />
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 font-semibold truncate group-hover:text-gray-700 transition-colors duration-200">
                  {item.name}
                </h4>
                
                {item.category && (
                  <p className="text-xs text-gray-600 truncate">
                    {item.category}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-gray-900">
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
                  className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>

              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
