// components/homepage/ServicesSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getImageUrl } from '@/lib/config';
import { ServicesSectionProps } from '@/types/homepage';
import { ServiceSkeleton, ErrorWithRetry } from '@/components/LoadingStates';
import { Star, Award, Zap, Heart, Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  loading = false,
  error = null,
  onRetry
}) => {
  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D97706' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-400/20 rounded-full px-6 py-2 text-amber-700 text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              <span>Nuestros Servicios</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-amber-900 mb-6 leading-tight">
              Servicios
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
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
      <section className="py-24 bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-8xl font-black text-amber-900 mb-6">
              Servicios
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
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
    <section className="py-24 bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D97706' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
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
          <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-400/20 rounded-full px-6 py-2 text-amber-700 text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            <span>Nuestros Servicios</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-amber-900 mb-6 leading-tight">
            Servicios
          </h2>
          <p className="text-xl text-amber-800/80 max-w-3xl mx-auto leading-relaxed">
            Descubre todos los servicios que ofrecemos para hacer de tu experiencia cervecera algo único
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full mt-6"></div>
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
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-amber-200/50 hover:border-amber-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-400/20 hover:-translate-y-3 overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Premium Badge */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>PREMIUM</span>
                </div>
              </div>

              <div className="relative z-10">
                {/* Service Image */}
                <div className="relative mb-6">
                  <div className="relative h-48 group">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl blur-xl scale-110 group-hover:scale-125 transition-all duration-500"></div>
                    
                    {/* Image Container */}
                    <div className="relative h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      {service.image_url ? (
                        <Image 
                          src={getImageUrl(service.image_url)}
                          alt={service.name} 
                          width={200}
                          height={200}
                          className="max-w-full max-h-full object-contain drop-shadow-lg"
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
                  </div>
                </div>
                
                {/* Service Info */}
                <div className="text-center">
                  {/* Service Name */}
                  <h3 className="text-2xl font-bold text-amber-900 group-hover:text-amber-700 transition-colors duration-300 mb-3">
                    {service.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-amber-800/70 leading-relaxed mb-4 text-sm">
                    {service.description}
                  </p>
                  
                  {/* Price */}
                  {service.price && (
                    <div className="text-3xl font-black text-amber-600 mb-4">
                      S/ {service.price.toFixed(2)}
                    </div>
                  )}
                  
                  {/* Status */}
                  <div className="flex items-center gap-2 justify-center mb-6">
                    <div className={`w-3 h-3 rounded-full ${service.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-amber-800/70">
                      {service.is_active ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Contactar</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-800 p-3 rounded-xl transition-all duration-300"
                    >
                      <Heart className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Contact Info */}
        <motion.div 
          className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold mb-4">¿Necesitas más información?</h3>
          <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
            Nuestro equipo está listo para ayudarte con cualquier consulta sobre nuestros servicios
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">+51 999 999 999</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">info@posoqo.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Ayacucho, Perú</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};