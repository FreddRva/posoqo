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
      className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <MapPin className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dirección de Entrega</h2>
          <p className="text-gray-600">Selecciona dónde quieres recibir tu pedido</p>
        </div>
      </div>

      {/* Ubicación actual */}
      {location && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 text-blue-800">
            <Navigation className="w-5 h-5" />
            <span className="font-medium">Ubicación actual:</span>
          </div>
          <p className="text-blue-700 mt-1">{location}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Dirección principal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Dirección *</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="Av. Principal 123"
            />
          </div>
        </div>

        {/* Referencia */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Referencia</label>
          <input
            type="text"
            value={addressRef}
            onChange={(e) => setAddressRef(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            placeholder="Frente al parque, casa azul"
          />
        </div>

        {/* Número de calle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Número</label>
          <input
            type="text"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            placeholder="123"
          />
        </div>

        {/* Coordenadas actuales */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Coordenadas seleccionadas:</p>
              <p className="text-sm text-gray-600">
                Lat: {markerPosition[0].toFixed(6)}, Lng: {markerPosition[1].toFixed(6)}
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMapClick}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Ver Mapa
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddressFromCoords}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
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
