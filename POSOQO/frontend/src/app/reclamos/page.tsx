'use client'
import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare,
  ChevronRight,
  FileText,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  User,
  Shield,
  ArrowRight,
  XCircle,
  Loader2
} from 'lucide-react'
import { apiFetch } from '@/lib/api'

export default function ReclamosPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    subject: '',
    text: '',
    allowContact: false
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

  const sections = [
    { id: 'introduccion', title: '1. Introducción', icon: FileText },
    { id: 'tipos', title: '2. Tipos de Reclamaciones', icon: MessageSquare },
    { id: 'proceso', title: '3. Proceso de Atención', icon: Clock },
    { id: 'formulario', title: '4. Formulario de Reclamación', icon: Send },
    { id: 'compromisos', title: '5. Nuestros Compromisos', icon: Shield },
    { id: 'seguimiento', title: '6. Seguimiento y Resolución', icon: CheckCircle },
    { id: 'contacto', title: '7. Canales de Contacto', icon: Phone }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
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
    if (!formData.text.trim() || formData.text.trim().length < 10) {
      showAlert('error', 'Error de validación', 'La descripción debe tener al menos 10 caracteres')
      return
    }

    setLoading(true)

    try {
      // Formatear el texto para incluir información adicional
      const fullText = `Tipo: ${formData.type || 'General'}\nAsunto: ${formData.subject}\nTeléfono: ${formData.phone || 'No proporcionado'}\n\nDescripción:\n${formData.text}`

      const response = await apiFetch('/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          text: fullText
        })
      })

      showAlert('success', 'Reclamación enviada', 'Tu reclamación ha sido registrada exitosamente. Te contactaremos pronto.')
      
      // Resetear formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: '',
        subject: '',
        text: '',
        allowContact: false
      })
    } catch (error: any) {
      console.error('Error enviando reclamación:', error)
      showAlert('error', 'Error al enviar', error.message || 'No se pudo enviar la reclamación. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 120
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

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
                <XCircle className="w-6 h-6 text-red-400" />
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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-black to-red-900/30" />
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-orange-400/10 to-red-400/10 border border-orange-400/30 rounded-full">
              <MessageSquare className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-semibold tracking-wider uppercase text-sm">
                Libro de Reclamaciones
              </span>
                </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
                Libro de Reclamaciones
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                <span>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                <span>Obligatorio según Ley del Consumidor</span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl leading-relaxed"
            >
              Tu opinión es fundamental para nosotros. Este es el canal oficial para presentar reclamaciones, 
              sugerencias o comentarios sobre nuestros productos y servicios, cumpliendo con la normativa peruana.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Table of Contents */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-400/20">
                <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Índice de Contenido
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const SectionIcon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-gray-400 hover:text-orange-400 hover:bg-white/5"
                      >
                        <SectionIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{section.title.replace(/^\d+\.\s/, '')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-orange-400/20 space-y-12">
                
                {/* Introducción */}
                <div id="introduccion" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-3 flex-shrink-0">
                      <FileText className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-orange-400 mb-4">1. Introducción</h2>
                      <div className="bg-gradient-to-r from-orange-400/10 to-red-400/10 border border-orange-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed text-lg">
                          El Libro de Reclamaciones es el canal oficial para que nuestros clientes puedan presentar 
                          reclamaciones, sugerencias, felicitaciones o consultas sobre nuestros productos y servicios. 
                          Este documento cumple con la normativa peruana establecida en la Ley de Protección al Consumidor.
                        </p>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        En POSOQO, valoramos cada opinión y comentario que recibimos. Cada reclamación es una oportunidad 
                        para mejorar nuestros servicios y brindar una mejor experiencia a todos nuestros clientes.
                      </p>
                      <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-orange-400">Nota Legal:</strong> Este Libro de Reclamaciones cumple 
                          con el Decreto Supremo N° 013-2015-PCM y la Ley N° 29571, Código de Protección y Defensa del Consumidor.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tipos */}
                <section id="tipos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-3 flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-orange-400 mb-4">2. Tipos de Reclamaciones</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Puede presentar los siguientes tipos de comentarios:
                      </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                      Sugerencias y Mejoras
                    </h3>
                          <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Ideas para nuevos productos o servicios</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Mejoras en la atención al cliente</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Sugerencias de menú o productos</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Propuestas de eventos o promociones</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Comentarios sobre la experiencia general</span>
                            </li>
                    </ul>
                  </div>
                        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-red-300 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                      Reclamaciones
                    </h3>
                          <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Problemas con productos defectuosos o en mal estado</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Mal servicio o atención al cliente</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Retrasos en entregas o incumplimiento de plazos</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Problemas de facturación o cobros incorrectos</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Cualquier inconveniente con nuestros servicios</span>
                            </li>
                    </ul>
                  </div>
                </div>
                    </div>
                  </div>
                </section>

                {/* Proceso */}
                <section id="proceso" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-3 flex-shrink-0">
                      <Clock className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-orange-400 mb-4">3. Proceso de Atención</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Nuestro proceso garantiza que cada reclamación sea atendida de manera eficiente:
                      </p>

                      <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-black font-bold text-lg">1</span>
                          </div>
                          <h4 className="font-semibold text-orange-300 mb-2">Recepción</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">Recibimos y registramos tu comentario</p>
                        </div>
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-black font-bold text-lg">2</span>
                          </div>
                          <h4 className="font-semibold text-orange-300 mb-2">Análisis</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">Evaluamos la situación y verificamos hechos</p>
                        </div>
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-black font-bold text-lg">3</span>
                          </div>
                          <h4 className="font-semibold text-orange-300 mb-2">Solución</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">Implementamos mejoras o soluciones</p>
                        </div>
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-black font-bold text-lg">4</span>
                  </div>
                          <h4 className="font-semibold text-orange-300 mb-2">Seguimiento</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">Verificamos tu satisfacción</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

                {/* Formulario */}
                <section id="formulario" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-3 flex-shrink-0">
                      <Send className="w-6 h-6 text-black" />
              </div>
                    <div className="w-full">
                      <h2 className="text-3xl font-bold text-orange-400 mb-4">4. Formulario de Reclamación</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Complete el siguiente formulario para presentar su reclamación, sugerencia o comentario:
                      </p>

                      <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                              <label className="block text-orange-300 font-semibold mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Nombre Completo *
                              </label>
                        <input 
                          type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                                placeholder="Ingrese su nombre completo"
                        />
                      </div>
                      <div>
                              <label className="block text-orange-300 font-semibold mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email *
                              </label>
                        <input 
                          type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                              <label className="block text-orange-300 font-semibold mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Teléfono
                              </label>
                        <input 
                          type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                          placeholder="+51 966 123 456"
                        />
                      </div>
                      <div>
                              <label className="block text-orange-300 font-semibold mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Tipo de Comentario *
                              </label>
                              <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                              >
                                <option value="">Seleccione una opción</option>
                          <option value="sugerencia">Sugerencia o Mejora</option>
                          <option value="reclamacion">Reclamación</option>
                          <option value="felicitacion">Felicitación</option>
                          <option value="consulta">Consulta General</option>
                        </select>
                      </div>
                    </div>

                    <div>
                            <label className="block text-orange-300 font-semibold mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Asunto *
                            </label>
                      <input 
                        type="text" 
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                              placeholder="Resumen breve de su comentario"
                      />
                    </div>

                    <div>
                            <label className="block text-orange-300 font-semibold mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Descripción Detallada *
                            </label>
                      <textarea 
                        rows={6}
                              name="text"
                              value={formData.text}
                              onChange={handleChange}
                              required
                              minLength={10}
                              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition-all"
                              placeholder="Describe detalladamente su comentario, sugerencia o reclamación. Incluya fechas, nombres de personas involucradas y cualquier detalle relevante (mínimo 10 caracteres)."
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              {formData.text.length}/1000 caracteres
                            </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <input 
                        type="checkbox" 
                              id="allowContact"
                              name="allowContact"
                              checked={formData.allowContact}
                              onChange={handleChange}
                              className="w-4 h-4 text-orange-400 bg-black/50 border-white/10 rounded focus:ring-orange-400"
                            />
                            <label htmlFor="allowContact" className="text-gray-300 text-sm">
                        Autorizo que me contacten para dar seguimiento a mi comentario
                      </label>
                    </div>

                          <div className="text-center pt-4">
                      <button 
                        type="submit"
                              disabled={loading}
                              className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 hover:from-orange-500 hover:via-orange-600 hover:to-red-600 text-black font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Send className="w-5 h-5" />
                                  Enviar Reclamación
                                </>
                              )}
                      </button>
                    </div>
                  </form>
                      </div>
                </div>
              </div>
            </section>

                {/* Compromisos */}
                <section id="compromisos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-3 flex-shrink-0">
                      <Shield className="w-6 h-6 text-black" />
              </div>
                    <div>
                      <h2 className="text-3xl font-bold text-orange-400 mb-4">5. Nuestros Compromisos</h2>
                      
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-orange-300 mb-4">Compromiso de Respuesta</h3>
                          <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Respuesta en máximo 24 horas hábiles</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Seguimiento personalizado de cada caso</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Soluciones concretas y efectivas</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Mejoras implementadas cuando sea necesario</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Comunicación transparente y clara</span>
                            </li>
                    </ul>
                  </div>
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-orange-300 mb-4">Compromiso de Mejora</h3>
                          <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Análisis detallado de cada comentario</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Implementación de mejoras basadas en feedback</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Capacitación continua del personal</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Revisión constante de procesos</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Medición de satisfacción del cliente</span>
                            </li>
                    </ul>
                  </div>
                </div>
                    </div>
              </div>
            </section>

                {/* Seguimiento */}
                <section id="seguimiento" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-3 flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-black" />
              </div>
                    <div>
                      <h2 className="text-3xl font-bold text-orange-400 mb-4">6. Seguimiento y Resolución</h2>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-orange-300 mb-4">Proceso de Seguimiento</h3>
                          <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Confirmación de recepción por email</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Asignación de responsable interno</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Análisis y evaluación del caso</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Implementación de solución o respuesta</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>Verificación de satisfacción del cliente</span>
                            </li>
                          </ul>
                  </div>
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-orange-300 mb-4">Tiempos de Resolución</h3>
                          <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span><strong>Consultas simples:</strong> 2-4 horas</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span><strong>Sugerencias:</strong> 24-48 horas</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span><strong>Reclamaciones:</strong> 48-72 horas</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span><strong>Casos complejos:</strong> 5-7 días hábiles</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span><strong>Seguimiento continuo</strong> hasta resolución</span>
                            </li>
                          </ul>
                  </div>
                  </div>
                </div>
              </div>
            </section>

                {/* Contacto */}
                <section id="contacto" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-3 flex-shrink-0">
                      <Phone className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-orange-400 mb-4">7. Canales de Contacto</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Además del formulario, puede contactarnos a través de:
                      </p>
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6 text-center">
                          <Phone className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                          <h4 className="font-semibold text-orange-300 mb-2">Línea Directa</h4>
                          <a href="tel:+51966123456" className="text-orange-200 font-medium hover:text-orange-400 transition-colors">
                            +51 966 123 456
                          </a>
                          <p className="text-xs text-gray-400 mt-2">Lun-Dom 9:00 AM - 8:00 PM</p>
                        </div>
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6 text-center">
                          <Mail className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                          <h4 className="font-semibold text-orange-300 mb-2">Email</h4>
                          <a href="mailto:reclamos@posoqo.com" className="text-orange-200 font-medium hover:text-orange-400 transition-colors">
                            reclamos@posoqo.com
                          </a>
                          <p className="text-xs text-gray-400 mt-2">Respuesta en 2-4 horas</p>
              </div>
                        <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-6 text-center">
                          <MessageSquare className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                          <h4 className="font-semibold text-orange-300 mb-2">Presencial</h4>
                          <p className="text-orange-200 font-medium">
                            Portal Independencia Nº65
                          </p>
                          <p className="text-xs text-gray-400 mt-2">Plaza de Armas, Ayacucho</p>
                  </div>
                  </div>
                </div>
              </div>
            </section>

                {/* Acceptance Box */}
                <div className="bg-gradient-to-r from-orange-400/20 to-red-400/20 border-2 border-orange-400/50 rounded-2xl p-8 text-center">
                  <MessageSquare className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-orange-400 mb-4">
                    Tu Opinión Transforma POSOQO
              </h3>
                  <p className="text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto mb-4">
                En POSOQO, creemos que la excelencia se construye día a día con la ayuda de nuestros 
                valiosos clientes. Cada comentario, sugerencia o reclamación es una oportunidad para 
                    mejorar y brindarte la experiencia que mereces.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Gracias por ser parte de nuestro crecimiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
      </section>
    </div>
  )
}
