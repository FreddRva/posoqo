// components/checkout/ProfileForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ProfileForm } from '@/types/checkout';

interface ProfileFormProps {
  profileForm: ProfileForm;
  setProfileForm: (form: ProfileForm) => void;
  profileComplete: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileFormComponent: React.FC<ProfileFormProps> = ({
  profileForm,
  setProfileForm,
  profileComplete,
  saving,
  error,
  success,
  onSave,
  onCancel
}) => {
  const [consultandoDNI, setConsultandoDNI] = useState(false);
  const [dniVerificado, setDniVerificado] = useState(false);

  const handleInputChange = (field: keyof ProfileForm, value: string) => {
    setProfileForm({
      ...profileForm,
      [field]: value
    });
    // Si cambia el DNI, resetear verificación
    if (field === 'dni') {
      setDniVerificado(false);
    }
  };

  // Función para consultar DNI cuando se complete
  const handleDNIBlur = async () => {
    const dniValue = profileForm.dni.trim();
    
    // Solo consultar si tiene exactamente 8 dígitos
    if (!/^\d{8}$/.test(dniValue)) {
      setDniVerificado(false);
      return;
    }

    // Si ya tiene nombre completo, no consultar de nuevo
    if (profileForm.name.trim() !== '' && profileForm.last_name.trim() !== '') {
      return;
    }

    setConsultandoDNI(true);
    setDniVerificado(false);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com').replace(/\/$/, '');
      const url = `${apiUrl}/api/dni/${dniValue}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Autocompletar los datos con los datos del DNI
          if (!profileForm.name.trim()) {
            setProfileForm({
              ...profileForm,
              name: result.data.nombres || ''
            });
          }
          if (!profileForm.last_name.trim()) {
            const apellidos = `${result.data.apellido_paterno || ''} ${result.data.apellido_materno || ''}`.trim();
            setProfileForm({
              ...profileForm,
              last_name: apellidos
            });
          }
          setDniVerificado(true);
        } else {
          setDniVerificado(false);
        }
      } else {
        setDniVerificado(false);
      }
    } catch (error) {
      console.error('Error consultando DNI:', error);
      setDniVerificado(false);
    } finally {
      setConsultandoDNI(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-yellow-400/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Información Personal</h2>
          <p className="text-gray-400">Completa tus datos para continuar</p>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-xl flex items-center gap-3 backdrop-blur-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-400/30 rounded-xl flex items-center gap-3 backdrop-blur-sm"
        >
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-300">{success}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Nombre *</label>
          <div className="relative">
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200 text-white placeholder-gray-500"
              placeholder="Tu nombre"
            />
          </div>
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Apellido *</label>
          <div className="relative">
            <input
              type="text"
              value={profileForm.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200 text-white placeholder-gray-500"
              placeholder="Tu apellido"
            />
          </div>
        </div>

        {/* DNI */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">DNI *</label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={profileForm.dni}
              onChange={(e) => handleInputChange('dni', e.target.value)}
              onBlur={handleDNIBlur}
              maxLength={8}
              className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-yellow-400/50 transition-all duration-200 text-white placeholder-gray-500 ${
                dniVerificado 
                  ? 'border-green-400/50 focus:border-green-400/50' 
                  : 'border-white/10 focus:border-yellow-400/50'
              }`}
              placeholder="12345678"
              disabled={consultandoDNI}
            />
            {consultandoDNI && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              </div>
            )}
            {dniVerificado && !consultandoDNI && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>
          {dniVerificado && (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              DNI verificado - Datos autocompletados
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Teléfono *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200 text-white placeholder-gray-500"
              placeholder="987654321"
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          disabled={saving || !profileForm.name || !profileForm.last_name || !profileForm.dni || !profileForm.phone}
          className="flex-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-yellow-400/50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Guardar Perfil
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="px-6 py-3 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl font-semibold hover:bg-white/5 transition-all duration-200"
        >
          Cancelar
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProfileFormComponent;
