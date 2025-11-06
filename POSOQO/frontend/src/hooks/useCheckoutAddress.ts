// hooks/useCheckoutAddress.ts
import { useState, useEffect, useRef } from 'react';
import { AddressData } from '@/types/checkout';

export const useCheckoutAddress = () => {
  const [address, setAddress] = useState("");
  const [addressRef, setAddressRef] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [location, setLocation] = useState("");
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([-9.19, -75.0152]);
  const [isClient, setIsClient] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Verificar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Construir la ubicación a partir de los datos del perfil
  useEffect(() => {
    if (!isClient) return;
    
    const fullAddress = `${address || ''}${address && (addressRef || streetNumber) ? ', ' : ''}${addressRef || ''}${addressRef && streetNumber ? ' ' : ''}${streetNumber || ''}`.trim();
    if (fullAddress) {
      setLocation(fullAddress);
    }
  }, [address, addressRef, streetNumber, isClient]);

  // Cargar datos de dirección desde localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const storedAddress = localStorage.getItem("userAddress");
    if (storedAddress) {
      try {
        const addressData = JSON.parse(storedAddress);
        setAddress(addressData.address || "");
        setAddressRef(addressData.addressRef || "");
        setStreetNumber(addressData.streetNumber || "");
        if (addressData.lat && addressData.lng) {
          setMarkerPosition([addressData.lat, addressData.lng]);
        }
      } catch (error) {
        console.error("Error loading address from localStorage:", error);
      }
    }
  }, [isClient]);

  // Guardar datos de dirección en localStorage
  const saveAddressToLocalStorage = () => {
    if (!isClient) return;
    
    const addressData = {
      address,
      addressRef,
      streetNumber,
      lat: markerPosition[0],
      lng: markerPosition[1]
    };
    
    localStorage.setItem("userAddress", JSON.stringify(addressData));
  };

  // Obtener dirección desde coordenadas (reverse geocoding)
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Primero intentar con el backend
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com';
      apiUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
      
      try {
        const response = await fetch(`${apiUrl}/api/geocoding/reverse-geocoding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: lat.toString(), lng: lng.toString() })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const fullAddress = data.data.display_name || data.data.address || '';
            if (fullAddress) {
              setAddress(fullAddress);
              setLocation(fullAddress);
              setMarkerPosition([lat, lng]);
              saveAddressToLocalStorage();
              return;
            }
          }
        }
      } catch (backendError) {
        console.log('Backend geocoding failed, trying OpenCage...');
      }

      // Fallback a OpenCage si el backend falla
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
        
        if (fullAddress) {
          setAddress(fullAddress);
          setLocation(fullAddress);
          setMarkerPosition([lat, lng]);
          saveAddressToLocalStorage();
        }
      }
    } catch (error) {
      console.error('Error al obtener dirección desde coordenadas:', error);
      throw error;
    }
  };

  // Obtener ubicación actual usando GPS
  const getCurrentLocation = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        alert('Tu navegador no soporta geolocalización');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await getAddressFromCoordinates(latitude, longitude);
            resolve(true);
          } catch (error) {
            console.error('Error obteniendo dirección:', error);
            alert('Error al obtener la dirección. Por favor, selecciona tu ubicación en el mapa.');
            resolve(false);
          }
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          let errorMessage = 'Error al obtener tu ubicación. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Por favor, permite el acceso a tu ubicación en la configuración del navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'La información de ubicación no está disponible.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Tiempo de espera agotado. Por favor, intenta de nuevo.';
              break;
            default:
              errorMessage += 'Error desconocido.';
              break;
          }
          alert(errorMessage);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const addressData: AddressData = {
    address,
    addressRef,
    streetNumber,
    lat: markerPosition[0],
    lng: markerPosition[1]
  };

  const fetchAddressFromCoordinates = getAddressFromCoordinates;

  return {
    address,
    setAddress,
    addressRef,
    setAddressRef,
    streetNumber,
    setStreetNumber,
    location,
    setLocation,
    markerPosition,
    setMarkerPosition,
    isClient,
    addressInputRef,
    addressData,
    saveAddressToLocalStorage,
    getAddressFromCoordinates,
    fetchAddressFromCoordinates,
    getCurrentLocation
  };
};
