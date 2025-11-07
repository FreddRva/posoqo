"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Bell, 
  Settings, 
  LogOut, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package, 
  Truck, 
  CreditCard,
  Mail,
  Phone,
  FileText,
  Home,
  Star,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useNotifications } from "@/hooks/useNotifications";
import { validatePeruvianCellphone } from "@/lib/utils/validation";

type TabType = "info" | "orders" | "addresses" | "notifications" | "settings";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("info");
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
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { notifications, stats } = useNotifications();
  const unread = notifications.filter(n => !n.is_read) ?? [];
  const all = notifications ?? [];

  // Estadísticas del usuario
  const statsData = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0),
    pendingOrders: orders.filter(o => ['recibido', 'preparando', 'camino'].includes(o.status?.toLowerCase())).length,
    completedOrders: orders.filter(o => o.status?.toLowerCase() === 'entregado').length,
  };

  // Función para verificar si el perfil está completo
  const isProfileComplete = (profileData: any) => {
    if (!profileData) return false;
    return profileData.name && 
           profileData.last_name && 
           profileData.phone;
  };

  // Cargar datos del perfil desde la API
  useEffect(() => {
    async function fetchProfile() {
      if (status === "authenticated" && session) {
        setLoading(true);
        try {
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
    async function fetchOrders() {
      if (status === "authenticated" && session) {
        setLoadingOrders(true);
        try {
          const accessToken = (session as any)?.accessToken;
          const res = await apiFetch<any>("/protected/orders", { 
            method: "GET",
            authToken: accessToken 
          });
          setOrders(res.orders || res || []);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const { name, email, image, role } = session.user as any;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'dni') {
      setDniVerificado(false);
    }
    if (e.target.name === 'phone') {
      setPhoneError(null);
    }
  }

  const handleDNIBlur = async () => {
    const dniValue = form.dni.trim();
    
    if (!/^\d{8}$/.test(dniValue)) {
      setDniVerificado(false);
      return;
    }

    if (form.name.trim() !== '' && form.last_name.trim() !== '') {
      return;
    }

    setConsultandoDNI(true);
    setDniVerificado(false);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com';
      apiUrl = apiUrl.replace(/\/api\/?$/, '');
      apiUrl = apiUrl.replace(/\/$/, '');
      const url = `${apiUrl}/api/dni/${dniValue}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Autocompletar los datos con los datos del DNI
          const nombres = result.data.nombres || '';
          const apellidos = `${result.data.apellido_paterno || ''} ${result.data.apellido_materno || ''}`.trim();
          
          // Actualizar ambos campos en una sola operación
          setForm(prev => ({
            ...prev,
            name: prev.name.trim() || nombres,
            last_name: prev.last_name.trim() || apellidos
          }));
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
    
    // Validar teléfono si está presente
    if (form.phone.trim()) {
      const phoneValidation = validatePeruvianCellphone(form.phone);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || "El teléfono es inválido");
        return;
      }
    }
    
    setPhoneError(null);
    
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

  const getStatusInfo = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'recibido':
        return { icon: Clock, color: 'text-yellow-400' };
      case 'preparando':
        return { icon: Package, color: 'text-blue-400' };
      case 'camino':
        return { icon: Truck, color: 'text-purple-400' };
      case 'entregado':
        return { icon: CheckCircle, color: 'text-green-400' };
      case 'cancelado':
        return { icon: XCircle, color: 'text-red-400' };
      default:
        return { icon: Clock, color: 'text-gray-400' };
    }
  };

  const tabs = [
    { id: "info" as TabType, label: "Información", icon: User },
    { id: "orders" as TabType, label: "Pedidos", icon: ShoppingBag },
    { id: "addresses" as TabType, label: "Direcciones", icon: MapPin },
    { id: "notifications" as TabType, label: "Notificaciones", icon: Bell, badge: unread.length },
    { id: "settings" as TabType, label: "Configuración", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header del Perfil */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg">
                <Image
                  src={image || "/file.svg"}
                  alt={name || "Avatar"}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              {isProfileComplete(profile) && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Información Principal */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {profile?.name || name} {profile?.last_name || ''}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{profile?.email || email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                  {profile?.role && (
                    <span className="inline-block mt-3 px-3 py-1 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-full text-sm font-semibold">
                      {profile.role}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-semibold rounded-lg transition-all shadow-lg hover:shadow-yellow-500/25 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {isProfileComplete(profile) ? "Editar Perfil" : "Completar Perfil"}
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>

              {/* Estado del Perfil */}
              {profile && (
                <div className="mt-4">
                  {isProfileComplete(profile) ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Perfil completo</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Perfil incompleto - Completa tu información</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/20 rounded-full mx-auto mb-2 border border-yellow-400/30">
                <ShoppingBag className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">{statsData.totalOrders}</div>
              <div className="text-sm text-gray-400">Pedidos Totales</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-2 border border-green-500/30">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">S/ {statsData.totalSpent.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Total Gastado</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-2 border border-blue-500/30">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{statsData.pendingOrders}</div>
              <div className="text-sm text-gray-400">En Proceso</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mx-auto mb-2 border border-purple-500/30">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{statsData.completedOrders}</div>
              <div className="text-sm text-gray-400">Completados</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-700/50 mb-6 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] px-4 py-4 flex items-center justify-center gap-2 font-semibold transition-all relative ${
                    isActive
                      ? "text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/10"
                      : "text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Información Personal */}
            {activeTab === "info" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-yellow-400" />
                      Datos Personales
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Nombre</label>
                        <p className="text-white font-semibold mt-1">{profile?.name || name || "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Apellidos</label>
                        <p className="text-white font-semibold mt-1">{profile?.last_name || "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">DNI</label>
                        <p className="text-white font-semibold mt-1">{profile?.dni || "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Email</label>
                        <p className="text-white font-semibold mt-1">{profile?.email || email || "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Teléfono</label>
                        <p className="text-white font-semibold mt-1">{profile?.phone || "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-yellow-400" />
                      Dirección
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Dirección Principal</label>
                        <p className="text-white mt-1">{profile?.address || "—"}</p>
                      </div>
                      {profile?.addressRef && (
                        <div>
                          <label className="text-sm font-medium text-gray-400">Referencia</label>
                          <p className="text-white mt-1">{profile.addressRef}</p>
                        </div>
                      )}
                      {profile?.streetNumber && (
                        <div>
                          <label className="text-sm font-medium text-gray-400">Número</label>
                          <p className="text-white mt-1">{profile.streetNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Pedidos */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300">Cargando pedidos...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">No tienes pedidos aún</p>
                    <button
                      onClick={() => router.push('/')}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold rounded-lg hover:from-yellow-300 hover:to-amber-400 transition shadow-lg"
                    >
                      Explorar Productos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div
                          key={order.id}
                          className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/70 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-lg bg-gray-600/50">
                                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-bold text-white">Pedido #{order.id?.slice(0, 8) || 'N/A'}</h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color} bg-gray-800/50`}>
                                    {order.status || 'Pendiente'}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(order.created_at || Date.now()).toLocaleDateString('es-PE', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    S/ {parseFloat(order.total || 0).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => router.push(`/orders?order=${order.id}`)}
                              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Direcciones */}
            {activeTab === "addresses" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50">
                  {profile?.address ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gray-600/30 rounded-lg border border-yellow-400/30">
                        <div className="p-2 bg-yellow-400/20 rounded-lg">
                          <Home className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">Dirección Principal</h4>
                            <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-semibold rounded border border-yellow-400/30">Principal</span>
                          </div>
                          <p className="text-gray-200">{profile.address}</p>
                          {profile.addressRef && (
                            <p className="text-sm text-gray-400 mt-1">Ref: {profile.addressRef}</p>
                          )}
                          {profile.streetNumber && (
                            <p className="text-sm text-gray-400">N° {profile.streetNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-300 mb-4">No tienes direcciones guardadas</p>
                      <button
                        onClick={() => setEditing(true)}
                        className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold rounded-lg hover:from-yellow-300 hover:to-amber-400 transition shadow-lg"
                      >
                        Agregar Dirección
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Notificaciones */}
            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {unread.length === 0 && all.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">No tienes notificaciones</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(unread.length > 0 ? unread : all.slice(0, 10)).map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 rounded-xl border ${
                          !n.is_read
                            ? 'bg-yellow-400/10 border-yellow-400/30'
                            : 'bg-gray-700/50 border-gray-600/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            n.type === "success" ? "bg-green-500/20" :
                            n.type === "error" ? "bg-red-500/20" :
                            n.type === "warning" ? "bg-yellow-500/20" :
                            "bg-blue-500/20"
                          }`}>
                            {n.type === "success" ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                             n.type === "error" ? <XCircle className="w-5 h-5 text-red-400" /> :
                             n.type === "warning" ? <AlertCircle className="w-5 h-5 text-yellow-400" /> :
                             <Bell className="w-5 h-5 text-blue-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-white">{n.title}</h4>
                              {!n.is_read && (
                                <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></span>
                              )}
                            </div>
                            {n.message && (
                              <p className="text-gray-300 text-sm mt-1">{n.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(n.created_at).toLocaleString('es-PE')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Configuración */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-yellow-400" />
                    Configuración de Cuenta
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-600/30 rounded-lg border border-gray-600/50">
                      <div>
                        <p className="font-semibold text-white">Notificaciones por Email</p>
                        <p className="text-sm text-gray-400">Recibe actualizaciones sobre tus pedidos</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-600/30 rounded-lg border border-gray-600/50">
                      <div>
                        <p className="font-semibold text-white">Notificaciones Push</p>
                        <p className="text-sm text-gray-400">Recibe notificaciones en tiempo real</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Zona de Peligro</h3>
                  <p className="text-sm text-red-300 mb-4">Acciones que no se pueden deshacer</p>
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                        signOut({ callbackUrl: "/" });
                      }
                    }}
                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {isProfileComplete(profile) ? "Editar Perfil" : "Completar Perfil"}
              </h3>
              <button
                onClick={() => setEditing(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {profile && !isProfileComplete(profile) && (
              <div className="mb-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  Completa tu información personal para una mejor experiencia de compra.
                </p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-300">Nombre *</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="border-2 border-gray-600 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:border-yellow-400 focus:outline-none transition"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-300">Apellidos</span>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="border-2 border-gray-600 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:border-yellow-400 focus:outline-none transition"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-300">
                  DNI <span className="text-xs text-gray-500 font-normal">(Opcional - 8 dígitos)</span>
                </span>
                <div className="relative">
                  <input
                    type="text"
                    name="dni"
                    value={form.dni}
                    onChange={handleChange}
                    onBlur={handleDNIBlur}
                    maxLength={8}
                    className={`border-2 rounded-lg px-4 py-2.5 w-full bg-gray-700/50 text-white focus:outline-none transition ${
                      dniVerificado ? 'border-green-400' : 'border-gray-600 focus:border-yellow-400'
                    }`}
                    placeholder="12345678"
                    disabled={consultandoDNI}
                  />
                  {consultandoDNI && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {dniVerificado && !consultandoDNI && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  )}
                </div>
                {dniVerificado && (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    DNI verificado - Datos autocompletados
                  </p>
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-300">Teléfono</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`border-2 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:outline-none transition ${
                    phoneError ? 'border-red-400' : 'border-gray-600 focus:border-yellow-400'
                  }`}
                  placeholder="987654321 o +51 987654321"
                />
                {phoneError && (
                  <p className="text-red-400 text-xs mt-1">{phoneError}</p>
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-300">Dirección</span>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="border-2 border-gray-600 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:border-yellow-400 focus:outline-none transition"
                />
              </label>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-300">Referencia de Dirección</span>
                  <input
                    type="text"
                    name="addressRef"
                    value={form.addressRef}
                    onChange={handleChange}
                    className="border-2 border-gray-600 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:border-yellow-400 focus:outline-none transition"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-300">Número de Calle</span>
                  <input
                    type="text"
                    name="streetNumber"
                    value={form.streetNumber}
                    onChange={handleChange}
                    className="border-2 border-gray-600 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:border-yellow-400 focus:outline-none transition"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-semibold rounded-lg transition shadow-lg hover:shadow-yellow-500/25"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
