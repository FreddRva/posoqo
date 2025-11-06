'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  Leaf,
  Recycle,
  Droplets,
  Sun,
  Users,
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function SustentabilidadPage() {
  const heroRef = useRef(null)
  const compromisosRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const compromisosInView = useInView(compromisosRef, { once: true, margin: "-100px" })

  const compromisos = [
    {
      icon: Recycle,
      title: "Reciclaje y Reutilización",
      description: "Implementamos programas de reciclaje de botellas y envases. Todas nuestras botellas son reutilizables y fomentamos el retorno de envases.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Droplets,
      title: "Uso Responsable del Agua",
      description: "Optimizamos nuestros procesos para minimizar el consumo de agua. Cada gota cuenta en nuestro compromiso con el medio ambiente.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Sun,
      title: "Energía Sostenible",
      description: "Buscamos constantemente formas de reducir nuestro consumo energético y utilizar fuentes de energía más limpias cuando es posible.",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Apoyo a Productores Locales",
      description: "Trabajamos directamente con productores locales de Ayacucho, apoyando la economía regional y reduciendo nuestra huella de carbono.",
      color: "from-amber-500 to-yellow-600"
    },
    {
      icon: Leaf,
      title: "Ingredientes Naturales",
      description: "Utilizamos ingredientes naturales y locales siempre que sea posible, evitando químicos y conservantes artificiales.",
      color: "from-green-400 to-teal-600"
    },
    {
      icon: Heart,
      title: "Comunidad Sostenible",
      description: "Participamos activamente en programas comunitarios que promueven la sostenibilidad y el desarrollo responsable de nuestra región.",
      color: "from-red-500 to-pink-600"
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
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-black to-emerald-900/30" />
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                                 radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`
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
              className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-green-400/10 to-emerald-400/10 border border-green-400/30 rounded-full"
            >
              <Leaf className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold tracking-wider uppercase text-sm">
                Compromiso Ambiental
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-2xl">
                Sustentabilidad
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              En POSOQO, creemos que la excelencia cervecera va de la mano con el cuidado del medio ambiente. 
              Nuestro compromiso con la sustentabilidad es parte integral de nuestra identidad.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Compromisos Grid */}
      <section 
        ref={compromisosRef}
        className="relative py-20 px-6 bg-black"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {compromisos.map((compromiso, index) => {
              const CompromisoIcon = compromiso.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 100, rotateX: -15 }}
                  animate={compromisosInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 100, rotateX: -15 }}
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
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${compromiso.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                  
                  <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-green-400/20 group-hover:border-green-400/50 transition-all duration-500 overflow-hidden">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`relative w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${compromiso.color} p-0.5 shadow-2xl`}
                    >
                      <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                        <CompromisoIcon className="w-8 h-8 text-green-400" />
                      </div>
                    </motion.div>

                    <h3 className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-emerald-300 transition-all duration-300">
                      {compromiso.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors duration-300">
                      {compromiso.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mensaje Final */}
      <section className="relative py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-green-400/20 group-hover:border-green-400/50 transition-all duration-500">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Nuestro Compromiso
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                La sustentabilidad no es solo una práctica para nosotros, es un valor fundamental. 
                Cada decisión que tomamos considera el impacto en nuestro planeta y en las generaciones futuras.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg">
                Estamos comprometidos a continuar mejorando nuestros procesos y a buscar nuevas formas 
                de reducir nuestra huella ambiental, mientras creamos cervezas excepcionales que honran 
                nuestra tierra y nuestra comunidad.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-black to-emerald-900/30" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-12 border border-green-400/20 group-hover:border-green-400/50 transition-all duration-500">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                Únete a Nuestro Compromiso
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Descubre nuestras cervezas elaboradas con responsabilidad ambiental.
              </p>
              <motion.a
                href="/products?filter=cerveza"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 text-black font-bold text-lg rounded-xl hover:from-green-300 hover:via-emerald-300 hover:to-green-400 transition-all duration-300 shadow-2xl hover:shadow-green-500/50"
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

