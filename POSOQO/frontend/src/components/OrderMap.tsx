"use client";

import { useEffect, useRef } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface OrderMapProps {
  lat?: number;
  lng?: number;
  location?: string;
  orderId: string;
}

export default function OrderMap({ lat, lng, location, orderId }: OrderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Función para abrir Google Maps
  const openInGoogleMaps = () => {
    if (!lat || !lng) return;
    
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

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
      if (!mapRef.current || !lat || !lng) return;

      const L = (window as any).L;
      if (!L) return;

      // Destruir mapa anterior si existe
      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      // Crear nuevo mapa
      const map = L.map(mapRef.current).setView([lat, lng], 15);
      mapInstance.current = map;

      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Agregar marcador
      const marker = L.marker([lat, lng]).addTo(map);
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
  }, [lat, lng, location, orderId]);

  // Mostrar dirección de texto siempre que esté disponible
  const displayLocation = location || 'Ubicación no especificada';

  if (!lat || !lng) {
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