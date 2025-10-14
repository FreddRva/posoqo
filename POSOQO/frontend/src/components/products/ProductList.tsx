import React from 'react';
import { motion } from 'framer-motion';
import { Product, ViewMode } from '@/types/products';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];
  viewMode: ViewMode;
  loading: boolean;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  favorites: string[];
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  viewMode,
  loading,
  onAddToCart,
  onToggleFavorite,
  onViewDetails,
  favorites
}) => {
  if (loading) {
    return (
      <div className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            <div className={`bg-gray-200 ${
              viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square w-full'
            }`} />
            <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
        <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProductCard
            product={product}
            viewMode={viewMode}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            onViewDetails={onViewDetails}
            isFavorite={favorites.includes(product.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
