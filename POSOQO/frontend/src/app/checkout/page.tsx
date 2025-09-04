"use client";
import { useEffect, useState, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import StripeElementsForm from "./StripeElementsForm";
import Script from "next/script";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CreditCard, Package, MapPin, User, Phone, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface Profile {
  name?: string;
  last_name?: string;
  dni?: string;
  phone?: string;
  address?: string;
  addressRef?: string;
  streetNumber?: string;
  lat?: number;
  lng?: number;
}

const CheckoutMap = dynamic(() => import("@/components/CheckoutMap"), { ssr: false });

export default function CheckoutPage() {
  const { data: session, status } = useSession();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", last_name: "", dni: "", phone: "" });
  const [address, setAddress] = useState("");
  const [addressRef, setAddressRef] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const addressInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([-9.19, -75.0152]); // valor por defecto
  const [showMapModal, setShowMapModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Verificar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  const profileComplete = useMemo(() => {
    if (!isClient) return false;
    
    // Verificar si tenemos datos básicos del perfil
    const hasBasicData = profile && 
      profile.name && 
      profile.last_name && 
      profile.dni && 
      profile.phone;
    
    console.log("🔍 [CHECKOUT] Profile complete calculation:", {
      hasBasicData,
      profile: profile ? {
        name: profile.name,
        last_name: profile.last_name,
        dni: profile.dni,
        phone: profile.phone,
        address: profile.address,
        addressRef: profile.addressRef,
        streetNumber: profile.streetNumber
      } : null,
      profileExists: !!profile,
      nameExists: !!(profile?.name),
      lastNameExists: !!(profile?.last_name),
      dniExists: !!(profile?.dni),
      phoneExists: !!(profile?.phone)
    });
    
    // Considerar completo si tenemos datos básicos
    return hasBasicData;
  }, [profile, isClient]);
  

  const [editingProfile, setEditingProfile] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Construir la ubicación a partir de los datos del perfil
  useEffect(() => {
    let fullAddress = '';
    
    // Intentar construir la dirección desde el perfil
    if (profile?.address || profile?.addressRef || profile?.streetNumber) {
      fullAddress = `${profile.address || ''}${profile.address && (profile.addressRef || profile.streetNumber) ? ', ' : ''}${profile.addressRef || ''}${profile.addressRef && profile.streetNumber ? ' ' : ''}${profile.streetNumber || ''}`.trim();
    }
    
    // Si no hay dirección en el perfil, intentar desde localStorage
    if (!fullAddress) {
      try {
        const storedAddress = localStorage.getItem("userAddress");
        if (storedAddress) {
          const addressData = JSON.parse(storedAddress);
          if (addressData.address || addressData.addressRef || addressData.streetNumber) {
            fullAddress = `${addressData.address || ''}${addressData.address && (addressData.addressRef || addressData.streetNumber) ? ', ' : ''}${addressData.addressRef || ''}${addressData.addressRef && addressData.streetNumber ? ' ' : ''}${addressData.streetNumber || ''}`.trim();
          }
        }
      } catch (error) {
        console.error("Error reading address from localStorage:", error);
      }
    }
    
    // Solo actualizar location si tenemos una dirección válida
    if (fullAddress) {
      setLocation(fullAddress);
    }
  }, [profile]);

  // Eliminar el efecto que lee localStorage para la ubicación

  useEffect(() => {
    if (!isClient) return;
    
    const stored = localStorage.getItem("cart");
    setCart(stored ? JSON.parse(stored) : []);
    
    // Cargar datos de dirección desde localStorage
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

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      signIn(undefined, { callbackUrl: "/checkout" });
      return;
    }
    if (status === "authenticated" && session?.accessToken) {
      console.log("🔄 [CHECKOUT] Cargando perfil...");
      apiFetch("/profile", { authToken: session.accessToken })
        .then(p => {
          const profile = p as Profile;
          console.log("🚀 [CHECKOUT] Profile loaded:", profile);
          console.log("🚀 [CHECKOUT] Profile complete check:", {
            name: !!profile.name,
            last_name: !!profile.last_name,
            dni: !!profile.dni,
            phone: !!profile.phone,
            complete: !!(profile.name && profile.last_name && profile.dni && profile.phone)
          });
          console.log("🚀 [CHECKOUT] Profile values:", {
            name: profile.name,
            last_name: profile.last_name,
            dni: profile.dni,
            phone: profile.phone
          });
          console.log("🚀 [CHECKOUT] Profile raw data:", JSON.stringify(profile, null, 2));
          setProfile(profile);
          setProfileForm({
            name: profile.name || "",
            last_name: profile.last_name || "",
            dni: profile.dni || "",
            phone: profile.phone || "",
          });
          // Si el perfil ya tiene dirección, cargarla en el estado
          if (profile.address) {
            setAddress(profile.address);
          }
          if (profile.addressRef) {
            setAddressRef(profile.addressRef);
          }
          if (profile.streetNumber) {
            setStreetNumber(profile.streetNumber);
          }
          if (profile.lat && profile.lng) {
            setMarkerPosition([profile.lat, profile.lng]);
          }
        })
        .catch((error) => {
          console.error("Error cargando perfil:", error);
          setError("No se pudo cargar el perfil");
        })
        .finally(() => setLoading(false));
    } else if (status === "authenticated" && !session?.accessToken) {
      // Si está autenticado pero no tiene token, establecer loading en false
      setLoading(false);
    }
  }, [status, session?.accessToken]);

  // 1. Eliminar Script de Google Maps y Autocomplete
  // 2. Reemplazar reverse geocoding por Nominatim

  async function updateAddressFromCoords(lat: number, lng: number) {
    try {
      // Usar nuestro proxy del backend para reverse geocoding
      const res = await fetch(`http://localhost:4000/api/geocoding/reverse?lat=${lat}&lon=${lng}`);
      if (!res.ok) {
        console.error('Error en reverse geocoding:', res.status);
        return;
      }
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error al obtener dirección desde coordenadas:', error);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400/30 border-t-amber-400"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 animate-ping"></div>
        </div>
        <p className="text-amber-100 text-lg mt-6 font-medium">Cargando checkout...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-600/30 max-w-md">
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <User className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Necesitas iniciar sesión</h2>
          <p className="text-slate-400 mb-8">Para continuar con el checkout, debes iniciar sesión.</p>
          <motion.button
          onClick={() => signIn(undefined, { callbackUrl: "/checkout" })}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          Iniciar sesión
          </motion.button>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && !session?.accessToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-600/30 max-w-md">
          <div className="p-4 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Error de autenticación</h2>
          <p className="text-slate-400 mb-8">Tu sesión ha expirado. Por favor, inicia sesión nuevamente.</p>
          <motion.button
          onClick={() => signIn(undefined, { callbackUrl: "/checkout" })}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          Iniciar sesión
          </motion.button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-600/30 max-w-md">
          <div className="p-4 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Tu carrito está vacío</h2>
          <p className="text-slate-400 mb-8">Agrega productos a tu carrito para continuar.</p>
          <motion.button
            onClick={() => router.push("/products")}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explorar productos
          </motion.button>
        </div>
      </div>
    );
  }

  const profileIncomplete = !profile?.name || !profile?.last_name || !profile?.dni || !profile?.phone;

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/checkout" });
      setSaving(false);
      return;
    }
    if (status === "authenticated" && !session?.accessToken) {
      setSaving(false);
      return;
    }
    // Validación frontend
    if (
      profileForm.last_name.trim().length < 2 ||
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(profileForm.last_name.trim()) ||
      profileForm.dni.trim().length < 8 ||
      profileForm.dni.trim().length > 12 ||
      profileForm.phone.trim().length < 6 ||
      profileForm.phone.trim().length > 20
    ) {
      setError("Completa todos los campos correctamente. Apellido: solo letras (2-50), DNI: 8-12 dígitos, Teléfono: 6-20 dígitos.");
      setSaving(false);
      return;
    }
    
    // Verificar si los datos son diferentes a los existentes
    const hasChanges = 
      profileForm.name !== profile?.name ||
      profileForm.last_name !== profile?.last_name ||
      profileForm.dni !== profile?.dni ||
      profileForm.phone !== profile?.phone ||
      address !== profile?.address ||
      addressRef !== profile?.addressRef ||
      streetNumber !== profile?.streetNumber ||
      markerPosition[0] !== profile?.lat ||
      markerPosition[1] !== profile?.lng;
    
    if (!hasChanges) {
      // No hay cambios, recargar el perfil desde la API para asegurar que los datos estén actualizados
      try {
        const refreshedProfile = await apiFetch("/profile", { authToken: session?.accessToken }) as Profile;
        console.log("🔄 [CHECKOUT] Profile refreshed from API (no changes):", refreshedProfile);
        setProfile(refreshedProfile);
        
        // Actualizar también el profileForm con los datos recargados
        setProfileForm({
          name: refreshedProfile.name || "",
          last_name: refreshedProfile.last_name || "",
          dni: refreshedProfile.dni || "",
          phone: refreshedProfile.phone || "",
        });
      } catch (error) {
        console.error("Error refreshing profile:", error);
        // Si falla la recarga, usar los datos locales
        const updatedProfile = { ...profile, ...profileForm, address, addressRef, streetNumber, lat: markerPosition[0], lng: markerPosition[1] };
        setProfile(updatedProfile);
      }
      
      setSaving(false);
      return;
    }
    
    try {
      // Preparar datos para enviar, incluyendo coordenadas solo si son válidas
      const profileData: any = {
        ...profileForm, // name, last_name, dni, phone
        address,
        addressRef,
        streetNumber,
      };
      
      // Solo incluir coordenadas si son números válidos y no son los valores por defecto
      if (typeof markerPosition[0] === 'number' && typeof markerPosition[1] === 'number' && 
          !isNaN(markerPosition[0]) && !isNaN(markerPosition[1]) &&
          (markerPosition[0] !== -9.19 || markerPosition[1] !== -75.0152)) {
        profileData.lat = markerPosition[0];
        profileData.lng = markerPosition[1];
      }

      console.log("🚀 [FRONTEND] Enviando datos de perfil:", profileData);
      console.log("🚀 [FRONTEND] Token de sesión:", session?.accessToken ? "Presente" : "Ausente");
      console.log("🚀 [FRONTEND] URL de la petición: /api/profile");

      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
        authToken: session?.accessToken,
      });
      
      // Guardar datos de dirección en localStorage para persistencia
      const addressData = {
        address,
        addressRef,
        streetNumber,
        lat: markerPosition[0],
        lng: markerPosition[1]
      };
      localStorage.setItem('userAddress', JSON.stringify(addressData));
      
      // Recargar el perfil desde la API para asegurar que los datos estén actualizados
      try {
        const refreshedProfile = await apiFetch("/profile", { authToken: session?.accessToken }) as Profile;
        console.log("🔄 [CHECKOUT] Profile refreshed from API after update:", refreshedProfile);
        setProfile(refreshedProfile);
        
        // Actualizar también el profileForm con los datos recargados
        setProfileForm({
          name: refreshedProfile.name || "",
          last_name: refreshedProfile.last_name || "",
          dni: refreshedProfile.dni || "",
          phone: refreshedProfile.phone || "",
        });
      } catch (error) {
        console.error("Error refreshing profile after update:", error);
        // Si falla la recarga, usar los datos locales
      const updatedProfile = { 
        ...profile, 
        ...profileForm, 
        address, 
        addressRef, 
        streetNumber, 
        lat: markerPosition[0], 
        lng: markerPosition[1] 
      };
      setProfile(updatedProfile);
      }
      
      console.log("✅ [CHECKOUT] Profile updated successfully");
      
      // Mostrar mensaje de éxito temporal
      setError(null);
      setSuccess(profileComplete ? "¡Datos actualizados correctamente!" : "¡Datos guardados correctamente!");
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Si es la primera vez guardando, continuar al siguiente paso después de un delay
      if (!profileComplete) {
        setTimeout(() => {
          setStep(2);
        }, 2000); // Dar tiempo para que el usuario vea el mensaje de éxito
      } else {
        // Si es actualización, cerrar el modo edición después de un delay
        setTimeout(() => {
          setEditingProfile(false);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err?.error || "Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  }

  async function handleOrder() {
    setSaving(true);
    setError(null);
    try {
      // Construir la ubicación actualizada antes de enviar el pedido
      let currentLocation = location;
      
      // Si no hay ubicación en el estado, intentar construirla desde los datos actuales
      if (!currentLocation || currentLocation === 'Ubicación no especificada') {
        const addressParts = [];
        if (address) addressParts.push(address);
        if (addressRef) addressParts.push(addressRef);
        if (streetNumber) addressParts.push(`N° ${streetNumber}`);
        
        if (addressParts.length > 0) {
          currentLocation = addressParts.join(', ');
        } else {
          // Intentar obtener desde localStorage como respaldo
          try {
            const storedAddress = localStorage.getItem('userAddress');
            if (storedAddress) {
              const addressData = JSON.parse(storedAddress);
              const parts = [];
              if (addressData.address) parts.push(addressData.address);
              if (addressData.addressRef) parts.push(addressData.addressRef);
              if (addressData.streetNumber) parts.push(`N° ${addressData.streetNumber}`);
              if (parts.length > 0) {
                currentLocation = parts.join(', ');
              }
            }
          } catch (error) {
            console.error("Error reading address from localStorage:", error);
          }
        }
      }
      
      // Si aún no hay ubicación, usar un valor por defecto
      if (!currentLocation || currentLocation === 'Ubicación no especificada') {
        currentLocation = 'Dirección del cliente';
      }
      
      console.log("📍 [ORDER] Ubicación para el pedido:", currentLocation);
      
      await apiFetch("/protected/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
          location: currentLocation,
        }),
        authToken: session?.accessToken,
      });
      localStorage.removeItem("cart");
      router.push("/profile");
    } catch (err: any) {
      setError(err?.error || "Error al crear pedido");
    } finally {
      setSaving(false);
    }
  }

  async function handleStripePay() {
    setSaving(true);
    setError(null);
    try {
      // Construir la ubicación actualizada antes de enviar el pedido
      let currentLocation = location;
      
      // Si no hay ubicación en el estado, intentar construirla desde los datos actuales
      if (!currentLocation || currentLocation === 'Ubicación no especificada') {
        const addressParts = [];
        if (address) addressParts.push(address);
        if (addressRef) addressParts.push(addressRef);
        if (streetNumber) addressParts.push(`N° ${streetNumber}`);
        
        if (addressParts.length > 0) {
          currentLocation = addressParts.join(', ');
        } else {
          // Intentar obtener desde localStorage como respaldo
          try {
            const storedAddress = localStorage.getItem('userAddress');
            if (storedAddress) {
              const addressData = JSON.parse(storedAddress);
              const parts = [];
              if (addressData.address) parts.push(addressData.address);
              if (addressData.addressRef) parts.push(addressData.addressRef);
              if (addressData.streetNumber) parts.push(`N° ${addressData.streetNumber}`);
              if (parts.length > 0) {
                currentLocation = parts.join(', ');
              }
            }
          } catch (error) {
            console.error("Error reading address from localStorage:", error);
          }
        }
      }
      
      // Si aún no hay ubicación, usar un valor por defecto
      if (!currentLocation || currentLocation === 'Ubicación no especificada') {
        currentLocation = 'Dirección del cliente';
      }
      
      console.log("📍 [STRIPE] Ubicación para el pedido:", currentLocation);
      
      // 1. Crear el pedido y obtener el order_id
      const orderRes = await apiFetch<{ message: string; order_id: string }>("/protected/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
          location: currentLocation,
        }),
        authToken: session?.accessToken,
      });
      const orderId = orderRes.order_id;
      // 2. Llamar al endpoint de pago con Stripe
      const payRes = await apiFetch<{ url: string }>("/pay", {
        method: "POST",
        body: JSON.stringify({
          type: "order",
          id: orderId,
          amount: total,
        }),
        authToken: session?.accessToken,
      });
      // 3. Redirigir a Stripe Checkout
      window.location.href = payRes.url;
    } catch (err: any) {
      setError(err?.error || err?.message || "Error al procesar pago con Stripe");
    } finally {
      setSaving(false);
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado profesional */}
        <div className="flex items-center justify-between mb-12">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors duration-300 font-medium"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </motion.button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30">
              <CreditCard className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Finalizar Compra</h1>
              <p className="text-slate-400 text-sm">Paso {step} de 2</p>
            </div>
          </div>
          
          <div className="w-24"></div> {/* Espaciador */}
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumen de compra */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-700/70 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/30">
                  <Package className="w-6 h-6 text-amber-400" />
          </div>
                <h2 className="text-xl font-bold text-slate-100">Resumen de compra</h2>
          </div>
              
              {/* Lista de productos */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
            {cart.map(item => (
                  <div key={`summary-${item.id}`} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/20">
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      item.image_url
                        ? (item.image_url.startsWith('http')
                            ? item.image_url
                            : `http://localhost:4000${item.image_url}`)
                        : "/file.svg"
                    }
                    alt={item.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { 
                          (e.target as HTMLImageElement).src = '/file.svg'; 
                        }}
                  />
                </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-100 font-medium truncate">{item.name}</div>
                      <div className="text-slate-400 text-sm">Cantidad: {item.quantity}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-slate-100 font-bold">S/ {(item.price * item.quantity).toFixed(2)}</div>
                      <div className="text-slate-400 text-xs">S/ {item.price.toFixed(2)} c/u</div>
                    </div>
              </div>
            ))}
          </div>

              {/* Totales */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Subtotal:</span>
                  <span className="text-slate-100 font-medium">S/ {total.toFixed(2)}</span>
        </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Envío:</span>
                  <span className="text-green-400 font-semibold">Gratis</span>
                  </div>
                <div className="border-t border-slate-600/30 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-100">Total:</span>
                    <span className="text-2xl font-extrabold text-green-400">
                      S/ {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg p-4 border border-amber-400/20">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Envío gratuito
                </div>
                <p className="text-slate-400 text-xs">
                  Tu pedido será entregado en 24-48 horas en Ayacucho
                </p>
              </div>
            </div>
          </div>

          {/* Formulario de pago y datos */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {profileComplete && !editingProfile ? (
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-100">Datos de entrega confirmados</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {(() => {
                          console.log("🔍 [CHECKOUT] Rendering profile display with data:", {
                            name: profile?.name,
                            last_name: profile?.last_name,
                            dni: profile?.dni,
                            phone: profile?.phone,
                            fullProfile: profile
                          });
                          return null;
                        })()}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 text-sm">Nombre completo:</span>
                          </div>
                          <div className="text-slate-100 font-medium">{profile?.name || ""} {profile?.last_name || ""}</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 text-sm">DNI:</span>
                          </div>
                          <div className="text-slate-100 font-medium">{profile?.dni || "No especificado"}</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 text-sm">Teléfono:</span>
                          </div>
                          <div className="text-slate-100 font-medium">{profile?.phone || "No especificado"}</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 text-sm">Dirección:</span>
                          </div>
                          <div className="text-slate-100 font-medium">
                            {profile?.address || profile?.addressRef || profile?.streetNumber ? 
                              `${profile?.address || ''}${profile?.address && (profile?.addressRef || profile?.streetNumber) ? ', ' : ''}${profile?.addressRef || ''}${profile?.addressRef && profile?.streetNumber ? ' ' : ''}${profile?.streetNumber || ''}`.trim() || "No especificada" :
                              "No especificada"
                            }
                          </div>
                          {profile?.streetNumber && <div className="text-slate-400 text-sm">N° {profile.streetNumber}</div>}
                          {profile?.addressRef && <div className="text-slate-400 text-sm">{profile.addressRef}</div>}
                        </div>
                      </div>
                      
                      <div className="flex gap-4 justify-end">
                        <motion.button
                          onClick={() => setEditingProfile(true)}
                          className="px-6 py-3 text-slate-400 hover:text-amber-400 hover:underline font-medium transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Modificar datos
                        </motion.button>
                        <motion.button
                          onClick={() => setStep(2)}
                          className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-400/25 flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Continuar al pago
                          <CreditCard className="w-5 h-5" />
                        </motion.button>
                  </div>
                </div>
              ) : (
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-8">
                      {(() => {
                        console.log("🔍 [CHECKOUT] Rendering profile display section:", {
                          profileComplete,
                          profile: profile,
                          profileForm: profileForm,
                          name: profile?.name,
                          last_name: profile?.last_name,
                          dni: profile?.dni,
                          phone: profile?.phone
                        });
                        return null;
                      })()}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/30">
                          <User className="w-6 h-6 text-amber-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-100">Completa tus datos de entrega</h2>
                      </div>
                      
                      <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium">Nombre</label>
                      <input
                        type="text"
                              placeholder="Tu nombre"
                        value={profileForm.name || ""}
                        onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                        required
                              className="w-full border border-slate-600/30 rounded-xl px-4 py-3 bg-slate-700/50 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 outline-none transition-all duration-300"
                      />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium">Apellido</label>
                      <input
                        type="text"
                              placeholder="Tu apellido"
                        value={profileForm.last_name}
                        onChange={e => setProfileForm(f => ({ ...f, last_name: e.target.value }))}
                        required
                              className="w-full border border-slate-600/30 rounded-xl px-4 py-3 bg-slate-700/50 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 outline-none transition-all duration-300"
                      />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium">DNI</label>
                      <input
                        type="text"
                              placeholder="Tu número de DNI"
                        value={profileForm.dni}
                        onChange={e => setProfileForm(f => ({ ...f, dni: e.target.value }))}
                        required
                              className="w-full border border-slate-600/30 rounded-xl px-4 py-3 bg-slate-700/50 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 outline-none transition-all duration-300"
                      />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium">Teléfono</label>
                      <input
                        type="text"
                              placeholder="Tu número de teléfono"
                        value={profileForm.phone}
                        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        required
                              className="w-full border border-slate-600/30 rounded-xl px-4 py-3 bg-slate-700/50 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 outline-none transition-all duration-300"
                      />
                    </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium">Dirección de entrega</label>
                            <div className="flex gap-3">
                      <input
                        type="text"
                                placeholder="Selecciona tu ubicación en el mapa"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                                className="flex-1 border border-slate-600/30 rounded-xl px-4 py-3 bg-slate-700/50 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 outline-none transition-all duration-300"
                      />
                              <motion.button
                        type="button"
                        onClick={() => setShowMapModal(true)}
                                className="p-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                        title="Seleccionar ubicación en el mapa"
                      >
                                <MapPin className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-slate-300 text-sm font-medium">Número de calle (opcional)</label>
                              <input
                                type="text"
                                placeholder="N° 123"
                                value={streetNumber}
                                onChange={e => setStreetNumber(e.target.value)}
                                className="w-full border border-slate-600/30 rounded-xl px-4 py-3 bg-slate-700/50 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 outline-none transition-all duration-300"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-slate-300 text-sm font-medium">Referencia (opcional)</label>
                              <input
                                type="text"
                                placeholder="Cerca a la plaza, piso 2"
                                value={addressRef}
                                onChange={e => setAddressRef(e.target.value)}
                                className="w-full border border-slate-600/30 rounded-xl px-4 py-3 bg-slate-700/50 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 outline-none transition-all duration-300"
                              />
                            </div>
                          </div>
                    </div>
                        
                    {/* Modal del mapa */}
                    {showMapModal && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl max-w-2xl w-full mx-4 border border-slate-600/30"
                            >
                              <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/30">
                                  <MapPin className="w-6 h-6 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-100">Selecciona tu ubicación</h3>
                              </div>
                          <CheckoutMap
                            position={markerPosition}
                            onChange={async (lat: number, lng: number) => {
                              setMarkerPosition([lat, lng]);
                              await updateAddressFromCoords(lat, lng);
                            }}
                          />
                              <div className="flex gap-4 mt-6 justify-end">
                                <motion.button 
                                  onClick={() => setShowMapModal(false)} 
                                  className="px-6 py-3 text-slate-400 hover:text-slate-300 transition-colors font-medium"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Cancelar
                                </motion.button>
                                <motion.button 
                                  onClick={() => setShowMapModal(false)} 
                                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Usar esta ubicación
                                </motion.button>
                          </div>
                            </motion.div>
                      </div>
                    )}
                        
                        <div className="flex gap-4 pt-6">
                          <motion.button 
                        type="submit" 
                        disabled={saving} 
                            className={`flex-1 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                          saving 
                                ? 'bg-slate-600 text-slate-300 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 shadow-lg hover:shadow-amber-400/25'
                        }`}
                            whileHover={!saving ? { scale: 1.02 } : {}}
                            whileTap={!saving ? { scale: 0.98 } : {}}
                      >
                        {saving ? (
                          <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                                <CheckCircle className="w-5 h-5" />
                            {profileComplete ? "Actualizar datos" : "Guardar y continuar"}
                          </>
                        )}
                          </motion.button>
                      
                      {profileComplete && (
                            <motion.button 
                          type="button" 
                          onClick={() => setEditingProfile(false)} 
                          disabled={saving}
                              className="px-6 py-4 text-slate-400 hover:text-slate-300 hover:underline font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                        >
                          Cancelar
                            </motion.button>
                      )}
                    </div>
                  </form>
                    </div>
                  )}
                </motion.div>
              )}
              
          {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/30">
                      <CreditCard className="w-6 h-6 text-amber-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">Método de pago</h2>
                  </div>
                  
              <StripeElementsForm amount={total} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Mensajes de estado */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-400/30 rounded-xl p-4 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 font-medium">{error}</span>
                </motion.div>
              )}
              
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-400/30 rounded-xl p-4 flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-green-300 font-medium">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
} 