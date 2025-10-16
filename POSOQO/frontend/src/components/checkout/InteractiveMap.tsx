"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Check, X, Search } from 'lucide-react';

// Declarar L (Leaflet) para TypeScript
declare global {
  interface Window {
    L: any;
  }
}

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
  const [isHoveringResults, setIsHoveringResults] = useState(false);
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
      } catch (error) {
        console.error('Error cargando Leaflet:', error);
        setIsLoading(false);
      }
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current) return;

      const map = window.L.map(mapRef.current, {
        center: initialPosition,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      });

      // Agregar capa de tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Crear marcador personalizado
      const customIcon = window.L.divIcon({
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Crear marcador
      const marker = window.L.marker(initialPosition, {
        icon: customIcon,
        draggable: true
      }).addTo(map);

      // Evento de arrastre del marcador
      marker.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        setSelectedPosition([newPos.lat, newPos.lng]);
        getAddressFromCoordinates(newPos.lat, newPos.lng);
      });

      // Evento de clic en el mapa
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        setSelectedPosition([e.latlng.lat, e.latlng.lng]);
        getAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
      });

      mapInstance.current = map;
      markerRef.current = marker;
      setIsLoading(false);
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, initialPosition]);

  // Función de búsqueda SIMPLIFICADA
  const searchLocation = async (query: string) => {
    console.log('🔍 BÚSQUEDA INICIADA:', query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      console.log('🔍 Enviando petición para:', query);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/geocoding/search-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query + ', Peru',
          type: 'search'
        })
      });
      
      console.log('📡 Respuesta recibida:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📍 Datos completos:', data);
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const results = data.data.map((result: any) => ({
          formatted: result.display_name || 'Sin nombre',
          geometry: { 
            lat: parseFloat(result.lat) || 0, 
            lng: parseFloat(result.lon) || 0 
          },
          components: {
            city: result.address?.city || result.address?.town || 'Perú',
            state: result.address?.state || 'Perú',
            country: 'Perú'
          },
          source: 'nominatim',
          importance: result.importance || 0
        }));
        
        console.log('✅ Resultados procesados:', results.length);
        setSearchResults(results.slice(0, 10));
      } else {
        console.log('❌ No hay datos válidos en la respuesta');
        setSearchResults([]);
      }
      
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar resultado de búsqueda - VERSIÓN ULTRA SIMPLE
  const selectSearchResult = (result: any) => {
    console.log('🚀 CLIC DETECTADO! Resultado:', result);
    
    if (!result || !result.geometry) {
      console.log('❌ Resultado inválido');
      return;
    }
    
    const lat = result.geometry.lat;
    const lng = result.geometry.lng;
    const address = result.formatted || 'Dirección no disponible';
    
    console.log('📍 Coordenadas:', { lat, lng });
    console.log('📍 Dirección:', address);
    
    // Actualizar estado
    setSelectedPosition([lat, lng]);
    setAddress(address);
    
    // Actualizar marcador
    if (markerRef.current) {
      console.log('🎯 Actualizando marcador existente');
      markerRef.current.setLatLng([lat, lng]);
    } else if (mapInstance.current && window.L) {
      console.log('🎯 Creando nuevo marcador');
      const newMarker = window.L.marker([lat, lng], {
        draggable: true
      }).addTo(mapInstance.current);
      markerRef.current = newMarker;
    }
    
    // Centrar mapa
    if (mapInstance.current) {
      console.log('🗺️ Centrando mapa');
      mapInstance.current.setView([lat, lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
    
    // Cerrar dropdown
    setShowSearchResults(false);
    
    console.log('✅ SELECCIÓN COMPLETADA');
  };

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      console.log('🔄 Obteniendo dirección para:', { lat, lng });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/geocoding/reverse-geocoding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: lat.toString(),
          lng: lng.toString()
        })
      });

      if (!response.ok) {
        throw new Error('Error en reverse geocoding');
      }

      const data = await response.json();
      console.log('📍 Datos de geocoding:', data);
      
      if (data.success && data.data) {
        const address = data.data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(address);
        console.log('✅ Dirección actualizada:', address);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
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
        const { latitude, longitude } = position.coords;
        setSelectedPosition([latitude, longitude]);
        
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }
        
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 16);
        }
        
        getAddressFromCoordinates(latitude, longitude);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación actual');
      }
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Seleccionar Ubicación</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Búsqueda */}
          <div className="relative">
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
                  // Nuevo timeout - reducido para respuesta más rápida
                  searchTimeoutRef.current = setTimeout(() => {
                    searchLocation(e.target.value);
                  }, 300);
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
          </div>
        </div>

        {/* Dropdown de resultados - Fuera del header */}
        {showSearchResults && (
          <div 
            className="absolute top-full left-0 right-0 z-[99999] bg-white border border-gray-200 shadow-lg rounded-b-xl"
            onMouseEnter={() => setIsHoveringResults(true)}
            onMouseLeave={() => setIsHoveringResults(false)}
            onClick={(e) => {
              console.log('🖱️ CLIC EN DROPDOWN:', e.target);
              e.stopPropagation();
            }}
          >
            {/* Botón para cerrar */}
            <div className="flex justify-end p-2 border-b border-gray-200">
              <button
                onClick={() => setShowSearchResults(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {searchResults.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🖱️ MOUSEDOWN EN RESULTADO (NUEVO DEPLOY):', result);
                      selectSearchResult(result);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🖱️ CLIC EN RESULTADO:', result);
                      selectSearchResult(result);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🖱️ TOUCH EN RESULTADO:', result);
                      selectSearchResult(result);
                    }}
                    className="w-full px-6 py-4 text-left hover:bg-blue-100 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                    style={{ 
                      pointerEvents: 'auto', 
                      zIndex: 100000,
                      position: 'relative'
                    }}
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
                  </div>
                ))}
              </div>
            ) : searchQuery.trim() && !isSearching ? (
              <div className="px-6 py-4">
                <p className="text-sm text-gray-500 text-center">
                  No se encontraron ubicaciones para "{searchQuery}"
                </p>
              </div>
            ) : null}
          </div>
        )}

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
          
          {/* Estilos para el marcador personalizado */}
          <style jsx global>{`
            .custom-marker {
              background: transparent !important;
              border: none !important;
            }
            .custom-marker div {
              transition: all 0.2s ease;
            }
            .custom-marker:hover div {
              transform: scale(1.1);
            }
          `}</style>
        </div>

        {/* Información de la ubicación mejorada */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Ubicación Seleccionada</h3>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-900 text-sm break-words">
                    {address || 'Selecciona una ubicación en el mapa o busca una dirección'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {selectedPosition[0].toFixed(6)}, Lng: {selectedPosition[1].toFixed(6)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUseCurrentLocation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                <Navigation className="w-4 h-4" />
                Mi Ubicación
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmLocation}
                disabled={!address}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Check className="w-4 h-4" />
                Confirmar
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InteractiveMap;