"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Users,
  Calendar,
  Settings,
  Edit,
  Save,
  X,
  CheckCircle,
  Award,
  Medal,
  Gift,
  Loader2,
  TrendingUp,
  Eye,
  Star,
  Clock,
  AlertCircle
} from 'lucide-react';

interface RaffleConfig {
  id: string;
  mes_sorteo: string;
  titulo: string;
  descripcion: string;
  fecha_sorteo: string;
  hora_sorteo: string;
  is_active: boolean;
  premio_primero: string;
  premio_segundo: string;
  premio_tercero: string;
  premio_consuelo: string;
  created_at: string;
  updated_at: string;
}

interface Participant {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  edad: number;
  numero_participacion: number;
  is_winner: boolean;
  prize_level: string | null;
  created_at: string;
}

export default function RafflesPage() {
  const [configs, setConfigs] = useState<RaffleConfig[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedMes, setSelectedMes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RaffleConfig | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [stats, setStats] = useState({ total_participants: 0, total_winners: 0 });

  useEffect(() => {
    loadConfigs();
    const now = new Date();
    setSelectedMes(now.toISOString().slice(0, 7));
  }, []);

  useEffect(() => {
    if (selectedMes) {
      loadParticipants(selectedMes);
      loadStats(selectedMes);
    }
  }, [selectedMes]);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ data: RaffleConfig[] }>('/admin/raffles/configs');
      if ((response as any).data) {
        setConfigs((response as any).data);
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (mes: string) => {
    try {
      setLoadingParticipants(true);
      const response = await apiFetch<{ participants: Participant[]; total: number }>(
        `/admin/raffles/participants?mes_sorteo=${mes}`
      );
      if ((response as any).participants) {
        setParticipants((response as any).participants);
      }
    } catch (error) {
      console.error('Error cargando participantes:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const loadStats = async (mes: string) => {
    try {
      const response = await apiFetch<{ total_participants: number; total_winners: number }>(
        `/admin/raffles/stats?mes_sorteo=${mes}`
      );
      setStats(response);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const saveConfig = async (config: Partial<RaffleConfig>) => {
    try {
      await apiFetch('/admin/raffles/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      await loadConfigs();
      setEditingConfig(null);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    }
  };

  const markWinner = async (participantId: string, prizeLevel: string) => {
    try {
      await apiFetch(`/admin/raffles/participants/${participantId}/winner?prize_level=${prizeLevel}`, {
        method: 'PUT',
      });
      await loadParticipants(selectedMes);
      await loadStats(selectedMes);
      alert('Ganador marcado exitosamente');
    } catch (error) {
      console.error('Error marcando ganador:', error);
      alert('Error al marcar ganador');
    }
  };

  const getCurrentConfig = () => {
    return configs.find(c => c.mes_sorteo === selectedMes);
  };

  const formatMes = (mes: string) => {
    const [year, month] = mes.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            Gestión de Sorteos
          </h1>
          <p className="text-stone-600 mt-2">Administra los sorteos mensuales y participantes</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-stone-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-600 text-sm">Total Participantes</p>
              <p className="text-3xl font-bold text-stone-900 mt-2">{stats.total_participants}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-stone-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-600 text-sm">Ganadores</p>
              <p className="text-3xl font-bold text-stone-900 mt-2">{stats.total_winners}</p>
            </div>
            <Trophy className="w-12 h-12 text-amber-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-stone-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-600 text-sm">Mes Seleccionado</p>
              <p className="text-lg font-semibold text-stone-900 mt-2">
                {selectedMes ? formatMes(selectedMes) : 'Selecciona un mes'}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Selector de mes y acciones */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-stone-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">Mes del Sorteo</label>
            <input
              type="month"
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => {
              const currentConfig = getCurrentConfig();
              if (currentConfig) {
                setEditingConfig(currentConfig);
              } else {
                setEditingConfig({
                  id: '',
                  mes_sorteo: selectedMes,
                  titulo: `Sorteo Mensual POSOQO - ${formatMes(selectedMes)}`,
                  descripcion: '',
                  fecha_sorteo: new Date(new Date(selectedMes + '-01').getFullYear(), new Date(selectedMes + '-01').getMonth() + 1, 0).toISOString().split('T')[0],
                  hora_sorteo: '20:00:00',
                  is_active: true,
                  premio_primero: 'Caja de 12 Cervezas',
                  premio_segundo: 'Pack de 6 Cervezas',
                  premio_tercero: 'Pack de 3 Cervezas',
                  premio_consuelo: '1 Cerveza + Descuento',
                  created_at: '',
                  updated_at: '',
                });
              }
            }}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {getCurrentConfig() ? 'Editar Configuración' : 'Crear Configuración'}
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showParticipants ? 'Ocultar' : 'Ver'} Participantes
          </button>
        </div>
      </div>

      {/* Modal de edición de configuración */}
      <AnimatePresence>
        {editingConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-stone-900">Configuración del Sorteo</h2>
                <button
                  onClick={() => setEditingConfig(null)}
                  className="p-2 hover:bg-stone-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  saveConfig({
                    mes_sorteo: editingConfig.mes_sorteo,
                    titulo: formData.get('titulo') as string,
                    descripcion: formData.get('descripcion') as string,
                    fecha_sorteo: formData.get('fecha_sorteo') as string,
                    hora_sorteo: formData.get('hora_sorteo') as string,
                    is_active: (formData.get('is_active') as string) === 'true',
                    premio_primero: formData.get('premio_primero') as string,
                    premio_segundo: formData.get('premio_segundo') as string,
                    premio_tercero: formData.get('premio_tercero') as string,
                    premio_consuelo: formData.get('premio_consuelo') as string,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Título</label>
                  <input
                    type="text"
                    name="titulo"
                    defaultValue={editingConfig.titulo}
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Descripción</label>
                  <textarea
                    name="descripcion"
                    defaultValue={editingConfig.descripcion}
                    rows={3}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Fecha del Sorteo</label>
                    <input
                      type="date"
                      name="fecha_sorteo"
                      defaultValue={editingConfig.fecha_sorteo}
                      required
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Hora del Sorteo</label>
                    <input
                      type="time"
                      name="hora_sorteo"
                      defaultValue={editingConfig.hora_sorteo}
                      required
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={editingConfig.is_active}
                      value="true"
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-stone-700">Sorteo Activo</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Primer Premio
                    </label>
                    <input
                      type="text"
                      name="premio_primero"
                      defaultValue={editingConfig.premio_primero}
                      required
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      Segundo Premio
                    </label>
                    <input
                      type="text"
                      name="premio_segundo"
                      defaultValue={editingConfig.premio_segundo}
                      required
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                      <Medal className="w-4 h-4 text-orange-500" />
                      Tercer Premio
                    </label>
                    <input
                      type="text"
                      name="premio_tercero"
                      defaultValue={editingConfig.premio_tercero}
                      required
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-purple-500" />
                      Premio Consuelo
                    </label>
                    <input
                      type="text"
                      name="premio_consuelo"
                      defaultValue={editingConfig.premio_consuelo}
                      required
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingConfig(null)}
                    className="flex-1 px-6 py-3 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lista de participantes */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-stone-200"
          >
            <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participantes - {selectedMes ? formatMes(selectedMes) : ''}
            </h2>

            {loadingParticipants ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                <p className="text-stone-600 mt-4">Cargando participantes...</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-600">No hay participantes para este mes</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">#</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Nombre</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Teléfono</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Número</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr key={participant.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-3 px-4 text-sm text-stone-600">{index + 1}</td>
                        <td className="py-3 px-4 text-sm font-medium text-stone-900">{participant.nombre}</td>
                        <td className="py-3 px-4 text-sm text-stone-600">{participant.email}</td>
                        <td className="py-3 px-4 text-sm text-stone-600">{participant.telefono}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-amber-600">
                          #{participant.numero_participacion}
                        </td>
                        <td className="py-3 px-4">
                          {participant.is_winner ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              <Trophy className="w-3 h-3" />
                              Ganador
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-xs">
                              Participante
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {!participant.is_winner ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => markWinner(participant.id, 'first')}
                                className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition"
                                title="Primer Lugar"
                              >
                                1°
                              </button>
                              <button
                                onClick={() => markWinner(participant.id, 'second')}
                                className="px-3 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition"
                                title="Segundo Lugar"
                              >
                                2°
                              </button>
                              <button
                                onClick={() => markWinner(participant.id, 'third')}
                                className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition"
                                title="Tercer Lugar"
                              >
                                3°
                              </button>
                              <button
                                onClick={() => markWinner(participant.id, 'consolation')}
                                className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition"
                                title="Consuelo"
                              >
                                C
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-500">
                              {participant.prize_level === 'first' && '🥇 Primer Lugar'}
                              {participant.prize_level === 'second' && '🥈 Segundo Lugar'}
                              {participant.prize_level === 'third' && '🥉 Tercer Lugar'}
                              {participant.prize_level === 'consolation' && '🎁 Consuelo'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

