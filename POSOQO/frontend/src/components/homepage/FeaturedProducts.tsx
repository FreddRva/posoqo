// components/homepage/FeaturedProducts.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/config';
import { FeaturedProductsProps } from '@/types/homepage';
import { ProductSkeleton, ErrorWithRetry } from '@/components/LoadingStates';
import { Star, Award, Zap, Heart, ShoppingCart, Eye } from 'lucide-react';

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  title,
  description,
  onProductClick,
  loading = false,
  error = null,
  onRetry
}) => {
  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-400/20 rounded-full px-6 py-2 text-amber-300 text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              <span>Productos Destacados</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
              {title}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
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
      <section className="py-24 bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-8xl font-black text-white mb-6">
              {title}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
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
    return null;
  }

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-400/5 via-transparent to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-400/20 rounded-full px-6 py-2 text-amber-300 text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            <span>Productos Destacados</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-xl text-amber-100/80 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full mt-6"></div>
        </motion.div>
        
        {/* Products Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-3xl p-8 border border-amber-400/20 hover:border-amber-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-400/20 hover:-translate-y-3 overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Premium Badge */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>PREMIUM</span>
                </div>
              </div>

              <div className="relative z-10">
                {/* Product Image */}
                <div className="relative mb-6">
                  <div className="relative h-64 group">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl blur-xl scale-110 group-hover:scale-125 transition-all duration-500"></div>
                    
                    {/* Image Container */}
                    <div className="relative h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-20 h-20 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="text-center">
                  {/* Product Name */}
                  <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300 mb-3">
                    {product.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-slate-300 leading-relaxed mb-4 text-sm">
                    {product.description}
                  </p>
                  
                  {/* Technical Specs */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {product.abv && (
                      <div className="bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                        <span className="text-xs font-semibold text-amber-400">ABV {product.abv}</span>
                      </div>
                    )}
                    {product.ibu && (
                      <div className="bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                        <span className="text-xs font-semibold text-amber-400">IBU {product.ibu}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                        <span className="text-xs font-semibold text-amber-400">{product.color}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Price */}
                  {product.price && (
                    <div className="text-3xl font-black text-amber-400 mb-6">
                      S/ {product.price.toFixed(2)}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onProductClick(product)}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalles</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-xl transition-all duration-300"
                    >
                      <Heart className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-xl transition-all duration-300"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Call to Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="/tienda"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl hover:shadow-amber-500/30 transition-all duration-300"
          >
            <Zap className="w-5 h-5" />
            <span>Explorar Todas las Cervezas</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};