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
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
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
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-medium text-green-600">
                    S/ {product.price.toFixed(2)}
                  </span>
                  {product.stock !== undefined && (
                    <span>Stock: {product.stock}</span>
                  )}
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onViewDetails(product)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onToggleFavorite(product)}
                  className={`p-2 transition-colors ${
                    isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                  title="Agregar a favoritos"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  title="Agregar al carrito"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
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
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
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
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">
              S/ {product.price.toFixed(2)}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-500">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {product.stock !== undefined && (
            <span className="text-xs text-gray-500">
              Stock: {product.stock}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
