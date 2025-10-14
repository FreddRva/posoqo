"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import CartModal from './CartModal';

export default function CartButton() {
  const { summary, loading } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Efecto para animar cuando se agrega un producto
  useEffect(() => {
    const handleCartUpdate = () => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  return (
    <>
      {/* Botón flotante del carrito */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className={`
          fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300
          ${summary.hasItems 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
            : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Efectos de fondo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        {/* Contenido del botón */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={isAnimating ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <ShoppingBag className="w-6 h-6 text-white" />
          </motion.div>

          {/* Contador de productos */}
          {summary.hasItems && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
            >
              <motion.span
                key={summary.itemCount}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xs font-bold text-white"
              >
                {summary.itemCount > 99 ? '99+' : summary.itemCount}
              </motion.span>
            </motion.div>
          )}

          {/* Efecto de pulso cuando hay productos */}
          {summary.hasItems && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
            />
          )}

          {/* Partículas flotantes */}
          <div className="absolute -top-1 -left-1 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap pointer-events-none"
        >
          {summary.hasItems 
            ? `${summary.itemCount} ${summary.itemCount === 1 ? 'producto' : 'productos'} - S/ ${summary.total.toFixed(2)}`
            : 'Ver carrito'
          }
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </motion.div>
      </motion.button>

      {/* Modal del carrito */}
      <CartModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
