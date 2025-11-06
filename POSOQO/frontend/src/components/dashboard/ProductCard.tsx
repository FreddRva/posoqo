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
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Imagen del producto */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="w-full h-full object-contain p-2"
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
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Destacado
            </span>
          )}
          {!product.is_active && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Inactivo
            </span>
          )}
          {(product.stock || 0) <= 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Sin Stock
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Nombre del producto */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Precio */}
        {product.price && (
          <div className="flex items-center gap-1 mb-3">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-lg font-bold text-green-600">
              S/ {product.price.toFixed(2)}
            </span>
          </div>
        )}
        
        {/* Stock */}
        <div className="flex items-center gap-1 mb-4">
          <Package className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Stock: {product.stock || 0}
          </span>
        </div>
        
        {/* Especificaciones */}
        <div className="flex flex-wrap gap-1 mb-4">
          {product.abv && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              ABV {product.abv}
            </span>
          )}
          {product.ibu && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              IBU {product.ibu}
            </span>
          )}
          {product.color && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              {product.color}
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          {/* Botón editar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(product)}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Editar
          </motion.button>
          
          {/* Botón eliminar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => product.id && onDelete(product.id)}
            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </motion.button>
        </div>
        
        <div className="flex gap-2 mt-2">
          {/* Toggle activo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => product.id && onToggleActive(product.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 ${
              product.is_active
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {product.is_active ? (
              <>
                <Eye className="w-4 h-4" />
                Activo
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Inactivo
              </>
            )}
          </motion.button>
          
          {/* Toggle destacado */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => product.id && onToggleFeatured(product.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 ${
              product.is_featured
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {product.is_featured ? (
              <>
                <Star className="w-4 h-4" />
                Destacado
              </>
            ) : (
              <>
                <StarOff className="w-4 h-4" />
                Normal
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
