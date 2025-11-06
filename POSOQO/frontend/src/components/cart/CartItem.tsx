"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Minus, Plus, Trash2, Heart } from 'lucide-react';
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
      className="group relative bg-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-6 hover:border-yellow-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10"
    >
      <div className="flex items-start gap-4">
        {/* Imagen del producto */}
        <div className="relative flex-shrink-0">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black border border-yellow-400/20 group-hover:border-yellow-400/40 transition-all">
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="96px"
            />
          </div>
          
          {/* Badge de categoría */}
          {item.category && (
            <div className="absolute -top-1 -right-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-xs font-bold text-black rounded-full border border-black">
              {item.category}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors duration-200 line-clamp-2 mb-2">
                {item.name}
              </h3>
              
              {item.description && (
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                  {item.description}
                </p>
              )}
              
              {/* Precio */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-yellow-400">
                  S/ {item.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  c/u
                </span>
              </div>
            </div>

            {/* Botón de eliminar */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 border border-transparent hover:border-red-400/30 flex-shrink-0"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Controles de cantidad y precio total */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-400">Cantidad:</span>
              
              <div className="flex items-center gap-2 bg-black/50 rounded-lg p-1 border border-yellow-400/20">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 rounded-md bg-white/5 text-gray-400 hover:bg-red-400/20 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-transparent hover:border-red-400/30"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                
                <span className="px-4 py-1 text-white font-bold min-w-[3rem] text-center bg-yellow-400/10 rounded-md border border-yellow-400/30">
                  {item.quantity}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  className="p-2 rounded-md bg-white/5 text-gray-400 hover:bg-green-400/20 hover:text-green-400 transition-all duration-200 border border-transparent hover:border-green-400/30"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Precio total del item */}
            <div className="text-right">
              <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                S/ {(item.price * item.quantity).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                Total
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
