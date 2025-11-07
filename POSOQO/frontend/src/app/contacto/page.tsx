'use client'
import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Loader2,
  MessageSquare,
  User,
  FileText
} from 'lucide-react'
import { apiFetch } from '@/lib/api'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    queryType: ''
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{
    show: boolean
    type: 'success' | 'error'
    title: string
    message: string
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const showAlert = (type: 'success' | 'error', title: string, message: string) => {
    setAlert({ show: true, type, title, message })
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación
    if (!formData.name.trim()) {
      showAlert('error', 'Error de validación', 'El nombre es obligatorio')
      return
    }
    if (!formData.email.trim()) {
      showAlert('error', 'Error de validación', 'El email es obligatorio')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showAlert('error', 'Error de validación', 'El email no es válido')
      return
    }
    if (!formData.subject.trim()) {
      showAlert('error', 'Error de validación', 'El asunto es obligatorio')
      return
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      showAlert('error', 'Error de validación', 'El mensaje debe tener al menos 10 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await apiFetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim()
        })
      })

      showAlert('success', 'Mensaje enviado', 'Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.')
      
      // Resetear formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        queryType: ''
      })
    } catch (error: any) {
      console.error('Error enviando mensaje:', error)
      showAlert('error', 'Error al enviar', error.message || 'No se pudo enviar el mensaje. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    { 
      icon: Phone, 
      title: "Teléfono", 
      content: "+51 966 123 456", 
      description: "Línea directa 24/7",
      link: "tel:+51966123456"
    },
    { 
      icon: Mail, 
      title: "Email", 
      content: "caposoqo@gmail.com", 
      description: "Respuesta en 2-4 horas",
      link: "mailto:caposoqo@gmail.com"
    },
    { 
      icon: MapPin, 
      title: "Ubicación", 
      content: "Portal Independencia Nº65", 
      description: "Plaza de Armas, Ayacucho",
      link: null
    },
    { 
      icon: Clock, 
      title: "Horarios", 
      content: "Lun - Dom: 9:00 - 22:00", 
      description: "Atención personalizada",
      link: null
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Alert */}
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 rounded-2xl p-6 shadow-2xl border-2 ${
              alert.type === 'success'
                ? 'bg-green-400/20 border-green-400/50 backdrop-blur-xl'
                : 'bg-red-400/20 border-red-400/50 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-center gap-4">
              {alert.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <p className={`font-bold ${alert.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {alert.title}
                </p>
                <p className="text-gray-300 text-sm">{alert.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-16 px-6 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-purple-900/30" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/30 rounded-full">
              <Phone className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm">
                Contacto
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl">
                Contacto Directo
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Atención 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span>Respuesta rápida</span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl leading-relaxed"
            >
              Estamos aquí para ayudarte. Contáctanos a través de cualquier canal y nuestro equipo 
              te responderá lo antes posible con la atención personalizada que te mereces.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Información de Contacto */}
            <div className="lg:col-span-1">
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/20 sticky top-24">
                <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  Información de Contacto
                </h3>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        className={`bg-blue-400/10 border border-blue-400/30 rounded-xl p-4 hover:bg-blue-400/20 transition-all ${info.link ? 'cursor-pointer' : ''}`}
                        onClick={() => info.link && window.open(info.link)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg p-2 flex-shrink-0">
                            <Icon className="w-5 h-5 text-black" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-300 mb-1">{info.title}</h4>
                            <p className="text-gray-300 text-sm font-medium">{info.content}</p>
                            <p className="text-gray-400 text-xs mt-1">{info.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Horarios detallados */}
                <div className="mt-6 bg-blue-400/10 border border-blue-400/30 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horarios Detallados
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex justify-between">
                      <span>Taproom Principal:</span>
                      <span className="text-blue-400">11:00 - 23:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Servicio al Cliente:</span>
                      <span className="text-blue-400">24/7</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Delivery:</span>
                      <span className="text-blue-400">9:00 - 22:00</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-2">
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-blue-400/20">
                <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                  <Send className="w-8 h-8" />
                  Envíanos un Mensaje
                </h2>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Completa el siguiente formulario y nuestro equipo te responderá lo antes posible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nombre Completo *
                      </label>
                      <input 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="Ingrese su nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Teléfono
                      </label>
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="+51 966 123 456"
                      />
                    </div>
                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Tipo de Consulta
                      </label>
                      <select
                        name="queryType"
                        value={formData.queryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="productos">Consulta sobre Productos</option>
                        <option value="servicios">Información de Servicios</option>
                        <option value="reservas">Reservas y Eventos</option>
                        <option value="delivery">Delivery y Envíos</option>
                        <option value="reclamos">Reclamos y Sugerencias</option>
                        <option value="general">Consulta General</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-blue-300 font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Asunto *
                    </label>
                    <input 
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="Resumen de su consulta"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Mensaje *
                    </label>
                    <textarea 
                      rows={6}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      minLength={10}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition-all"
                      placeholder="Describe tu consulta o solicitud detalladamente (mínimo 10 caracteres)..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.message.length}/1000 caracteres
                    </p>
                  </div>

                  <div className="text-center pt-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 hover:from-blue-500 hover:via-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Enviar Mensaje
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
