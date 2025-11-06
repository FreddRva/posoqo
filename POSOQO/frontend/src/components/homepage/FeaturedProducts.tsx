'use client'
import React, { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { getImageUrl, getApiUrl } from '@/lib/config'
import { FeaturedProductsProps, Product } from '@/types/homepage'
import { ProductSkeleton, ErrorWithRetry } from '@/components/LoadingStates'
import { Eye, Heart, ShoppingCart, Star, Beer, Sparkles, ArrowRight } from 'lucide-react'

// Componente para mostrar estrellas de solo lectura (promedio de reseñas)
const RatingStars: React.FC<{ product: Product }> = ({ product }) => {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  React.useEffect(() => {
    if (!product.id) {
      setLoading(false);
      return;
    }
    
    // Cargar reseñas para calcular promedio
    const loadRating = async () => {
      try {
        // Primero obtener el total de reseñas
        const response = await fetch(getApiUrl(`products/${product.id}/reviews?limit=1`));
        if (response.ok) {
          const data = await response.json();
          const totalReviews = data.pagination?.total || 0;
          setReviewCount(totalReviews);
          
          if (totalReviews > 0) {
            // Cargar todas las reseñas para calcular el promedio correcto
            const allReviewsResponse = await fetch(getApiUrl(`products/${product.id}/reviews?limit=${totalReviews}`));
            if (allReviewsResponse.ok) {
              const allReviewsData = await allReviewsResponse.json();
              const allReviews = allReviewsData.reviews || [];
              
              if (allReviews.length > 0) {
                const avg = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;
                setAverageRating(avg);
              } else {
                setAverageRating(0);
              }
            }
          } else {
            setAverageRating(0);
            setReviewCount(0);
          }
        }
      } catch (error) {
        console.error('Error cargando rating:', error);
        setAverageRating(0);
        setReviewCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    loadRating();
  }, [product.id]);
  
  const rating = averageRating || product.rating || 0;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center gap-1 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-gray-700 text-gray-700" />
        ))}
      </div>
    );
  }
  
  if (rating === 0 && reviewCount === 0) {
    return (
      <div className="flex justify-center items-center gap-2 mb-5">
        <span className="text-sm text-gray-500">Sin reseñas aún</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center gap-2 mb-5">
      <div className="flex justify-center items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.floor(rating);
          const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 >= 0.5;
          
          return (
            <Star
              key={i}
              className={`w-5 h-5 transition-colors ${
                isFilled
                  ? 'fill-cyan-400 text-cyan-400'
                  : isHalfFilled
                  ? 'fill-cyan-400/50 text-cyan-400/50'
                  : 'fill-gray-600 text-gray-600'
              }`}
            />
          );
        })}
        <span className="ml-2 text-sm text-gray-400">
          {rating > 0 ? `${rating.toFixed(1)}` : '0.0'}
          {reviewCount > 0 && (
            <span className="text-gray-500"> ({reviewCount})</span>
          )}
        </span>
      </div>
      <p className="text-xs text-gray-500">Promedio de reseñas</p>
    </div>
  );
};

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
      <section className="py-32 bg-black relative overflow-hidden">
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
      <section className="py-32 bg-black relative overflow-hidden">
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
      <section className="py-32 bg-black relative overflow-hidden">
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
              <div className="bg-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-3xl p-12 max-w-2xl mx-auto">
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
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative z-10"
            >
              {/* Contenedor principal con espacio para la imagen flotante */}
              <div className="relative pt-48">
                {/* Imagen del producto - FLOTANTE como en Fortnite - COMPLETA */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full z-30 group-hover:z-40 -translate-y-8 group-hover:-translate-y-12 transition-transform duration-300">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -5 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative w-full flex items-center justify-center"
                  >
                    <div className="w-full max-w-[300px] h-auto flex items-center justify-center" style={{ minHeight: '200px', maxHeight: '500px' }}>
                      <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-auto h-auto max-w-full max-h-[500px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)] filter brightness-110"
                        style={{ objectFit: 'contain', display: 'block', minHeight: '150px', maxHeight: '500px' }}
                      />
                    </div>
                    
                    {/* Badge destacado */}
                    {product.is_featured && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm border border-cyan-300/50 z-20"
                      >
                        ⭐ Destacado
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Card estilo Fortnite - Diseño moderno y limpio */}
                <div className="relative bg-gray-900/95 backdrop-blur-sm rounded-2xl overflow-visible border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/20 group-hover:shadow-3xl mt-48">
                  {/* Tarjeta de información - Estilo Fortnite */}
                  <div className="bg-gray-800/95 backdrop-blur-sm p-6 border-t border-gray-700/50 rounded-b-2xl">
                  {/* Nombre del producto */}
                  <h3 className="text-2xl font-bold text-white text-center mb-4">
                    {product.name}
                  </h3>
                  
                  {/* Rating con estrellas brillantes - Interactivas para calificar */}
                  <RatingStars product={product} />

                  {/* Botón destacado - Estilo Fortnite */}
                  <motion.button
                    onClick={() => onProductClick?.(product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-400 hover:via-blue-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 uppercase tracking-wider text-sm"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Ver Detalle</span>
                  </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
