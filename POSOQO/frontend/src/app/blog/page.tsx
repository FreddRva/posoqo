'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  Clock
} from 'lucide-react'

export default function BlogPage() {
  const heroRef = useRef(null)
  const blogRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const blogInView = useInView(blogRef, { once: true, margin: "-100px" })

  const posts = [
    {
      title: "La Historia de la Cerveza Artesanal en Ayacucho",
      excerpt: "Descubre cómo la tradición cervecera llegó a los Andes y evolucionó en nuestra región.",
      date: "15 Enero 2024",
      author: "Equipo POSOQO",
      category: "Historia"
    },
    {
      title: "Guía de Maridaje: Cervezas y Comidas Andinas",
      excerpt: "Aprende a combinar nuestras cervezas artesanales con los sabores únicos de la gastronomía ayacuchana.",
      date: "10 Enero 2024",
      author: "Equipo POSOQO",
      category: "Gastronomía"
    },
    {
      title: "El Proceso de Fermentación: Creando la Espuma Perfecta",
      excerpt: "Conoce los secretos detrás de la creación de la 'pusuqu' y cómo logramos la espuma perfecta.",
      date: "5 Enero 2024",
      author: "Equipo POSOQO",
      category: "Proceso"
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
              <BookOpen className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Blog POSOQO
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Blog
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Descubre historias, consejos y todo sobre el mundo de la cerveza artesanal POSOQO.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts */}
      <section 
        ref={blogRef}
        className="relative py-20 px-6 bg-black"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={blogInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 overflow-hidden">
                  <div className="text-yellow-400 text-xs font-semibold mb-3 uppercase tracking-wider">
                    {post.category}
                  </div>
                  <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-amber-300 transition-all duration-300">
                    {post.title}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                  </div>
                  <button className="group/btn flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold text-sm transition-colors">
                    Leer más
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
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
                Más Contenido Próximamente
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Estamos preparando más artículos interesantes sobre cerveza artesanal, gastronomía y cultura ayacuchana.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

