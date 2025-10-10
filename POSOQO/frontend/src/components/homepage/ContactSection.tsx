'use client'
import React, { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send, Sparkles, MessageCircle } from 'lucide-react'

export const ContactSection: React.FC = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Formulario de contacto enviado:', formData)
    alert('¡Mensaje enviado con éxito! Te contactaremos pronto.')
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  const contactInfo = [
    { 
      icon: Phone, 
      title: "Teléfono Premium", 
      content: "+51 999 999 999", 
      description: "Línea directa para miembros VIP"
    },
    { 
      icon: Mail, 
      title: "Email Exclusivo", 
      content: "info@posoqo.com", 
      description: "Respuesta en menos de 24 horas"
    },
    { 
      icon: MapPin, 
      title: "Ubicación Premium", 
      content: "Ayacucho, Perú", 
      description: "Cervecería artesanal de clase mundial"
    },
    { 
      icon: Clock, 
      title: "Horarios de Atención", 
      content: "Lun - Dom: 9:00 - 22:00", 
      description: "Atención personalizada todos los días"
    }
  ]

  return (
    <section ref={ref} className="py-32 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/3 -left-64 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
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
          className="absolute bottom-1/3 -right-64 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"
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
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-6"
          >
            <MessageCircle className="w-4 h-4" />
            <span>ESTAMOS AQUÍ PARA TI</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </motion.div>
          
          <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-6 leading-tight">
            Contáctanos
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            ¿Tienes alguna pregunta o comentario? Nuestro equipo está listo para brindarte una atención personalizada
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">Información de Contacto</h3>
              <p className="text-lg text-gray-400 leading-relaxed">
                Estamos aquí para ayudarte con cualquier consulta sobre nuestros productos, servicios o membresía VIP.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="group flex items-start gap-4 p-5 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-500"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <contact.icon className="w-7 h-7 text-black" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-yellow-400 mb-1">
                      {contact.title}
                    </h4>
                    <p className="text-xl font-semibold text-white mb-1">{contact.content}</p>
                    <p className="text-gray-400 text-sm">{contact.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl opacity-20 blur-2xl" />
            
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl p-8 rounded-3xl border border-yellow-400/20">
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-3">Envíanos un Mensaje</h3>
                <p className="text-gray-400 leading-relaxed">
                  Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-yellow-400/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 bg-black/50 text-white placeholder-gray-500"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-yellow-400/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 bg-black/50 text-white placeholder-gray-500"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-yellow-400/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 bg-black/50 text-white placeholder-gray-500"
                      placeholder="+51 999 999 999"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-yellow-400/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 bg-black/50 text-white placeholder-gray-500 resize-none"
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                    required
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-300 hover:via-amber-400 hover:to-yellow-500 text-black font-bold py-4 px-8 rounded-xl text-lg shadow-xl hover:shadow-yellow-500/50 transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Send className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  <span className="relative z-10">ENVIAR MENSAJE</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}