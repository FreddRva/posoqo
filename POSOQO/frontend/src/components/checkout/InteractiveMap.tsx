"use client";

import React, { useEffect, useRef, useState } from 'react';
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

  // Cargar Leaflet de forma simple
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    const loadMap = async () => {
      try {
        // Cargar CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Cargar JS
        if (!window.L) {
          await import('leaflet');
        }

        // Inicializar mapa
        const map = window.L.map(mapRef.current!, {
          center: initialPosition,
          zoom: 13
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Crear marcador
        const marker = window.L.marker(initialPosition, {
          draggable: true
        }).addTo(map);

        // Eventos
        marker.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          setSelectedPosition([pos.lat, pos.lng]);
          getAddressFromCoordinates(pos.lat, pos.lng);
        });

        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          setSelectedPosition([e.latlng.lat, e.latlng.lng]);
          getAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
        });

        mapInstance.current = map;
        markerRef.current = marker;
        setIsLoading(false);

      } catch (error) {
        console.error('Error cargando mapa:', error);
        setIsLoading(false);
      }
    };

    loadMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, initialPosition]);

  // Búsqueda simple
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/geocoding/search-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query + ', Peru' })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setSearchResults(data.data.slice(0, 5));
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

  // Seleccionar resultado
  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setSelectedPosition([lat, lng]);
      setAddress(result.display_name || 'Dirección no disponible');
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      
      if (mapInstance.current) {
        mapInstance.current.setView([lat, lng], 16);
      }
    }
    
    setShowSearchResults(false);
  };

  // Obtener dirección
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/geocoding/reverse-geocoding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: lat.toString(), lng: lng.toString() })
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setAddress(data.data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedPosition[0], selectedPosition[1], address);
    onClose();
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    
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
      (error) => console.error('Error:', error)
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
        className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Seleccionar Ubicación</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          {/* Búsqueda */}
          <div className="relative z-50">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const timeout = setTimeout(() => searchLocation(e.target.value), 500);
                return () => clearTimeout(timeout);
              }}
              placeholder="Buscar ubicación..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Resultados de búsqueda - FUERA del header */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="relative z-[9999] bg-white border border-gray-200 shadow-lg rounded-b-xl max-h-60 overflow-y-auto mx-6 -mt-2">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => selectResult(result)}
                className="px-6 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {result.display_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ubicación Seleccionada</h3>
              <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                {address || 'Selecciona una ubicación en el mapa'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCurrentLocation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Mi Ubicación
              </button>
              
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InteractiveMap;