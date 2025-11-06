"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CreditCard, Package, User, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import StripeElementsForm from "./StripeElementsForm";
import { ProfileFormComponent } from "@/components/checkout/ProfileForm";
import AddressForm from "@/components/checkout/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import AddressSelector from "@/components/checkout/AddressSelector";
import InteractiveMap from "@/components/checkout/InteractiveMap";
import { useCheckoutProfile } from "@/hooks/useCheckoutProfile";
import { useCheckoutAddress } from "@/hooks/useCheckoutAddress";
import { apiFetch } from "@/lib/api";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, summary, loading: cartLoading, clearCart } = useCart();
  const total = summary.total;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    profile,
    profileForm,
    setProfileForm,
    loading: profileLoading,
    error: profileError,
    success: profileSuccess,
    saving: profileSaving,
    profileComplete,
    handleProfileFormChange,
    saveProfile,
    refreshProfile,
  } = useCheckoutProfile();

  const addressHook = useCheckoutAddress();
  const {
    location,
    markerPosition,
    setMarkerPosition,
    fetchAddressFromCoordinates,
    getCurrentLocation,
    setAddress,
    setAddressRef,
    setStreetNumber,
  } = addressHook;

  const [step, setStep] = useState<1 | 2>(1);
  const [isClient, setIsClient] = useState(false);
  const [addressMode, setAddressMode] = useState<'select' | 'create' | 'map'>('select');
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/checkout" });
      return;
    }
  }, [status, router]);

  // Sync profile address with address hook
  useEffect(() => {
    if (profile && profile.lat && profile.lng && isClient) {
      setMarkerPosition([profile.lat, profile.lng]);
      setAddress(profile.address || "");
      setAddressRef(profile.addressRef || "");
      setStreetNumber(profile.streetNumber || "");
    }
  }, [profile, isClient, setMarkerPosition, setAddress, setAddressRef, setStreetNumber]);

  const handlePlaceOrder = async () => {
    if (!session?.accessToken || cart.length === 0 || !profileComplete || !location) {
      // Handle error or prompt user to complete info
      return;
    }

    // Save current address to profile before placing order
    try {
      const dataToSend = {
        ...profileForm,
        address: addressHook.address,
        addressRef: addressHook.addressRef,
        streetNumber: addressHook.streetNumber,
        lat: addressHook.markerPosition[0],
        lng: addressHook.markerPosition[1],
      };

      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify(dataToSend),
        authToken: session.accessToken,
      });
      await refreshProfile(); // Ensure profile is updated
    } catch (err) {
      // Handle error saving address
      return;
    }

    // Proceed with Stripe payment intent
    try {
      const response = await apiFetch<{ clientSecret: string; orderId: string }>("/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({
          amount: total * 100, // Stripe expects amount in cents
          currency: "pen",
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          shipping: {
            address: addressHook.address,
            addressRef: addressHook.addressRef,
            streetNumber: addressHook.streetNumber,
            lat: addressHook.markerPosition[0],
            lng: addressHook.markerPosition[1],
          },
        }),
        authToken: session.accessToken,
      });

      if (response && response.clientSecret && response.orderId) {
        // Guardar clientSecret y orderId
        setClientSecret(response.clientSecret);
        setOrderId(response.orderId);
        // Ir al paso 2 del checkout
        setStep(2);
      } else {
        // Handle error
        console.error('Error creating payment intent');
      }
    } catch (err) {
      // Handle error
      console.error('Error:', err);
    }
  };

  if (!isClient || profileLoading || cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-yellow-400">
        <Loader2 className="animate-spin mr-2" size={32} /> Cargando...
      </div>
    );
  }

  // Manejar selección de dirección guardada
  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
    setAddress(address.address);
    setAddressRef(address.addressRef);
    setStreetNumber(address.streetNumber);
    setMarkerPosition([address.lat, address.lng]);
    setAddressMode('select');
  };

  // Manejar nueva dirección
  const handleNewAddress = () => {
    setAddressMode('create');
    setSelectedAddress(null);
  };

  // Manejar selección desde mapa
  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    setMarkerPosition([lat, lng]);
    setAddress(address);
    setAddressMode('create');
    // ✅ NO cerrar el mapa automáticamente - dejar que el usuario lo cierre manualmente
    // setShowMap(false);
  };

  // Guardar dirección actual
  const saveCurrentAddress = () => {
    if (!addressHook.address) return;

    const newAddress = {
      id: Date.now().toString(),
      name: `Dirección ${new Date().toLocaleDateString()}`,
      address: addressHook.address,
      addressRef: addressHook.addressRef,
      streetNumber: addressHook.streetNumber,
      lat: markerPosition[0],
      lng: markerPosition[1],
      isDefault: false
    };

    try {
      const saved = localStorage.getItem('savedAddresses');
      const addresses = saved ? JSON.parse(saved) : [];
      addresses.unshift(newAddress);
      localStorage.setItem('savedAddresses', JSON.stringify(addresses));
      
      // También guardar en userAddress para compatibilidad
      addressHook.saveAddressToLocalStorage();
      
      setSelectedAddress(newAddress);
      setAddressMode('select');
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full mb-6">
            <CreditCard className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
              Checkout
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
              Finalizar Compra
            </span>
          </h1>
        </motion.div>

        {/* Steps Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <motion.div
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 ${
                step === 1 
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/50' 
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
              whileHover={{ scale: step === 1 ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                step === 1 ? 'bg-black/20' : 'bg-white/5'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <span className="font-semibold">1. Datos Personales y Dirección</span>
            </motion.div>
            <div className={`w-12 h-1 rounded-full transition-all duration-200 ${
              step === 2 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-white/10'
            }`}></div>
            <motion.div
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 ${
                step === 2 
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/50' 
                  : 'bg-white/5 text-gray-400 border border-white/10'
              } ${!profileComplete || !location ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={{ scale: step === 2 && (profileComplete && location) ? 1 : (profileComplete && location ? 1.05 : 1) }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (profileComplete && location ? setStep(2) : null)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                step === 2 ? 'bg-black/20' : 'bg-white/5'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-semibold">2. Pago</span>
            </motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="space-y-8">
                <ProfileFormComponent
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  profileComplete={!!profileComplete}
                  saving={profileSaving}
                  error={profileError}
                  success={profileSuccess}
                  onSave={saveProfile}
                  onCancel={() => {}}
                />
                {/* Selector de direcciones */}
                {addressMode === 'select' && (
                  <AddressSelector
                    onSelectAddress={handleSelectAddress}
                    onNewAddress={handleNewAddress}
                    selectedAddressId={selectedAddress?.id}
                  />
                )}

                {/* Formulario de nueva dirección */}
                {addressMode === 'create' && (
                  <div className="space-y-6">
                    <AddressForm 
                      address={addressHook.address}
                      setAddress={addressHook.setAddress}
                      addressRef={addressHook.addressRef}
                      setAddressRef={addressHook.setAddressRef}
                      streetNumber={addressHook.streetNumber}
                      setStreetNumber={addressHook.setStreetNumber}
                      location={location}
                      markerPosition={markerPosition}
                      onMapClick={() => setShowMap(true)}
                      onAddressFromCoords={async () => {
                        const success = await getCurrentLocation();
                        if (!success) {
                          // Si falla GPS, intentar con las coordenadas del marcador
                          await fetchAddressFromCoordinates(markerPosition[0], markerPosition[1]);
                        }
                      }}
                    />
                    
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={saveCurrentAddress}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-yellow-400/50"
                      >
                        Guardar Dirección
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAddressMode('select')}
                        className="px-6 py-3 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl font-semibold hover:bg-white/5 transition-all duration-200"
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Mapa interactivo */}
                <InteractiveMap
                  initialPosition={markerPosition}
                  onLocationSelect={handleMapLocationSelect}
                  onClose={() => setShowMap(false)}
                  isOpen={showMap}
                />
              </div>
              <div>
                <OrderSummary 
                  cart={cart} 
                  total={total} 
                  profile={profile}
                  addressData={{
                    address: addressHook.address,
                    addressRef: addressHook.addressRef,
                    streetNumber: addressHook.streetNumber,
                    lat: addressHook.markerPosition[0],
                    lng: addressHook.markerPosition[1]
                  }}
                  onProceedToPayment={handlePlaceOrder}
                  loading={cartLoading}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(1)}
                  className="mb-8 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" /> Volver a Datos Personales
                </motion.button>
                <StripeElementsForm
                  amount={total}
                  clientSecret={clientSecret}
                  orderId={orderId}
                />
              </div>
              <div>
                <OrderSummary 
                  cart={cart} 
                  total={total} 
                  profile={profile}
                  addressData={{
                    address: addressHook.address,
                    addressRef: addressHook.addressRef,
                    streetNumber: addressHook.streetNumber,
                    lat: addressHook.markerPosition[0],
                    lng: addressHook.markerPosition[1]
                  }}
                  onProceedToPayment={() => {}} // No hacer nada en paso 2
                  loading={cartLoading}
                  showProceedButton={false} // No mostrar botón en paso 2
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}