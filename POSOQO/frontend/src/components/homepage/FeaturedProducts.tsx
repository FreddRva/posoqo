'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { getImageUrl } from '@/lib/config'
import { FeaturedProductsProps } from '@/types/homepage'
import { ProductSkeleton, ErrorWithRetry } from '@/components/LoadingStates'
import { Eye, Heart, ShoppingCart, Star, Beer, Sparkles, ArrowRight } from 'lucide-react'

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  title,
  description,
  onProductClick,
  loading = false,
  error = null,
  onRetry
}) => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  // Determinar el badge según el título
  const getBadgeText = () => {
    if (title.toLowerCase().includes('comida') || title.toLowerCase().includes('gastronomía')) {
      return 'NUESTRA GASTRONOMÍA'
    }
    return 'NUESTRAS CERVEZAS'
  }

  if (loading) {
    return (
      <section className="py-32 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-6"
            >
              <Beer className="w-4 h-4" />
              <span>{getBadgeText()}</span>
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-4">
              {title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-32 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          
          <ErrorWithRetry 
            error={error} 
            onRetry={onRetry || (() => {})}
            title={`Error cargando ${title.toLowerCase()}`}
          />
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-32 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-6"
            >
              <Beer className="w-4 h-4" />
              <span>{getBadgeText()}</span>
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-6">
              {title}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-3xl p-12 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Próximamente</h3>
                <p className="text-gray-300 text-lg">
                  Estamos preparando una colección excepcional de cervezas artesanales.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="py-32 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Efectos de fondo sutiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-6"
          >
            <Beer className="w-4 h-4" />
            <span>NUESTRAS CERVEZAS</span>
          </motion.div>
          
          <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-6 leading-tight">
            {title}
          </h2>
          
          {description && (
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative z-10"
            >
              {/* Card con glassmorphism premium */}
              <div className="relative h-full bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-black/95 backdrop-blur-sm rounded-3xl overflow-hidden border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-500 shadow-2xl hover:shadow-yellow-400/20 group-hover:shadow-3xl">
                {/* Efecto de brillo superior */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Imagen del producto */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay sutil sin botón */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Efecto de brillo sutil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Información del producto */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Botón de ver detalle en la parte inferior */}
                  <motion.button
                    onClick={() => onProductClick?.(product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 hover:from-yellow-400/20 hover:to-amber-500/20 border border-yellow-400/30 hover:border-yellow-400/50 text-yellow-400 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-yellow-400/20"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalle</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </div>

                {/* Efecto de brillo en hover */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
