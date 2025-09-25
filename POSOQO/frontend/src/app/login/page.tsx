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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      
      {/* Contenedor principal del formulario */}
      <div className="w-full max-w-sm">
        {/* Card del formulario compacto */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          
          {/* Header compacto */}
          <div className="text-center mb-6">
            {/* Logo POSOQO con trigo */}
            <div className="mb-4">
              <img 
                src="/Logo.png" 
                alt="POSOQO" 
                className="w-12 h-12 mx-auto"
              />
            </div>
            
            {/* Título principal */}
            <h1 className="text-2xl font-bold text-white mb-1">
              POSOQO
            </h1>
            <p className="text-gray-400 text-xs">Cervezas Artesanales</p>
          </div>

          {/* Formulario de email/password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            
            {/* Campo Email elegante */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                    errors.email 
                      ? "border-red-500 bg-red-500/5 focus:ring-red-500/20" 
                      : "border-gray-700 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                  } text-white placeholder-gray-500 focus:outline-none focus:ring-2`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Campo Contraseña elegante */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                    errors.password 
                      ? "border-red-500 bg-red-500/5 focus:ring-red-500/20" 
                      : "border-gray-700 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                  } text-white placeholder-gray-500 focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
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
                <p className="text-red-400 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
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

            {/* Botón de login compacto */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-semibold py-2 px-4 rounded-lg hover:from-[#FFD700] hover:to-[#D4AF37] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  <span className="text-sm">Iniciando...</span>
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 