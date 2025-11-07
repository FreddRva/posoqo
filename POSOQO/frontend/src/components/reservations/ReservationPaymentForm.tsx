"use client";
import React, { useState, useEffect } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, CheckCircle, AlertCircle, Loader2, X, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface ReservationPaymentFormProps {
  amount: number;
  clientSecret: string;
  reservationId: string;
  userDni?: string;
  userName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReservationPaymentForm({
  amount,
  clientSecret,
  reservationId,
  userDni,
  userName,
  onSuccess,
  onCancel
}: ReservationPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState(userName || "");
  const [dni, setDni] = useState(userDni || "");
  const [dniError, setDniError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe no está cargado. Por favor espera un momento.");
      return;
    }

    // Validar DNI
    const dniTrimmed = dni.trim();
    if (!dniTrimmed) {
      setDniError("El DNI es requerido");
      return;
    }

    if (!/^\d{8}$/.test(dniTrimmed)) {
      setDniError("El DNI debe tener exactamente 8 dígitos");
      return;
    }

    if (!cardholderName.trim()) {
      setError("El nombre del titular es requerido");
      return;
    }

    setError(null);
    setDniError(null);
    setProcessing(true);

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setError("No se pudo encontrar el elemento de tarjeta.");
      setProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Error al procesar el pago.");
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess();
      } else {
        setError("El pago no se completó correctamente.");
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado al procesar el pago.");
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/90 backdrop-blur-xl rounded-2xl p-8 border border-purple-400/20 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-purple-400" />
            Pago de Adelanto
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-purple-400/10 to-pink-400/10 border border-purple-400/30 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Monto a pagar:</span>
            <span className="text-2xl font-bold text-purple-400">S/ {amount.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-purple-300 font-semibold mb-2">
              DNI del titular *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={dni}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setDni(value);
                  setDniError(null);
                }}
                className={`w-full pl-12 pr-4 py-3 bg-black/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  dniError
                    ? 'border-red-400/50 focus:ring-red-400 focus:border-red-400'
                    : 'border-white/10 focus:ring-purple-400 focus:border-transparent'
                }`}
                placeholder="12345678"
                maxLength={8}
                required
              />
            </div>
            {dniError && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {dniError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-purple-300 font-semibold mb-2">
              Nombre del titular de la tarjeta *
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => {
                setCardholderName(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-purple-300 font-semibold mb-2">
              Número de tarjeta
            </label>
            <div className="px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-transparent transition-all">
              <CardNumberElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#ffffff",
                      "::placeholder": {
                        color: "#9ca3af",
                      },
                    },
                    invalid: {
                      color: "#ef4444",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-300 font-semibold mb-2">
                Vencimiento
              </label>
              <div className="px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-transparent transition-all">
                <CardExpiryElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#ffffff",
                        "::placeholder": {
                          color: "#9ca3af",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-purple-300 font-semibold mb-2">
                CVC
              </label>
              <div className="px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-transparent transition-all">
                <CardCvcElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#ffffff",
                        "::placeholder": {
                          color: "#9ca3af",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-400/10 border border-red-400/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-lg transition-all border border-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={processing || !stripe || !elements}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 text-black font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Pagar S/ {amount.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

