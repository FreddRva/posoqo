"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { useNotifications } from "@/hooks/useNotifications";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    last_name: "",
    dni: "",
    phone: "",
    address: "",
    addressRef: "",
    streetNumber: "",
  });
  const [consultandoDNI, setConsultandoDNI] = useState(false);
  const [dniVerificado, setDniVerificado] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { notifications, stats } = useNotifications();
  const unread = notifications.filter(n => !n.is_read) ?? [];
  const all = notifications ?? [];

  // Función para verificar si el perfil está completo
  const isProfileComplete = (profileData: any) => {
    if (!profileData) return false;
    return profileData.name && 
           profileData.last_name && 
           profileData.dni && 
           profileData.phone;
  };

  // Función para verificar campos faltantes
  const getMissingFields = (profileData: any) => {
    if (!profileData) return {};
    const missing: any = {};
    if (!profileData.name) missing.name = true;
    if (!profileData.last_name) missing.last_name = true;
    if (!profileData.dni) missing.dni = true;
    if (!profileData.phone) missing.phone = true;
    return missing;
  };

  // Cargar datos del perfil desde la API
  useEffect(() => {
    async function fetchProfile() {
      if (status === "authenticated" && session) {
        setLoading(true);
        try {
          // Obtener accessToken de la sesión
          const accessToken = (session as any)?.accessToken;
          const profileData = await apiFetch<any>("/profile", { 
            method: "GET",
            authToken: accessToken 
          });
          setProfile(profileData);
          setForm({
            name: (profileData as any).name || "",
            last_name: (profileData as any).last_name || "",
            dni: (profileData as any).dni || "",
            phone: (profileData as any).phone || "",
            address: (profileData as any).address || "",
            addressRef: (profileData as any).addressRef || "",
            streetNumber: (profileData as any).streetNumber || "",
          });
        } catch (error) {
          console.error("Error cargando perfil:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchProfile();
  }, [status, session]);

  useEffect(() => {
    // Cargar historial de pedidos
    async function fetchOrders() {
      if (status === "authenticated" && session) {
        setLoadingOrders(true);
        try {
          // Obtener accessToken de la sesión
          const accessToken = (session as any)?.accessToken;
          const res = await apiFetch<any[]>("/orders", { 
            method: "GET",
            authToken: accessToken 
          });
          setOrders(res);
        } catch {
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      }
    }
    fetchOrders();
  }, [status, session]);

  if (status === "loading" || loading) {
    return <div className="text-center mt-20">Cargando perfil...</div>;
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const { name, email, image, role } = session.user as any;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Si cambia el DNI, resetear verificación
    if (e.target.name === 'dni') {
      setDniVerificado(false);
    }
  }

  // Función para consultar DNI cuando se complete
  const handleDNIBlur = async () => {
    const dniValue = form.dni.trim();
    
    // Solo consultar si tiene exactamente 8 dígitos
    if (!/^\d{8}$/.test(dniValue)) {
      setDniVerificado(false);
      return;
    }

    // Si ya tiene nombre completo, no consultar de nuevo
    if (form.name.trim() !== '' && form.last_name.trim() !== '') {
      return;
    }

    setConsultandoDNI(true);
    setDniVerificado(false);
    try {
      // Construir URL correctamente (evitar duplicación de /api)
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com';
      // Remover /api si está al final
      apiUrl = apiUrl.replace(/\/api\/?$/, '');
      // Remover barra final si existe
      apiUrl = apiUrl.replace(/\/$/, '');
      const url = `${apiUrl}/api/dni/${dniValue}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Autocompletar los datos con los datos del DNI
          if (!form.name.trim()) {
            setForm(prev => ({ ...prev, name: result.data.nombres || '' }));
          }
          if (!form.last_name.trim()) {
            const apellidos = `${result.data.apellido_paterno || ''} ${result.data.apellido_materno || ''}`.trim();
            setForm(prev => ({ ...prev, last_name: apellidos }));
          }
          setDniVerificado(true);
        } else {
          setDniVerificado(false);
        }
      } else {
        setDniVerificado(false);
      }
    } catch (error) {
      console.error('Error consultando DNI:', error);
      setDniVerificado(false);
    } finally {
      setConsultandoDNI(false);
    }
  };

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    
    try {
      const accessToken = (session as any)?.accessToken;
      const updatedProfile = await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify(form),
        authToken: accessToken,
      });
      setProfile(updatedProfile);
      setEditing(false);
      alert("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("Error al actualizar el perfil");
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div>
          <Image
            src={image || "/file.svg"}
            alt={name || "Avatar"}
            width={100}
            height={100}
            className="rounded-full border-2 border-amber-400 object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-stone-900">{profile?.name || name}</h2>
          <p className="text-stone-600">{profile?.email || email}</p>
          {profile?.role && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
              {profile.role}
            </span>
          )}
          
          {/* Mostrar estado del perfil */}
          {profile && (
            <div className="mt-2">
              {isProfileComplete(profile) ? (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span>✅</span>
                  <span className="font-semibold">Perfil completo</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <span>⚠️</span>
                  <span className="font-semibold">Perfil incompleto</span>
                </div>
              )}
            </div>
          )}
          
          {profile?.address && (
            <p className="mt-2 text-stone-500 text-sm">
              <span className="font-semibold">Dirección:</span> {profile.address}
            </p>
          )}
          {profile?.phone && (
            <p className="mt-1 text-stone-500 text-sm">
              <span className="font-semibold">Teléfono:</span> {profile.phone}
            </p>
          )}
          {profile?.dni && (
            <p className="mt-1 text-stone-500 text-sm">
              <span className="font-semibold">DNI:</span> {profile.dni}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button
            className="py-2 px-4 rounded bg-amber-400 text-stone-900 font-bold hover:bg-amber-300 transition"
            onClick={() => setEditing(true)}
          >
            {profile && isProfileComplete(profile) ? "Modificar perfil" : "Completar perfil"}
          </button>
          <button
            className="py-2 px-4 rounded bg-stone-900 text-white font-bold hover:bg-stone-700 transition"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">
              {profile && isProfileComplete(profile) ? "Modificar perfil" : "Completar perfil"}
            </h3>
            {profile && !isProfileComplete(profile) && (
              <p className="text-sm text-amber-600 mb-4">
                Completa tu información personal para una mejor experiencia de compra.
              </p>
            )}
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                Nombre
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                Apellido
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1">
                DNI <span className="text-xs text-gray-500">(Opcional - 8 dígitos)</span>
                <div className="relative">
                  <input
                    type="text"
                    name="dni"
                    value={form.dni}
                    onChange={handleChange}
                    onBlur={handleDNIBlur}
                    maxLength={8}
                    className={`border rounded px-3 py-2 w-full ${
                      dniVerificado ? 'border-green-400' : 'border-gray-300'
                    }`}
                    placeholder="12345678"
                    disabled={consultandoDNI}
                  />
                  {consultandoDNI && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {dniVerificado && !consultandoDNI && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-green-500 text-sm">✓</span>
                    </div>
                  )}
                </div>
                {dniVerificado && (
                  <p className="text-xs text-green-600 mt-1">DNI verificado - Datos autocompletados</p>
                )}
              </label>
              <label className="flex flex-col gap-1">
                Teléfono
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1">
                Dirección
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1">
                Referencia de Dirección
                <input
                  type="text"
                  name="addressRef"
                  value={form.addressRef}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1">
                Número de Calle
                <input
                  type="text"
                  name="streetNumber"
                  value={form.streetNumber}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </label>
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded bg-amber-400 text-stone-900 font-bold hover:bg-amber-300 transition"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 rounded bg-stone-900 text-white font-bold hover:bg-stone-700 transition"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historial de pedidos */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-4">Historial de pedidos</h3>
        {loadingOrders ? (
          <div className="text-center text-stone-500">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-stone-400">No tienes pedidos aún.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-stone-100">
                  <th className="px-3 py-2 text-left"># Pedido</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-3 py-2">{order.id}</td>
                    <td className="px-3 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2">S/ {order.total}</td>
                    <td className="px-3 py-2">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notificaciones recientes */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-4">Notificaciones recientes</h3>
        {unread.length === 0 && all.length === 0 ? (
          <div className="text-center text-stone-400">No tienes notificaciones recientes.</div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {(unread.length > 0 ? unread : all.slice(0, 5)).map((n) => (
              <li key={n.id} className="py-3 flex items-start gap-3">
                <span className="text-lg">
                  {n.type === "success" ? "✅" : n.type === "error" ? "❌" : n.type === "warning" ? "⚠️" : "ℹ️"}
                </span>
                <div>
                  <div className="font-semibold text-stone-900 text-sm">{n.title}</div>
                  {n.message && <div className="text-xs text-stone-600">{n.message}</div>}
                  <div className="text-xs text-stone-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 