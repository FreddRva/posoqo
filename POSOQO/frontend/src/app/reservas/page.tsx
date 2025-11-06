'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Users,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  X,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

interface Reservation {
  id: string
  date: string
  time: string
  people: number
  payment_method: string
  advance: number
  status: string
  created_at: string
  updated_at: string
}

const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pendiente':
      return {
        icon: Clock,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        borderColor: 'border-yellow-400/30',
        text: 'Pendiente'
      }
    case 'confirmada':
      return {
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        borderColor: 'border-green-400/30',
        text: 'Confirmada'
      }
    case 'cancelada':
      return {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-400/10',
        borderColor: 'border-red-400/30',
        text: 'Cancelada'
      }
    case 'completada':
    case 'finalizada':
      return {
        icon: CheckCircle,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/30',
        text: 'Completada'
      }
    default:
      return {
        icon: Clock,
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/10',
        borderColor: 'border-gray-400/30',
        text: status
      }
  }
}

export default function ReservationsPage() {
  const { data: session } = useSession()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: 1,
    payment_method: 'efectivo',
    advance: 0
  })
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState<{
    show: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  } | null>(null)
  
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlert({ show: true, type, title, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const loadReservations = async () => {
    if (!session) return
    
    try {
      setLoading(true)
      const accessToken = (session as any)?.accessToken
      const response = await apiFetch<{ reservations: any[]; pagination: any }>('/protected/reservations', {
        authToken: accessToken
      })
      
      if (response.reservations) {
        setReservations(response.reservations)
      }
    } catch (error) {
      console.error('Error cargando reservas:', error)
      showAlert('error', 'Error', 'No se pudieron cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date || !formData.time || formData.people < 1) {
      showAlert('error', 'Error de validación', 'Por favor completa todos los campos correctamente')
      return
    }

    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      showAlert('error', 'Fecha inválida', 'No puedes reservar para fechas pasadas')
      return
    }

    try {
      setSubmitting(true)
      const accessToken = (session as any)?.accessToken
      await apiFetch('/protected/reservations', {
        method: 'POST',
        body: JSON.stringify(formData),
        authToken: accessToken
      })
      
      setFormData({ 
        date: '', 
        time: '', 
        people: 1, 
        payment_method: 'efectivo', 
        advance: 0 
      })
      setShowForm(false)
      loadReservations()
      showAlert('success', 'Reserva creada', 'Tu reserva ha sido creada exitosamente. Te contactaremos pronto.')
    } catch (error: any) {
      console.error('Error creando reserva:', error)
      showAlert('error', 'Error', error.message || 'Error al crear la reserva. Por favor intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black">
        <section className="relative pt-32 pb-16 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-purple-400/10 to-pink-400/10 border border-purple-400/30 rounded-full">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-semibold tracking-wider uppercase text-sm">
                  Acceso Requerido
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl">
                  Inicia Sesión
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Debes iniciar sesión para ver y gestionar tus reservas
              </p>

              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ArrowRight className="w-5 h-5" />
                Iniciar Sesión
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Alert */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 rounded-2xl p-6 shadow-2xl border-2 ${
              alert.type === 'success'
                ? 'bg-green-400/20 border-green-400/50 backdrop-blur-xl'
                : alert.type === 'error'
                ? 'bg-red-400/20 border-red-400/50 backdrop-blur-xl'
                : alert.type === 'warning'
                ? 'bg-yellow-400/20 border-yellow-400/50 backdrop-blur-xl'
                : 'bg-blue-400/20 border-blue-400/50 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-center gap-4">
              {alert.type === 'success' && (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
              {alert.type === 'error' && (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              {alert.type === 'warning' && (
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              )}
              {alert.type === 'info' && (
                <AlertCircle className="w-6 h-6 text-blue-400" />
              )}
              <div>
                <p className={`font-bold ${
                  alert.type === 'success' ? 'text-green-400' :
                  alert.type === 'error' ? 'text-red-400' :
                  alert.type === 'warning' ? 'text-yellow-400' :
                  'text-blue-400'
                }`}>
                  {alert.title}
                </p>
                <p className="text-gray-300 text-sm">{alert.message}</p>
              </div>
              <button
                onClick={() => setAlert(null)}
                className="ml-4 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-purple-400/10 to-pink-400/10 border border-purple-400/30 rounded-full">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold tracking-wider uppercase text-sm">
                Reservas
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl">
                Reservar Mesa
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span>Reserva tu mesa con anticipación</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>Disponibilidad garantizada</span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl leading-relaxed"
            >
              Reserva tu mesa en POSOQO y disfruta de una experiencia única con nuestras cervezas 
              artesanales y gastronomía ayacuchana. Nos aseguramos de tener todo listo para ti.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Botón para crear nueva reserva */}
              {!showForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <button
                    onClick={() => setShowForm(true)}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Nueva Reserva
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}

              {/* Formulario de nueva reserva */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 border border-purple-400/20"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-3">
                        <Calendar className="w-6 h-6" />
                        Nueva Reserva
                      </h2>
                      <button
                        onClick={() => setShowForm(false)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Fecha *
                          </label>
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-5 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Hora *
                          </label>
                          <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                            className="w-full px-5 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Número de Personas *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.people}
                            onChange={(e) => setFormData({...formData, people: parseInt(e.target.value) || 1})}
                            className="w-full px-5 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Método de Pago *
                          </label>
                          <select
                            value={formData.payment_method}
                            onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                            className="w-full px-5 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                            required
                          >
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="yape">Yape</option>
                            <option value="plin">Plin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-purple-300 font-semibold mb-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Adelanto (S/)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.advance}
                            onChange={(e) => setFormData({...formData, advance: parseFloat(e.target.value) || 0})}
                            className="w-full px-5 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-lg transition-all border border-white/10"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 text-black font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Crear Reserva
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lista de Reservas */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                </div>
              ) : reservations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/80 backdrop-blur-xl rounded-2xl p-12 text-center border border-purple-400/20"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-400/30"
                  >
                    <Calendar className="w-12 h-12 text-purple-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">No tienes reservas aún</h2>
                  <p className="text-gray-300 mb-8 max-w-md mx-auto">
                    Reserva tu mesa para disfrutar de nuestros productos y experiencias únicas
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Mi Primera Reserva
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {reservations.map((reservation, index) => {
                      const statusInfo = getStatusInfo(reservation.status)
                      const StatusIcon = statusInfo.icon
                      
                      return (
                        <motion.div
                          key={reservation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-xl font-bold text-white">
                                  Reserva #{reservation.id.slice(-8)}
                                </h3>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  <span className="text-sm font-semibold">{statusInfo.text}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-purple-400" />
                                  <div>
                                    <span className="text-xs text-gray-400 block">Fecha</span>
                                    <span className="text-sm text-gray-300 font-medium">
                                      {new Date(reservation.date).toLocaleDateString('es-ES', { 
                                        day: 'numeric', 
                                        month: 'short', 
                                        year: 'numeric' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-purple-400" />
                                  <div>
                                    <span className="text-xs text-gray-400 block">Hora</span>
                                    <span className="text-sm text-gray-300 font-medium">
                                      {reservation.time}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-purple-400" />
                                  <div>
                                    <span className="text-xs text-gray-400 block">Personas</span>
                                    <span className="text-sm text-gray-300 font-medium">
                                      {reservation.people} {reservation.people === 1 ? 'persona' : 'personas'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-purple-400" />
                                  <div>
                                    <span className="text-xs text-gray-400 block">Pago</span>
                                    <span className="text-sm text-gray-300 font-medium capitalize">
                                      {reservation.payment_method}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {reservation.advance > 0 && (
                                <div className="mt-4 p-3 bg-green-400/10 border border-green-400/30 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-gray-400">Adelanto:</span>
                                    <span className="text-green-400 font-bold">
                                      S/ {reservation.advance.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Right Column - Info */}
            <div className="space-y-6">
              {/* Información de Reserva */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20 sticky top-24"
              >
                <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Información Importante
                </h3>

                <div className="space-y-4">
                  <div className="bg-purple-400/10 border border-purple-400/30 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horarios de Atención
                    </h4>
                    <p className="text-sm text-gray-300">Lunes a Domingo: 11:00 AM - 11:00 PM</p>
                  </div>

                  <div className="bg-purple-400/10 border border-purple-400/30 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Capacidad
                    </h4>
                    <p className="text-sm text-gray-300">Máximo 50 personas por reserva</p>
                  </div>

                  <div className="bg-purple-400/10 border border-purple-400/30 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Política de Cancelación
                    </h4>
                    <p className="text-sm text-gray-300">Cancela hasta 24 horas antes sin costo</p>
                  </div>

                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                    <h4 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Nota Importante
                    </h4>
                    <p className="text-sm text-gray-300">
                      Te contactaremos por email o teléfono para confirmar tu reserva
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Contacto */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20"
              >
                <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contacto
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-2">
                      <Phone className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Teléfono</p>
                      <a href="tel:+51966123456" className="text-purple-300 hover:text-purple-400 transition-colors">
                        +51 966 123 456
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-2">
                      <Mail className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <a href="mailto:reservas@posoqo.com" className="text-purple-300 hover:text-purple-400 transition-colors">
                        reservas@posoqo.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-2">
                      <MapPin className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Ubicación</p>
                      <p className="text-gray-300 text-sm">Portal Independencia Nº65, Plaza de Armas, Ayacucho</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Estadísticas */}
              {reservations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20"
                >
                  <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Tus Reservas
                  </h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                      {reservations.length}
                    </div>
                    <p className="text-sm text-gray-400">
                      {reservations.length === 1 ? 'reserva' : 'reservas'} en total
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
