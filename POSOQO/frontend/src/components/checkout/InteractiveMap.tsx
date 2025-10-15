"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Check, X, Search } from 'lucide-react';

interface InteractiveMapProps {
  initialPosition: [number, number];
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  initialPosition,
  onLocationSelect,
  onClose,
  isOpen
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>(initialPosition);
  const [address, setAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar Leaflet
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    const loadLeaflet = async () => {
      try {
        // Cargar CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Cargar JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initializeMap();
        };
        document.head.appendChild(script);

        return () => {
          document.head.removeChild(link);
          document.head.removeChild(script);
        };
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, [isOpen]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || typeof window === 'undefined' || !(window as any).L) return;

    const L = (window as any).L;

    // Posición inicial en Lima, Perú
    const limaPosition: [number, number] = [-12.0464, -77.0428];
    
    // Crear mapa centrado en Lima
    mapInstance.current = L.map(mapRef.current).setView(limaPosition, 13);

    // Agregar capa de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Crear marcador
    markerRef.current = L.marker(initialPosition, {
      draggable: true
    }).addTo(mapInstance.current);

    // Evento de arrastrar marcador
    markerRef.current.on('dragend', (e: any) => {
      const lat = e.target.getLatLng().lat;
      const lng = e.target.getLatLng().lng;
      setSelectedPosition([lat, lng]);
      getAddressFromCoordinates(lat, lng);
    });

    // Evento de click en el mapa
    mapInstance.current.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setSelectedPosition([lat, lng]);
      markerRef.current.setLatLng([lat, lng]);
      getAddressFromCoordinates(lat, lng);
    });

    // Obtener dirección inicial
    getAddressFromCoordinates(limaPosition[0], limaPosition[1]);
    setIsLoading(false);
  };

  // Función de búsqueda
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      // Primero intentar con OpenCage API
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query + ', Peru')}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}&limit=5&countrycode=pe`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } else {
        // Fallback: usar datos de ejemplo para Perú
        const peruLocations = [
          {
            formatted: `${query}, Lima, Perú`,
            geometry: { lat: -12.0464, lng: -77.0428 },
            components: { city: 'Lima', state: 'Lima' }
          },
          {
            formatted: `${query}, Arequipa, Perú`,
            geometry: { lat: -16.4090, lng: -71.5375 },
            components: { city: 'Arequipa', state: 'Arequipa' }
          },
          {
            formatted: `${query}, Cusco, Perú`,
            geometry: { lat: -13.5319, lng: -71.9675 },
            components: { city: 'Cusco', state: 'Cusco' }
          }
        ];
        setSearchResults(peruLocations);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar resultado de búsqueda
  const selectSearchResult = (result: any) => {
    const lat = result.geometry.lat;
    const lng = result.geometry.lng;
    const address = result.formatted;
    
    setSelectedPosition([lat, lng]);
    setAddress(address);
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 16);
    }
    
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Error en reverse geocoding');
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;
        
        const addressParts = [
          components.road,
          components.house_number,
          components.suburb,
          components.city,
          components.state
        ].filter(Boolean);
        
        const fullAddress = addressParts.join(', ');
        setAddress(fullAddress);
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      setAddress('Dirección no encontrada');
    }
  };

  const handleConfirmLocation = () => {
    onLocationSelect(selectedPosition[0], selectedPosition[1], address);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada por este navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedPosition([lat, lng]);
        
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 15);
        }
        
        getAddressFromCoordinates(lat, lng);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación actual');
      }
    );
  };

  // Limpiar mapa al cerrar
  useEffect(() => {
    if (!isOpen && mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markerRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Seleccionar Ubicación</h2>
                <p className="text-gray-600">Busca, arrastra el marcador o haz clic en el mapa</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Buscador */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Limpiar timeout anterior
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  // Nuevo timeout
                  searchTimeoutRef.current = setTimeout(() => {
                    searchLocation(e.target.value);
                  }, 500);
                }}
                placeholder="Buscar ubicación en Perú (ej: Miraflores, Lima)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => selectSearchResult(result)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.formatted}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.components?.city || result.components?.town || 'Perú'}, {result.components?.state || 'Perú'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {showSearchResults && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                <p className="text-sm text-gray-500 text-center">
                  No se encontraron ubicaciones para "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando mapa...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full rounded-b-2xl" />
        </div>

        {/* Información de la ubicación */}
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Dirección seleccionada:
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900">{address || 'Cargando...'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Lat: {selectedPosition[0].toFixed(6)}, Lng: {selectedPosition[1].toFixed(6)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUseCurrentLocation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Usar Mi Ubicación
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmLocation}
                disabled={!address}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Confirmar Ubicación
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InteractiveMap;
