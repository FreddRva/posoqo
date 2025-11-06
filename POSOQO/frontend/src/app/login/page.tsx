"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// Tipos
interface LoginForm {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  // Estados
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  // Hooks
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (status === "authenticated" && session) {
      const redirectPath = typeof window !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null;
      if (redirectPath && redirectPath !== '/login') {
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  // Validaciones
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError(null);
    setUnverifiedEmail(null);
    setResendStatus(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED") || result.error.includes("verificar tu email")) {
          setUnverifiedEmail(formData.email.trim().toLowerCase());
        } else {
          setGeneralError("Credenciales inválidas. Verifica tu email y contraseña.");
        }
      } else if (result?.ok) {
        const redirectPath = typeof window !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null;
        if (redirectPath && redirectPath !== '/login') {
          localStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      setGeneralError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendStatus(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus("¡Email de verificación reenviado! Revisa tu bandeja de entrada.");
      } else {
        setResendStatus(data.error || "No se pudo reenviar el email.");
      }
    } catch (e) {
      setResendStatus("Error de conexión al reenviar email.");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setGeneralError(null);
    
    try {
      const redirectPath = typeof window !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null;
      const callbackUrl = redirectPath && redirectPath !== '/login' ? redirectPath : "/";
      
      await signIn("google", { 
        callbackUrl: callbackUrl,
        redirect: true 
      });
    } catch (error) {
      setGeneralError("Error al conectar con Google. Intenta de nuevo.");
      setLoading(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-white/90 text-xs font-medium tracking-wide">
              Cervezas Artesanales Ayacuchanas
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
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
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-transparent border-b-2 transition-all duration-200 ${
                    errors.email 
                      ? "border-red-400 text-white" 
                      : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                  } focus:outline-none text-sm font-medium`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-red-300 text-xs mt-1.5 flex items-center font-medium">
                  <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 pl-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 bg-transparent border-b-2 transition-all duration-200 ${
                    errors.password 
                      ? "border-red-400 text-white" 
                      : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                  } focus:outline-none text-sm font-medium`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-300 text-xs mt-1.5 flex items-center font-medium">
                  <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Errores */}
            {generalError && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-lg p-3">
                <p className="text-red-200 text-xs font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {generalError}
                </p>
              </div>
            )}

            {/* Email no verificado */}
            {unverifiedEmail && (
              <div className="bg-yellow-500/20 backdrop-blur-sm border border-[#FFD700]/50 rounded-lg p-4">
                <p className="text-yellow-200 text-xs font-semibold mb-3">
                  Debes verificar tu email antes de iniciar sesión. ¿No recibiste el email?
                </p>
                <button
                  onClick={handleResendVerification}
                  className="w-full bg-white hover:bg-gray-100 text-black font-bold px-4 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={!!resendStatus && resendStatus.startsWith("¡Email")}
                >
                  Reenviar email de verificación
                </button>
                {resendStatus && (
                  <p className={`mt-2.5 text-xs font-semibold ${
                    resendStatus.startsWith('¡Email') ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {resendStatus}
                  </p>
                )}
              </div>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 hover:scale-[1.02] active:scale-[0.98] text-black font-bold py-3.5 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2 animate-spin" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "INICIAR SESIÓN"
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="relative flex justify-center">
              <span className="bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full border border-white/20 text-xs text-white/90 font-medium uppercase tracking-wide">o continúa con</span>
            </div>
          </div>

          {/* Botón de Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 border-2 border-white/30 rounded-lg text-sm font-semibold text-white bg-white/10 backdrop-blur-sm hover:bg-white/25 hover:border-white/60 hover:scale-[1.02] active:scale-[0.98] active:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4 mr-2.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Enlaces */}
          <div className="mt-6 text-center space-y-3">
            <div>
              <p className="text-white/80 text-xs mb-2 font-medium">
                ¿No tienes una cuenta?
              </p>
              <Link 
                href="/register" 
                className="inline-block text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 hover:bg-clip-text hover:text-transparent font-bold text-xs transition-all duration-200"
              >
                Regístrate aquí
              </Link>
            </div>
            
            <div className="pt-3 border-t border-white/20">
              <Link 
                href="/forgot-password" 
                className="text-white/80 hover:text-white text-xs font-medium transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}