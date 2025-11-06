import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye, Star, ArrowRight, Store } from 'lucide-react';
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
        whileHover={{ x: 5, scale: 1.01 }}
        className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-xl border border-yellow-400/20 overflow-hidden hover:shadow-yellow-400/25 hover:border-yellow-400/40 transition-all duration-500 group relative"
      >
        {/* Efectos de brillo dorado */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-amber-400/5 to-yellow-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex">
          {/* Imagen más grande - Adaptativa */}
          <div className="w-48 h-48 flex-shrink-0 relative overflow-hidden bg-black flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full flex items-center justify-center p-4"
            >
              <Image
                src={getImageUrl(product.image_url || product.image || '')}
                alt={product.name}
                width={192}
                height={192}
                className="w-auto h-auto max-w-full max-h-full object-contain"
                style={{ objectFit: 'contain' }}
                sizes="192px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
            
            {/* Corazón de favoritos en esquina superior derecha */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product);
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={`absolute top-2 right-2 z-30 p-2 rounded-full backdrop-blur-md shadow-lg border transition-all duration-300 ${
                isFavorite
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400/50 shadow-red-500/50'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
              }`}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {product.description}
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    S/ {product.price.toFixed(2)}
                  </span>
                  {product.stock !== undefined && (
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 border border-green-400/20 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-xs font-medium">Stock: {product.stock}</span>
                    </div>
                  )}
                  {product.rating && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold text-sm">{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3 ml-6">
                <motion.button
                  onClick={() => onViewDetails(product)}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-xl shadow-lg hover:shadow-yellow-400/50 transition-all duration-300"
                  title="Ver detalles"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 shadow-lg transition-all duration-300"
                    title="Ver tienda"
                  >
                    <Store className="w-5 h-5" />
                  </motion.button>
                </Link>
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
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="group relative h-full bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-400/20 overflow-hidden hover:border-yellow-400/50 transition-all duration-500 hover:shadow-yellow-400/20"
    >
      {/* Efecto de brillo dorado */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700"
        animate={{
          opacity: [0, 0.2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Línea superior dorada */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Imagen completa y atractiva - Adaptativa para imágenes pequeñas */}
      <div className="relative overflow-hidden bg-black" style={{ minHeight: '280px', height: 'auto' }}>
        <motion.div
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full flex items-center justify-center p-8"
          style={{ minHeight: '280px' }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={getImageUrl(product.image_url || product.image || '')}
              alt={product.name}
              width={400}
              height={400}
              className="w-auto h-auto max-w-full max-h-[400px] object-contain"
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </div>
          
          {/* Overlay gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Efecto de brillo dorado en la imagen */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        </motion.div>
        
        {/* Badges flotantes */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {product.is_featured && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black text-xs font-bold rounded-full shadow-lg backdrop-blur-sm border border-yellow-300/50"
            >
              ⭐ Destacado
            </motion.div>
          )}
          {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg border border-red-400/50"
            >
              ¡Últimas unidades!
            </motion.div>
          )}
        </div>

        {/* Corazón de favoritos en esquina superior derecha */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-4 right-4 z-30 p-2.5 rounded-full backdrop-blur-md shadow-lg border transition-all duration-300 ${
            isFavorite
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400/50 shadow-red-500/50'
              : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
          }`}
          title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Botones de acción flotantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20"
        >
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-xl shadow-lg hover:shadow-yellow-400/50 backdrop-blur-sm border border-yellow-300/50 transition-all duration-300"
            title="Ver detalles"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
          
          <Link href="/products">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
              }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 border border-white/30 shadow-lg transition-all duration-300"
              title="Ver tienda"
            >
              <Store className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Contenido */}
      <div className="p-6 relative z-10 bg-gradient-to-b from-black/80 to-black">
        <div className="mb-4">
          <h3 className="font-bold text-white mb-2 line-clamp-2 text-xl group-hover:text-yellow-400 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              S/ {product.price.toFixed(2)}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-semibold">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {product.stock !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-400/20 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">
                {product.stock} disponibles
              </span>
            </div>
          )}
        </div>

        {/* Botón de acción principal */}
        <Link href="/products">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-400/50 group-hover:shadow-xl"
          >
            <Store className="w-5 h-5" />
            <span>Ver Tienda</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};
