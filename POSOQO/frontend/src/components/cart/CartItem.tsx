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
      className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Imagen del producto */}
        <div className="relative flex-shrink-0">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          
          {/* Badge de categoría */}
          {item.category && (
            <div className="absolute -top-1 -right-1 px-2 py-1 bg-gray-900 text-xs font-medium text-white rounded-full">
              {item.category}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-200 line-clamp-2">
                {item.name}
              </h3>
              
              {item.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
              
              {/* Precio */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xl font-bold text-gray-900">
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
              <span className="text-sm font-medium text-gray-600">Cantidad:</span>
              
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 rounded-md bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 border border-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <span className="px-3 py-1 text-gray-900 font-semibold min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  className="p-2 rounded-md bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 border border-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Precio total del item */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                S/ {(item.price * item.quantity).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Botón de eliminar */}
        <button
          onClick={handleRemove}
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
