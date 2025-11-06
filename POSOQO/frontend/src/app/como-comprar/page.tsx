'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  ShoppingCart,
  Search,
  CreditCard,
  Package,
  CheckCircle,
  ArrowRight,
  User,
  MapPin,
  Phone
} from 'lucide-react'

export default function ComoComprarPage() {
  const heroRef = useRef(null)
  const pasosRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const pasosInView = useInView(pasosRef, { once: true, margin: "-100px" })

  const pasos = [
    {
      step: 1,
      title: "Explora Nuestros Productos",
      description: "Navega por nuestra tienda y descubre nuestras cervezas artesanales, comidas y refrescos. Usa los filtros para encontrar exactamente lo que buscas.",
      icon: Search
    },
    {
      step: 2,
      title: "Agrega al Carrito",
      description: "Selecciona los productos que deseas y agrégalos a tu carrito de compras. Puedes ajustar las cantidades antes de finalizar.",
      icon: ShoppingCart
    },
    {
      step: 3,
      title: "Inicia Sesión o Regístrate",
      description: "Crea una cuenta o inicia sesión para continuar. Esto nos permite gestionar tu pedido y mantenerte informado.",
      icon: User
    },
    {
      step: 4,
      title: "Completa tu Información",
      description: "Proporciona tu dirección de envío y datos de contacto. Verifica que toda la información sea correcta.",
      icon: MapPin
    },
    {
      step: 5,
      title: "Realiza el Pago",
      description: "Selecciona tu método de pago preferido. Aceptamos tarjetas de crédito, débito y otros métodos seguros.",
      icon: CreditCard
    },
    {
      step: 6,
      title: "Confirma tu Pedido",
      description: "Revisa todos los detalles de tu pedido y confirma. Recibirás un correo de confirmación con los detalles de tu compra.",
      icon: CheckCircle
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
              <ShoppingCart className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Guía de Compra
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Cómo Comprar
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Proceso simple y seguro para adquirir nuestras cervezas artesanales POSOQO.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Pasos */}
      <section 
        ref={pasosRef}
        className="relative py-20 px-6 bg-black"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pasos.map((paso, index) => {
              const PasoIcon = paso.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={pasosInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                  <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 text-black font-bold text-lg">
                        {paso.step}
                      </div>
                      <div className="bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-xl p-3">
                        <PasoIcon className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                      {paso.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {paso.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Info Adicional */}
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
                ¿Necesitas Ayuda?
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Si tienes alguna pregunta sobre el proceso de compra o necesitas asistencia, 
                nuestro equipo está listo para ayudarte.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="/contacto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  Contáctanos
                </motion.a>
                <motion.a
                  href="/tienda"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-yellow-400/50 hover:bg-yellow-400/20 hover:border-yellow-400 transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ir a la Tienda
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

