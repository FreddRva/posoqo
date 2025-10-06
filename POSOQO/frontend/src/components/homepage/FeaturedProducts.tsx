// components/homepage/FeaturedProducts.tsx
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { getImageUrl } from '@/lib/config';
import { FeaturedProductsProps } from '@/types/homepage';
import { ProductSkeleton, ErrorWithRetry } from '@/components/LoadingStates';
import { Eye, Heart, ShoppingCart, Star, ArrowRight, Sparkles, Award } from 'lucide-react';

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  title,
  description,
  onProductClick,
  loading = false,
  error = null,
  onRetry
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (loading) {
    return (
      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/FondoPo.png')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-3 text-yellow-300 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
            >
              <Award className="w-5 h-5" />
              <span>COLECCIÓN PREMIUM</span>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </motion.div>
            <h2 className="text-7xl md:text-8xl font-black text-white mb-6 leading-tight">
              {title}
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/FondoPo.png')] bg-cover bg-center opacity-20"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-7xl md:text-8xl font-black text-white mb-6">
              {title}
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
          </div>
          
          <ErrorWithRetry 
            error={error} 
            onRetry={onRetry || (() => {})}
            title={`Error cargando ${title.toLowerCase()}`}
          />
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/FondoPo.png')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-3 text-yellow-300 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
            >
              <Award className="w-5 h-5" />
              <span>COLECCIÓN PREMIUM</span>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </motion.div>
            <h2 className="text-7xl md:text-8xl font-black text-white mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              {description}
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16"
            >
              <div className="bg-gradient-to-r from-yellow-400/10 to-amber-500/10 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-12 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Próximamente</h3>
                <p className="text-gray-300 text-lg">
                  Estamos preparando una colección excepcional de cervezas artesanales que superará todas tus expectativas.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[url('/FondoPo.png')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-3 text-yellow-300 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
          >
            <Award className="w-5 h-5" />
            <span>COLECCIÓN PREMIUM</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </motion.div>
          <h2 className="text-7xl md:text-8xl font-black text-white mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
            {description}
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
        </motion.div>
        
        {/* Products Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 80, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-yellow-400/30 transition-all duration-700 hover:shadow-2xl hover:shadow-yellow-400/20 hover:-translate-y-5 overflow-hidden"
            >
              {/* Cinematic Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Premium Badge */}
              <div className="absolute top-6 right-6 z-20">
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  <span>PREMIUM</span>
                </div>
              </div>

              <div className="relative z-10">
                {/* Product Image with Cinematic Effects */}
                <div className="relative mb-8">
                  <div className="relative h-80 group">
                    {/* Cinematic Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-2xl blur-2xl scale-110 group-hover:scale-125 transition-all duration-700"></div>
                    
                    {/* Image Container */}
                    <div className="relative h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-24 h-24 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-500 mb-4">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6 text-base font-light">
                    {product.description}
                  </p>
                  
                  {/* Technical Specs with Glassmorphism */}
                  <div className="flex flex-wrap gap-3 justify-center mb-8">
                    {product.abv && (
                      <div className="bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
                        <span className="text-sm font-semibold text-yellow-400">ABV {product.abv}</span>
                      </div>
                    )}
                    {product.ibu && (
                      <div className="bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
                        <span className="text-sm font-semibold text-yellow-400">IBU {product.ibu}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
                        <span className="text-sm font-semibold text-yellow-400">{product.color}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Price with Cinematic Effect */}
                  {product.price && (
                    <div className="text-4xl font-black text-yellow-400 mb-8 group-hover:scale-110 transition-transform duration-300">
                      S/ {product.price.toFixed(2)}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onProductClick(product)}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Ver Detalles</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-xl transition-all duration-300 border border-white/20"
                    >
                      <Heart className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-xl transition-all duration-300 border border-white/20"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Cinematic Call to Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.a
            href="/tienda"
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: "0 25px 50px rgba(251, 191, 36, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 text-black font-bold py-5 px-10 rounded-2xl text-xl shadow-2xl hover:shadow-yellow-400/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10">EXPLORAR COLECCIÓN COMPLETA</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10"
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};