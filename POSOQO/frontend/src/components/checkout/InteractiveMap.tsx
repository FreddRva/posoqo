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

    // Crear marcador mejorado
    markerRef.current = L.marker(limaPosition, {
      draggable: true,
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div class="w-8 h-8 bg-blue-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform"><div class="w-3 h-3 bg-white rounded-full"></div></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).addTo(mapInstance.current);

    // Evento de arrastrar marcador mejorado
    markerRef.current.on('dragstart', () => {
      console.log('Iniciando arrastre del marcador');
    });

    markerRef.current.on('dragend', (e: any) => {
      const lat = e.target.getLatLng().lat;
      const lng = e.target.getLatLng().lng;
      console.log('Marcador arrastrado a:', { lat, lng });
      setSelectedPosition([lat, lng]);
      getAddressFromCoordinates(lat, lng);
    });

    // Evento de click en el mapa mejorado
    mapInstance.current.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      console.log('Clic en mapa:', { lat, lng });
      setSelectedPosition([lat, lng]);
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.update();
      }
      
      getAddressFromCoordinates(lat, lng);
    });

    // Obtener dirección inicial
    getAddressFromCoordinates(limaPosition[0], limaPosition[1]);
    setIsLoading(false);
  };

  // Función de búsqueda usando proxy del backend
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      console.log('🔍 Buscando:', query);
      
      // Usar proxy del backend para evitar CORS
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
      
      if (!response.ok) {
        throw new Error('Error en búsqueda');
      }
      
      const data = await response.json();
      console.log('📍 Resultados de búsqueda:', data);
      
      if (data.success && data.data) {
        const results = Array.isArray(data.data) ? data.data : [];
        
        const processedResults = results.map((result: any) => ({
          formatted: result.display_name,
          geometry: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
          components: {
            city: result.address?.city || result.address?.town || result.address?.village || result.address?.municipality,
            state: result.address?.state || result.address?.region,
            country: result.address?.country
          },
          source: 'nominatim',
          importance: result.importance || 0
        }));
        
        // Ordenar por importancia
        processedResults.sort((a: any, b: any) => (b.importance || 0) - (a.importance || 0));
        
        setSearchResults(processedResults.slice(0, 10));
      } else {
        setSearchResults([]);
      }
      
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar resultado de búsqueda mejorado
  const selectSearchResult = (result: any) => {
    console.log('🔍 Resultado seleccionado:', result);
    
    const lat = result.geometry.lat;
    const lng = result.geometry.lng;
    const address = result.formatted;
    
    console.log('📍 Coordenadas:', { lat, lng });
    console.log('📍 Dirección:', address);
    
    // Actualizar estado
    setSelectedPosition([lat, lng]);
    setAddress(address);
    
    // Actualizar marcador con delay para asegurar que el mapa esté listo
    setTimeout(() => {
      if (markerRef.current) {
        console.log('🎯 Actualizando marcador a:', [lat, lng]);
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.update();
      } else {
        console.warn('⚠️ Marcador no encontrado');
      }
      
      // Centrar mapa en la nueva ubicación
      if (mapInstance.current) {
        console.log('🗺️ Centrando mapa en:', [lat, lng]);
        mapInstance.current.setView([lat, lng], 16, {
          animate: true,
          duration: 1.5
        });
      } else {
        console.warn('⚠️ Mapa no encontrado');
      }
    }, 100);
    
    // Cerrar dropdown
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      console.log('🔄 Obteniendo dirección para:', { lat, lng });
      
      // Usar proxy del backend para evitar CORS
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/geocoding/reverse-geocoding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: lat.toString(),
          lng: lng.toString(),
          type: 'reverse'
        })
      });
      
      if (!response.ok) {
        throw new Error('Error en reverse geocoding');
      }
      
      const data = await response.json();
      console.log('📍 Datos de geocoding:', data);
      
      if (data.success && data.data && data.data.display_name) {
        setAddress(data.data.display_name);
        console.log('✅ Dirección actualizada:', data.data.display_name);
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
          </div>
        </div>

        {/* Dropdown de resultados - Fuera del header */}
        {showSearchResults && (
          <div className="relative z-[9999] bg-white border-b border-gray-200">
            {searchResults.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => selectSearchResult(result)}
                    className="w-full px-6 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
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
