"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, CreditCard, Star, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import CartItemComponent from './CartItem';
import Link from 'next/link';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, summary, clearCart, loading } = useCart();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay de fondo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal del carrito */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-black border-l border-blue-400/20 shadow-2xl z-50 overflow-hidden"
          >
            {/* Efectos de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400" />
            
            {/* Partículas flotantes */}
            <div className="absolute top-20 left-8 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse" />
            <div className="absolute top-40 right-12 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-32 left-16 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse" style={{ animationDelay: '4s' }} />

            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Mi Carrito</h2>
                    <p className="text-sm text-gray-400">
                      {summary.uniqueItems} {summary.uniqueItems === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Botón de limpiar carrito */}
                  {summary.hasItems && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearCart}
                      disabled={isClearing}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  )}

                  {/* Botón de cerrar */}
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Contenido del carrito */}
              <div className="flex-1 overflow-hidden">
                {summary.isEmpty ? (
                  /* Estado vacío */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full p-6 text-center"
                  >
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600/30">
                        <ShoppingBag className="w-12 h-12 text-gray-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">
                      Tu carrito está vacío
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-xs">
                      Explora nuestros productos y agrega los que más te gusten
                    </p>
                    
                    <Link
                      href="/products"
                      onClick={onClose}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                    >
                      Ver Productos
                    </Link>
                  </motion.div>
                ) : (
                  /* Lista de productos */
                  <div className="h-full overflow-y-auto">
                    <div className="p-4 space-y-4">
                      <AnimatePresence>
                        {cart.map((item) => (
                          <CartItemComponent
                            key={item.id}
                            item={item}
                            onUpdateQuantity={(productId, quantity) => {
                              // Aquí se implementaría la lógica de actualización
                            }}
                            onRemove={(productId) => {
                              // Aquí se implementaría la lógica de eliminación
                            }}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer con resumen y checkout */}
              {summary.hasItems && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-gray-700/50 p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50"
                >
                  {/* Resumen */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Subtotal:</span>
                      <span className="text-white font-semibold">
                        S/ {summary.total.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Envío:</span>
                      <span className="text-green-400 font-semibold">
                        Gratis
                      </span>
                    </div>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                    
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-white font-bold">Total:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                        S/ {summary.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-3">
                    <Link
                      href="/checkout"
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                    >
                      <CreditCard className="w-5 h-5" />
                      Proceder al Pago
                    </Link>
                    
                    <Link
                      href="/cart"
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-600/50 transition-all duration-300 border border-gray-600/30"
                    >
                      <Star className="w-4 h-4" />
                      Ver Carrito Completo
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
