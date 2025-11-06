"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  User,
  Crown,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Calendar,
  Mail,
  AlertTriangle,
  Loader2,
  X,
  Ban,
  RotateCcw,
  CheckCircle2,
  XCircle as XCircleIcon
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    email_verified: false
  });
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

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios desde el endpoint principal
      
      const response = await apiFetch<{ data: any[] }>('/admin/users/list');
      if ((response as any).data) {
        setUsers((response as any).data);
      }
    } catch (error) {
      showErrorAlert('Error de carga', 'No se pudieron cargar los usuarios. Intenta recargar la página.');
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
    loadUsers();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'suspended': return <Ban className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getVerificationStatus = (verified: boolean) => {
    return verified ? 
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
          Verificado
        </span>
      </div> :
      <div className="flex items-center space-x-2">
        <XCircle className="w-4 h-4 text-red-600" />
        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
          No verificado
        </span>
      </div>;
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getUserStats = () => {
    const stats = {
      total: users.length,
      admin: users.filter(u => u.role === 'admin').length,
      user: users.filter(u => u.role === 'user').length,
      suspended: users.filter(u => u.role === 'suspended').length,
      verified: users.filter(u => u.email_verified).length,
      unverified: users.filter(u => !u.email_verified).length,
    };
    return stats;
  };

  const stats = getUserStats();

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified
    });
    setShowEditModal(true);
  };

  const handleSuspendUser = (user: User) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
  };

  const handleReactivateUser = (user: User) => {
    setSelectedUser(user);
    setShowReactivateModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await apiFetch<{ success: boolean; error?: string }>(`/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });

      if (response.success) {
        await loadUsers();
        setShowEditModal(false);
        showSuccessAlert('Usuario actualizado', 'Los cambios han sido guardados correctamente');
      } else {
        throw new Error(response.error || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      showErrorAlert('Error al actualizar', 'No se pudo actualizar el usuario. Intenta de nuevo.');
    }
  };

  const handleSuspendUserConfirm = async () => {
    if (!selectedUser) return;

    try {
      const response = await apiFetch<{ success: boolean; error?: string }>(`/admin/users/${selectedUser.id}/suspend`, {
        method: 'PUT'
      });

      if (response.success) {
        await loadUsers();
        setShowSuspendModal(false);
        showSuccessAlert('Usuario suspendido', `${selectedUser.name} ha sido suspendido correctamente`);
      } else {
        throw new Error(response.error || 'Error al suspender usuario');
      }
    } catch (error) {
      console.error('Error suspendiendo usuario:', error);
      showErrorAlert('Error al suspender', 'No se pudo suspender el usuario. Intenta de nuevo.');
    }
  };

  const handleReactivateUserConfirm = async () => {
    if (!selectedUser) return;

    try {
      const response = await apiFetch<{ success: boolean; error?: string }>(`/admin/users/${selectedUser.id}/reactivate`, {
        method: 'PUT'
      });

      if (response.success) {
        await loadUsers();
        setShowReactivateModal(false);
        showSuccessAlert('Usuario reactivado', `${selectedUser.name} ha sido reactivado correctamente`);
      } else {
        throw new Error(response.error || 'Error al reactivar usuario');
      }
    } catch (error) {
      console.error('Error reactivando usuario:', error);
      showErrorAlert('Error al reactivar', 'No se pudo reactivar el usuario. Intenta de nuevo.');
    }
  };

  const closeModals = () => {
    setShowProfileModal(false);
    setShowEditModal(false);
    setShowSuspendModal(false);
    setShowReactivateModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
          <p className="text-stone-700">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Gestión de Usuarios</h1>
            <p className="text-stone-600">Administra todos los usuarios del sistema</p>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Usuario</span>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-stone-800">{stats.total}</div>
                <div className="text-stone-600 text-sm font-medium">Total Usuarios</div>
              </div>
              <div className="text-blue-600">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{stats.admin}</div>
                <div className="text-stone-600 text-sm font-medium">Administradores</div>
              </div>
              <div className="text-purple-600">
                <Crown className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.user}</div>
                <div className="text-stone-600 text-sm font-medium">Usuarios</div>
              </div>
              <div className="text-blue-600">
                <User className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{stats.suspended}</div>
                <div className="text-stone-600 text-sm font-medium">Suspendidos</div>
              </div>
              <div className="text-orange-600">
                <Ban className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.verified}</div>
                <div className="text-stone-600 text-sm font-medium">Verificados</div>
              </div>
              <div className="text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{stats.unverified}</div>
                <div className="text-stone-600 text-sm font-medium">No Verificados</div>
              </div>
              <div className="text-red-600">
                <XCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Buscar Usuarios</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 placeholder-stone-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-medium text-stone-700 mb-2">Filtrar por Rol</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">Todos los usuarios</option>
                  <option value="admin">Solo administradores</option>
                  <option value="user">Solo usuarios</option>
                  <option value="suspended">Solo suspendidos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Verificación
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-stone-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-stone-900">{user.name}</div>
                          <div className="text-sm text-stone-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <div className="text-sm text-stone-900">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVerificationStatus(user.email_verified)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <div className="text-sm text-stone-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProfile(user)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Ver perfil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.role === 'suspended' ? (
                          <button
                            onClick={() => handleReactivateUser(user)}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Reactivar usuario"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendUser(user)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Suspender usuario"
                          >
                            <Ban className="w-4 h-4" />
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="text-4xl mb-4">
              <Users className="w-16 h-16 text-stone-400 mx-auto" />
            </div>
            <div className="text-stone-600 text-lg font-medium">No hay usuarios para mostrar</div>
            <div className="text-stone-500 text-sm mt-2">Los usuarios aparecerán aquí cuando se registren</div>
          </div>
        )}

        {/* Modales */}
        {/* Modal de perfil */}
        {showProfileModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800">Perfil de Usuario</h2>
                <button
                  onClick={closeModals}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-stone-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-stone-900">{selectedUser.name}</div>
                    <div className="text-sm text-stone-500">{selectedUser.email}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-600">Rol:</span>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(selectedUser.role)}
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-600">Verificación:</span>
                    {getVerificationStatus(selectedUser.email_verified)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-600">Fecha de registro:</span>
                    <span className="text-sm text-stone-900">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800">
                  {selectedUser ? 'Editar Usuario' : 'Agregar Usuario'}
                </h2>
                <button
                  onClick={closeModals}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Nombre*
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Email*
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Rol*
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-stone-900"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email_verified"
                    checked={editForm.email_verified}
                    onChange={(e) => setEditForm({...editForm, email_verified: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 rounded"
                  />
                  <label htmlFor="email_verified" className="ml-2 text-sm text-stone-700">
                    Email verificado
                  </label>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                  >
                    {selectedUser ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {selectedUser ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de suspensión */}
        {showSuspendModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800">Suspender Usuario</h2>
                <button
                  onClick={closeModals}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-lg font-semibold text-stone-900">¿Estás seguro?</div>
                    <div className="text-sm text-stone-600">
                      Vas a suspender al usuario <strong>{selectedUser.name}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-stone-200">
                  <button
                    onClick={closeModals}
                    className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSuspendUserConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Suspender
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de reactivación */}
        {showReactivateModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800">Reactivar Usuario</h2>
                <button
                  onClick={closeModals}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-lg font-semibold text-stone-900">¿Estás seguro?</div>
                    <div className="text-sm text-stone-600">
                      Vas a reactivar al usuario <strong>{selectedUser.name}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-stone-200">
                  <button
                    onClick={closeModals}
                    className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleReactivateUserConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reactivar
                  </button>
                </div>
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
                <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
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
  );
} 