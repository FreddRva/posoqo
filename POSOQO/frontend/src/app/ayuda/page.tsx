'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  FileText,
  ShoppingCart,
  Package,
  CreditCard
} from 'lucide-react'

export default function AyudaPage() {
  const heroRef = useRef(null)
  const faqRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const faqInView = useInView(faqRef, { once: true, margin: "-100px" })

  const faqs = [
    {
      question: "¿Cómo puedo realizar un pedido?",
      answer: "Puedes realizar un pedido navegando por nuestra tienda, agregando productos al carrito y completando el proceso de checkout. También puedes visitar nuestra página 'Cómo Comprar' para más detalles.",
      icon: ShoppingCart
    },
    {
      question: "¿Cuáles son los métodos de pago aceptados?",
      answer: "Aceptamos tarjetas de crédito, débito y otros métodos de pago seguros. Todos los pagos se procesan de forma segura.",
      icon: CreditCard
    },
    {
      question: "¿Hacen envíos a otras ciudades?",
      answer: "Actualmente realizamos envíos principalmente en Ayacucho y provincias cercanas. Visita nuestra página de 'Envíos' para más información sobre cobertura.",
      icon: Package
    },
    {
      question: "¿Puedo visitar sus instalaciones?",
      answer: "¡Por supuesto! Visita nuestro taproom en Plaza de Armas, Portal Independencia Nº65. Consulta nuestra página 'Taprooms' para más información.",
      icon: FileText
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
              <HelpCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Centro de Ayuda
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Ayuda
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Estamos aquí para ayudarte. Encuentra respuestas a tus preguntas o contáctanos directamente.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section 
        ref={faqRef}
        className="relative py-20 px-6 bg-black"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => {
              const FaqIcon = faq.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                  <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                        <FaqIcon className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3 text-yellow-400">
                          {faq.question}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-amber-900/30" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-12 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                ¿No Encontraste lo que Buscabas?
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Contáctanos directamente y nuestro equipo estará encantado de ayudarte.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/contacto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all duration-300"
                >
                  <Mail className="w-5 h-5" />
                  Enviar Mensaje
                </motion.a>
                <motion.a
                  href="https://wa.me/51956099690"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-yellow-400/50 hover:bg-yellow-400/20 hover:border-yellow-400 transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  Llamar Ahora
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

