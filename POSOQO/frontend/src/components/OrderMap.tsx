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

  // Convertir coordenadas a números
  let latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  let lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
  
  // Si las coordenadas son 0,0 pero la location contiene coordenadas, extraerlas
  if ((latNum === 0 && lngNum === 0) && location) {
    const coordMatch = location.match(/Lat:\s*(-?\d+\.?\d*),\s*Lng:\s*(-?\d+\.?\d*)/i);
    if (coordMatch) {
      latNum = parseFloat(coordMatch[1]);
      lngNum = parseFloat(coordMatch[2]);
    }
  }
  
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
          <small>${location || 'Ubicación seleccionada'}</small><br>
          <button onclick="window.open('https://www.google.com/maps?q=${latNum},${lngNum}', '_blank')" style="background: #3b82f6; color: white; padding: 4px 8px; border: none; border-radius: 4px; font-size: 12px; margin-top: 4px; cursor: pointer;">Ver en Google Maps</button>
        </div>
      `);

      // Agregar evento de clic al mapa completo
      map.on('click', () => {
        openInGoogleMaps();
      });

      // Agregar evento de clic al marcador
      marker.on('click', () => {
        openInGoogleMaps();
      });

      // Ajustar vista para mostrar el marcador
      map.setView([latNum, lngNum], 15);
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
        className="w-full h-32 rounded-lg border-2 border-stone-300 hover:border-blue-400 shadow-sm cursor-pointer transition-all duration-200 relative group"
        style={{ minHeight: '128px' }}
        onClick={openInGoogleMaps}
        title="Hacer clic para abrir en Google Maps"
      >
        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none flex items-center justify-center">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg">
            Clic para abrir en Google Maps
          </div>
        </div>
      </div>
    </div>
  );
} 