"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, CreditCard, ArrowLeft, Star, Package, Clock, Eye } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/products"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
          
          <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
                  <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
                  <p className="text-gray-600">
                    {summary.uniqueItems} {summary.uniqueItems === 1 ? 'producto' : 'productos'} en tu carrito
                  </p>
                </div>
              </div>
            </div>

            {summary.hasItems && (
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isClearing ? 'Limpiando...' : 'Limpiar Carrito'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Contenido principal */}
        {summary.isEmpty ? (
          /* Estado vacío */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
                >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explora nuestros productos y agrega los que más te gusten para comenzar tu pedido
            </p>
            
            <div className="flex gap-4 justify-center">
                    <Link
                      href="/products"
                className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Ver Productos
              </Link>
              <Link
                href="/"
                className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Ir al Inicio
                    </Link>
            </div>
                </motion.div>
        ) : (
          /* Lista de productos */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Productos en tu carrito
                </h3>
                <div className="space-y-4">
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
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              {/* Resumen del pedido */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-gray-600" />
                  Resumen del Pedido
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'producto' : 'productos'}):</span>
                    <span className="text-gray-900 font-semibold">
                      S/ {summary.total.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Envío:</span>
                    <span className="text-green-600 font-semibold">
                      Gratis
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Descuento:</span>
                    <span className="text-gray-500">
                      S/ 0.00
                    </span>
                  </div>
                  
                  <div className="h-px bg-gray-200" />
                  
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-900 font-bold">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      S/ {summary.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceder al Pago
                  </Link>
                  
                  <Link
                    href="/products"
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Seguir Comprando
                  </Link>
                </div>

                {/* Información adicional */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Información del Pedido
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
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