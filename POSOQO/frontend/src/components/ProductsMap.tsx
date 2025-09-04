import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function ProductsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const [position, setPosition] = useState<[number, number]>(() => {
    // Cargar ubicación previa si existe
    const saved = localStorage.getItem("user_location");
    if (saved) {
      try {
        const [lat, lng] = JSON.parse(saved);
        return [lat, lng];
      } catch {}
    }
    // Centro de Perú por defecto
    return [-9.19, -75.0152];
  });

  useEffect(() => {
    if (!mapRef.current || map) return;
    const m = L.map(mapRef.current).setView(position, 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(m);
    const mk = L.marker(position, { draggable: true }).addTo(m);
    mk.on("dragend", function (e: L.LeafletEvent) {
      const latlng = mk.getLatLng();
      setPosition([latlng.lat, latlng.lng]);
      localStorage.setItem("user_location", JSON.stringify([latlng.lat, latlng.lng]));
    });
    setMap(m);
    setMarker(mk);
    // Cleanup
    return () => { m.remove(); };
  }, []);

  // Si cambia la posición, mueve el marcador
  useEffect(() => {
    if (marker) {
      marker.setLatLng(position);
    }
    if (map) {
      map.setView(position, map.getZoom());
    }
  }, [position]);

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: 350, borderRadius: 12, overflow: "hidden" }} />
      <div className="mt-2 text-sm text-gray-600">
        Latitud: {position[0].toFixed(5)}, Longitud: {position[1].toFixed(5)}
      </div>
    </div>
  );
} 