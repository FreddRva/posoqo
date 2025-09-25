"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// Tipos TypeScript para mejor seguridad de tipos
interface RegisterForm {
  name: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  lastName?: string;
  dni?: string;
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
    dni: "",
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

    // Validar DNI
    if (!formData.dni.trim()) {
      newErrors.dni = "El DNI es requerido";
    } else if (formData.dni.length < 8 || formData.dni.length > 12) {
      newErrors.dni = "El DNI debe tener entre 8 y 12 caracteres";
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (formData.phone.length < 6 || formData.phone.length > 20) {
      newErrors.phone = "El teléfono debe tener entre 6 y 20 caracteres";
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
      const response = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          last_name: formData.lastName.trim(),
          dni: formData.dni.trim(),
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
        // Limpiar formulario después de registro exitoso
        setFormData({
          name: "",
          lastName: "",
          dni: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      setGeneralError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 relative overflow-hidden">
      {/* Efectos de fondo sutiles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.05),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,215,0,0.03),transparent_60%)]"></div>
      
      {/* Contenedor principal del formulario */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Card del formulario profesional */}
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#FFD700]/5 opacity-30"></div>
          
          {/* Header profesional */}
          <div className="text-center mb-8 relative z-10">
            {/* Logo POSOQO con efecto */}
            <div className="mb-6 relative">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                <img 
                  src="/Logo.png" 
                  alt="POSOQO" 
                  className="w-10 h-10"
                />
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
            
            {/* Título principal */}
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
              Crear Cuenta
            </h1>
            <p className="text-gray-400 text-sm font-medium">Únete a POSOQO Cervezas Artesanales</p>
            
            {/* Línea decorativa */}
            <div className="w-20 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full mx-auto mt-4"></div>
          </div>

          {/* Mensaje de éxito */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <p className="text-green-400 text-sm">
                ¡Registro exitoso! Redirigiendo al login...
              </p>
            </div>
          )}

          {/* Formulario de registro */}
          <form onSubmit={handleRegister} className="space-y-6 relative z-10">
            
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-200">
                  Nombre
                </label>
                <div className="relative group">
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.name 
                        ? "border-red-500 bg-red-500/10 focus:ring-red-500/20" 
                        : "border-gray-600 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 group-hover:border-gray-500"
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-4 backdrop-blur-sm`}
                    placeholder="Tu nombre"
                    disabled={loading}
                  />
                  {/* Efecto de brillo en focus */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.name && (
                  <p className="text-red-400 text-sm flex items-center font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-200">
                  Apellido
                </label>
                <div className="relative group">
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.lastName 
                        ? "border-red-500 bg-red-500/10 focus:ring-red-500/20" 
                        : "border-gray-600 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 group-hover:border-gray-500"
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-4 backdrop-blur-sm`}
                    placeholder="Tu apellido"
                    disabled={loading}
                  />
                  {/* Efecto de brillo en focus */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.lastName && (
                  <p className="text-red-400 text-sm flex items-center font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* DNI y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dni" className="block text-sm font-medium text-gray-300 mb-2">
                  DNI
                </label>
      <input
                  id="dni"
        type="text"
                  value={formData.dni}
                  onChange={(e) => handleInputChange("dni", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    errors.dni 
                      ? "border-red-500 bg-red-500/10" 
                      : "border-gray-600 bg-gray-800/50 focus:border-[#FFD700] focus:bg-gray-800"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20`}
                  placeholder="12345678"
                  disabled={loading}
                />
                {errors.dni && (
                  <p className="text-red-400 text-xs mt-1">{errors.dni}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    errors.phone 
                      ? "border-red-500 bg-red-500/10" 
                      : "border-gray-600 bg-gray-800/50 focus:border-[#FFD700] focus:bg-gray-800"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20`}
                  placeholder="999888777"
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
      <input
                id="email"
        type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  errors.email 
                    ? "border-red-500 bg-red-500/10" 
                    : "border-gray-600 bg-gray-800/50 focus:border-[#FFD700] focus:bg-gray-800"
                } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20`}
                placeholder="tu@email.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full px-3 py-2 pr-12 rounded-lg border transition-colors ${
                    errors.password 
                      ? "border-red-500 bg-red-500/10" 
                      : "border-gray-600 bg-gray-800/50 focus:border-[#FFD700] focus:bg-gray-800"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {/* Botón para mostrar/ocultar contraseña */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
      <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`w-full px-3 py-2 pr-12 rounded-lg border transition-colors ${
                    errors.confirmPassword 
                      ? "border-red-500 bg-red-500/10" 
                      : "border-gray-600 bg-gray-800/50 focus:border-[#FFD700] focus:bg-gray-800"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {/* Botón para mostrar/ocultar confirmación de contraseña */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Error general */}
            {generalError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{generalError}</p>
              </div>
            )}

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-black font-bold py-3 px-4 rounded-lg hover:from-[#D4AF37] hover:to-[#FFD700] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                "Crear cuenta"
              )}
      </button>
    </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link 
                href="/login" 
                className="text-[#FFD700] hover:text-[#D4AF37] transition-colors font-medium"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 