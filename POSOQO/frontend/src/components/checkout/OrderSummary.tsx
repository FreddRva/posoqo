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
}

export const OrderSummaryComponent: React.FC<OrderSummaryProps> = ({
  cart,
  total,
  profile,
  addressData,
  onProceedToPayment,
  loading = false
}) => {
  const isProfileComplete = profile && profile.name && profile.last_name && profile.dni && profile.phone;
  const isAddressComplete = addressData.address && addressData.addressRef;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resumen del Pedido</h2>
          <p className="text-gray-600">Revisa tu pedido antes de continuar</p>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Cliente</span>
        </div>
        {isProfileComplete ? (
          <div className="text-sm text-gray-700">
            <p>{profile.name} {profile.last_name}</p>
            <p>DNI: {profile.dni}</p>
            <p>Tel: {profile.phone}</p>
          </div>
        ) : (
          <p className="text-sm text-red-600">Información incompleta</p>
        )}
      </div>

      {/* Dirección de entrega */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Dirección de Entrega</span>
        </div>
        {isAddressComplete ? (
          <div className="text-sm text-gray-700">
            <p>{addressData.address}</p>
            {addressData.addressRef && <p>Ref: {addressData.addressRef}</p>}
            {addressData.streetNumber && <p>N°: {addressData.streetNumber}</p>}
          </div>
        ) : (
          <p className="text-sm text-red-600">Dirección incompleta</p>
        )}
      </div>

      {/* Productos */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Productos ({cart.length})</h3>
        <div className="space-y-3">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  S/ {(item.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">S/ {item.price.toFixed(2)} c/u</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center text-xl font-bold text-gray-900">
          <span>Total</span>
          <span>S/ {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Botón de pago */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onProceedToPayment}
        disabled={!isProfileComplete || !isAddressComplete || loading}
        className="w-full mt-6 bg-green-600 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Proceder al Pago
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default OrderSummaryComponent;
