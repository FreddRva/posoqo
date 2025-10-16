"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiFetch } from "@/lib/api";
import { CreditCard, Package, CheckCircle, AlertCircle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeElementsFormProps {
  amount: number;
}

function CheckoutForm({ amount }: StripeElementsFormProps) {
  const stripe = useStripe();
  const elements = useElements();
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
  React.useEffect(() => {
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

  // Consultar datos del DNI (simulado - en producción usar API real)
  const consultarDNI = async (dni: string) => {
    setConsultingDNI(true);
    setDniData(null);
    
    try {
      // Simular consulta a API (reemplazar con API real)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      
      // Datos simulados - en producción esto vendría de la API
      const datosSimulados = {
        nombres: "Juan Carlos",
        apellidoPaterno: "García",
        apellidoMaterno: "López"
      };
      
      setDniData(datosSimulados);
      
      // Auto-completar nombre del titular
      const nombreCompleto = `${datosSimulados.nombres} ${datosSimulados.apellidoPaterno} ${datosSimulados.apellidoMaterno}`;
      setCardholderName(nombreCompleto);
      
    } catch (error) {
      console.error('Error consultando DNI:', error);
      setError('No se pudieron obtener los datos del DNI. Por favor, ingresa el nombre manualmente.');
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

      const data = await apiFetch<{clientSecret: string}>("/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({ 
          amount,
          currency: "pen",
          metadata: {
            document_type: documentType,
            document_number: documentNumber.replace(/[\s.-]/g, ''),
            cardholder_name: cardholderName.trim()
          }
        }),
      });

      if (!data.clientSecret) {
        throw new Error("No se pudo crear el PaymentIntent. El sistema de pagos no está disponible.");
      }

      const result = await stripe?.confirmCardPayment((data as any).clientSecret, {
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario de pago...</p>
          <p className="text-sm text-gray-500 mt-2">Inicializando Stripe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de pago */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              {/* Banner informativo */}
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">i</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      Activa compras por internet en la app de tu banco o llamando al teléfono que está en la tarjeta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Información de Pago</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Número de tarjeta */}
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-medium">Número de tarjeta</label>
                  <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                    <CardNumberElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#374151',
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
                  <label className="text-gray-700 text-sm font-medium">Nombre del titular</label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Ej.: María López"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    required
                  />
                </div>

                {/* Fecha de vencimiento y CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-medium">Vencimiento</label>
                    <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                      <CardExpiryElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#374151',
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
                    <label className="text-gray-700 text-sm font-medium">Código de seguridad</label>
                    <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                      <CardCvcElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#374151',
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
                  <label className="text-gray-700 text-sm font-medium">Documento del titular</label>
                  <div className="flex gap-2">
                    <select 
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
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
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  {consultingDNI && (
                    <div className="flex items-center text-blue-600 text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Consultando datos del DNI...
                    </div>
                  )}
                  
                  {dniData && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center text-green-800 text-sm mb-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Datos encontrados:
                      </div>
                      <div className="text-green-700 text-sm">
                        <p><strong>Nombres:</strong> {dniData.nombres}</p>
                        <p><strong>Apellidos:</strong> {dniData.apellidoPaterno} {dniData.apellidoMaterno}</p>
                      </div>
                    </div>
                  )}
                  
                  {documentNumber && !validateDocument(documentType, documentNumber) && !consultingDNI && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      El {documentType} ingresado no es válido
                    </p>
                  )}
                </div>

                {/* Botón de pago */}
                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                    processing 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

          {/* Resumen y métodos de pago */}
          <div className="space-y-8">
            {/* Resumen del pedido */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Resumen del Pedido</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900 font-medium">S/ {amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envío:</span>
                  <span className="text-green-600 font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">IGV:</span>
                  <span className="text-gray-900 font-medium">S/ 0</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-extrabold text-blue-600">
                      S/ {amount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Métodos de Pago Aceptados</h3>
                <div className="grid grid-cols-4 gap-3">
                  {/* Visa */}
                  <div className="w-16 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                    <svg viewBox="0 0 38 24" className="w-12 h-7">
                      <rect width="38" height="24" rx="4" fill="#1A1F71"/>
                      <rect x="1" y="1" width="36" height="22" rx="3" fill="#FFF"/>
                      <path d="M8.9 6.2c0-.1.1-.1.1-.2h3.2c.1 0 .2 0 .2.1.1.1.1.2.1.3v11.3c0 .2 0 .3-.1.4 0 .1-.1.1-.2.1H9c-.1 0-.2 0-.2-.1-.1-.1-.1-.2-.1-.4V6.4c0-.1 0-.2.1-.2z" fill="#FF5F00"></path>
                      <path d="M15.7 6.2c0-.1.1-.1.1-.2h3.2c.1 0 .2 0 .2.1.1.1.1.2.1.3v11.3c0 .2 0 .3-.1.4 0 .1-.1.1-.2.1h-3.2c-.1 0-.2 0-.2-.1-.1-.1-.1-.2-.1-.4V6.4c0-.1 0-.2.1-.2z" fill="#EB001B"></path>
                      <path d="M12.3 12.7c-.7-1-1.7-1.7-2.8-2v4c1.1-.3 2.1-1 2.8-2z" fill="#FF5F00"></path>
                      <path d="M12.3 12.7c.7 1 1.7 1.7 2.8 2v-4c-1.1.3-2.1 1-2.8 2z" fill="#EB001B"></path>
                    </svg>
                  </div>
                  
                  {/* Mastercard */}
                  <div className="w-16 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                    <svg viewBox="0 0 38 24" className="w-12 h-7">
                      <rect width="38" height="24" rx="4" fill="#EB001B"/>
                      <rect x="1" y="1" width="36" height="22" rx="3" fill="#FFF"/>
                      <circle cx="15" cy="12" r="6" fill="#EB001B"/>
                      <circle cx="23" cy="12" r="6" fill="#F79E1B"/>
                      <path d="M19 6c-1.7 0-3 1.3-3 3v6c0 1.7 1.3 3 3 3s3-1.3 3-3V9c0-1.7-1.3-3-3-3z" fill="#FF5F00"/>
                    </svg>
                  </div>
                  
                  {/* American Express */}
                  <div className="w-16 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                    <svg viewBox="0 0 38 24" className="w-12 h-7">
                      <rect width="38" height="24" rx="4" fill="#006FCF"/>
                      <rect x="1" y="1" width="36" height="22" rx="3" fill="#FFF"/>
                      <path d="M8 8h22v8H8V8zm1 1v6h20V9H9z" fill="#006FCF"/>
                      <path d="M12 10h2v4h-2v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4z" fill="#006FCF"/>
                    </svg>
                  </div>
                  
                  {/* Diners Club */}
                  <div className="w-16 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                    <svg viewBox="0 0 38 24" className="w-12 h-7">
                      <rect width="38" height="24" rx="4" fill="#0079BE"/>
                      <rect x="1" y="1" width="36" height="22" rx="3" fill="#FFF"/>
                      <path d="M12 6.5c-1.7 0-3 1.3-3 3v9c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3v-9c0-1.7-1.3-3-3-3H12zm0 1h14c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2v-9c0-1.1.9-2 2-2z" fill="#0079BE"/>
                      <path d="M19 8.5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2h-4zm0 1h4c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-4c-.6 0-1-.4-1-1v-7c0-.6.4-1 1-1z" fill="#0079BE"/>
                    </svg>
                  </div>
                </div>
                
                {/* Bancos peruanos */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Bancos peruanos compatibles:</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {/* BCP */}
                    <div className="w-16 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="w-12 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">BCP</span>
                      </div>
                    </div>
                    
                    {/* BBVA */}
                    <div className="w-16 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="w-12 h-6 bg-red-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">BBVA</span>
                      </div>
                    </div>
                    
                    {/* Interbank */}
                    <div className="w-16 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="w-12 h-6 bg-green-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">Interbank</span>
                      </div>
                    </div>
                    
                    {/* Scotiabank */}
                    <div className="w-16 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="w-12 h-6 bg-red-700 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">Scotiabank</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Información adicional sobre métodos de pago */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm flex items-center">
                      <span className="text-green-500 font-semibold mr-2">✓</span> Aceptamos todas las tarjetas principales
                    </p>
                    <p className="text-gray-600 text-sm flex items-center">
                      <span className="text-green-500 font-semibold mr-2">✓</span> Pagos seguros con encriptación SSL
                    </p>
                    <p className="text-gray-600 text-sm flex items-center">
                      <span className="text-green-500 font-semibold mr-2">✓</span> Incluye tarjetas de BCP, BBVA, Interbank, Scotiabank, etc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StripeElementsForm({ amount }: { amount: number }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} />
    </Elements>
  );
}