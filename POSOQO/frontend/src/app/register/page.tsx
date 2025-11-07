"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { getApiUrl } from "@/lib/config";
import { validatePeruvianCellphone } from "@/lib/utils/validation";

// Tipos TypeScript para mejor seguridad de tipos
interface RegisterForm {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  // Estados del formulario
  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // Estados de UI y validación
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  
  // Hooks de Next.js
  const router = useRouter();

  // Validación de email usando regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación de contraseña fuerte
  const validateStrongPassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol;
  };

  // Validación de nombre (solo letras y espacios)
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
  };

  // Validación del formulario completo
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (!validateName(formData.name)) {
      newErrors.name = "El nombre debe contener solo letras (2-50 caracteres)";
    }

    // Validar apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName = "El apellido debe contener solo letras (2-50 caracteres)";
    }

    // Validar teléfono (celular peruano)
    const phoneValidation = validatePeruvianCellphone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error || "El teléfono es inválido";
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (!validateStrongPassword(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo";
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (field: keyof RegisterForm, value: string) => {
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

  // Obtener enlace de verificación
  const handleGetVerificationLink = async (email: string) => {
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
        body: JSON.stringify({ email }),
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

  // Manejar envío del formulario
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError(null);
    setSuccess(false);

    try {
      const response = await fetch(getApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.error || "Error al registrar usuario");
      } else {
        setSuccess(true);
        setRegisteredEmail(formData.email.trim().toLowerCase());
        
        // Limpiar formulario después de registro exitoso
        setFormData({
          name: "",
          lastName: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        
        // Obtener enlace de verificación inmediatamente
        handleGetVerificationLink(formData.email.trim().toLowerCase());
      }
    } catch (error) {
      setGeneralError("Error de conexión. Intenta de nuevo.");
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
      
      {/* Contenedor principal del formulario */}
      <div className="w-full max-w-lg relative z-10">
        {/* Card del formulario con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
              POSOQO
            </h1>
            <div className="h-0.5 w-20 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mx-auto mb-3"></div>
            <p className="text-white/90 text-sm font-medium tracking-wide">
              Únete a POSOQO
            </p>
          </div>

          {/* Mensaje de éxito y verificación */}
          {success && (
            <div className="bg-yellow-500/20 backdrop-blur-sm border border-[#FFD700]/50 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-xs font-semibold mb-3">
                ¡Cuenta creada exitosamente! Debes verificar tu email antes de iniciar sesión.
              </p>
              
              {resendLoading && (
                <p className="text-yellow-200 text-xs mb-2">Obteniendo enlace de verificación...</p>
              )}
              
              {resendStatus && (
                <div className="mt-2.5 text-xs font-semibold">
                  <p className={resendStatus.startsWith('¡Email') ? 'text-green-200' : resendStatus.startsWith('Usa el') ? 'text-yellow-200' : 'text-red-200'}>
                    {resendStatus}
                  </p>
                  {verificationUrl && (
                    <a 
                      href={verificationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 block text-blue-300 hover:text-blue-200 underline break-all bg-black/20 p-2 rounded"
                    >
                      {verificationUrl}
                    </a>
                  )}
                </div>
              )}
              
              {registeredEmail && (
                <button
                  type="button"
                  onClick={() => handleGetVerificationLink(registeredEmail)}
                  className="mt-3 w-full bg-white hover:bg-gray-100 text-black font-bold px-4 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={resendLoading}
                >
                  {resendLoading ? "Obteniendo..." : "Obtener enlace de verificación"}
                </button>
              )}
              
              <div className="mt-4 pt-3 border-t border-yellow-400/30">
                <Link 
                  href="/login" 
                  className="block text-center text-yellow-200 hover:text-yellow-100 text-xs font-medium transition-colors duration-200"
                >
                  Ya verifiqué mi email, ir a login →
                </Link>
              </div>
            </div>
          )}

          {/* Formulario de registro */}
          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 bg-transparent border-b-2 transition-all duration-200 ${
                    errors.name 
                      ? "border-red-400 text-white" 
                      : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                  } focus:outline-none text-sm font-medium`}
                  placeholder="Nombre"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-300 text-xs mt-1.5 font-medium">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`w-full px-4 py-3 bg-transparent border-b-2 transition-all duration-200 ${
                    errors.lastName 
                      ? "border-red-400 text-white" 
                      : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                  } focus:outline-none text-sm font-medium`}
                  placeholder="Apellido"
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-red-300 text-xs mt-1.5 font-medium">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full px-4 py-3 bg-transparent border-b-2 transition-all duration-200 ${
                  errors.phone 
                    ? "border-red-400 text-white" 
                    : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                } focus:outline-none text-sm font-medium`}
                placeholder="987654321 o +51 987654321"
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-red-300 text-xs mt-1.5 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
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
                <p className="text-red-300 text-xs mt-1.5 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-red-300 text-xs mt-1.5 font-medium">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
                  Confirmar
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 pl-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`w-full pl-12 pr-12 py-3 bg-transparent border-b-2 transition-all duration-200 ${
                      errors.confirmPassword 
                        ? "border-red-400 text-white" 
                        : "border-white/30 text-white focus:border-yellow-400 placeholder-white/50"
                    } focus:outline-none text-sm font-medium`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-300 text-xs mt-1.5 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Error general */}
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

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 hover:scale-[1.02] active:scale-[0.98] text-black font-bold py-3.5 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2 animate-spin" />
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                "CREAR CUENTA"
              )}
            </button>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center">
            <p className="text-white/80 text-xs mb-2 font-medium">
              ¿Ya tienes cuenta?
            </p>
            <Link 
              href="/login" 
              className="inline-block text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 hover:bg-clip-text hover:text-transparent font-bold text-xs transition-all duration-200"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 