// components/checkout/ProfileForm.tsx
import React from 'react';
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
  const handleInputChange = (field: keyof ProfileForm, value: string) => {
    setProfileForm({
      ...profileForm,
      [field]: value
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
          <p className="text-gray-600">Completa tus datos para continuar</p>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nombre *</label>
          <div className="relative">
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Tu nombre"
            />
          </div>
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Apellido *</label>
          <div className="relative">
            <input
              type="text"
              value={profileForm.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Tu apellido"
            />
          </div>
        </div>

        {/* DNI */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">DNI *</label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={profileForm.dni}
              onChange={(e) => handleInputChange('dni', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="12345678"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Teléfono *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
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
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
        >
          Cancelar
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProfileFormComponent;
