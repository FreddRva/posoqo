"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiFetch } from "@/lib/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface StripeElementsFormProps {
  amount: number;
}

function CheckoutForm({ amount }: StripeElementsFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [subtotal, setSubtotal] = useState(amount);
  const [tax, setTax] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);
    
    try {
      if (!stripe || !elements) {
        throw new Error("Stripe no está inicializado");
      }

      const data = await apiFetch<{clientSecret: string}>("/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({ 
          amount,
          currency: "pen"
        }),
      });

      const result = await stripe?.confirmCardPayment((data as any).clientSecret, {
        payment_method: {
          card: elements?.getElement(CardNumberElement)!,
          billing_details: { name: cardholderName },
        },
      });

      if (result?.error) {
        throw new Error(result.error.message || "Error al procesar el pago");
      } else if (result?.paymentIntent?.status === "succeeded") {
        setSuccess("¡Pago exitoso! Tu pedido ha sido confirmado.");
        
        // Crear el pedido en la base de datos
        try {
          const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
          
          // Obtener la ubicación del localStorage
          let location = 'Ubicación no especificada';
          try {
            const storedAddress = localStorage.getItem('userAddress');
            if (storedAddress) {
              const addressData = JSON.parse(storedAddress);
              if (addressData.address || addressData.addressRef || addressData.streetNumber) {
                const parts = [];
                if (addressData.address) parts.push(addressData.address);
                if (addressData.addressRef) parts.push(addressData.addressRef);
                if (addressData.streetNumber) parts.push(`N° ${addressData.streetNumber}`);
                if (parts.length > 0) {
                  location = parts.join(', ');
                }
              }
            }
          } catch (error) {
            console.error("Error reading address from localStorage:", error);
          }
          
          // Si aún no hay ubicación válida, usar un valor por defecto
          if (!location || location === 'Ubicación no especificada') {
            location = 'Dirección del cliente';
          }
          
          console.log("🛒 Carrito:", cartItems);
          console.log("📍 Ubicación:", location);
          
          if (cartItems.length > 0) {
            const orderData = {
              items: cartItems.map((item: any) => ({
                product_id: item.id,
                quantity: item.quantity
              })),
              location: location
            };
            
            console.log("📦 Datos del pedido:", orderData);
            
            const orderResponse = await apiFetch("/protected/orders", {
              method: "POST",
              body: JSON.stringify(orderData),
            });
            
            console.log("✅ Pedido creado:", orderResponse);
            
            // Limpiar el carrito después de crear el pedido
            localStorage.removeItem('cart');
            localStorage.removeItem('userAddress');
          } else {
            console.log("⚠️ Carrito vacío, no se puede crear pedido");
          }
        } catch (error) {
          console.error("❌ Error creando pedido:", error);
        }
        
        // Crear notificación de pago exitoso - SIN ESPERAR RESPUESTA
        apiFetch("/admin/notifications", {
          method: "POST",
          body: JSON.stringify({
            type: "success",
            title: "🎉 ¡Pago Exitoso!",
            message: `Tu pago de S/${amount.toFixed(2)} ha sido procesado exitosamente. ¡Gracias por tu compra!`
          }),
        }).then(() => {
          // Actualizar notificaciones después de crear una nueva
          console.log("✅ Notificación creada, actualizando lista...");
        }).catch(error => {
          console.error("Error creando notificación:", error);
        });
        
        // Reproducir sonido de éxito INMEDIATAMENTE
        if (typeof window !== 'undefined' && 'Audio' in window) {
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.play().catch(() => {});
          } catch (e) {
            // Ignorar errores de audio
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error desconocido");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Información de Pago</h1>
            <p className="text-stone-300">Completa los datos de tu tarjeta de forma segura</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario de pago */}
            <div className="space-y-6">
              <div>
                <label className="block text-yellow-400 font-medium mb-2">Nombre del Titular</label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-800/60 border border-yellow-400/30 rounded-lg text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                  placeholder="Como aparece en la tarjeta"
                />
              </div>

              <div>
                <label className="block text-yellow-400 font-medium mb-2">Número de Tarjeta</label>
                <div className="relative">
                  <CardNumberElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#f5f5f4',
                          backgroundColor: 'rgba(41, 37, 36, 0.6)',
                          padding: '12px 16px',
                          '::placeholder': {
                            color: '#a8a29e',
                          },
                        },
                        invalid: {
                          color: '#fca5a5',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-400 font-medium mb-2">Fecha de Vencimiento</label>
                  <CardExpiryElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#f5f5f4',
                          backgroundColor: 'rgba(41, 37, 36, 0.6)',
                          padding: '12px 16px',
                          '::placeholder': {
                            color: '#a8a29e',
                          },
                        },
                        invalid: {
                          color: '#fca5a5',
                        },
                      },
                    }}
                  />
                </div>
                <div>
                  <label className="block text-yellow-400 font-medium mb-2">Código de Seguridad</label>
                  <CardCvcElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#f5f5f4',
                          backgroundColor: 'rgba(41, 37, 36, 0.6)',
                          padding: '12px 16px',
                          '::placeholder': {
                            color: '#a8a29e',
                          },
                        },
                        invalid: {
                          color: '#fca5a5',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Botón de pago */}
              <button
                onClick={handleSubmit}
                disabled={processing}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  processing
                    ? 'bg-stone-600 text-stone-400 cursor-not-allowed'
                    : 'bg-yellow-400 text-stone-900 hover:bg-yellow-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl shadow-yellow-400/25'
                }`}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                    Pagar S/ {amount}
                  </div>
                )}
              </button>

              {/* Mensajes de estado */}
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-400/30 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-300">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-900/20 border border-green-400/30 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-300">{success}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Resumen del pedido */}
            <div className="bg-stone-800/60 rounded-lg p-6 border-l border-yellow-400/20">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Resumen del Pedido</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-stone-300">
                  <span>Subtotal</span>
                  <span>S/ {subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Envío</span>
                  <span className="text-green-400">Gratis</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>IGV</span>
                  <span>S/ {tax}</span>
                </div>
                <div className="border-t border-yellow-400/20 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-yellow-400">
                    <span>Total</span>
                    <span>S/ {amount}</span>
                  </div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="mt-8">
                <h3 className="font-semibold text-yellow-300 mb-4">Métodos de Pago Aceptados</h3>
                <div className="grid grid-cols-4 gap-3">
                  {/* Visa */}
                  <div className="w-14 h-9 bg-white border border-yellow-400/30 rounded flex items-center justify-center">
                    <svg viewBox="0 0 38 24" className="w-10 h-6">
                      <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#172B85"></path>
                      <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"></path>
                      <path d="M8.9 6.2c0-.1.1-.1.1-.2h3.2c.1 0 .2 0 .2.1.1.1.1.2.1.3v11.3c0 .2 0 .3-.1.4 0 .1-.1.1-.2.1H9c-.1 0-.2 0-.2-.1-.1-.1-.1-.2-.1-.4V6.4c0-.1 0-.2.1-.2z" fill="#FF5F00"></path>
                      <path d="M15.7 6.2c0-.1.1-.1.1-.2h3.2c.1 0 .2 0 .2.1.1.1.1.2.1.3v11.3c0 .2 0 .3-.1.4 0 .1-.1.1-.2.1h-3.2c-.1 0-.2 0-.2-.1-.1-.1-.1-.2-.1-.4V6.4c0-.1 0-.2.1-.2z" fill="#EB001B"></path>
                      <path d="M12.3 12.7c-.7-1-1.7-1.7-2.8-2v4c1.1-.3 2.1-1 2.8-2z" fill="#FF5F00"></path>
                      <path d="M12.3 12.7c.7 1 1.7 1.7 2.8 2v-4c-1.1.3-2.1 1-2.8 2z" fill="#EB001B"></path>
                    </svg>
                  </div>
                  
                  {/* Mastercard */}
                  <div className="w-14 h-9 bg-white border border-yellow-400/30 rounded flex items-center justify-center">
                    <svg viewBox="0 0 38 24" className="w-10 h-6">
                      <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#172B85"></path>
                      <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"></path>
                      <path d="M11.3 15.5c0-1.2.7-1.9 1.8-2.2.8-.2 1.5-.3 1.5-.8 0-.4-.4-.7-1-.7-.6 0-1 .3-1.2.8l-1.5-.6c.3-1.2 1.4-1.9 2.8-1.9 1.6 0 2.8.8 2.8 2.1 0 1.1-.7 1.7-1.7 2.1-.8.3-1.4.4-1.4.8 0 .4.4.8 1.1.8.7 0 1.2-.3 1.4-1l1.5.5c-.4 1.3-1.4 2-3 2-1.7 0-3-.8-3-2.4zm7.8.1c0-.6.5-1 1.2-1 .7 0 1.2.4 1.2 1s-.5 1-1.2 1c-.7 0-1.2-.4-1.2-1zm5.5 0c0-1.7 1.2-3 3.2-3s3.2 1.3 3.2 3-1.2 3-3.2 3-3.2-1.3-3.2-3zm1.6 0c0 .9.6 1.6 1.6 1.6 1 0 1.6-.7 1.6-1.6 0-.9-.6-1.6-1.6-1.6-1 0-1.6.7-1.6 1.6z" fill="#142688"></path>
                    </svg>
                  </div>
                  
                  {/* American Express */}
                  <div className="w-14 h-9 bg-white border border-yellow-400/30 rounded flex items-center justify-center">
                    <svg viewBox="0 0 38 24" className="w-10 h-6">
                      <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#172B85"></path>
                      <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"></path>
                      <path d="M30.1 12.9c0-1.2-.4-2.3-1.1-3.1-.7-.8-1.7-1.2-2.9-1.2h-4.2c-.3 0-.5.2-.5.5v8.2c0 .3.2.5.5.5h4.2c1.2 0 2.2-.4 2.9-1.2.7-.8 1.1-1.9 1.1-3.1v-.6c0-.1 0-.2-.1-.3l.1-.3v-.6zm-1.7 0c0 .8-.2 1.5-.6 2-.4.5-.9.8-1.6.8h-1.6v-5.6h1.6c.7 0 1.3.3 1.6.8.4.5.6 1.2.6 2v.1-.1z" fill="#259CD4"></path>
                      <path d="M15.7 8.6c0-.3-.2-.5-.5-.5h-4.2c-1.2 0-2.2.4-2.9 1.2-.7.8-1.1 1.9-1.1 3.1v.6c0 .1 0 .2.1.3l-.1.3v.6c0 1.2.4 2.3 1.1 3.1.7.8 1.7 1.2 2.9 1.2h4.2c.3 0 .5-.2.5-.5V8.6zm-1.7 5.7c0 .8-.2 1.5-.6 2-.4.5-.9.8-1.6.8h-1.6v-5.6h1.6c.7 0 1.3.3 1.6.8.4.5.6 1.2.6 2v.1-.1z" fill="#259CD4"></path>
                      <path d="M21.4 8.6c0-.3-.2-.5-.5-.5h-2.6c-.3 0-.5.2-.5.5v8.2c0 .3.2.5.5.5h2.6c.3 0 .5-.2.5-.5V8.6z" fill="#259CD4"></path>
                    </svg>
                  </div>
                  
                  {/* Diners Club */}
                  <div className="w-14 h-9 bg-white border border-yellow-400/30 rounded flex items-center justify-center">
                    <svg viewBox="0 0 38 24" className="w-10 h-6">
                      <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#172B85"></path>
                      <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"></path>
                      <path d="M12 6.5c-1.7 0-3 1.3-3 3v9c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3v-9c0-1.7-1.3-3-3-3H12zm0 1h14c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2v-9c0-1.1.9-2 2-2z" fill="#0079BE"></path>
                      <path d="M19 8.5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2h-4zm0 1h4c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-4c-.6 0-1-.4-1-1v-7c0-.6.4-1 1-1z" fill="#0079BE"></path>
                    </svg>
                  </div>
                </div>
                
                {/* Bancos peruanos */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-yellow-300 mb-3">Bancos peruanos compatibles:</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {/* BCP */}
                    <div className="w-12 h-8 bg-white border border-yellow-400/30 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">BCP</span>
                    </div>
                    
                    {/* BBVA */}
                    <div className="w-12 h-8 bg-white border border-yellow-400/30 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-red-600">BBVA</span>
                    </div>
                    
                    {/* Interbank */}
                    <div className="w-12 h-8 bg-white border border-yellow-400/30 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">Interbank</span>
                    </div>
                    
                    {/* Scotiabank */}
                    <div className="w-12 h-8 bg-white border border-yellow-400/30 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-red-700">Scotiabank</span>
                    </div>
                  </div>
                </div>
                
                {/* Información adicional sobre métodos de pago */}
                <div className="mt-4 p-3 bg-stone-800/40 rounded-lg border border-yellow-400/10">
                  <p className="text-stone-300 text-xs">
                    <span className="text-yellow-400 font-semibold">✓</span> Aceptamos todas las tarjetas principales
                  </p>
                  <p className="text-stone-300 text-xs mt-1">
                    <span className="text-yellow-400 font-semibold">✓</span> Pagos seguros con encriptación SSL
                  </p>
                  <p className="text-stone-300 text-xs mt-1">
                    <span className="text-yellow-400 font-semibold">✓</span> Incluye tarjetas de BCP, BBVA, Interbank, Scotiabank, etc.
                  </p>
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