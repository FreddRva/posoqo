// components/homepage/ServicesSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getImageUrl } from '@/lib/config';
import { ServicesSectionProps } from '@/types/homepage';
import { ServiceSkeleton, ErrorWithRetry } from '@/components/LoadingStates';

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
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
              Servicios
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <ServiceSkeleton key={index} />
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
              Servicios
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
          </div>
          
          <ErrorWithRetry 
            error={error} 
            onRetry={onRetry || (() => {})}
            title="Error cargando servicios"
          />
        </div>
      </section>
    );
  }

  if (!services || services.length === 0) {
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
            Servicios
          </motion.h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
        </div>
        
        {/* Grid de servicios */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              className="group relative bg-gradient-to-br from-neutral-800/95 to-neutral-700/95 backdrop-blur-sm rounded-3xl p-6 border border-amber-400/30 hover:border-amber-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-2 overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 text-center">
                {/* Imagen grande centrada */}
                <div className="relative w-full h-64 mb-6 group">
                  {/* Efecto de resplandor premium */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl blur-lg scale-110 group-hover:scale-125 transition-all duration-500"></div>
                  
                  {/* Contenedor de imagen con gradiente */}
                  <div className="relative bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    {service.image_url ? (
                      <Image 
                        src={getImageUrl(service.image_url)}
                        alt={service.name} 
                        width={300}
                        height={300}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-6xl">🍺</span></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🍺</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Efecto de resplandor en la imagen */}
                  <div className="absolute inset-0 border-2 border-amber-400/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Información del servicio */}
                <div className="space-y-4">
                  {/* Título principal */}
                  <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300 line-clamp-2">
                    {service.name}
                  </h3>
                  
                  {/* Descripción */}
                  <p className="text-neutral-300 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                  
                  {/* Precio si existe */}
                  {service.price && (
                    <div className="text-3xl font-bold text-amber-400">
                      S/ {service.price.toFixed(2)}
                    </div>
                  )}
                  
                  {/* Estado del servicio */}
                  <div className="flex items-center gap-2 justify-center">
                    <div className={`w-3 h-3 rounded-full ${service.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-neutral-300">
                      {service.is_active ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex flex-col gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 group-hover:from-amber-600 group-hover:to-amber-500"
                    >
                      Contáctanos
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full border-2 border-amber-400 text-amber-400 font-bold py-3 px-6 rounded-xl hover:bg-amber-400 hover:text-black transition-all duration-300"
                    >
                      Más Información
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Efecto de resplandor en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
