"use client";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { CreditCard, Package, CheckCircle, AlertCircle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RcbC4CL70N5NrKOIPYs3SiN0fsiVUf903Vp94tDj6yyu56QHx3MrMn0K6JIBvZ4vVvgzjgbihX5cRfRCi40I25G00lqp7TAxk');

interface StripeElementsFormProps {
  amount: number;
  clientSecret: string | null;
  orderId: string | null;
}

function CheckoutForm({ amount, clientSecret: propClientSecret, orderId }: StripeElementsFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const [clientSecret, setClientSecret] = useState<string | null>(propClientSecret);
  const [cardholderName, setCardholderName] = useState("");
  const [documentType, setDocumentType] = useState("DNI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [subtotal, setSubtotal] = useState(amount);
  const [tax, setTax] = useState(0);
  const [consultingDNI, setConsultingDNI] = useState(false);
  const [dniData, setDniData] = useState<{
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
  } | null>(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  // Verificar que Stripe esté cargado
  useEffect(() => {
    if (stripe && elements) {
      setStripeLoaded(true);
    }
  }, [stripe, elements]);

  // Validar DNI peruano
  const validateDNI = (dni: string) => {
    // Remover espacios y puntos
    const cleanDNI = dni.replace(/[\s.]/g, '');
    
    // Verificar que sea numérico y tenga 8 dígitos
    if (!/^\d{8}$/.test(cleanDNI)) {
      return false;
    }
    
    // Algoritmo de validación DNI peruano
    const digits = cleanDNI.split('').map(Number);
    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;
    
    return checkDigit === digits[7];
  };

  // Validar otros tipos de documento
  const validateDocument = (type: string, number: string) => {
    const cleanNumber = number.replace(/[\s.-]/g, '');
    
    switch (type) {
      case 'DNI':
        return validateDNI(cleanNumber);
      case 'CE':
        // Cédula de extranjería: 9 dígitos
        return /^\d{9}$/.test(cleanNumber);
      case 'PAS':
        // Pasaporte: alfanumérico, 6-12 caracteres
        return /^[A-Z0-9]{6,12}$/.test(cleanNumber.toUpperCase());
      default:
        return false;
    }
  };

  // Consultar datos del DNI desde APIperu.dev
  const consultarDNI = async (dni: string) => {
    setConsultingDNI(true);
    setDniData(null);
    
    try {
      // Construir URL correctamente (evitar duplicación de /api)
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com';
      // Remover /api si está al final
      apiUrl = apiUrl.replace(/\/api\/?$/, '');
      // Remover barra final si existe
      apiUrl = apiUrl.replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/dni/${dni}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Guardar los datos del DNI
          const datosReales = {
            nombres: result.data.nombres || '',
            apellidoPaterno: result.data.apellido_paterno || '',
            apellidoMaterno: result.data.apellido_materno || ''
          };
          
          setDniData(datosReales);
          
          // Auto-completar nombre del titular
          const nombreCompleto = result.data.nombre_completo || 
            `${datosReales.nombres} ${datosReales.apellidoPaterno} ${datosReales.apellidoMaterno}`.trim();
          setCardholderName(nombreCompleto);
        } else {
          setError('DNI no encontrado en los registros. Por favor, ingresa el nombre manualmente.');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error al consultar el DNI' }));
        setError(errorData.error || 'No se pudieron obtener los datos del DNI. Por favor, ingresa el nombre manualmente.');
      }
    } catch (error) {
      console.error('Error consultando DNI:', error);
      setError('No se pudo consultar el DNI. Por favor, ingresa el nombre manualmente.');
    } finally {
      setConsultingDNI(false);
    }
  };

  // Consultar DNI cuando sea válido
  const handleDocumentChange = (value: string) => {
    setDocumentNumber(value);
    setDniData(null);
    
    // Solo consultar si es DNI y tiene 8 dígitos
    if (documentType === 'DNI' && value.replace(/[\s.-]/g, '').length === 8) {
      const cleanDNI = value.replace(/[\s.-]/g, '');
      if (validateDNI(cleanDNI)) {
        consultarDNI(cleanDNI);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);
    
    try {
      // Validar campos requeridos
      if (!cardholderName.trim()) {
        throw new Error("El nombre del titular es requerido");
      }
      
      if (!documentNumber.trim()) {
        throw new Error("El número de documento es requerido");
      }
      
      if (!validateDocument(documentType, documentNumber)) {
        throw new Error(`El ${documentType} ingresado no es válido`);
      }

      if (!stripe || !elements) {
        throw new Error("Stripe no está inicializado");
      }

      if (!clientSecret) {
        throw new Error("No se pudo obtener el clientSecret. Por favor, intenta de nuevo.");
      }

      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements?.getElement(CardNumberElement)!,
          billing_details: { 
            name: cardholderName.trim(),
          },
        },
      });

      if (result?.error) {
        throw new Error(result.error.message || "Error al procesar el pago");
      }
      setSuccess("¡Pago procesado exitosamente!");
      setProcessing(false);
    } catch (err: any) {
      setError(err.message || "Error al procesar el pago");
      setProcessing(false);
    }
  };

  if (!stripe || !elements || !stripeLoaded) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando formulario de pago...</p>
          <p className="text-sm text-gray-400 mt-2">Inicializando Stripe...</p>
        </div>
      </div>
    );
  }

  // Si el pago fue exitoso, mostrar mensaje de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-400/20 p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">¡Pago Confirmado!</h2>
            <p className="text-gray-300 mb-6">{success}</p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/products'}
                className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-400/50"
              >
                <Package className="w-5 h-5" />
                Continuar Comprando
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl hover:bg-white/5 transition-all duration-200"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-400/20 p-8">
        {/* Banner informativo */}
        <div className="bg-yellow-400/10 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <span className="text-black text-sm font-bold">i</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-300">
                Activa compras por internet en la app de tu banco o llamando al teléfono que está en la tarjeta.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-lg">
            <CreditCard className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Información de Pago</h2>
        </div>
              
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Número de tarjeta */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Número de tarjeta</label>
            <div className="border border-white/10 rounded-xl px-4 py-3 bg-white/5 focus-within:border-yellow-400/50 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all duration-200">
              <CardNumberElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#FFFFFF',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      '::placeholder': {
                        color: '#9CA3AF',
                      },
                    },
                  },
                  placeholder: '1234 5678 9012 3456',
                }}
              />
            </div>
          </div>

          {/* Nombre del titular */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Nombre del titular</label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Ej.: María López"
              className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder-gray-500 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Fecha de vencimiento y CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Vencimiento</label>
              <div className="border border-white/10 rounded-xl px-4 py-3 bg-white/5 focus-within:border-yellow-400/50 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all duration-200">
                <CardExpiryElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#FFFFFF',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        '::placeholder': {
                          color: '#9CA3AF',
                        },
                      },
                    },
                    placeholder: 'MM/AA',
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Código de seguridad</label>
              <div className="border border-white/10 rounded-xl px-4 py-3 bg-white/5 focus-within:border-yellow-400/50 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all duration-200">
                <CardCvcElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#FFFFFF',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        '::placeholder': {
                          color: '#9CA3AF',
                        },
                      },
                    },
                    placeholder: '123',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Documento del titular */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Documento del titular</label>
            <div className="flex gap-2">
              <select 
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200"
              >
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
                <option value="PAS">PAS</option>
              </select>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => handleDocumentChange(e.target.value)}
                placeholder={documentType === 'DNI' ? '12345678' : documentType === 'CE' ? '123456789' : 'ABC123456'}
                className="flex-1 border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder-gray-500 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200"
                required
              />
            </div>
            {consultingDNI && (
              <div className="flex items-center text-yellow-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                Consultando datos del DNI...
              </div>
            )}
            
            {dniData && (
              <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center text-green-400 text-sm mb-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Datos encontrados:
                </div>
                <div className="text-green-300 text-sm">
                  <p><strong>Nombres:</strong> {dniData.nombres}</p>
                  <p><strong>Apellidos:</strong> {dniData.apellidoPaterno} {dniData.apellidoMaterno}</p>
                </div>
              </div>
            )}
            
            {documentNumber && !validateDocument(documentType, documentNumber) && !consultingDNI && (
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                El {documentType} ingresado no es válido
              </p>
            )}
          </div>

          {/* Botón de pago */}
          <button
            type="submit"
            disabled={processing}
            className={`w-full font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
              processing 
                ? 'bg-gray-500 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black shadow-lg hover:shadow-yellow-400/50'
            }`}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pagar S/ {amount}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StripeElementsForm({ amount, clientSecret, orderId }: StripeElementsFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} clientSecret={clientSecret} orderId={orderId} />
    </Elements>
  );
}