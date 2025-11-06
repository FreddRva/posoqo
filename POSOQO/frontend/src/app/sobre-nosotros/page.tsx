'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  Beer, 
  Mountain, 
  Wheat, 
  Heart, 
  Users, 
  Award, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Star,
  Target,
  Leaf,
  Zap
} from 'lucide-react'

export default function SobreNosotrosPage() {
  const heroRef = useRef(null)
  const historiaRef = useRef(null)
  const filosofiaRef = useRef(null)
  const equipoRef = useRef(null)
  const impactoRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const historiaInView = useInView(historiaRef, { once: true, margin: "-100px" })
  const filosofiaInView = useInView(filosofiaRef, { once: true, margin: "-100px" })
  const equipoInView = useInView(equipoRef, { once: true, margin: "-100px" })
  const impactoInView = useInView(impactoRef, { once: true, margin: "-100px" })

  const stats = [
    { label: "Años de Tradición", value: "10+", icon: Calendar },
    { label: "Cervezas Únicas", value: "15+", icon: Beer }
  ]

  const valores = [
    {
      icon: Heart,
      title: "Pasión Artesanal",
      description: "Cada cerveza es el resultado de años de perfeccionamiento, donde la tradición se encuentra con la innovación. La dedicación en cada proceso es nuestra marca distintiva.",
      color: "from-yellow-500 to-amber-600",
      delay: 0.2
    },
    {
      icon: Mountain,
      title: "Orgullo Ayacuchano",
      description: "Desde el corazón de Ayacucho, Perú, elaboramos cervezas que capturan la esencia de nuestra tierra. Ingredientes locales y técnicas ancestrales se fusionan para crear sabores auténticos.",
      color: "from-amber-500 to-orange-600",
      delay: 0.4
    },
    {
      icon: Wheat,
      title: "Espuma que Une",
      description: "La 'pusuqu' (espuma en quechua) es más que un ingrediente: es el símbolo de la unión, la amistad y los momentos compartidos. Cada brindis conecta con nuestras raíces.",
      color: "from-orange-500 to-red-600",
      delay: 0.6
    }
  ]

  const hitos = [
    {
      year: "2014",
      title: "El Comienzo",
      description: "Nacimos en Ayacucho con la visión de crear cervezas artesanales que reflejen nuestra identidad cultural y tradición.",
      icon: Sparkles
    },
    {
      year: "2016",
      title: "Primer Espacio",
      description: "Inauguramos nuestro primer espacio donde la comunidad se reúne para disfrutar de nuestras cervezas artesanales.",
      icon: Beer
    },
    {
      year: "2020",
      description: "Lanzamos nuestro servicio de delivery para llevar POSOQO a más hogares peruanos.",
      icon: Zap
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-20 px-6 overflow-hidden"
      >
        {/* Fondo con efecto de profundidad */}
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

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={heroInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full"
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Desde 2014 - Tradición y Excelencia
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Sobre POSOQO
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Donde la tradición ayacuchana se encuentra con la innovación cervecera artesanal. 
              En <span className="text-yellow-400 font-bold">POSOQO</span>, cada cerveza es una celebración de nuestra herencia. 
              El nombre proviene del quechua <span className="text-yellow-400 font-bold">"pusuqu"</span>, 
              que significa espuma, el alma de la fermentación y el símbolo de la unión.
            </motion.p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 text-center">
                  <stat.icon className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia Section */}
      <section 
        ref={historiaRef}
        className="relative py-32 overflow-hidden bg-black"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-amber-900/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={historiaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={historiaInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full"
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Nuestra Historia
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                El Origen de la Espuma
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={historiaInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  El Comienzo de un Sueño
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  En el corazón de los Andes ayacuchanos, un grupo de apasionados por la cerveza artesanal 
                  compartía una visión: crear algo extraordinario que reflejara la identidad de nuestra tierra.
                </p>
                <p className="text-gray-300 leading-relaxed text-lg">
                  El nombre <span className="text-yellow-400 font-bold">POSOQO</span>, que en quechua significa 
                  <span className="text-yellow-400 font-bold"> "pusuqu"</span> (espuma), refleja nuestra esencia: 
                  un espacio donde la comunidad se une alrededor de buenas cervezas y mejores momentos. 
                  La espuma es el alma de la fermentación y el símbolo de la unión.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={historiaInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  Línea de Tiempo
                </h3>
                <div className="space-y-6">
                  {hitos.map((hito, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={historiaInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                        <hito.icon className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <div className="text-yellow-400 font-bold text-lg mb-1">{hito.year}</div>
                        {hito.title && (
                          <h4 className="text-white font-bold mb-2">{hito.title}</h4>
                        )}
                        <p className="text-gray-300 text-sm leading-relaxed">{hito.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filosofía Section */}
      <section 
        ref={filosofiaRef}
        className="relative py-32 overflow-hidden bg-black"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-amber-900/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={filosofiaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={filosofiaInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full"
            >
              <Target className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Nuestra Filosofía
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Valores que nos Definen
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {valores.map((valor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 100, rotateX: -15 }}
                animate={filosofiaInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 100, rotateX: -15 }}
                transition={{ 
                  duration: 0.8, 
                  delay: valor.delay,
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                
                <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 overflow-hidden">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`relative w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${valor.color} p-0.5 shadow-2xl`}
                  >
                    <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                      <valor.icon className="w-10 h-10 text-yellow-400" />
                    </div>
                  </motion.div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-amber-300 transition-all duration-300">
                    {valor.title}
                  </h3>

                  <p className="text-gray-300 leading-relaxed text-base group-hover:text-gray-200 transition-colors duration-300">
                    {valor.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={filosofiaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="group relative max-w-4xl mx-auto"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-12 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
              <div className="text-center">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
                <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  Nuestra Promesa
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
                  "En cada sorbo de POSOQO, encontrarás no solo una cerveza excepcional, 
                  sino una historia de tradición, innovación y el espíritu vibrante de Ayacucho."
                </p>
                <div className="text-yellow-400 font-semibold text-lg">
                  — Fundadores de POSOQO
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compromiso Section */}
      <section 
        ref={impactoRef}
        className="relative py-32 overflow-hidden bg-black"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-amber-900/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={impactoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={impactoInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full"
            >
              <Leaf className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Nuestro Compromiso
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Compromiso con la Comunidad
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={impactoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3">
                    <Leaf className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    Sostenibilidad
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Comprometidos con prácticas responsables que respetan nuestro entorno y 
                  contribuyen al desarrollo sostenible de nuestra comunidad ayacuchana.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span>Uso responsable de recursos naturales</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span>Apoyo a productores locales</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span>Prácticas de reciclaje y reutilización</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={impactoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    Apoyo a la Comunidad
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Creamos espacios donde las personas se conectan, comparten y crean recuerdos juntos. 
                  Nuestro compromiso va más allá de la cerveza.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span>Eventos culturales y comunitarios</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span>Fomento de la cultura ayacuchana</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span>Apoyo a emprendimientos locales</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
                ¿Listo para Experimentar la Diferencia POSOQO?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Visita nuestros espacios y descubre por qué somos la elección preferida 
                de los amantes de la cerveza artesanal en Ayacucho.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/tienda"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold text-lg rounded-xl hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50"
                >
                  <Beer className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Explora Nuestras Cervezas
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.a>
                <motion.a
                  href="/contacto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-xl border-2 border-yellow-400/50 hover:bg-yellow-400/20 hover:border-yellow-400 transition-all duration-300 shadow-xl"
                >
                  <Phone className="w-5 h-5" />
                  Contáctanos
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
