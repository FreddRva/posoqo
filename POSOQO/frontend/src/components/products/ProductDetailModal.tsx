import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star, Package, Tag, Info } from 'lucide-react';
import { Product } from '@/types/products';
import { getImageUrl } from '@/lib/config';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  isFavorite?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false
}) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl border border-blue-400/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="relative p-6 border-b border-gray-700/50">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                    <p className="text-gray-400">Detalles del producto</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Imagen */}
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                        <img
                          src={getImageUrl(product.image_url || product.image || '')}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {product.is_featured && (
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-400/30">
                            <Star className="w-3 h-3 inline mr-1" />
                            Destacado
                          </span>
                        )}
                        {product.stock && product.stock > 0 && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-400/30">
                            En Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">
                        S/ {product.price}
                      </div>
                      <div className="text-gray-400 text-sm">Precio por unidad</div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="space-y-6">
                    {/* Descripción */}
                    {product.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Info className="w-5 h-5 text-blue-400" />
                          Descripción
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* Detalles técnicos */}
                    <div className="grid grid-cols-2 gap-4">
                      {product.stock !== undefined && (
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <div className="text-sm text-gray-400 mb-1">Stock</div>
                          <div className="text-lg font-semibold text-white">
                            {product.stock} unidades
                          </div>
                        </div>
                      )}
                      
                      {product.category && (
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <div className="text-sm text-gray-400 mb-1">Categoría</div>
                          <div className="text-lg font-semibold text-white">
                            {product.category}
                          </div>
                        </div>
                      )}

                      {product.subcategory && (
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <div className="text-sm text-gray-400 mb-1">Subcategoría</div>
                          <div className="text-lg font-semibold text-white">
                            {product.subcategory}
                          </div>
                        </div>
                      )}

                      {product.estilo && (
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <div className="text-sm text-gray-400 mb-1">Estilo</div>
                          <div className="text-lg font-semibold text-white">
                            {product.estilo}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Características especiales */}
                    {(product.abv || product.ibu || product.color) && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Tag className="w-5 h-5 text-purple-400" />
                          Características
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {product.abv && (
                            <div className="flex justify-between items-center py-2 px-4 bg-gray-800/30 rounded-lg">
                              <span className="text-gray-300">ABV</span>
                              <span className="text-white font-semibold">{product.abv}</span>
                            </div>
                          )}
                          {product.ibu && (
                            <div className="flex justify-between items-center py-2 px-4 bg-gray-800/30 rounded-lg">
                              <span className="text-gray-300">IBU</span>
                              <span className="text-white font-semibold">{product.ibu}</span>
                            </div>
                          )}
                          {product.color && (
                            <div className="flex justify-between items-center py-2 px-4 bg-gray-800/30 rounded-lg">
                              <span className="text-gray-300">Color</span>
                              <span className="text-white font-semibold">{product.color}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => onToggleFavorite(product)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isFavorite
                        ? 'bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30'
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600/30 hover:bg-gray-600/50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
                  </motion.button>

                  <motion.button
                    onClick={() => onAddToCart(product)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agregar al Carrito
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
