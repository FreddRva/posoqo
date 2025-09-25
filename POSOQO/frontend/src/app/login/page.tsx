"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// Tipos TypeScript para mejor seguridad de tipos
interface LoginForm {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  // Estados del formulario
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  
  // Estados de UI y validación
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Estado para mostrar si el email no está verificado
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  
  // Hooks de Next.js
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (status === "authenticated" && session) {
      // Verificar si hay una página guardada para redirigir después del login
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath && redirectPath !== '/login') {
        localStorage.removeItem('redirectAfterLogin'); // Limpiar después de usar
        router.push(redirectPath);
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  // Validación de email usando regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación del formulario completo
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Limpiar error general
    if (generalError) {
      setGeneralError(null);
    }
  };

  // Manejar envío del formulario con email/password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError(null);
    setUnverifiedEmail(null);
    setResendStatus(null);

    try {
      // Intentar login con NextAuth
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Detectar error de email no verificado
        if (result.error.includes("EMAIL_NOT_VERIFIED") || result.error.includes("verificar tu email")) {
          setUnverifiedEmail(formData.email.trim().toLowerCase());
        } else {
          setGeneralError("Credenciales inválidas. Verifica tu email y contraseña.");
        }
      } else if (result?.ok) {
        // Login exitoso - verificar si hay página guardada para redirigir
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath && redirectPath !== '/login') {
          localStorage.removeItem('redirectAfterLogin'); // Limpiar después de usar
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

  // Función para reenviar email de verificación
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

  // Manejar login con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setGeneralError(null);
    
    try {
      // Verificar si hay una página guardada para redirigir después del login
      const redirectPath = localStorage.getItem('redirectAfterLogin');
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

  // Si está cargando la sesión, mostrar loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0714] to-[#18151f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4 relative overflow-hidden">
      {/* Efectos de fondo elegantes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,215,0,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(212,175,55,0.02)_50%,transparent_70%)]"></div>
      
      {/* Contenedor principal del formulario */}
      <div className="w-full max-w-lg relative z-10">
        {/* Card del formulario profesional */}
        <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-2xl border border-gray-600/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Efecto de brillo profesional */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-[#FFD700]/10 opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          
          {/* Header profesional */}
          <div className="text-center mb-8 relative z-10">
            {/* Logo POSOQO con efecto */}
            <div className="mb-6 relative">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4AF37] via-[#FFD700] to-[#D4AF37] rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden group">
                <img 
                  src="/Logo.png" 
                  alt="POSOQO" 
                  className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                />
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              {/* Efecto de resplandor exterior */}
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 rounded-2xl blur-xl -z-10"></div>
            </div>
            
            {/* Título principal elegante */}
            <h1 className="text-3xl font-black text-white mb-2 tracking-wide bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              POSOQO
            </h1>
            <p className="text-gray-300 text-sm font-medium mb-4">Cervezas Artesanales Ayacuchanas</p>
            
            {/* Línea decorativa elegante */}
            <div className="relative">
              <div className="w-20 h-0.5 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] rounded-full mx-auto"></div>
              <div className="absolute inset-0 w-20 h-0.5 bg-gradient-to-r from-[#D4AF37]/50 via-[#FFD700]/50 to-[#D4AF37]/50 rounded-full mx-auto blur-sm"></div>
            </div>
          </div>

          {/* Formulario de email/password */}
          <form onSubmit={handleEmailLogin} className="space-y-6 relative z-10">
            
            {/* Campo Email profesional */}
            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-bold text-gray-200 tracking-wide">
                CORREO ELECTRÓNICO
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 via-[#FFD700]/20 to-[#D4AF37]/20 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-500 ${
                    errors.email 
                      ? "border-red-500 bg-red-500/10 focus:ring-red-500/30" 
                      : "border-gray-500/50 bg-gray-700/60 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 group-hover:border-gray-400/70"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-4 backdrop-blur-sm font-medium`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
                {/* Efecto de brillo en focus */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 opacity-0 focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm flex items-center font-semibold">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Campo Contraseña profesional */}
            <div className="space-y-3">
              <label htmlFor="password" className="block text-sm font-bold text-gray-200 tracking-wide">
                CONTRASEÑA
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 via-[#FFD700]/20 to-[#D4AF37]/20 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-500 ${
                    errors.password 
                      ? "border-red-500 bg-red-500/10 focus:ring-red-500/30" 
                      : "border-gray-500/50 bg-gray-700/60 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 group-hover:border-gray-400/70"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-4 backdrop-blur-sm font-medium`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-all duration-300 p-1 rounded-lg hover:bg-gray-600/30"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                {/* Efecto de brillo en focus */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 opacity-0 focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm flex items-center font-semibold">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Error general */}
            {generalError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{generalError}</p>
              </div>
            )}
            {/* Email no verificado */}
            {unverifiedEmail && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-4">
                <p className="text-yellow-700 text-sm font-semibold mb-2">
                  Debes verificar tu email antes de iniciar sesión.<br />
                  ¿No recibiste el email?
                </p>
                <button
                  onClick={handleResendVerification}
                  className="bg-yellow-500 text-black font-bold px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
                  disabled={!!resendStatus && resendStatus.startsWith("¡Email")}
                >
                  Reenviar email de verificación
                </button>
                {resendStatus && (
                  <p className="mt-2 text-sm {resendStatus.startsWith('¡Email') ? 'text-green-600' : 'text-red-500'}">
                    {resendStatus}
                  </p>
                )}
              </div>
            )}

            {/* Botón de login profesional */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] text-black font-black py-4 px-6 rounded-xl hover:from-[#FFD700] hover:via-[#D4AF37] hover:to-[#FFD700] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-[#D4AF37]/40 transform hover:scale-[1.02] relative overflow-hidden group"
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {/* Efecto de resplandor exterior */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 via-[#FFD700]/20 to-[#D4AF37]/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              
              {loading ? (
                <div className="flex items-center justify-center relative z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                  <span className="font-bold text-lg">Iniciando sesión...</span>
                </div>
              ) : (
                <span className="relative z-10 font-black text-lg tracking-wide">INICIAR SESIÓN</span>
              )}
            </button>
          </form>

          {/* Separador elegante */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-600/50">
                <span className="text-gray-400 font-medium text-sm">o continúa con</span>
              </div>
            </div>
          </div>

          {/* Botón de Google profesional */}
          <button
            onClick={() => signIn("google")}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-500/50 rounded-xl shadow-xl text-base font-bold text-white bg-gradient-to-r from-gray-700/60 to-gray-600/60 hover:from-gray-600/70 hover:to-gray-500/70 hover:border-gray-400/70 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm group relative overflow-hidden"
          >
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <svg className="h-6 w-6 mr-4 relative z-10" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="relative z-10 font-bold">CONTINUAR CON GOOGLE</span>
          </button>

          {/* Enlaces de registro y recuperación profesionales */}
          <div className="mt-8 text-center space-y-4">
            <div className="p-4 bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-xl border border-gray-500/30 backdrop-blur-sm">
              <p className="text-gray-200 text-sm mb-3 font-semibold">
                ¿No tienes una cuenta?
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center text-[#D4AF37] hover:text-[#FFD700] transition-all duration-500 font-bold hover:underline group"
              >
                <span>Regístrate aquí</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="pt-4 border-t border-gray-500/30">
              <Link 
                href="/forgot-password" 
                className="inline-flex items-center text-gray-300 hover:text-[#D4AF37] transition-all duration-500 text-sm font-semibold group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 