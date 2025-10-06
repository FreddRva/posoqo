// components/homepage/FeaturedProducts.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/config';
import { FeaturedProductsProps } from '@/types/homepage';
import { ProductSkeleton, ErrorWithRetry } from '@/components/LoadingStates';

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
      <section className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold text-amber-400 mb-6">
              {title}
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
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
      <section className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold text-amber-400 mb-6">
              {title}
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
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
    <section className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-transparent to-amber-400/5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-400/10 via-transparent to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Título de la sección */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-5xl md:text-7xl font-bold text-amber-400 mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
        </div>
        
        {/* Grid de productos */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-gradient-to-br from-neutral-800/95 to-neutral-700/95 backdrop-blur-sm rounded-3xl p-6 border border-amber-400/30 hover:border-amber-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-2 overflow-hidden"
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                {/* Imagen flotante */}
                <div className="flex-shrink-0 w-full lg:w-48">
                  <div className="relative h-80 group">
                    {/* Efecto de resplandor sutil */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-2xl blur-xl scale-110 group-hover:scale-125 transition-all duration-500"></div>
                    
                    {/* Imagen flotante */}
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
                
                {/* Información del producto */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Título principal */}
                  <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300 mb-4">
                    {product.name}
                  </h3>
                  
                  {/* Descripción */}
                  <p className="text-neutral-300 leading-relaxed mb-4">
                    {product.description}
                  </p>
                  
                  {/* Especificaciones técnicas */}
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
                    {product.abv && (
                      <div className="bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/40">
                        <span className="text-xs font-semibold text-amber-400">ABV {product.abv}</span>
                      </div>
                    )}
                    {product.ibu && (
                      <div className="bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/40">
                        <span className="text-xs font-semibold text-amber-400">IBU {product.ibu}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/40">
                        <span className="text-xs font-semibold text-amber-400">{product.color}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Precio si existe */}
                  {product.price && (
                    <div className="text-2xl font-bold text-amber-400 mb-4">
                      S/ {product.price.toFixed(2)}
                    </div>
                  )}
                  
                  {/* Botón Ver Detalles */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onProductClick(product)}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 group-hover:from-[#FFD700] group-hover:to-[#D4AF37]"
                  >
                    Ver Detalles
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Botón de acción principal */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.a
            href="/tienda"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-4 px-8 rounded-2xl text-lg hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300"
          >
            <span>Ver Todas las Cervezas</span>
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
