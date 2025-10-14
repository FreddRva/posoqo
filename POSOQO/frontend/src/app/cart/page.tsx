"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, CreditCard, ArrowLeft, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/cart/CartItem';
import RecentlyViewed from '@/components/cart/RecentlyViewed';

export default function CartPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
      
      {/* Partículas flotantes */}
      <div className="absolute top-20 left-8 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
      <div className="absolute top-40 right-12 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-32 left-16 w-3 h-3 bg-cyan-400/20 rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
      <div className="absolute top-60 right-1/4 w-1 h-1 bg-green-400/50 rounded-full animate-pulse" style={{ animationDelay: '6s' }} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="p-3 bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-300 border border-gray-600/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Mi Carrito</h1>
                <p className="text-gray-400">
                  {summary.uniqueItems} {summary.uniqueItems === 1 ? 'producto' : 'productos'} en tu carrito
                </p>
              </div>
            </div>
          </div>

          {summary.hasItems && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearCart}
              disabled={isClearing}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-400/30 rounded-xl hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'Limpiando...' : 'Limpiar Carrito'}
            </motion.button>
          )}
        </motion.div>

        {/* Contenido principal */}
        {summary.isEmpty ? (
          /* Estado vacío */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600/30">
                <ShoppingBag className="w-16 h-16 text-gray-500" />
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-md">
              Explora nuestros productos y agrega los que más te gusten para comenzar tu pedido
            </p>
            
            <div className="flex gap-4">
              <Link
                href="/products"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                Ver Productos
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-600/50 transition-all duration-300 border border-gray-600/30"
              >
                Ir al Inicio
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Lista de productos */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Lista de productos */}
            <div className="xl:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CartItem
                      item={item}
                      onUpdateQuantity={(productId, quantity) => {
                        // La lógica se maneja en el CartItem directamente
                      }}
                      onRemove={(productId) => {
                        // La lógica se maneja en el CartItem directamente
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Columna derecha */}
            <div className="xl:col-span-2 space-y-6">
              {/* Resumen del pedido */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-black/80 backdrop-blur-xl rounded-2xl border border-blue-400/20 p-6"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Resumen del Pedido
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'producto' : 'productos'}):</span>
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
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Descuento:</span>
                    <span className="text-gray-400">
                      S/ 0.00
                    </span>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                  
                  <div className="flex justify-between items-center text-xl">
                    <span className="text-white font-bold">Total:</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                      S/ {summary.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceder al Pago
                  </Link>
                  
                  <Link
                    href="/products"
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-600/50 transition-all duration-300 border border-gray-600/30"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Seguir Comprando
                  </Link>
                </div>

                {/* Información adicional */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">
                    💡 Información del Pedido
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Envío gratuito en pedidos mayores a S/ 50</li>
                    <li>• Tiempo de entrega: 30-45 minutos</li>
                    <li>• Pago seguro con tarjeta o efectivo</li>
                  </ul>
                </div>
              </motion.div>

              {/* Vistos Recientemente */}
              <RecentlyViewed />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}