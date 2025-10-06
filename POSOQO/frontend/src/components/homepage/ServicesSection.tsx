// components/homepage/ServicesSection.tsx
import React from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { getImageUrl } from '@/lib/config';
import { ServicesSectionProps } from '@/types/homepage';
import { ServiceSkeleton, ErrorWithRetry } from '@/components/LoadingStates';
import { Star, Award, Phone, Mail, MapPin, Clock, ArrowRight, Sparkles, Crown } from 'lucide-react';

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  loading = false,
  error = null,
  onRetry
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (loading) {
    return (
      <section className="py-32 bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/FondoPoC.png')] bg-cover bg-center opacity-5"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-3 text-yellow-700 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
            >
              <Crown className="w-5 h-5" />
              <span>SERVICIOS PREMIUM</span>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </motion.div>
            <h2 className="text-7xl md:text-8xl font-black text-black mb-6 leading-tight">
              Servicios
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
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
      <section className="py-32 bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/FondoPoC.png')] bg-cover bg-center opacity-5"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-7xl md:text-8xl font-black text-black mb-6">
              Servicios
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
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
      <section className="py-32 bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/FondoPoC.png')] bg-cover bg-center opacity-5"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-3 text-yellow-700 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
            >
              <Crown className="w-5 h-5" />
              <span>SERVICIOS PREMIUM</span>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </motion.div>
            <h2 className="text-7xl md:text-8xl font-black text-black mb-6 leading-tight">
              Servicios
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              Experiencias únicas diseñadas para los verdaderos conocedores de la cerveza artesanal
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16"
            >
              <div className="bg-gradient-to-r from-yellow-400/10 to-amber-500/10 backdrop-blur-xl border border-yellow-400/20 rounded-3xl p-16 max-w-3xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Crown className="w-12 h-12 text-black" />
                </div>
                <h3 className="text-4xl font-bold text-black mb-6">Servicios Exclusivos</h3>
                <p className="text-gray-600 text-xl leading-relaxed">
                  Próximamente ofreceremos experiencias premium que elevarán tu apreciación por la cerveza artesanal a un nivel completamente nuevo.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[url('/FondoPoC.png')] bg-cover bg-center opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/20"></div>
      
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
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-3 text-yellow-700 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
          >
            <Crown className="w-5 h-5" />
            <span>SERVICIOS PREMIUM</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </motion.div>
          <h2 className="text-7xl md:text-8xl font-black text-black mb-6 leading-tight">
            Servicios
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
            Experiencias únicas diseñadas para los verdaderos conocedores de la cerveza artesanal
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
        </motion.div>
        
        {/* Services Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 80, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
              className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 hover:border-yellow-400/50 transition-all duration-700 hover:shadow-2xl hover:shadow-yellow-400/20 hover:-translate-y-5 overflow-hidden"
            >
              {/* Cinematic Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Premium Badge */}
              <div className="absolute top-6 right-6 z-20">
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  <span>PREMIUM</span>
                </div>
              </div>

              <div className="relative z-10">
                {/* Service Image */}
                <div className="relative mb-8">
                  <div className="relative h-56 group">
                    {/* Cinematic Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-2xl blur-2xl scale-110 group-hover:scale-125 transition-all duration-700"></div>
                    
                    {/* Image Container */}
                    <div className="relative h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
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
                  <h3 className="text-2xl font-bold text-black group-hover:text-yellow-600 transition-colors duration-500 mb-4">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6 text-base font-light">
                    {service.description}
                  </p>
                  
                  {/* Price */}
                  {service.price && (
                    <div className="text-3xl font-black text-yellow-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                      S/ {service.price.toFixed(2)}
                    </div>
                  )}
                  
                  {/* Status */}
                  <div className="flex items-center gap-2 justify-center mb-8">
                    <div className={`w-3 h-3 rounded-full ${service.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600 font-medium">
                      {service.is_active ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-yellow-400/30"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Contactar</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Cinematic Contact Section */}
        <motion.div 
          className="bg-gradient-to-r from-black via-gray-900 to-black rounded-3xl p-12 text-center text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          {/* Cinematic Background Pattern */}
          <div className="absolute inset-0 bg-[url('/FondoPo.png')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-gray-900/80 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-3 text-yellow-300 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
            >
              <Crown className="w-5 h-5" />
              <span>CONTACTO EXCLUSIVO</span>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </motion.div>
            
            <h3 className="text-5xl font-bold mb-6">¿Listo para la Experiencia Premium?</h3>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Nuestro equipo de expertos está listo para crear una experiencia personalizada que supere todas tus expectativas
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-8 h-8 text-black" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-white">+51 999 999 999</div>
                  <div className="text-sm text-gray-400">Línea Premium</div>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-8 h-8 text-black" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-white">info@posoqo.com</div>
                  <div className="text-sm text-gray-400">Email Exclusivo</div>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-8 h-8 text-black" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-white">Ayacucho, Perú</div>
                  <div className="text-sm text-gray-400">Ubicación Premium</div>
                </div>
              </motion.div>
            </div>
            
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                boxShadow: "0 25px 50px rgba(251, 191, 36, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 text-black font-bold py-5 px-10 rounded-2xl text-xl shadow-2xl hover:shadow-yellow-400/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">CONTACTAR AHORA</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};