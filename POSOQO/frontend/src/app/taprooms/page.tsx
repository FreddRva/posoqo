'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Beer,
  Calendar,
  Users
} from 'lucide-react'

export default function TaproomsPage() {
  const heroRef = useRef(null)
  const locationsRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const locationsInView = useInView(locationsRef, { once: true, margin: "-100px" })

  const taprooms = [
    {
      name: "POSOQO Plaza de Armas",
      address: "Portal Independencia Nº65, Plaza de Armas",
      city: "Ayacucho, Perú",
      hours: "Lunes a Domingo: 10:00 AM - 10:00 PM",
      phone: "+51 966 123 456",
      description: "Nuestro taproom principal en el corazón de Ayacucho. Disfruta de nuestras cervezas artesanales en un ambiente único."
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
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Nuestros Taprooms
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Taprooms POSOQO
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Visita nuestros espacios y disfruta de nuestras cervezas artesanales en un ambiente único.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Locations */}
      <section 
        ref={locationsRef}
        className="relative py-20 px-6 bg-black"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {taprooms.map((taproom, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={locationsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    {taproom.name}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {taproom.description}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3">
                        <MapPin className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <p className="text-yellow-400 font-bold mb-1">Dirección</p>
                        <p className="text-gray-300 text-sm">{taproom.address}</p>
                        <p className="text-gray-300 text-sm">{taproom.city}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3">
                        <Clock className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <p className="text-yellow-400 font-bold mb-1">Horarios</p>
                        <p className="text-gray-300 text-sm">{taproom.hours}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3">
                        <Phone className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <p className="text-yellow-400 font-bold mb-1">Teléfono</p>
                        <a href={`tel:${taproom.phone}`} className="text-gray-300 text-sm hover:text-yellow-400 transition-colors">
                          {taproom.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
                ¿Quieres Reservar una Mesa?
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Reserva tu mesa en nuestros taprooms y disfruta de una experiencia única.
              </p>
              <motion.a
                href="/reservas"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold text-lg rounded-xl hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50"
              >
                <Calendar className="w-5 h-5" />
                Hacer Reserva
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

