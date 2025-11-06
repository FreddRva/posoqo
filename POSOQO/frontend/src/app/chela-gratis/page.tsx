'use client'
import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { 
  Beer, 
  Gift, 
  Users, 
  Calendar, 
  Star, 
  CheckCircle, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowRight,
  Sparkles,
  Trophy,
  Award,
  Zap,
  User,
  Mail,
  AlertCircle,
  Info,
  X,
  ShieldCheck,
  FileText,
  Bell,
  Award as AwardIcon,
  Medal,
  Loader2,
  AlertTriangle,
  Package,
  ShoppingBag
} from 'lucide-react'

export default function ChelaGratisPage() {
  const heroRef = useRef(null)
  const formRef = useRef(null)
  const infoRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const formInView = useInView(formRef, { once: true, margin: "-100px" })
  const infoInView = useInView(infoRef, { once: true, margin: "-100px" })

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    edad: "",
    aceptaTerminos: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    setAlert({
      type: 'success',
      title: '¡Suscripción Exitosa!',
      message: 'Ya estás participando en el sorteo. Te notificaremos por email si eres ganador.'
    })
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setAlert(null)
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        edad: "",
        aceptaTerminos: false
      })
    }, 5000)
  }

  const steps = [
    { step: 1, title: "Suscripción", desc: "Completa el formulario con tus datos", icon: FileText },
    { step: 2, title: "Confirmación", desc: "Recibe tu número de participación", icon: ShieldCheck },
    { step: 3, title: "Sorteo", desc: "El último día del mes se realiza el sorteo", icon: Calendar },
    { step: 4, title: "Notificación", desc: "Los ganadores son contactados", icon: Bell }
  ]

  const premios = [
    { place: Trophy, title: "Primer Lugar", prize: "Caja de 12 Cervezas", color: "from-yellow-400 to-amber-500" },
    { place: AwardIcon, title: "Segundo Lugar", prize: "Pack de 6 Cervezas", color: "from-gray-300 to-gray-400" },
    { place: Medal, title: "Tercer Lugar", prize: "Pack de 3 Cervezas", color: "from-orange-400 to-orange-500" },
    { place: Gift, title: "Premios Consuelo", prize: "1 Cerveza + Descuento", color: "from-yellow-400/50 to-amber-400/50" }
  ]

  return (
    <div className="min-h-screen bg-black relative">
      {/* Fondo repetitivo para toda la página */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Patrón repetitivo de Imagen1.png - pequeñas y repetidas */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/Imagen1.png)',
            backgroundSize: '150px 150px',
            backgroundPosition: '0 0',
            backgroundRepeat: 'repeat',
            animation: 'slide-diagonal 40s linear infinite',
          }}
        />
        
        {/* Patrón repetitivo de free.png - pequeñas y repetidas */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(/free.png)',
            backgroundSize: '80px 80px',
            backgroundPosition: '0 0',
            backgroundRepeat: 'repeat',
            animation: 'slide-diagonal-reverse 35s linear infinite',
          }}
        />
        
        {/* Overlay oscuro para mejor contraste del contenido */}
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      {/* Estilos para las animaciones */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slide-diagonal {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 150px 150px;
            }
          }
          @keyframes slide-diagonal-reverse {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: -80px -80px;
            }
          }
        `
      }} />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-20 px-6 overflow-hidden z-10"
      >
          
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
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Sorteo Mensual
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl flex items-center justify-center gap-4">
                <Beer className="w-16 h-16 md:w-20 md:h-20 text-yellow-400" />
                CHELA GRATIS
                <Beer className="w-16 h-16 md:w-20 md:h-20 text-yellow-400" />
              </span>
          </h1>
          
            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
            Participa en nuestro sorteo mensual de cervezas artesanales POSOQO. 
            La participación es completamente gratuita.
            </motion.p>
          
            <motion.a
            href="#participar"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold text-lg rounded-xl hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50"
            >
              <Beer className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            PARTICIPAR AHORA
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
            <div ref={formRef} className="space-y-8" id="participar">
            {/* Subscription Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="w-16 h-16 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-black/10"
                    >
                      <CheckCircle className="w-8 h-8 text-black" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Suscripción al Sorteo</h2>
                    <p className="text-black/80 font-medium">Completa tus datos y participa</p>
              </div>
              
                  <div className="p-6 md:p-8">
                    {/* Alertas profesionales */}
                    <AnimatePresence>
                      {alert && (
                        <motion.div
                          initial={{ opacity: 0, y: -20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className={`mb-6 rounded-xl border p-4 backdrop-blur-sm ${
                            alert.type === 'success'
                              ? 'bg-green-500/10 border-green-400/30 text-green-300'
                              : alert.type === 'error'
                              ? 'bg-red-500/10 border-red-400/30 text-red-300'
                              : alert.type === 'warning'
                              ? 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300'
                              : 'bg-blue-500/10 border-blue-400/30 text-blue-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {alert.type === 'success' && (
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            )}
                            {alert.type === 'error' && (
                              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            {alert.type === 'warning' && (
                              <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            )}
                            {alert.type === 'info' && (
                              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                              <p className="text-sm opacity-90">{alert.message}</p>
                            </div>
                            <button
                              onClick={() => setAlert(null)}
                              className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                          <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-yellow-400" />
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleInputChange}
                            className="w-full px-5 py-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-white placeholder-gray-500 transition-all duration-200"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-yellow-400" />
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                            className="w-full px-5 py-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-white placeholder-gray-500 transition-all duration-200"
                        placeholder="tu@email.com"
                      />
                    </div>

                        <div>
                          <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-yellow-400" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        required
                        value={formData.telefono}
                        onChange={handleInputChange}
                            className="w-full px-5 py-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-white placeholder-gray-500 transition-all duration-200"
                        placeholder="+51 966 123 456"
                      />
                    </div>

                    <div>
                          <label htmlFor="edad" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-yellow-400" />
                        Edad *
                      </label>
                      <input
                        type="number"
                        id="edad"
                        name="edad"
                        required
                        min="18"
                        max="100"
                        value={formData.edad}
                        onChange={handleInputChange}
                            className="w-full px-5 py-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-white placeholder-gray-500 transition-all duration-200"
                        placeholder="Tu edad"
                      />
                          <p className="text-xs text-gray-500 mt-2">Debes ser mayor de 18 años</p>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="aceptaTerminos"
                        name="aceptaTerminos"
                        required
                        checked={formData.aceptaTerminos}
                        onChange={handleInputChange}
                            className="mt-1 w-5 h-5 text-yellow-400 bg-black/60 border-white/10 rounded focus:ring-yellow-400 focus:ring-2"
                      />
                          <label htmlFor="aceptaTerminos" className="text-sm text-gray-400 leading-relaxed">
                        Acepto los{" "}
                            <a href="/terminos" className="text-yellow-400 hover:text-yellow-300 underline transition-colors">
                          términos y condiciones
                        </a>{" "}
                        y la{" "}
                            <a href="/privacidad" className="text-yellow-400 hover:text-yellow-300 underline transition-colors">
                          política de privacidad
                        </a>
                      </label>
                    </div>

                        <motion.button
                      type="submit"
                      disabled={isSubmitting || !formData.aceptaTerminos}
                          whileHover={!isSubmitting && formData.aceptaTerminos ? { scale: 1.02 } : {}}
                          whileTap={!isSubmitting && formData.aceptaTerminos ? { scale: 0.98 } : {}}
                          className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-yellow-500/50"
                    >
                      {isSubmitting ? (
                        <>
                              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Suscribiendo...
                        </>
                      ) : (
                        <>
                              <CheckCircle className="w-5 h-5 mr-3" />
                          ¡SUSCRIBIRME AL SORTEO!
                        </>
                      )}
                        </motion.button>
                  </form>
                ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                        >
                          <CheckCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-2">
                      ¡Suscripción Exitosa!
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Ya estás participando en el sorteo de este mes. Te notificaremos por email si eres ganador.
                    </p>
                        <div className="bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 p-4 rounded-xl flex items-center justify-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <p className="text-yellow-400 font-medium">
                            Tu número de participación: #{Math.floor(Math.random() * 1000) + 100}
                      </p>
                    </div>
                      </motion.div>
                )}
              </div>
            </div>
              </motion.div>

            {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                  <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-400 mr-3" />
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                ¿Cómo Funciona?
                    </span>
              </h2>
              
                  <div className="space-y-6">
                    {steps.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                        className="flex items-center space-x-4 group/item"
                      >
                        <div className="relative w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-black font-bold text-lg flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                          <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                          <h3 className="font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                      </motion.div>
                ))}
              </div>
            </div>
              </motion.div>
          </div>

          {/* Right Column - Info */}
            <div ref={infoRef} className="space-y-8">
            {/* Prize Details */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={infoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                  <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Premios del Mes
                    </span>
              </h2>
              
              <div className="space-y-4">
                    {premios.map((item, index) => {
                      const PlaceIcon = item.place
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={infoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="bg-black/60 backdrop-blur-sm p-5 rounded-xl border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300"
                        >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                              <div className={`bg-gradient-to-r ${item.color} p-2 rounded-lg`}>
                                <PlaceIcon className="w-5 h-5 text-black" />
                              </div>
                              <h3 className="font-bold text-white">{item.title}</h3>
                      </div>
                            <span className={`bg-gradient-to-r ${item.color} text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                        {item.prize}
                      </span>
                    </div>
                        </motion.div>
                      )
                    })}
              </div>
            </div>
              </motion.div>

            {/* Next Draw Info */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={infoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 text-center">
                  <h2 className="text-2xl font-bold mb-6 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-400 mr-3" />
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Próximo Sorteo
                    </span>
              </h2>
              
                  <div className="bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 p-6 rounded-xl mb-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Calendar className="w-6 h-6 text-yellow-400" />
                      <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                        {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <p className="text-yellow-400 font-medium">
                        Último día del mes a las 8:00 PM
                      </p>
                    </div>
                  </div>
            </div>
              </motion.div>

            {/* Contact & Pickup */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={infoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500">
                  <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-yellow-400 mr-3" />
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Retiro de Premios
                    </span>
              </h2>
              
                  <div className="space-y-5">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3">
                        <MapPin className="w-5 h-5 text-black" />
                      </div>
                  <div>
                        <p className="text-yellow-400 font-bold mb-1">Ubicación</p>
                    <p className="text-gray-300 text-sm">Plaza de Armas, Portal Independencia Nº65, Ayacucho</p>
                  </div>
                </div>
                
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3">
                        <Clock className="w-5 h-5 text-black" />
                      </div>
                  <div>
                        <p className="text-yellow-400 font-bold mb-1">Horarios</p>
                    <p className="text-gray-300 text-sm">Lunes a Domingo: 10:00 AM - 10:00 PM</p>
                  </div>
                </div>
                
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3">
                        <Phone className="w-5 h-5 text-black" />
                      </div>
                  <div>
                        <p className="text-yellow-400 font-bold mb-1">Contacto</p>
                    <p className="text-gray-300 text-sm">+51 966 123 456</p>
                  </div>
                </div>
                
                    <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-700/30 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 font-bold mb-1">Importante</p>
                          <p className="text-gray-300 text-sm">
                            Los premios deben ser retirados dentro de los 7 días hábiles
                          </p>
                        </div>
                      </div>
                    </div>
              </div>
            </div>
              </motion.div>
          </div>
        </div>
      </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-32 overflow-hidden z-10">

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
              <div className="flex items-center justify-center gap-3 mb-4">
                <Beer className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  ¿Qué Esperas para Participar?
                </h2>
                <Beer className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
              </div>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Únete a nuestro sorteo mensual y participa por cervezas artesanales POSOQO
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
              href="#participar"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold text-lg rounded-xl hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50"
            >
                  <Beer className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              PARTICIPAR AHORA
                </motion.a>
                <motion.a
                  href="/products"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-xl border-2 border-yellow-400/50 hover:bg-yellow-400/20 hover:border-yellow-400 transition-all duration-300 shadow-xl"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Ver Nuestras Cervezas
                </motion.a>
          </div>
        </div>
          </motion.div>
      </div>
      </section>
    </div>
  )
}
