import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Product, ViewMode } from '@/types/products';
import { getImageUrl } from '@/lib/config';

interface ProductCardProps {
  product: Product;
  viewMode: ViewMode;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isFavorite?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  onAddToCart,
  onToggleFavorite,
  onViewDetails,
  isFavorite = false
}) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: 5 }}
        className="bg-gradient-to-r from-gray-900/90 via-gray-800/80 to-black/90 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-400/20 overflow-hidden hover:shadow-blue-500/25 hover:border-blue-400/40 transition-all duration-500 group relative"
      >
        {/* Efectos de brillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex">
          {/* Imagen */}
          <div className="w-32 h-32 flex-shrink-0">
            <Image
              src={getImageUrl(product.image_url || product.image || '')}
              alt={product.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Contenido */}
          <div className="flex-1 p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    S/ {product.price.toFixed(2)}
                  </span>
                  {product.stock !== undefined && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-gray-400">Stock: {product.stock}</span>
                    </div>
                  )}
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3 ml-6">
                <motion.button
                  onClick={() => onViewDetails(product)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-400 rounded-xl hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300"
                  title="Ver detalles"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => onToggleFavorite(product)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isFavorite
                      ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 border border-red-400/50 text-red-400'
                      : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-400/30 text-gray-400 hover:from-red-500/20 hover:to-pink-500/20 hover:border-red-400/30 hover:text-red-400'
                  }`}
                  title="Agregar a favoritos"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </motion.button>
                <motion.button
                  onClick={() => onAddToCart(product)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 text-green-400 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300"
                  title="Agregar al carrito"
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Vista de cuadrícula
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-400/20 overflow-hidden hover:shadow-blue-500/25 hover:border-blue-400/40 transition-all duration-500 group relative"
    >
      {/* Efectos de brillo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={getImageUrl(product.image_url || product.image || '')}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Overlay de acciones */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={() => onViewDetails(product)}
            className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onToggleFavorite(product)}
            className={`p-2 backdrop-blur-sm rounded-lg transition-colors ${
              isFavorite 
                ? 'bg-red-500/80 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title="Agregar a favoritos"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => onAddToCart(product)}
            className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
            title="Agregar al carrito"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 relative z-10">
        <h3 className="font-bold text-white mb-3 line-clamp-2 text-lg group-hover:text-blue-400 transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              S/ {product.price.toFixed(2)}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-semibold">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {product.stock !== undefined && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">
                Stock: {product.stock}
              </span>
            </div>
          )}
        </div>

        {/* Botón de acción galáctico */}
        <motion.button
          onClick={() => onViewDetails(product)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-400 font-semibold rounded-xl hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/25"
        >
          <Eye className="w-4 h-4" />
          <span>Explorar Producto</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
