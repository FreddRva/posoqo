// components/homepage/FeaturedProducts.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/config';
import { FeaturedProductsProps } from '@/types/homepage';
import { ProductSkeleton, ErrorWithRetry } from '@/components/LoadingStates';
import { Eye, Heart, ShoppingCart, ArrowDown } from 'lucide-react';

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
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
              {title}
            </h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
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
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
              {title}
            </h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
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
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
              {title}
            </h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
            <p className="text-gray-600 text-lg mt-6">
              Próximamente tendremos nuestras cervezas artesanales disponibles
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            {description}
          </p>
          <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
        </motion.div>
        
        {/* Products Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg"
            >
              {/* Product Image */}
              <div className="relative mb-6">
                <div className="relative h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg></div>';
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Product Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-black mb-3 group-hover:text-yellow-600 transition-colors duration-300">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  {product.description}
                </p>
                
                {/* Technical Specs */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {product.abv && (
                    <div className="bg-yellow-100 px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold text-yellow-800">ABV {product.abv}</span>
                    </div>
                  )}
                  {product.ibu && (
                    <div className="bg-yellow-100 px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold text-yellow-800">IBU {product.ibu}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="bg-yellow-100 px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold text-yellow-800">{product.color}</span>
                    </div>
                  )}
                </div>
                
                {/* Price */}
                {product.price && (
                  <div className="text-2xl font-bold text-yellow-600 mb-4">
                    S/ {product.price.toFixed(2)}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onProductClick(product)}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded transition-all duration-300"
                  >
                    <Heart className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded transition-all duration-300"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </motion.button>
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-black text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-all duration-300"
          >
            <span>Ver Todas las Cervezas</span>
            <ArrowDown className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};