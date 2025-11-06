// components/dashboard/ProductCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff, 
  Package,
  DollarSign,
  Tag
} from 'lucide-react';
import { ProductCardProps } from '@/types/dashboard';
import { getImageUrl } from '@/lib/config';

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative bg-gray-900/95 backdrop-blur-sm rounded-2xl overflow-visible border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/20"
    >
      {/* Contenedor principal con espacio para la imagen flotante */}
      <div className="relative pt-48">
        {/* Imagen del producto - FLOTANTE estilo Fortnite */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full z-30 group-hover:z-40 -translate-y-8 group-hover:-translate-y-12 transition-transform duration-300">
          <motion.div
            whileHover={{ scale: 1.08, y: -5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full flex items-center justify-center"
          >
            <div className="w-full max-w-[300px] h-auto flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={getImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-auto h-auto max-w-full max-h-[420px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)] filter brightness-110"
                  style={{ objectFit: 'contain', display: 'block' }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-12 h-12" />
                </div>
              )}
            </div>
            
            {/* Badge destacado */}
            {product.is_featured && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute top-2 right-2 px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm border border-cyan-300/50 z-20"
              >
                ⭐ Destacado
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Card estilo Fortnite - Diseño moderno y limpio */}
        <div className="relative bg-gray-800/95 backdrop-blur-sm rounded-2xl overflow-visible border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/20 mt-48 p-6">
          {/* Nombre del producto */}
          <h3 className="text-2xl font-bold text-white text-center mb-4">
            {product.name}
          </h3>
          
          {/* Rating con estrellas brillantes */}
          <div className="flex justify-center items-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => {
              const rating = product.rating || 0;
              const starValue = i + 1;
              const isFilled = starValue <= Math.floor(rating);
              const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 >= 0.5;
              
              return (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    isFilled
                      ? 'fill-cyan-400 text-cyan-400'
                      : isHalfFilled
                      ? 'fill-cyan-400/50 text-cyan-400/50'
                      : 'fill-gray-600 text-gray-600'
                  }`}
                />
              );
            })}
            {product.rating && (
              <span className="ml-2 text-sm text-gray-400">({product.rating.toFixed(1)})</span>
            )}
          </div>

          {/* Botones de acción - Estilo Fortnite */}
          <div className="space-y-2">
            {/* Botón Editar */}
            <motion.button
              onClick={() => onEdit(product)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-400 hover:via-blue-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 uppercase tracking-wider text-sm"
            >
              <Edit className="w-5 h-5" />
              <span>Editar</span>
            </motion.button>
            
            {/* Botón Eliminar */}
            <motion.button
              onClick={() => product.id && onDelete(product.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/50 uppercase tracking-wider text-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </motion.button>
            
            {/* Toggles compactos */}
            <div className="flex gap-2 mt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => product.id && onToggleActive(product.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1 ${
                  product.is_active
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                    : 'bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600'
                }`}
              >
                {product.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span className="text-xs">{product.is_active ? 'Activo' : 'Inactivo'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => product.id && onToggleFeatured(product.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1 ${
                  product.is_featured
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                    : 'bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600'
                }`}
              >
                {product.is_featured ? <Star className="w-3 h-3" /> : <StarOff className="w-3 h-3" />}
                <span className="text-xs">{product.is_featured ? 'Destacado' : 'Normal'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
