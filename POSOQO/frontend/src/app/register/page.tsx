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
      <div className="w-full max-w-lg relative z-10">
        {/* Card del formulario profesional */}
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#FFD700]/5 opacity-30"></div>
          
          {/* Header compacto */}
          <div className="text-center mb-6 relative z-10">
            {/* Logo POSOQO */}
            <div className="mb-4 relative">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                <img 
                  src="/Logo.png" 
                  alt="POSOQO" 
                  className="w-8 h-8"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-1">Crear Cuenta</h1>
            <p className="text-gray-400 text-xs">Únete a POSOQO</p>
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
          <form onSubmit={handleRegister} className="space-y-4 relative z-10">
            
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                    errors.name 
                      ? "border-red-500 bg-red-500/10 focus:ring-red-500/20" 
                      : "border-gray-600 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
                  placeholder="Nombre"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                    errors.lastName 
                      ? "border-red-500 bg-red-500/10 focus:ring-red-500/20" 
                      : "border-gray-600 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
                  placeholder="Apellido"
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-red-400 text-xs">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* DNI y Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="dni" className="block text-sm font-medium text-gray-300">
                  DNI
                </label>
                <input
                  id="dni"
                  type="text"
                  value={formData.dni}
                  onChange={(e) => handleInputChange("dni", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                    errors.dni 
                      ? "border-red-500 bg-red-500/10 focus:ring-red-500/20" 
                      : "border-gray-600 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
                  placeholder="12345678"
                  disabled={loading}
                />
                {errors.dni && (
                  <p className="text-red-400 text-xs">{errors.dni}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                    errors.phone 
                      ? "border-red-500 bg-red-500/10 focus:ring-red-500/20" 
                      : "border-gray-600 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
                  placeholder="999888777"
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                  errors.email 
                    ? "border-red-500 bg-red-500/10 focus:ring-red-500/20" 
                    : "border-gray-600 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
                placeholder="tu@email.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    className={`w-full px-3 py-2 pr-10 rounded-lg border transition-all duration-200 ${
                      errors.password 
                        ? "border-red-500 bg-red-500/10 focus:ring-red-500/20" 
                        : "border-gray-600 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
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
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirmar
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`w-full px-3 py-2 pr-10 rounded-lg border transition-all duration-200 ${
                      errors.confirmPassword 
                        ? "border-red-500 bg-red-500/10 focus:ring-red-500/20" 
                        : "border-gray-600 bg-gray-700/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-2`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
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
                  <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
                )}
              </div>
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
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3 px-4 rounded-lg hover:from-[#FFD700] hover:to-[#D4AF37] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
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