'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  Accessibility,
  Eye,
  MousePointerClick,
  Volume2,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function AccesibilidadPage() {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })

  const features = [
    {
      icon: Eye,
      title: "Contraste de Colores",
      description: "Nuestro diseño utiliza colores con alto contraste para facilitar la lectura y navegación."
    },
    {
      icon: MousePointerClick,
      title: "Navegación por Teclado",
      description: "Toda la funcionalidad del sitio es accesible mediante navegación por teclado."
    },
    {
      icon: Volume2,
      title: "Texto Alternativo",
      description: "Todas las imágenes incluyen texto alternativo descriptivo para lectores de pantalla."
    },
    {
      icon: Accessibility,
      title: "Diseño Responsivo",
      description: "Nuestro sitio se adapta a diferentes tamaños de pantalla y dispositivos."
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-20 px-6 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-amber-900/30" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={heroInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full"
            >
              <Accessibility className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Accesibilidad
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Accesibilidad
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              En POSOQO creemos que todos deberían poder acceder y disfrutar de nuestro sitio web. 
              Estamos comprometidos con la accesibilidad web.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section 
        ref={featuresRef}
        className="relative py-20 px-6 bg-black"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                  <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 text-center">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FeatureIcon className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="relative py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Nuestro Compromiso
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Estamos trabajando constantemente para mejorar la accesibilidad de nuestro sitio web. 
                Si encuentras algún problema de accesibilidad o tienes sugerencias, no dudes en contactarnos.
              </p>
              <motion.a
                href="/contacto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all duration-300"
              >
                Contactarnos
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

