"use client";

import { useEffect, useRef } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface OrderMapProps {
  lat?: number | string;
  lng?: number | string;
  location?: string;
  orderId: string;
}

export default function OrderMap({ lat, lng, location, orderId }: OrderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Convertir coordenadas a números y validar
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
  const hasValidCoords = latNum !== undefined && lngNum !== undefined && 
                        latNum !== null && lngNum !== null &&
                        !isNaN(latNum) && !isNaN(lngNum) &&
                        latNum !== 0 && lngNum !== 0;


  // Función para abrir Google Maps
  const openInGoogleMaps = () => {
    if (!hasValidCoords) return;
    
    const googleMapsUrl = `https://www.google.com/maps?q=${latNum},${lngNum}`;
    window.open(googleMapsUrl, '_blank');
  };

  useEffect(() => {
    if (!mapRef.current || !hasValidCoords) return;

    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      // Verificar si Leaflet ya está cargado
      if (typeof window !== 'undefined' && (window as any).L) {
        createMap();
        return;
      }

      // Cargar CSS de Leaflet
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Cargar JavaScript de Leaflet
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = createMap;
      document.head.appendChild(script);
    };

    const createMap = () => {
      if (!mapRef.current || !hasValidCoords) return;

      const L = (window as any).L;
      if (!L) return;

      // Destruir mapa anterior si existe
      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      // Crear nuevo mapa
      const map = L.map(mapRef.current).setView([latNum, lngNum], 15);
      mapInstance.current = map;

      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Agregar marcador
      const marker = L.marker([latNum, lngNum]).addTo(map);
      marker.bindPopup(`
        <div class="text-center">
          <strong>Pedido #${orderId.slice(-8)}</strong><br>
          <small>${location || 'Ubicación seleccionada'}</small>
        </div>
      `);

      // Ajustar vista para mostrar el marcador
      map.fitBounds(marker.getLatLng().toBounds(100));
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, [latNum, lngNum, location, orderId, hasValidCoords]);

  // Mostrar dirección de texto siempre que esté disponible
  const displayLocation = location || 'Ubicación no especificada';

  if (!hasValidCoords) {
    return (
      <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-stone-400" />
            <div className="text-stone-600 text-sm font-medium">
              {displayLocation}
            </div>
          </div>
          <div className="text-stone-400 text-xs">
            Sin coordenadas
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-stone-400" />
          <div className="text-stone-600 text-sm font-medium">
            {displayLocation}
          </div>
        </div>
        <button
          onClick={openInGoogleMaps}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 shadow-sm"
          title="Abrir en Google Maps"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Ver en Maps</span>
        </button>
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-32 rounded-lg border border-stone-200 shadow-sm cursor-pointer"
        style={{ minHeight: '128px' }}
        onClick={openInGoogleMaps}
        title="Hacer clic para abrir en Google Maps"
      />
    </div>
  );
} 