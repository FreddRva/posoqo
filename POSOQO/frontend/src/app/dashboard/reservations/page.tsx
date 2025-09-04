"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Check, 
  Users, 
  Clock as ClockIcon,
  DollarSign, 
  User, 
  CalendarDays,
  Loader2,
  X,
  AlertCircle,
  Ban,
  CheckSquare
} from 'lucide-react';

interface Reservation {
  id: string;
  user_name: string;
  date: string;
  time: string;
  people: number;
  payment_method: string;
  advance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ reservations: any[] }>('/admin/reservations');
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
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
      case 'completada': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada': return <CheckCircle className="w-4 h-4" />;
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'cancelada': return <XCircle className="w-4 h-4" />;
      case 'completada': return <CheckSquare className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesFilter = filter === 'all' || reservation.status === filter;
    const matchesSearch = searchQuery === '' ||
      reservation.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.date.includes(searchQuery) ||
      reservation.time.includes(searchQuery);
    
    return matchesFilter && matchesSearch;
  });

  const getReservationStats = () => {
    return {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === 'confirmada').length,
      pending: reservations.filter(r => r.status === 'pendiente').length,
      cancelled: reservations.filter(r => r.status === 'cancelada').length,
      completed: reservations.filter(r => r.status === 'completada').length
    };
  };

  const stats = getReservationStats();

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      setUpdatingStatus(reservationId);
      await apiFetch(`/admin/reservations/${reservationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      // Actualizar el estado local
      setReservations(prev => prev.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: newStatus }
          : reservation
      ));
      
      // Mostrar notificación de éxito
      alert('Estado de reserva actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado de la reserva');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
            <p className="text-stone-600">Cargando reservas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Gestión de Reservas</h1>
            <p className="text-stone-600">Administra las reservas de tu restaurante</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-stone-800">{stats.total}</div>
                <div className="text-stone-600 text-sm font-medium">Total Reservas</div>
              </div>
              <div className="text-blue-600">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
                <div className="text-stone-600 text-sm font-medium">Confirmadas</div>
              </div>
              <div className="text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-stone-600 text-sm font-medium">Pendientes</div>
              </div>
              <div className="text-yellow-600">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
                <div className="text-stone-600 text-sm font-medium">Canceladas</div>
              </div>
              <div className="text-red-600">
                <XCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
                <div className="text-stone-600 text-sm font-medium">Completadas</div>
              </div>
              <div className="text-blue-600">
                <CheckSquare className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Buscar Reservas</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, fecha o hora..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 placeholder-stone-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-medium text-stone-700 mb-2">Filtrar por Estado</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">Todas las reservas</option>
                  <option value="confirmada">Solo confirmadas</option>
                  <option value="pendiente">Solo pendientes</option>
                  <option value="cancelada">Solo canceladas</option>
                  <option value="completada">Solo completadas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de reservas */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Personas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-stone-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-stone-900">{reservation.user_name}</div>
                          <div className="text-sm text-stone-500">ID: {reservation.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="w-4 h-4 text-stone-400" />
                          <div className="text-sm text-stone-900">
                            {new Date(reservation.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-stone-400" />
                          <div className="text-sm text-stone-500">{reservation.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-stone-400" />
                        <div className="text-sm font-semibold text-stone-900">
                          {reservation.people} {reservation.people === 1 ? 'persona' : 'personas'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div className="text-sm font-semibold text-stone-900">
                            {formatCurrency(reservation.advance)}
                          </div>
                        </div>
                        <div className="text-xs text-stone-500 capitalize">
                          {reservation.payment_method}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(reservation.status)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(reservation)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {reservation.status === 'pendiente' && (
                          <>
                            <button
                              onClick={() => updateReservationStatus(reservation.id, 'confirmada')}
                              disabled={updatingStatus === reservation.id}
                              className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                              title="Confirmar reserva"
                            >
                              {updatingStatus === reservation.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => updateReservationStatus(reservation.id, 'cancelada')}
                              disabled={updatingStatus === reservation.id}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                              title="Cancelar reserva"
                            >
                              {updatingStatus === reservation.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                        {reservation.status === 'confirmada' && (
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'completada')}
                            disabled={updatingStatus === reservation.id}
                            className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50"
                            title="Marcar como completada"
                          >
                            {updatingStatus === reservation.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckSquare className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="text-4xl mb-4">
              <Calendar className="w-16 h-16 text-stone-400 mx-auto" />
            </div>
            <div className="text-stone-600 text-lg font-medium">No hay reservas para mostrar</div>
            <div className="text-stone-500 text-sm mt-2">Las reservas aparecerán aquí cuando los clientes las hagan</div>
          </div>
        )}

        {/* Modal de detalles */}
        {showDetailModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800">Detalles de la Reserva</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-stone-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-stone-900">{selectedReservation.user_name}</div>
                    <div className="text-sm text-stone-500">ID: {selectedReservation.id}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Fecha y Hora</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-900">
                          {new Date(selectedReservation.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-900">{selectedReservation.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Detalles</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-900">
                          {selectedReservation.people} {selectedReservation.people === 1 ? 'persona' : 'personas'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-stone-900">
                          {formatCurrency(selectedReservation.advance)} - {selectedReservation.payment_method}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Estado</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedReservation.status)}
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedReservation.status)}`}>
                      {selectedReservation.status}
                    </span>
                  </div>
                </div>
                
                {selectedReservation.status === 'pendiente' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-stone-200">
                    <button
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'confirmada');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Confirmar Reserva
                    </button>
                    <button
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'cancelada');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Cancelar Reserva
                    </button>
                  </div>
                )}
                
                {selectedReservation.status === 'confirmada' && (
                  <div className="flex justify-end pt-4 border-t border-stone-200">
                    <button
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'completada');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Marcar como Completada
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 