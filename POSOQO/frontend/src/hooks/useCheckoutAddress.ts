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
          saveAddressToLocalStorage();
        }
      }
    } catch (error) {
      console.error('Error al obtener dirección desde coordenadas:', error);
    }
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
    fetchAddressFromCoordinates
  };
};
