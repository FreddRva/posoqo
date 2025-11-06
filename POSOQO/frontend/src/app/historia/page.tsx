'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  Calendar,
  Beer,
  Mountain,
  Users,
  Award,
  MapPin,
  ArrowRight
} from 'lucide-react'

export default function HistoriaPage() {
  const heroRef = useRef(null)
  const timelineRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const timelineInView = useInView(timelineRef, { once: true, margin: "-100px" })

  const hitos = [
    {
      year: "2014",
      title: "El Comienzo",
      description: "Nacimos en Ayacucho con la visión de crear cervezas artesanales que reflejen nuestra identidad cultural y tradición. Un grupo de apasionados por la cerveza artesanal compartía una visión: crear algo extraordinario.",
      icon: Sparkles
    },
    {
      year: "2016",
      title: "Primer Espacio",
      description: "Inauguramos nuestro primer espacio donde la comunidad se reúne para disfrutar de nuestras cervezas artesanales. Un lugar que se convirtió en punto de encuentro para los amantes de la buena cerveza.",
      icon: Beer
    },
    {
      year: "2020",
      title: "Expansión Digital",
      description: "Lanzamos nuestro servicio de delivery para llevar POSOQO a más hogares peruanos. La tecnología se unió a la tradición para acercar nuestras cervezas a más personas.",
      icon: ArrowRight
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
              <Calendar className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Nuestra Historia
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Historia de POSOQO
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Desde el corazón de los Andes ayacuchanos, un grupo de apasionados por la cerveza artesanal 
              compartía una visión: crear algo extraordinario que reflejara la identidad de nuestra tierra.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Historia Completa */}
      <section className="relative py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative mb-12"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                El Origen de la Espuma
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                En el corazón de los Andes ayacuchanos, un grupo de amigos compartía una pasión: 
                la cerveza artesanal. Lo que comenzó como reuniones informales en 2014, pronto se 
                transformó en una visión compartida de crear algo extraordinario.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                El nombre <span className="text-yellow-400 font-bold">POSOQO</span>, que en quechua significa 
                <span className="text-yellow-400 font-bold"> "pusuqu"</span> (espuma), refleja nuestra esencia: 
                un espacio donde la comunidad se une alrededor de buenas cervezas y mejores momentos. 
                La espuma es el alma de la fermentación y el símbolo de la unión.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg">
                Desde Ayacucho, Perú, elaboramos cervezas que capturan la esencia de nuestra tierra. 
                Ingredientes locales y técnicas ancestrales se fusionan para crear sabores auténticos 
                que honran nuestra herencia cultural.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section 
        ref={timelineRef}
        className="relative py-20 px-6 bg-black"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={timelineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Línea de Tiempo
              </span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {hitos.map((hito, index) => {
              const HitoIcon = hito.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={timelineInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                  <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                    <div className="flex items-start gap-6">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-4 flex-shrink-0">
                        <HitoIcon className="w-8 h-8 text-black" />
                      </div>
                      <div className="flex-1">
                        <div className="text-yellow-400 font-bold text-2xl mb-2">{hito.year}</div>
                        <h3 className="text-2xl font-bold text-white mb-3">{hito.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{hito.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
                ¿Quieres Saber Más?
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Visita nuestra página "Sobre Nosotros" para conocer más sobre nuestra filosofía y valores.
              </p>
              <motion.a
                href="/sobre-nosotros"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold text-lg rounded-xl hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50"
              >
                <Beer className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Conoce Más Sobre Nosotros
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

