"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  Archive, 
  Mail, 
  User, 
  Calendar, 
  MessageSquare, 
  Loader2,
  X,
  AlertCircle,
  Check,
  Ban,
  CheckCircle2,
  XCircle,
  Sparkles,
  Shield
} from 'lucide-react';

interface Complaint {
  id: string;
  name: string;
  email: string;
  text: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ complaints: Complaint[] }>('/admin/complaints');
      if (response.complaints) {
        setComplaints(response.complaints);
      }
    } catch (error) {
      console.error('Error cargando reclamos:', error);
      showErrorAlert('Error de carga', 'No se pudieron cargar los reclamos. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de alerta
  const showSuccessAlert = (title: string, message: string) => {
    setAlert({
      show: true,
      type: 'success',
      title,
      message
    });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
  };

  const showErrorAlert = (title: string, message: string) => {
    setAlert({
      show: true,
      type: 'error',
      title,
      message
    });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      setUpdatingStatus(complaintId);
      const response = await apiFetch<{ success: boolean; error?: string }>(`/admin/complaints/${complaintId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.success) {
        // Actualizar el estado local
        setComplaints(prev => prev.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, status: newStatus }
            : complaint
        ));
        
        // Mostrar notificación de éxito
        const statusText = newStatus === 'atendido' ? 'atendido' : newStatus === 'archivado' ? 'archivado' : 'actualizado';
        showSuccessAlert('Estado actualizado', `El reclamo ha sido marcado como ${statusText}`);
      } else {
        throw new Error(response.error || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showErrorAlert('Error al actualizar', 'No se pudo actualizar el estado del reclamo. Intenta de nuevo.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'atendido': return 'bg-green-100 text-green-800 border-green-200';
      case 'archivado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'atendido': return <CheckCircle className="w-4 h-4" />;
      case 'archivado': return <Archive className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesFilter = filter === 'all' || complaint.status === filter;
    const matchesSearch = searchQuery === '' ||
      complaint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getComplaintStats = () => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pendiente').length,
      attended: complaints.filter(c => c.status === 'atendido').length,
      archived: complaints.filter(c => c.status === 'archivado').length
    };
  };

  const stats = getComplaintStats();

  const handleViewDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <AlertTriangle className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          </motion.div>
          <p className="text-yellow-300 text-2xl font-bold">Cargando Reclamos...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-gradient-to-r from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-yellow-400/20">
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-2xl p-4">
                <AlertTriangle className="w-8 h-8 text-black" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Gestión de Reclamos
              </h1>
              <p className="text-gray-400 text-sm md:text-base mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Administra reclamos y sugerencias
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.05, y: -5 }} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-xl p-4 border border-yellow-400/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400">{stats.total}</div>
                  <div className="text-gray-400 text-xs md:text-sm font-medium mt-1">Total</div>
                </div>
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                </motion.div>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} whileHover={{ scale: 1.05, y: -5 }} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-xl p-4 border border-orange-400/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-orange-400">{stats.pending}</div>
                  <div className="text-gray-400 text-xs md:text-sm font-medium mt-1">Pendientes</div>
                </div>
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.attended}</div>
                <div className="text-stone-600 text-sm font-medium">Atendidos</div>
              </div>
              <div className="text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-600">{stats.archived}</div>
                <div className="text-stone-600 text-sm font-medium">Archivados</div>
              </div>
              <div className="text-gray-600">
                <Archive className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Buscar Reclamos</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o contenido..."
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
                  <option value="all">Todos los reclamos</option>
                  <option value="pendiente">Solo pendientes</option>
                  <option value="atendido">Solo atendidos</option>
                  <option value="archivado">Solo archivados</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de reclamos */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Mensaje
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-stone-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-stone-900">{complaint.name}</div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <div className="text-sm text-stone-500">{complaint.email}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-stone-900 line-clamp-2">
                          {complaint.text}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(complaint.status)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <div className="text-sm text-stone-500">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(complaint)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {complaint.status === 'pendiente' && (
                          <>
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'atendido')}
                              disabled={updatingStatus === complaint.id}
                              className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                              title="Marcar como atendido"
                            >
                              {updatingStatus === complaint.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'archivado')}
                              disabled={updatingStatus === complaint.id}
                              className="text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                              title="Archivar"
                            >
                              {updatingStatus === complaint.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Archive className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                        {complaint.status === 'atendido' && (
                          <button
                            onClick={() => updateComplaintStatus(complaint.id, 'archivado')}
                            disabled={updatingStatus === complaint.id}
                            className="text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            title="Archivar"
                          >
                            {updatingStatus === complaint.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Archive className="w-4 h-4" />
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

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="text-4xl mb-4">
              <AlertTriangle className="w-16 h-16 text-stone-400 mx-auto" />
            </div>
            <div className="text-stone-600 text-lg font-medium">No hay reclamos para mostrar</div>
            <div className="text-stone-500 text-sm mt-2">Los reclamos aparecerán aquí cuando los usuarios los envíen</div>
          </div>
        )}

        {/* Modal de detalles */}
        {showDetailModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800">Detalles del Reclamo</h2>
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
                    <div className="text-lg font-semibold text-stone-900">{selectedComplaint.name}</div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4 text-stone-400" />
                      <div className="text-sm text-stone-500">{selectedComplaint.email}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Mensaje</label>
                    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-5 h-5 text-stone-400 mt-0.5" />
                        <div className="text-stone-800 whitespace-pre-wrap">
                          {selectedComplaint.text}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Estado</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedComplaint.status)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedComplaint.status)}`}>
                          {selectedComplaint.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Fecha</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span className="text-sm text-stone-900">
                          {new Date(selectedComplaint.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedComplaint.status === 'pendiente' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-stone-200">
                    <button
                      onClick={() => {
                        updateComplaintStatus(selectedComplaint.id, 'atendido');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Marcar como Atendido
                    </button>
                    <button
                      onClick={() => {
                        updateComplaintStatus(selectedComplaint.id, 'archivado');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Archivar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alerta de notificaciones */}
        {alert.show && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border max-w-md ${
              alert.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {alert.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{alert.title}</h4>
                <p className="text-sm opacity-90">{alert.message}</p>
              </div>
              <button
                onClick={() => setAlert(prev => ({ ...prev, show: false }))}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 