"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PlusIcon,
  UserGroupIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Reservation {
  id: string;
  date: string;
  time: string;
  people: number;
  payment_method: string;
  advance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pendiente':
      return {
        icon: <ClockIcon className="w-5 h-5" />,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        text: 'Pendiente'
      };
    case 'confirmada':
      return {
        icon: <CheckCircleIcon className="w-5 h-5" />,
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        text: 'Confirmada'
      };
    case 'cancelada':
      return {
        icon: <XCircleIcon className="w-5 h-5" />,
        color: 'text-red-400',
        bgColor: 'bg-red-400/10',
        text: 'Cancelada'
      };
    case 'finalizada':
      return {
        icon: <CheckCircleIcon className="w-5 h-5" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        text: 'Finalizada'
      };
    default:
      return {
        icon: <ClockIcon className="w-5 h-5" />,
        color: 'text-stone-400',
        bgColor: 'bg-stone-400/10',
        text: status
      };
  }
};

export default function ReservationsPage() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: 1,
    payment_method: 'efectivo',
    advance: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const loadReservations = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      const response = await apiFetch<{ reservations: any[]; pagination: any }>('/protected/reservations');
      console.log('🔍 [RESERVATIONS] Respuesta del backend:', response);
      
      if (response.reservations) {
        setReservations(response.reservations);
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time || formData.people < 1) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    try {
      setSubmitting(true);
      await apiFetch('/protected/reservations', {
        method: 'POST',
        body: JSON.stringify(formData),
        authToken: session?.accessToken
      });
      
      setFormData({ 
        date: '', 
        time: '', 
        people: 1, 
        payment_method: 'efectivo', 
        advance: 0 
      });
      setShowForm(false);
      loadReservations(); // Recargar lista
      alert('Reserva creada correctamente');
    } catch (error) {
      console.error('Error creando reserva:', error);
      alert('Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">Acceso Requerido</h1>
            <p className="text-stone-300 mb-8">Debes iniciar sesión para ver tus reservas</p>
            <Link
              href="/login"
              className="px-6 py-3 bg-amber-400 text-stone-900 font-bold rounded-full hover:bg-amber-300 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
            📅 Mis Reservas
          </h1>
          <p className="text-stone-300 text-lg">
            Historial de tus reservas y su estado actual
          </p>
        </motion.div>

        {/* Botón para crear nueva reserva */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-amber-400 text-stone-900 font-bold rounded-full hover:bg-amber-300 transition-colors flex items-center gap-2 mx-auto"
          >
            <PlusIcon className="w-5 h-5" />
            {showForm ? 'Cancelar' : 'Nueva Reserva'}
          </button>
        </motion.div>

        {/* Formulario de nueva reserva */}
        {showForm && (
          <motion.div 
            className="mb-8 bg-stone-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-yellow-400/20 p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">Nueva Reserva</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-200 text-sm font-medium mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-800 border border-yellow-400/30 rounded-lg text-yellow-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-yellow-200 text-sm font-medium mb-2">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-800 border border-yellow-400/30 rounded-lg text-yellow-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-yellow-200 text-sm font-medium mb-2">
                    Número de Personas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.people}
                    onChange={(e) => setFormData({...formData, people: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-stone-800 border border-yellow-400/30 rounded-lg text-yellow-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-yellow-200 text-sm font-medium mb-2">
                    Método de Pago
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-800 border border-yellow-400/30 rounded-lg text-yellow-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
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
                  <label className="block text-yellow-200 text-sm font-medium mb-2">
                    Adelanto (S/)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.advance}
                    onChange={(e) => setFormData({...formData, advance: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-stone-800 border border-yellow-400/30 rounded-lg text-yellow-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-amber-400 text-stone-900 font-bold rounded-full hover:bg-amber-300 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creando...' : 'Crear Reserva'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : reservations.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-6xl mb-6">📅</div>
            <h2 className="text-2xl font-bold text-stone-300 mb-4">No tienes reservas aún</h2>
            <p className="text-stone-400 mb-8">
              Reserva tu mesa para disfrutar de nuestros productos
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-amber-400 text-stone-900 font-bold rounded-full hover:bg-amber-300 transition-colors"
            >
              Crear Mi Primera Reserva
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {reservations.map((reservation, index) => {
              const statusInfo = getStatusInfo(reservation.status);
              
              return (
                <motion.div
                  key={reservation.id}
                  className="bg-stone-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-yellow-400/20 hover:shadow-2xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Información de la reserva */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-yellow-100">
                            Reserva #{reservation.id.slice(-8)}
                          </h3>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="text-sm font-semibold">{statusInfo.text}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-stone-400">Fecha:</span>
                            <div className="text-stone-300 font-medium">
                              {new Date(reservation.date).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400">Hora:</span>
                            <div className="text-stone-300">
                              {reservation.time}
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400">Personas:</span>
                            <div className="text-stone-300">
                              {reservation.people} {reservation.people === 1 ? 'persona' : 'personas'}
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400">Pago:</span>
                            <div className="text-stone-300">
                              {reservation.payment_method}
                            </div>
                          </div>
                        </div>

                        {reservation.advance > 0 && (
                          <div className="mt-3 p-3 bg-stone-800/50 rounded-lg">
                            <span className="text-stone-400 text-sm">Adelanto:</span>
                            <div className="text-green-400 font-bold">
                              S/ {reservation.advance.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Contador de reservas */}
        {reservations.length > 0 && (
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-stone-400">
              Tienes <span className="text-yellow-400 font-bold">{reservations.length}</span> reserva{reservations.length !== 1 ? 's' : ''} en total
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 