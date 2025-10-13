'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { getImageUrl } from '@/lib/config'
import { ServicesSectionProps } from '@/types/homepage'
import { ServiceSkeleton, ErrorWithRetry } from '@/components/LoadingStates'
import { Star, ArrowRight, Sparkles, Zap } from 'lucide-react'

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  loading = false,
  error = null,
  onRetry
}) => {
  const sectionRef = React.useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  if (loading) {
    return (
      <section className="py-32 bg-gradient-to-b from-gray-950 via-black to-gray-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-6"
            >
              <Zap className="w-4 h-4" />
              <span>EXPERIENCIAS ÚNICAS</span>
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-4">
              Servicios
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <ServiceSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-32 bg-gradient-to-b from-gray-950 via-black to-gray-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Servicios
            </h2>
          </div>
          
          <ErrorWithRetry 
            error={error} 
            onRetry={onRetry || (() => {})}
            title="Error cargando servicios"
          />
        </div>
      </section>
    )
  }

  if (!services || services.length === 0) {
    return (
      <section className="py-32 bg-gradient-to-b from-gray-950 via-black to-gray-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-6"
            >
              <Zap className="w-4 h-4" />
              <span>EXPERIENCIAS ÚNICAS</span>
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-6">
              Servicios
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Experiencias diseñadas para los verdaderos conocedores de la cerveza artesanal
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-3xl p-12 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Servicios Exclusivos</h3>
                <p className="text-gray-300 text-lg">
                  Próximamente ofreceremos experiencias premium que elevarán tu apreciación por la cerveza artesanal.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="py-32 bg-gradient-to-b from-gray-950 via-black to-gray-950 relative overflow-hidden">
      {/* Efectos de fondo futuristas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6">
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
            <Zap className="w-4 h-4" />
            <span>EXPERIENCIAS ÚNICAS</span>
          </motion.div>
          
          <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-6 leading-tight">
            Servicios
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Experiencias diseñadas para los verdaderos conocedores de la cerveza artesanal
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 80, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -15, 
                scale: 1.03,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Glow effect premium */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700" />
              
              {/* Card content */}
              <div className="relative h-full bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                
                {/* Imagen del servicio */}
                {service.image_url && (
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={getImageUrl(service.image_url)}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                    
                    {/* Badge flotante */}
                    <div className="absolute top-4 right-4 bg-yellow-400/90 backdrop-blur-sm px-4 py-2 rounded-full">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-black text-black" />
                        <span className="text-black font-bold text-sm">Premium</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contenido */}
                <div className="p-8">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-amber-300 transition-all duration-300">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="text-gray-400 text-base leading-relaxed mb-6 group-hover:text-gray-300 transition-colors duration-300 line-clamp-3">
                      {service.description}
                    </p>
                  )}

                  {/* Precio si está disponible */}
                  {service.price && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                        <span className="text-gray-400 text-sm font-medium">Desde</span>
                        <span className="text-2xl font-bold text-yellow-400">
                          S/ {service.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botón de acción */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-500/50"
                  >
                    <span>Más información</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </div>

                {/* Efecto de brillo en hover */}
                <motion.div
                  className="absolute -bottom-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
