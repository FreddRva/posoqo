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
  onToggleFavorite?: (product: Product) => void;
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-yellow-400/20 max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-4 sm:p-6 border-b border-yellow-400/10 bg-gradient-to-r from-yellow-400/5 to-transparent">
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-white hover:bg-yellow-400/20 rounded-full transition-all duration-200 z-10"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
                
                <div className="flex items-center gap-3 pr-12">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-xl border border-yellow-400/30">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">{product.name}</h2>
                    <p className="text-gray-400 text-sm">Detalles del producto</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-yellow-400/30 scrollbar-track-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Imagen */}
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-400/10">
                        <img
                          src={getImageUrl(product.image_url || product.image || '')}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-4"
                        />
                      </div>
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-2">
                        {product.is_featured && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 sm:px-3 py-1 bg-gradient-to-r from-yellow-400/30 to-amber-500/30 backdrop-blur-sm text-yellow-300 text-xs font-semibold rounded-full border border-yellow-400/40 shadow-lg"
                          >
                            <Star className="w-3 h-3 inline mr-1" />
                            Destacado
                          </motion.span>
                        )}
                        {product.stock !== undefined && product.stock > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="px-2 sm:px-3 py-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-sm text-green-300 text-xs font-semibold rounded-full border border-green-400/40 shadow-lg"
                          >
                            En Stock
                          </motion.span>
                        )}
                      </div>
                    </div>

                    {/* Rating y Precio */}
                    <div className="text-center space-y-4 mt-4">
                      {/* Rating con estrellas */}
                      {product.rating && (
                        <div className="flex justify-center items-center gap-1 sm:gap-2 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const rating = product.rating || 0;
                            const starValue = i + 1;
                            const isFilled = starValue <= Math.floor(rating);
                            const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 >= 0.5;
                            
                            return (
                              <Star
                                key={i}
                                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  isFilled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : isHalfFilled
                                    ? 'fill-yellow-400/50 text-yellow-400/50'
                                    : 'fill-gray-600 text-gray-600'
                                }`}
                              />
                            );
                          })}
                          <span className="text-yellow-400 font-semibold ml-2 text-sm sm:text-base">({product.rating.toFixed(1)})</span>
                        </div>
                      )}
                      
                      {/* Precio */}
                      {product.price && (
                        <div>
                          <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                            S/ {product.price.toFixed(2)}
                          </div>
                          <div className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Precio por unidad</div>
                        </div>
                      )}
                      
                      {/* Stock */}
                      {product.stock !== undefined && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-700/50">
                          <Package className="w-4 h-4 text-green-400" />
                          <span className={`font-semibold text-sm sm:text-base ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Descripción */}
                    {product.description && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                          Descripción
                        </h3>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* Detalles técnicos - Solo para cervezas */}
                    {(product.estilo || product.abv || product.ibu || product.color) && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                          <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                          Especificaciones Técnicas
                        </h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          {product.estilo && (
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-4 border border-gray-700/50">
                              <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Estilo</div>
                              <div className="text-lg font-bold text-white">
                                {product.estilo}
                              </div>
                            </div>
                          )}

                          {product.abv && (
                            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
                              <div className="text-xs text-blue-400 mb-1 uppercase tracking-wider">ABV</div>
                              <div className="text-lg font-bold text-white">
                                {product.abv}
                              </div>
                            </div>
                          )}

                          {product.ibu && (
                            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                              <div className="text-xs text-purple-400 mb-1 uppercase tracking-wider">IBU</div>
                              <div className="text-lg font-bold text-white">
                                {product.ibu}
                              </div>
                            </div>
                          )}

                          {product.color && (
                            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
                              <div className="text-xs text-orange-400 mb-1 uppercase tracking-wider">Color</div>
                              <div className="text-lg font-bold text-white">
                                {product.color}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Información adicional */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {product.category && (
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-3 sm:p-4 border border-yellow-400/10">
                          <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Categoría</div>
                          <div className="text-sm font-semibold text-white">
                            {product.category}
                          </div>
                        </div>
                      )}

                      {product.subcategory && (
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-3 sm:p-4 border border-yellow-400/10">
                          <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Subcategoría</div>
                          <div className="text-sm font-semibold text-white">
                            {product.subcategory}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-yellow-400/10 bg-gradient-to-r from-gray-900/80 to-black/80">
                <motion.button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3.5 sm:py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-400/50 text-base sm:text-lg"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-5" />
                  Agregar al Carrito
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
