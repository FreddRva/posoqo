"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

export default function CompletarPerfilPage() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consultandoDNI, setConsultandoDNI] = useState(false);
  const [dniVerificado, setDniVerificado] = useState(false);
  const router = useRouter();

  // Función para consultar DNI cuando se complete
  const handleDNIBlur = async () => {
    const dniValue = dni.trim();
    
    // Solo consultar si tiene exactamente 8 dígitos
    if (!/^\d{8}$/.test(dniValue)) {
      setDniVerificado(false);
      return;
    }

    // Si ya tiene nombre completo, no consultar de nuevo
    if (name.trim() !== '' && lastName.trim() !== '') {
      return;
    }

    setConsultandoDNI(true);
    setDniVerificado(false);
    try {
      // Construir URL correctamente (sin barras duplicadas)
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com').replace(/\/$/, '');
      const url = `${apiUrl}/api/dni/${dniValue}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Autocompletar los datos con los datos del DNI
          if (!name.trim()) {
            setName(result.data.nombres || '');
          }
          if (!lastName.trim()) {
            const apellidos = `${result.data.apellido_paterno || ''} ${result.data.apellido_materno || ''}`.trim();
            setLastName(apellidos);
          }
          setDniVerificado(true);
          setError(null);
        } else {
          setDniVerificado(false);
          setError('DNI no encontrado en los registros');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error al consultar el DNI' }));
        setDniVerificado(false);
        setError(errorData.error || `Error ${response.status}: No se pudo consultar el DNI`);
        console.error('Error en respuesta:', response.status, errorData);
      }
    } catch (error: any) {
      console.error('Error consultando DNI:', error);
      setDniVerificado(false);
      setError(`Error de conexión: ${error.message || 'No se pudo conectar con el servidor'}`);
    } finally {
      setConsultandoDNI(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ 
          name: name.trim() || undefined,
          last_name: lastName.trim() || undefined, 
          dni: dni.trim() || undefined, 
          phone: phone.trim() || undefined 
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err?.error || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/FondoPoS.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-5">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Completa tu Perfil
          </h1>
          <p className="text-white/80 text-sm">Ingresa tus datos para continuar</p>
        </div>

        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border-b-2 border-white/30 text-white focus:border-yellow-400 placeholder-white/50 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* Apellido */}
        <div>
          <label htmlFor="lastName" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
            Apellido
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Tu apellido"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border-b-2 border-white/30 text-white focus:border-yellow-400 placeholder-white/50 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* DNI con autocompletado */}
        <div>
          <label htmlFor="dni" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
            DNI <span className="text-white/50 font-normal normal-case">(8 dígitos)</span>
          </label>
          <div className="relative">
            <input
              id="dni"
              type="text"
              placeholder="12345678"
              value={dni}
              onChange={e => {
                setDni(e.target.value);
                setDniVerificado(false);
              }}
              onBlur={handleDNIBlur}
              maxLength={8}
              className={`w-full px-4 py-3 bg-transparent border-b-2 text-white placeholder-white/50 focus:outline-none text-sm font-medium ${
                dniVerificado 
                  ? 'border-green-400' 
                  : 'border-white/30 focus:border-yellow-400'
              }`}
              disabled={consultandoDNI}
            />
            {consultandoDNI && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              </div>
            )}
            {dniVerificado && !consultandoDNI && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>
          {dniVerificado && (
            <p className="text-green-300 text-xs mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              DNI verificado - Datos autocompletados
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wide">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="999888777"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border-b-2 border-white/30 text-white focus:border-yellow-400 placeholder-white/50 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/50 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-200 text-sm">¡Perfil actualizado correctamente! Redirigiendo...</p>
          </div>
        )}

        {/* Botón */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black font-bold py-3.5 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            "GUARDAR PERFIL"
          )}
        </button>
      </form>
    </div>
  );
} 