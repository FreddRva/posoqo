import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CheckoutMapProps {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}

export default function CheckoutMap({ position, onChange }: CheckoutMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mountedRef = useRef(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const suggestionTimeout = useRef<NodeJS.Timeout | null>(null);

  // Coordenadas aproximadas del centro de Perú
  const PERU_CENTER: [number, number] = [-9.19, -75.0152];
  // Límites aproximados de Perú
  const PERU_BOUNDS = L.latLngBounds([
    [-18.35, -81.35], // Suroeste
    [-0.04, -68.65],  // Noreste
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstance.current) return;
    mountedRef.current = true;
    const map = L.map(mapRef.current, {
      center: position || PERU_CENTER,
      zoom: 6,
      maxBounds: PERU_BOUNDS,
      maxBoundsViscosity: 1.0,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    const marker = L.marker(position || PERU_CENTER, { draggable: true }).addTo(map);
    marker.on("dragend", function () {
      const latlng = marker.getLatLng();
      onChange(latlng.lat, latlng.lng);
    });
    // Permitir seleccionar ubicación haciendo clic en el mapa
    map.on("click", function (e: L.LeafletMouseEvent) {
      marker.setLatLng(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
    });
    mapInstance.current = map;
    markerRef.current = marker;
    return () => {
      mountedRef.current = false;
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !markerRef.current ||
      !mapInstance.current ||
      !mapRef.current ||
      !mountedRef.current
    ) return;
    try {
      markerRef.current.setLatLng(position);
      mapInstance.current.setView(position, mapInstance.current.getZoom());
    } catch (e) {
      // Silenciar errores si el mapa no está listo
    }
  }, [position]);

  // Autocompletado de direcciones con Nominatim
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSuggestionLoading(true);
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    suggestionTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/geocoding/search?q=${encodeURIComponent(search)}`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setSuggestionLoading(false);
    }, 400); // Espera 400ms después de dejar de escribir
    return () => {
      if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    };
  }, [search]);

  // Buscar dirección con Nominatim (por si el usuario presiona Buscar)
  const handleSearch = async () => {
    setSearchError(null);
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/geocoding/search?q=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        if (!isNaN(latNum) && !isNaN(lonNum)) {
          onChange(latNum, lonNum);
          if (mapInstance.current) {
            mapInstance.current.setView([latNum, lonNum], 16);
          }
        }
      } else {
        setSearchError("No se encontró la dirección.");
      }
    } catch (err) {
      setSearchError("Error al buscar la dirección.");
    }
    setSearching(false);
  };

  // Cuando el usuario selecciona una sugerencia
  const handleSuggestionClick = (s: any) => {
    setShowSuggestions(false);
    setSearch(s.display_name);
    const latNum = parseFloat(s.lat);
    const lonNum = parseFloat(s.lon);
    if (!isNaN(latNum) && !isNaN(lonNum)) {
      onChange(latNum, lonNum);
      if (mapInstance.current) {
        mapInstance.current.setView([latNum, lonNum], 16);
      }
    }
  };

  // Helper para separar el nombre principal y el resto
  function parseDisplayName(displayName: string) {
    // Normalmente el display_name viene como "Principal, resto, resto..."
    const [main, ...rest] = displayName.split(",");
    return {
      main: main.trim(),
      rest: rest.join(",").trim(),
    };
  }

  if (typeof window === "undefined") return null;

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="mb-2 flex gap-2 relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar dirección en Perú..."
          className="flex-1 px-3 py-2 rounded border border-yellow-400/40 bg-stone-900/40 text-yellow-100 focus:border-yellow-400 focus:ring-yellow-400 outline-none"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          autoComplete="off"
        />
        <button
          type="button"
          disabled={searching}
          onClick={handleSearch}
          className="px-4 py-2 rounded bg-yellow-400 text-stone-900 font-bold hover:bg-yellow-300 transition-colors"
        >
          {searching ? "Buscando..." : "Buscar"}
        </button>
      </div>
      {/* Dropdown fuera del mapa para que siempre quede arriba */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="absolute z-[9999] left-0 right-0 bg-stone-900 border border-yellow-400/40 rounded mt-1 max-h-60 overflow-auto text-yellow-100 shadow-2xl"
          style={{ top: 54 }} // altura del input + margen
        >
          {suggestionLoading && (
            <li className="px-4 py-2 text-sm text-gray-400">Cargando...</li>
          )}
          {suggestions.map((s, idx) => {
            const { main, rest } = parseDisplayName(s.display_name);
            return (
              <li
                key={s.place_id || idx}
                className="flex items-start gap-3 px-4 py-2 cursor-pointer hover:bg-yellow-400/10 border-b border-yellow-400/10 last:border-b-0"
                onClick={() => handleSuggestionClick(s)}
              >
                {/* Icono de ubicación SVG */}
                <span className="mt-1">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-yellow-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21c-4.418 0-8-5.373-8-10a8 8 0 1116 0c0 4.627-3.582 10-8 10z" /><circle cx="12" cy="11" r="3" fill="currentColor" className="text-yellow-400" /></svg>
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold text-yellow-100 text-base">{main}</span>
                  {rest && <span className="text-xs text-gray-400">{rest}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {searchError && <div className="text-red-400 text-sm mb-2">{searchError}</div>}
      <div ref={mapRef} style={{ width: "100%", height: 250, borderRadius: 12, overflow: "hidden" }} />
    </div>
  );
} 