// components/homepage/ServicesSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getImageUrl } from '@/lib/config';
import { ServicesSectionProps } from '@/types/homepage';
import { ServiceSkeleton, ErrorWithRetry } from '@/components/LoadingStates';
import { Phone, Mail, MapPin } from 'lucide-react';

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  loading = false,
  error = null,
  onRetry
}) => {
  if (loading) {
    return (
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
              Servicios
            </h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
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
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
              Servicios
            </h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
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
    return (
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
              Servicios
            </h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
            <p className="text-gray-600 text-lg mt-6">
              Próximamente ofreceremos servicios especializados para cerveceros
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-100">
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
            Servicios
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            Ofrecemos servicios especializados para la comunidad cervecera
          </p>
          <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
        </motion.div>
        
        {/* Services Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg"
            >
              {/* Service Image */}
              <div className="relative mb-6">
                <div className="relative h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  {service.image_url ? (
                    <Image 
                      src={getImageUrl(service.image_url)}
                      alt={service.name} 
                      width={200}
                      height={200}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><span class="text-4xl">🍺</span></div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">🍺</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Service Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-black group-hover:text-yellow-600 transition-colors duration-300 mb-3">
                  {service.name}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  {service.description}
                </p>
                
                {/* Price */}
                {service.price && (
                  <div className="text-2xl font-bold text-yellow-600 mb-4">
                    S/ {service.price.toFixed(2)}
                  </div>
                )}
                
                {/* Status */}
                <div className="flex items-center gap-2 justify-center mb-4">
                  <div className={`w-3 h-3 rounded-full ${service.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {service.is_active ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                
                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition-all duration-300"
                >
                  Contactar
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Contact Info */}
        <motion.div 
          className="bg-black rounded-lg p-8 text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">¿Necesitas más información?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Nuestro equipo está listo para ayudarte con cualquier consulta sobre nuestros servicios
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">+51 999 999 999</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">info@posoqo.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Ayacucho, Perú</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};