// components/checkout/AddressForm.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Navigation } from 'lucide-react';
import { AddressData } from '@/types/checkout';

interface AddressFormProps {
  address: string;
  setAddress: (address: string) => void;
  addressRef: string;
  setAddressRef: (addressRef: string) => void;
  streetNumber: string;
  setStreetNumber: (streetNumber: string) => void;
  location: string;
  markerPosition: [number, number];
  onMapClick: () => void;
  onAddressFromCoords: () => void;
}

export const AddressFormComponent: React.FC<AddressFormProps> = ({
  address,
  setAddress,
  addressRef,
  setAddressRef,
  streetNumber,
  setStreetNumber,
  location,
  markerPosition,
  onMapClick,
  onAddressFromCoords
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-yellow-400/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-xl flex items-center justify-center">
          <MapPin className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">Dirección de Entrega</h2>
          <p className="text-gray-400 text-sm">Selecciona dónde quieres recibir tu pedido</p>
        </div>
      </div>

      {/* Ubicación actual */}
      {location && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/20 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-yellow-400">
            <Navigation className="w-5 h-5" />
            <span className="font-medium text-sm">Ubicación actual:</span>
          </div>
          <p className="text-yellow-300 mt-1 text-sm">{location}</p>
        </div>
      )}

      <div className="space-y-5 sm:space-y-6">
        {/* Dirección principal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Dirección *</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400/60 z-10" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200"
              placeholder="Av. Principal 123"
            />
          </div>
        </div>

        {/* Referencia */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Referencia</label>
          <input
            type="text"
            value={addressRef}
            onChange={(e) => setAddressRef(e.target.value)}
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200"
            placeholder="Frente al parque, casa azul"
          />
        </div>

        {/* Número de calle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Número</label>
          <input
            type="text"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200"
            placeholder="123"
          />
        </div>

        {/* Coordenadas actuales */}
        <div className="p-4 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl border border-yellow-400/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-300 mb-1">Coordenadas seleccionadas:</p>
              <p className="text-xs sm:text-sm text-gray-400 font-mono">
                Lat: {markerPosition[0].toFixed(6)}, Lng: {markerPosition[1].toFixed(6)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMapClick}
                className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-yellow-400/50"
              >
                Ver Mapa
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddressFromCoords}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-yellow-300 hover:text-yellow-200 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-yellow-400/20 hover:border-yellow-400/40"
                title="Obtener dirección usando GPS"
              >
                <Navigation className="w-4 h-4" />
                Obtener Dirección (GPS)
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AddressFormComponent;
