"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestCode = async (e: React.FormEvent) => {
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
        setError(data.error || "Error al enviar el código de recuperación");
      } else {
        setSuccess(true);
        setStep("code");
        setError(null);
      }
    } catch (error) {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!code.trim() || code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    if (!newPassword) {
      setError("La nueva contraseña es requerida");
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com';
      const response = await fetch(`${apiUrl}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al restablecer la contraseña");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
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
              {step === "email" ? "Recuperar Contraseña" : "Restablecer Contraseña"}
            </p>
          </div>

          {/* Mensaje de éxito */}
          {success && step === "email" && (
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/50 rounded-lg p-4 mb-6">
              <p className="text-green-200 text-sm font-semibold">
                ¡Código enviado! Revisa tu correo electrónico (incluyendo spam).
              </p>
            </div>
          )}

          {success && step === "code" && (
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/50 rounded-lg p-4 mb-6">
              <p className="text-green-200 text-sm font-semibold">
                ¡Contraseña restablecida! Redirigiendo al login...
              </p>
            </div>
          )}

          {/* Formulario - Paso 1: Solicitar código */}
          {step === "email" && (
            <form onSubmit={handleRequestCode} className="space-y-5">
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
                Ingresa tu email y te enviaremos un código de 6 dígitos por correo electrónico.
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
                  "ENVIAR CÓDIGO"
                )}
              </button>
            </form>
          )}

          {/* Formulario - Paso 2: Ingresar código y nueva contraseña */}
          {step === "code" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Información del email */}
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-white/80 text-xs mb-1">Email:</p>
                <p className="text-white font-medium text-sm">{email}</p>
              </div>

              {/* Campo Código */}
              <div>
                <label htmlFor="code" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
                  Código de Verificación (6 dígitos)
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 pl-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="code"
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCode(value);
                      if (error) setError(null);
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-transparent border-b-2 transition-all duration-200 text-center text-2xl tracking-widest font-bold ${
                      error 
                        ? "border-red-400 text-white" 
                        : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                    } focus:outline-none`}
                    placeholder="000000"
                    disabled={loading || success}
                    autoFocus
                  />
                </div>
                {error && !error.includes("contraseña") && (
                  <p className="text-red-300 text-xs mt-1.5 flex items-center font-medium">
                    <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>

              {/* Campo Nueva Contraseña */}
              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 pl-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-transparent border-b-2 transition-all duration-200 ${
                      error && error.includes("contraseña")
                        ? "border-red-400 text-white" 
                        : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                    } focus:outline-none text-sm font-medium`}
                    placeholder="••••••••"
                    disabled={loading || success}
                  />
                </div>
              </div>

              {/* Campo Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 pl-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-transparent border-b-2 transition-all duration-200 ${
                      error && error.includes("coinciden")
                        ? "border-red-400 text-white" 
                        : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                    } focus:outline-none text-sm font-medium`}
                    placeholder="••••••••"
                    disabled={loading || success}
                  />
                </div>
                {error && (error.includes("contraseña") || error.includes("coinciden")) && (
                  <p className="text-red-300 text-xs mt-1.5 flex items-center font-medium">
                    <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>

              <p className="text-white/70 text-xs text-center">
                Ingresa el código de 6 dígitos que recibiste por correo y tu nueva contraseña.
              </p>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 hover:scale-[1.02] active:scale-[0.98] text-black font-bold py-3.5 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2 animate-spin" />
                      <span>Restableciendo...</span>
                    </div>
                  ) : (
                    "RESTABLECER CONTRASEÑA"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setError(null);
                    setSuccess(false);
                  }}
                  className="w-full text-white/80 hover:text-white text-xs font-medium transition-colors duration-200"
                >
                  Volver a solicitar código
                </button>
              </div>
            </form>
          )}

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

