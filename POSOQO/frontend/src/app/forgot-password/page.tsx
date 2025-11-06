"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("El email es requerido");
      return;
    }

    if (!validateEmail(email)) {
      setError("Ingresa un email válido");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com';
      const response = await fetch(`${apiUrl}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al enviar el email de recuperación");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="w-full max-w-[420px] relative z-10">
        {/* Card del formulario con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
              POSOQO
            </h1>
            <div className="h-0.5 w-20 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mx-auto mb-3"></div>
            <p className="text-white/90 text-sm font-medium tracking-wide">
              Recuperar Contraseña
            </p>
          </div>

          {/* Mensaje de éxito */}
          {success && (
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/50 rounded-lg p-4 mb-6">
              <p className="text-green-200 text-sm font-semibold">
                ¡Email enviado! Revisa tu bandeja de entrada para recuperar tu contraseña. Redirigiendo al login...
              </p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 pl-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-transparent border-b-2 transition-all duration-200 ${
                    error 
                      ? "border-red-400 text-white" 
                      : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                  } focus:outline-none text-sm font-medium`}
                  placeholder="tu@email.com"
                  disabled={loading || success}
                />
              </div>
              {error && (
                <p className="text-red-300 text-xs mt-1.5 flex items-center font-medium">
                  <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <p className="text-white/70 text-xs text-center">
              Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña.
            </p>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 hover:scale-[1.02] active:scale-[0.98] text-black font-bold py-3.5 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2 animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                "ENVIAR EMAIL"
              )}
            </button>
          </form>

          {/* Enlaces */}
          <div className="mt-6 text-center space-y-3">
            <Link 
              href="/login" 
              className="inline-block text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 hover:bg-clip-text hover:text-transparent font-bold text-xs transition-all duration-200"
            >
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

