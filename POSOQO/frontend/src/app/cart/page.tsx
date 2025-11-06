'use client'
import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, CreditCard, ArrowLeft, Package, Sparkles, Shield, Truck, Tag, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import CartItem from '@/components/cart/CartItem'
import RecentlyViewed from '@/components/cart/RecentlyViewed'

export default function CartPage() {
  const { cart, summary, clearCart, loading } = useCart()
  const [isClearing, setIsClearing] = useState(false)
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })

  const handleClearCart = async () => {
    if (!confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      return
    }
    setIsClearing(true)
    try {
      await clearCart()
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-16 px-6 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-amber-900/30" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/products"
                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full">
                <ShoppingBag className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                  Carrito de Compras
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Carrito de Compras
              </span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {summary.isEmpty ? (
              /* Estado vacío */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/80 backdrop-blur-xl rounded-2xl p-12 md:p-16 text-center border border-yellow-400/20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-yellow-400/30"
                >
                  <ShoppingBag className="w-16 h-16 text-yellow-400" />
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
                  Tu carrito está vacío
                </h2>
                <p className="text-gray-300 mb-10 max-w-md mx-auto text-lg">
                  Explora nuestros productos y agrega los que más te gusten para comenzar tu pedido
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/products"
                    className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/50 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Ver Productos
                  </Link>
                  <Link
                    href="/"
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-lg transition-all duration-300 border border-white/10 hover:border-white/20 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Ir al Inicio
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Lista de productos */
              <motion.div
                key="filled"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Lista de productos */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Header con botón limpiar */}
                  <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg p-2">
                        <Package className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400">
                          Productos en tu carrito
                        </h3>
                        <p className="text-sm text-gray-400">
                          {summary.itemCount} {summary.itemCount === 1 ? 'artículo' : 'artículos'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleClearCart}
                      disabled={isClearing}
                      className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 disabled:opacity-50 border border-red-400/30 hover:border-red-400/50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isClearing ? 'Limpiando...' : 'Limpiar Todo'}
                    </button>
                  </div>

                  {/* Items del carrito */}
                  <div className="space-y-4">
                    <AnimatePresence>
                      {cart.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                          <CartItem
                            item={item}
                            onUpdateQuantity={(productId, quantity) => {}}
                            onRemove={(productId) => {}}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Columna derecha - Resumen */}
                <div className="space-y-6">
                  {/* Resumen del pedido */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/20 sticky top-24"
                  >
                    <h3 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Resumen del Pedido
                    </h3>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'artículo' : 'artículos'}):</span>
                        <span className="text-gray-300 font-semibold">
                          S/ {summary.total.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Envío:</span>
                        <span className="text-green-400 font-semibold flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          Gratis
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Descuento:</span>
                        <span className="text-gray-500">
                          S/ 0.00
                        </span>
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent my-4" />
                      
                      <div className="flex justify-between items-center text-lg pt-2">
                        <span className="text-white font-bold">Total:</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                          S/ {summary.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Link
                        href="/checkout"
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/50"
                      >
                        <CreditCard className="w-5 h-5" />
                        Proceder al Pago
                      </Link>
                      
                      <Link
                        href="/products"
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-lg transition-all duration-300 border border-white/10 hover:border-white/20"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Seguir Comprando
                      </Link>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
                      <h4 className="text-sm font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Información del Pedido
                      </h4>
                      <ul className="text-xs text-gray-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <Truck className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Envío gratuito en pedidos mayores a S/ 50</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Tiempo de entrega: 30-45 minutos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Pago seguro con tarjeta o efectivo</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Tag className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Garantía de satisfacción 100%</span>
                        </li>
                      </ul>
                    </div>

                    {/* Alerta de seguridad */}
                    <div className="mt-4 p-3 bg-blue-400/10 border border-blue-400/30 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-400">
                        Tus datos están protegidos. Proceso de pago seguro y encriptado.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vistos Recientemente - Siempre visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <RecentlyViewed />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
