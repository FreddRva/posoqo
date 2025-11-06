'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  Wheat,
  Droplets,
  Flame,
  Clock,
  Beaker,
  Filter,
  Package,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function ProcesoPage() {
  const heroRef = useRef(null)
  const procesoRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const procesoInView = useInView(procesoRef, { once: true, margin: "-100px" })

  const pasos = [
    {
      step: 1,
      title: "Selección de Ingredientes",
      description: "Seleccionamos cuidadosamente los mejores ingredientes locales de Ayacucho. Malta, lúpulo, levadura y agua de calidad premium.",
      icon: Wheat,
      color: "from-yellow-500 to-amber-600"
    },
    {
      step: 2,
      title: "Molienda",
      description: "La malta se muele finamente para exponer el almidón, preparándola para la extracción de azúcares durante la maceración.",
      icon: Package,
      color: "from-amber-500 to-orange-600"
    },
    {
      step: 3,
      title: "Maceración",
      description: "La malta molida se mezcla con agua caliente para activar las enzimas que convierten el almidón en azúcares fermentables.",
      icon: Droplets,
      color: "from-orange-500 to-red-600"
    },
    {
      step: 4,
      title: "Filtración y Cocción",
      description: "El mosto se filtra y se hierve con lúpulo, añadiendo amargor, aroma y sabor único a cada cerveza.",
      icon: Flame,
      color: "from-red-500 to-pink-600"
    },
    {
      step: 5,
      title: "Fermentación",
      description: "El mosto se enfría y se añade levadura. La fermentación transforma los azúcares en alcohol y CO2, creando la 'pusuqu' (espuma).",
      icon: Beaker,
      color: "from-pink-500 to-purple-600"
    },
    {
      step: 6,
      title: "Maduración y Embotellado",
      description: "La cerveza madura para desarrollar sus sabores completos. Luego se embotella artesanalmente, preservando su calidad.",
      icon: CheckCircle,
      color: "from-purple-500 to-blue-600"
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
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
                                 radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`
              }}
            />
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
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Proceso Artesanal
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Nuestro Proceso
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Cada cerveza POSOQO es el resultado de un proceso artesanal cuidadoso, 
              donde la tradición se encuentra con la innovación para crear sabores únicos.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Proceso Steps */}
      <section 
        ref={procesoRef}
        className="relative py-20 px-6 bg-black"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pasos.map((paso, index) => {
              const PasoIcon = paso.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 100, rotateX: -15 }}
                  animate={procesoInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 100, rotateX: -15 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="group relative"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${paso.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                  
                  <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 overflow-hidden">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`relative w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${paso.color} p-0.5 shadow-2xl`}
                    >
                      <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                        <PasoIcon className="w-8 h-8 text-yellow-400" />
                      </div>
                    </motion.div>

                    <div className="text-yellow-400 font-bold text-sm mb-2">Paso {paso.step}</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-amber-300 transition-all duration-300">
                      {paso.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors duration-300">
                      {paso.description}
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
                Tradición y Calidad
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Nuestro proceso artesanal respeta los métodos tradicionales mientras incorpora 
                técnicas modernas para garantizar la calidad y consistencia de cada lote.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg">
                Desde la selección de ingredientes hasta el embotellado final, cada paso es 
                supervisado cuidadosamente por nuestros maestros cerveceros para asegurar que 
                cada sorbo de POSOQO sea una experiencia excepcional.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-amber-900/30" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-12 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Descubre Nuestras Cervezas
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Prueba el resultado de nuestro proceso artesanal cuidadoso.
              </p>
              <motion.a
                href="/products?filter=cerveza"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold text-lg rounded-xl hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50"
              >
                Ver Cervezas
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

