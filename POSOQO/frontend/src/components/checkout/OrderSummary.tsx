// components/checkout/OrderSummary.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Package, CreditCard, MapPin, User } from 'lucide-react';
import { CartItem, Profile, AddressData } from '@/types/checkout';
import { getImageUrl } from '@/lib/config';

interface OrderSummaryProps {
  cart: CartItem[];
  total: number;
  profile: Profile | null;
  addressData: AddressData;
  onProceedToPayment: () => void;
  loading?: boolean;
  showProceedButton?: boolean;
}

export const OrderSummaryComponent: React.FC<OrderSummaryProps> = ({
  cart,
  total,
  profile,
  addressData,
  onProceedToPayment,
  loading = false,
  showProceedButton = true
}) => {
  const isProfileComplete = profile && profile.name && profile.last_name && profile.dni && profile.phone;
  const isAddressComplete = addressData.address && addressData.addressRef;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-yellow-400/20 sticky top-24"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Resumen del Pedido</h2>
          <p className="text-gray-400">Revisa tu pedido antes de continuar</p>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-yellow-400" />
          <span className="font-medium text-white">Cliente</span>
        </div>
        {isProfileComplete ? (
          <div className="text-sm text-gray-300 space-y-1">
            <p className="text-white font-medium">{profile.name} {profile.last_name}</p>
            <p>DNI: {profile.dni}</p>
            <p>Tel: {profile.phone}</p>
          </div>
        ) : (
          <p className="text-sm text-red-400">Información incompleta</p>
        )}
      </div>

      {/* Dirección de entrega */}
      <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-yellow-400" />
          <span className="font-medium text-white">Dirección de Entrega</span>
        </div>
        {isAddressComplete ? (
          <div className="text-sm text-gray-300 space-y-1">
            <p className="text-white font-medium">{addressData.address}</p>
            {addressData.addressRef && <p>Ref: {addressData.addressRef}</p>}
            {addressData.streetNumber && <p>N°: {addressData.streetNumber}</p>}
          </div>
        ) : (
          <p className="text-sm text-red-400">Dirección incompleta</p>
        )}
      </div>

      {/* Productos */}
      <div className="mb-6">
        <h3 className="font-semibold text-white mb-4">Productos ({cart.length})</h3>
        <div className="space-y-3">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-black border border-white/10">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{item.name}</h4>
                <p className="text-sm text-gray-400">Cantidad: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  S/ {(item.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">S/ {item.price.toFixed(2)} c/u</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-yellow-400/30 pt-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-white">Total</span>
          <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            S/ {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botón de pago */}
      {showProceedButton && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onProceedToPayment}
          disabled={!isProfileComplete || !isAddressComplete || loading}
          className="w-full mt-6 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-yellow-400/50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Proceder al Pago
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

export default OrderSummaryComponent;
