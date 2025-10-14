"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Minus, Plus, Trash2, Star, Heart } from 'lucide-react';
import { CartItem as CartItemType, useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export default function CartItemComponent({ 
  item, 
  onUpdateQuantity, 
  onRemove, 
  onToggleFavorite,
  isFavorite = false 
}: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-black/80 backdrop-blur-xl rounded-2xl border border-blue-400/20 p-6 hover:border-blue-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Partículas flotantes */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 flex items-start gap-4">
        {/* Imagen del producto */}
        <div className="relative flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.2 }}
            className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600/30"
          >
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
            {/* Overlay con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
          
          {/* Badge de categoría */}
          {item.category && (
            <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-bold text-white rounded-full shadow-lg">
              {item.category}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                {item.name}
              </h3>
              
              {item.description && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
              
              {/* Precio */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  S/ {item.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  c/u
                </span>
              </div>
            </div>

            {/* Botón de favorito */}
            {onToggleFavorite && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleFavorite(item.id)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-red-500/20 text-red-400 border border-red-400/50' 
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/30'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </motion.button>
            )}
          </div>

          {/* Controles de cantidad */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300">Cantidad:</span>
              
              <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-1 border border-gray-600/30">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                
                <span className="px-3 py-1 text-white font-bold min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-green-500/20 hover:text-green-400 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Precio total del item */}
            <div className="text-right">
              <div className="text-lg font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                S/ {(item.price * item.quantity).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Botón de eliminar */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRemove}
          className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-400/30 hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Línea de separación animada */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
    </motion.div>
  );
}
