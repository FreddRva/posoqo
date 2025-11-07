"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getApiUrl } from "@/lib/config";

export default function VerificarEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  // Obtener enlace de verificación
  const handleGetVerificationLink = async (emailToVerify: string) => {
    setResendStatus(null);
    setVerificationUrl(null);
    setResendLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com/api';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000);
      
      const res = await fetch(`${apiUrl}/resend-verification`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email: emailToVerify }),
        signal: controller.signal,
      }).catch((fetchError) => {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error("TIMEOUT");
        }
        throw fetchError;
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `Error ${res.status}: ${res.statusText}` };
        }
        throw new Error(errorData.error || `Error ${res.status}`);
      }
      
      const data = await res.json();
      
      // Mostrar el enlace de verificación
      if (data.verification_url) {
        setVerificationUrl(data.verification_url);
        setResendStatus("Usa el enlace de abajo para verificar tu email:");
      } else if (data.message) {
        setResendStatus(data.message);
        if (data.token) {
          const backendUrl = apiUrl.replace('/api', '');
          const url = `${backendUrl}/api/verify-email?token=${data.token}`;
          setVerificationUrl(url);
        }
      } else {
        setResendStatus("¡Email de verificación reenviado! Revisa tu bandeja de entrada.");
      }
    } catch (error: any) {
      console.error("Error obteniendo enlace de verificación:", error);
      if (error.message === 'TIMEOUT' || error.name === 'AbortError') {
        setResendStatus("La solicitud tardó demasiado. Intenta de nuevo.");
      } else {
        setResendStatus(`Error: ${error.message || "No se pudo obtener el enlace de verificación"}`);
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Obtener enlace automáticamente si hay email
  useEffect(() => {
    if (email) {
      handleGetVerificationLink(email);
    }
  }, [email]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/FondoPoS.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro para mejor legibilidad */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Contenedor principal */}
      <div className="w-full max-w-lg relative z-10">
        {/* Card con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
              POSOQO
            </h1>
            <div className="h-0.5 w-20 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mx-auto mb-3"></div>
            <p className="text-white/90 text-sm font-medium tracking-wide">
              Verifica tu Email
            </p>
          </div>

          {/* Contenido principal */}
          <div className="bg-yellow-500/20 backdrop-blur-sm border border-[#FFD700]/50 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-bold text-yellow-200 mb-2">
                ¡Cuenta creada exitosamente!
              </h2>
              <p className="text-yellow-200 text-sm mb-4">
                Debes verificar tu email antes de iniciar sesión.
              </p>
              {email && (
                <p className="text-yellow-300 text-xs font-medium mb-4">
                  Email: {email}
                </p>
              )}
            </div>

            <div className="bg-black/20 rounded-lg p-4 mb-4">
              <p className="text-white/90 text-xs mb-3 font-medium">
                📧 Revisa tu bandeja de entrada (y la carpeta de spam) para encontrar el email de verificación.
              </p>
              <p className="text-white/80 text-xs">
                Haz clic en el enlace del email para verificar tu cuenta.
              </p>
            </div>

            {resendLoading && (
              <div className="text-center mb-4">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-yellow-400 border-t-transparent"></div>
                <p className="text-yellow-200 text-xs mt-2">Obteniendo enlace de verificación...</p>
              </div>
            )}

            {resendStatus && (
              <div className="mt-4 mb-4">
                <p className={`text-xs font-semibold mb-2 ${
                  resendStatus.startsWith('¡Email') ? 'text-green-200' : 
                  resendStatus.startsWith('Usa el') ? 'text-yellow-200' : 
                  'text-red-200'
                }`}>
                  {resendStatus}
                </p>
                {verificationUrl && (
                  <div className="bg-black/30 rounded p-3 mt-2">
                    <a 
                      href={verificationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-300 hover:text-blue-200 underline break-all text-xs"
                    >
                      {verificationUrl}
                    </a>
                  </div>
                )}
              </div>
            )}

            {email && (
              <button
                type="button"
                onClick={() => handleGetVerificationLink(email)}
                className="w-full bg-white hover:bg-gray-100 text-black font-bold px-4 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-4"
                disabled={resendLoading}
              >
                {resendLoading ? "Obteniendo..." : "Reenviar email de verificación"}
              </button>
            )}

            <div className="pt-4 border-t border-yellow-400/30">
              <Link 
                href="/login" 
                className="block text-center text-yellow-200 hover:text-yellow-100 text-xs font-medium transition-colors duration-200"
              >
                Ya verifiqué mi email, ir a login →
              </Link>
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-center">
            <p className="text-white/60 text-xs mb-2">
              ¿No recibiste el email?
            </p>
            <ul className="text-white/50 text-xs space-y-1 text-left bg-black/20 rounded p-3">
              <li>• Revisa tu carpeta de spam o correo no deseado</li>
              <li>• Verifica que el email sea correcto</li>
              <li>• Espera unos minutos y vuelve a intentar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

