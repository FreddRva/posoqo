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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0714] via-[#18151f] to-[#0f0f0f] p-4 relative overflow-hidden">
      {/* Efectos de fondo mejorados */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,215,0,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_70%)]"></div>
      
      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#D4AF37]/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-[#FFD700]/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#D4AF37]/20 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-[#FFD700]/30 rounded-full animate-pulse delay-1500"></div>
      </div>
      
      {/* Contenedor principal del formulario */}
      <div className="w-full max-w-md relative z-10">
        {/* Card del formulario mejorado */}
        <div className="bg-[#18151f]/95 backdrop-blur-2xl border border-[#D4AF37]/40 rounded-3xl p-8 shadow-2xl shadow-[#D4AF37]/20 relative overflow-hidden">
          {/* Efecto de brillo en el borde */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-transparent to-[#FFD700]/20 opacity-50"></div>
          <div className="relative z-10">
          
          {/* Header con logo mejorado */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-[#D4AF37]/30 relative overflow-hidden">
                {/* Efecto de brillo interno */}
                <div className="absolute inset-2 bg-gradient-to-r from-[#FFD700]/30 to-[#D4AF37]/30 rounded-full"></div>
                <span className="text-3xl font-bold text-black relative z-10">P</span>
              </div>
              {/* Anillo decorativo */}
              <div className="absolute inset-0 w-20 h-20 border-2 border-[#D4AF37]/30 rounded-full mx-auto animate-spin" style={{animationDuration: '10s'}}></div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-[#D4AF37] bg-clip-text text-transparent">
              Bienvenido a POSOQO
            </h1>
            <p className="text-gray-300 text-lg">Inicia sesión en tu cuenta</p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full mx-auto mt-4"></div>
          </div>

          {/* Formulario de email/password */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            
            {/* Campo Email mejorado */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-[#D4AF37] mb-3 group-focus-within:text-[#FFD700] transition-colors">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                  errors.email 
                      ? "border-red-500 bg-red-500/10 focus:ring-red-500/20 shadow-lg shadow-red-500/10" 
                      : "border-[#D4AF37]/40 bg-gray-800/60 focus:border-[#D4AF37] focus:bg-gray-800 focus:ring-[#D4AF37]/30 focus:shadow-lg focus:shadow-[#D4AF37]/20"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-4 backdrop-blur-sm`}
                placeholder="tu@email.com"
                disabled={loading}
              />
                {/* Efecto de brillo en el input */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D4AF37]/5 to-[#FFD700]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
              {errors.email && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                </div>
              )}
            </div>

            {/* Campo Contraseña mejorado */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-[#D4AF37] mb-3 group-focus-within:text-[#FFD700] transition-colors">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full pl-12 pr-14 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    errors.password 
                      ? "border-red-500 bg-red-500/10 focus:ring-red-500/20 shadow-lg shadow-red-500/10" 
                      : "border-[#D4AF37]/40 bg-gray-800/60 focus:border-[#D4AF37] focus:bg-gray-800 focus:ring-[#D4AF37]/30 focus:shadow-lg focus:shadow-[#D4AF37]/20"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-4 backdrop-blur-sm`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {/* Botón para mostrar/ocultar contraseña mejorado */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-all duration-300 p-2 rounded-lg hover:bg-[#D4AF37]/10"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                {/* Efecto de brillo en el input */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D4AF37]/5 to-[#FFD700]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
              {errors.password && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                </div>
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

            {/* Botón de login mejorado */}
            <div className="relative group">
            <button
              type="submit"
              disabled={loading}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-5 px-6 rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl hover:shadow-[#D4AF37]/40 transform hover:scale-[1.03] relative overflow-hidden"
            >
                {/* Efecto de brillo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
              {loading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-3"></div>
                    <span className="text-lg">Iniciando sesión...</span>
                </div>
              ) : (
                  <div className="flex items-center justify-center relative z-10">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-lg">Iniciar sesión</span>
                  </div>
              )}
            </button>
              
              {/* Efecto de resplandor exterior */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>
            </div>
          </form>

          {/* Separador mejorado */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-[#18151f] px-6 py-2 rounded-full border border-[#D4AF37]/30">
                <span className="text-[#D4AF37] font-semibold text-sm">o continúa con</span>
            </div>
            </div>
          </div>

          {/* Botón de Google mejorado */}
          <div className="relative group">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
              className="w-full bg-white text-gray-800 font-semibold py-5 px-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] border-2 border-gray-200 hover:border-[#D4AF37]/30 relative overflow-hidden"
            >
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative z-10 flex items-center space-x-4">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
                <span className="text-lg">Continuar con Google</span>
              </div>
          </button>
          </div>

          {/* Enlaces adicionales mejorados */}
          <div className="mt-10 text-center space-y-4">
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
              <p className="text-gray-300 text-sm mb-2">
                ¿No tienes cuenta?
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center text-[#D4AF37] hover:text-[#FFD700] transition-all duration-300 font-semibold hover:underline group"
              >
                <span>Regístrate aquí</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="pt-4 border-t border-gray-700/30">
              <Link 
                href="/" 
                className="inline-flex items-center text-gray-400 hover:text-white transition-all duration-300 text-sm group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al inicio
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
} 