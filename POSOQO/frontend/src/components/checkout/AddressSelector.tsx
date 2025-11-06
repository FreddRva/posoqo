"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Check, Edit, Trash2, Navigation } from 'lucide-react';

interface SavedAddress {
  id: string;
  name: string;
  address: string;
  addressRef: string;
  streetNumber: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

interface AddressSelectorProps {
  onSelectAddress: (address: SavedAddress) => void;
  onNewAddress: () => void;
  selectedAddressId?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  onSelectAddress,
  onNewAddress,
  selectedAddressId
}) => {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Cargar direcciones guardadas
  useEffect(() => {
    const loadSavedAddresses = () => {
      try {
        const addresses = localStorage.getItem('savedAddresses');
        if (addresses) {
          const parsed = JSON.parse(addresses);
          setSavedAddresses(parsed);
        }
      } catch (error) {
        console.error('Error loading saved addresses:', error);
      }
    };

    loadSavedAddresses();
  }, []);

  // Guardar direcciones
  const saveAddresses = (addresses: SavedAddress[]) => {
    localStorage.setItem('savedAddresses', JSON.stringify(addresses));
    setSavedAddresses(addresses);
  };

  // Eliminar dirección
  const deleteAddress = (id: string) => {
    const updated = savedAddresses.filter(addr => addr.id !== id);
    saveAddresses(updated);
    setShowDeleteConfirm(null);
  };

  // Establecer como predeterminada
  const setAsDefault = (id: string) => {
    const updated = savedAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    saveAddresses(updated);
  };

  // Obtener dirección actual del localStorage
  const getCurrentAddress = (): SavedAddress | null => {
    try {
      const current = localStorage.getItem('userAddress');
      if (current) {
        const data = JSON.parse(current);
        return {
          id: 'current',
          name: 'Dirección Actual',
          address: data.address || '',
          addressRef: data.addressRef || '',
          streetNumber: data.streetNumber || '',
          lat: data.lat || 0,
          lng: data.lng || 0,
          isDefault: true
        };
      }
    } catch (error) {
      console.error('Error getting current address:', error);
    }
    return null;
  };

  const currentAddress = getCurrentAddress();
  const allAddresses = currentAddress ? [currentAddress, ...savedAddresses] : savedAddresses;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 bg-black/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-yellow-400/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Seleccionar Dirección</h2>
            <p className="text-gray-400">Elige una dirección guardada o crea una nueva</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewAddress}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-yellow-400/50"
        >
          <Plus className="w-4 h-4" />
          Nueva Dirección
        </motion.button>
      </div>

      {/* Lista de direcciones */}
      <div className="space-y-3">
        <AnimatePresence>
          {allAddresses.map((address, index) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                selectedAddressId === address.id
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
              onClick={() => onSelectAddress(address)}
            >
              {/* Checkbox de selección */}
              <div className="absolute top-4 right-4">
                {selectedAddressId === address.id ? (
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/50">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-white/20 rounded-full" />
                )}
              </div>

              {/* Contenido de la dirección */}
              <div className="pr-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white">{address.name}</h3>
                  {address.isDefault && (
                    <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-400/30">
                      Predeterminada
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-300">
                  <p className="font-medium text-white">{address.address}</p>
                  {address.addressRef && (
                    <p className="text-gray-400">Ref: {address.addressRef}</p>
                  )}
                  {address.streetNumber && (
                    <p className="text-gray-400">N° {address.streetNumber}</p>
                  )}
                </div>

                {/* Coordenadas */}
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {address.lat.toFixed(6)}, {address.lng.toFixed(6)}
                </div>
              </div>

              {/* Acciones */}
              {address.id !== 'current' && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAsDefault(address.id);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Establecer como predeterminada"
                  >
                    <Check className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(address.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar dirección"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {allAddresses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-400/20">
              <MapPin className="w-10 h-10 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No hay direcciones guardadas
            </h3>
            <p className="text-gray-400 mb-6">
              Crea tu primera dirección para facilitar futuras compras
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewAddress}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-yellow-400/50"
            >
              Crear Primera Dirección
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black/95 backdrop-blur-2xl rounded-2xl p-6 max-w-md mx-4 border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                Eliminar Dirección
              </h3>
              <p className="text-gray-400 mb-6">
                ¿Estás seguro de que quieres eliminar esta dirección? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors border border-white/10 hover:border-white/20 rounded-lg hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteAddress(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddressSelector;
