"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { Trash2, ChevronLeft, ChevronRight, ShoppingCart, Heart, Eye, X, Package, CreditCard, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useNotifications } from "@/components/NotificationSystem";
import { useRecentlyViewed } from "@/lib/recentlyViewedContext";
import { useCart } from "@/hooks/useCart";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  image_url?: string;
  category?: string;
  category_id?: string;
  subcategory_id?: string;
  stock?: number;
  rating?: number;
}

export default function CartPage() {
  const { recentlyViewed, updateRecentlyViewed } = useRecentlyViewed();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const router = useRouter();
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  
  // Hook del carrito
  const { 
    cart, 
    loading, 
    total, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    addToCart: addToCartHook
  } = useCart();

  // Cargar favoritos
  useEffect(() => {
    const loadFavorites = async () => {
      if (!session?.accessToken) return;
      
      try {
        const res = await apiFetch<{ data: any[] }>("/protected/favorites", { 
          authToken: session.accessToken 
        });
        const favIds = res.data?.map((product: any) => product.id) || [];
        setFavorites(favIds);
      } catch (error) {
        console.error('Error cargando favoritos:', error);
      }
    };

    loadFavorites();
  }, [session]);

  // Abrir modal de confirmación de eliminación
  const openDeleteModal = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  // Eliminar producto del carrito
  const removeItem = async (id: string) => {
    try {
      await removeFromCart(id);
      addNotification({
        type: "success",
        title: "Eliminado",
        message: "Producto removido del carrito"
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo eliminar el producto"
      });
    }
    
    // Cerrar modal
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Abrir modal de detalles del producto
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    updateRecentlyViewed(product);
  };

  // Cerrar modal
  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Toggle favoritos
  const toggleFavorite = async (productId: string) => {
    try {
      if (session?.accessToken) {
        await apiFetch("/favorites", {
          method: "POST",
          body: JSON.stringify({ product_id: productId }),
          authToken: session.accessToken,
        });
      }
      
      setFavorites(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
      
      addNotification({
        type: "success",
        title: "Favoritos",
        message: favorites.includes(productId) ? "Removido de favoritos" : "Agregado a favoritos"
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar favoritos"
      });
    }
  };

  // Agregar al carrito
  const addToCart = async (product: Product) => {
    try {
      // Construir la URL de la imagen correctamente
      let imageUrl = "";
      if (product.image_url || product.image) {
        const img = product.image_url || product.image || "";
        imageUrl = img.startsWith('http')
          ? img
          : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000'}${img}`;
      } else {
        imageUrl = "/file.svg";
      }

      await addToCartHook({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: imageUrl,
      });
      
      addNotification({
        type: "success",
        title: "Agregado al carrito",
        message: `${product.name} agregado al carrito`
      });
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo agregar al carrito"
      });
    }
  };

  // Estados de carga y vacío
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400/30 border-t-amber-400"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 animate-ping"></div>
        </div>
        <p className="text-amber-100 text-lg mt-6 font-medium">Cargando tu carrito...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado profesional */}
        <div className="flex items-center justify-between mb-12">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors duration-300 font-medium"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </motion.button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30">
              <ShoppingCart className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Tu Carrito</h1>
              <p className="text-slate-400 text-sm">{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</p>
            </div>
          </div>
          
          <div className="w-24"></div> {/* Espaciador */}
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-16 text-center border border-slate-600/30"
                >
                  <div className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-3">Tu carrito está vacío</h2>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">Descubre nuestros productos artesanales y llena tu carrito con las mejores cervezas y comidas de Ayacucho</p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
                    >
                      <Package className="w-5 h-5" />
                      Explorar productos
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: "spring", damping: 25, delay: index * 0.1 }}
                    className="group bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600/30 hover:border-amber-400/40 transition-all duration-300 p-6 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Imagen del producto */}
                      <div className="relative w-full sm:w-32 h-32 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl overflow-hidden border border-slate-600/30 group-hover:border-amber-400/30 transition-colors">
                        <img
                          src={item.image_url || "/file.svg"}
                          alt={item.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.log('Error loading image:', item.image_url);
                            (e.target as HTMLImageElement).src = '/file.svg';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', item.image_url);
                          }}
                        />
                      </div>

                      {/* Detalles del producto */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">{item.name}</h2>
                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-2xl font-bold text-amber-400">S/ {item.price.toFixed(2)}</span>
                            <span className="text-slate-400 text-sm">cada unidad</span>
                          </div>
                        </div>

                        {/* Controles de cantidad y precio total */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center bg-slate-700/50 rounded-lg border border-slate-600/30 overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-4 py-2 text-slate-300 hover:text-amber-400 hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <span className="px-6 py-2 text-center min-w-[3rem] text-slate-100 font-bold text-lg">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-4 py-2 text-slate-300 hover:text-amber-400 hover:bg-slate-600/50 transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <span className="text-slate-400 text-sm">Total:</span>
                              <div className="text-xl font-bold text-green-400">
                                S/ {(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => openDeleteModal(item.id)}
                            className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Resumen de compra */}
          {cart.length > 0 && (
            <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
              <div className="bg-gradient-to-br from-slate-800/70 to-slate-700/70 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/30">
                    <CreditCard className="w-6 h-6 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">Resumen de compra</h2>
                </div>
                
                {/* Lista de productos */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                  {cart.map(item => (
                    <div key={`summary-${item.id}`} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-600/20">
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-100 font-medium truncate">{item.name}</div>
                        <div className="text-slate-400 text-sm">Cantidad: {item.quantity}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-slate-100 font-bold">S/ {(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-slate-400 text-xs">S/ {item.price.toFixed(2)} c/u</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-slate-600/30 pt-6 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-100">Total:</span>
                    <span className="text-2xl font-extrabold text-green-400">
                      S/ {total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">Incluye todos los productos seleccionados</p>
                </div>

                {/* Botón de pago */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/checkout"
                    className="block w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-bold py-4 px-6 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-amber-400/25 flex items-center justify-center gap-3"
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceder al pago
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>

                {/* Continuar comprando */}
                <motion.button
                  onClick={() => router.push("/products")}
                  className="w-full mt-4 text-slate-400 hover:text-amber-400 underline text-sm text-center transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Seguir comprando
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Productos vistos recientemente */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-400/30">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                Productos que viste recientemente
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentlyViewed.map((product, index) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-600/30 hover:border-purple-400/40 transition-all duration-300 overflow-hidden"
                >
                  {/* Favoritos */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
                      favorites.includes(product.id)
                        ? "text-red-500 bg-red-500/20 border border-red-500/30" 
                        : "text-slate-400 hover:text-purple-400 bg-slate-800/70 hover:bg-purple-500/20 border border-slate-600/30 hover:border-purple-400/30"
                    }`}
                    aria-label={favorites.includes(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Imagen */}
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 border-b border-slate-600/30 flex items-center justify-center overflow-hidden aspect-square p-4">
                    <img
                      src={
                        product.image_url
                          ? (product.image_url.startsWith('http')
                              ? product.image_url
                              : `${process.env.NEXT_PUBLIC_UPLOADS_URL || "http://localhost:4000"}${product.image_url}`)
                          : "/file.svg"
                      }
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = '/file.svg'; 
                      }}
                    />
                  </div>

                  {/* Información */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-slate-100 text-lg line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-bold text-lg">
                        S/ {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                      </span>
                      <button
                        onClick={() => openProductModal(product)}
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalle
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de detalles del producto */}
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-600/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                {/* Header del modal */}
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-2xl font-bold text-slate-100">{selectedProduct.name}</h2>
                  <button
                    onClick={closeProductModal}
                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Imagen */}
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border border-slate-600/30 p-6">
                    <img
                      src={
                        selectedProduct.image_url
                          ? (selectedProduct.image_url.startsWith('http')
                              ? selectedProduct.image_url
                              : `${process.env.NEXT_PUBLIC_UPLOADS_URL || "http://localhost:4000"}${selectedProduct.image_url}`)
                          : "/file.svg"
                      }
                      alt={selectedProduct.name}
                      className="w-full h-auto object-contain"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = '/file.svg'; 
                      }}
                    />
                  </div>

                  {/* Información */}
                  <div className="space-y-6">
                    <div className="text-3xl font-bold text-green-400">
                      S/ {typeof selectedProduct.price === 'number' ? selectedProduct.price.toFixed(2) : '0.00'}
                    </div>
                    
                    <p className="text-slate-300 leading-relaxed">
                      {selectedProduct.description}
                    </p>

                    {selectedProduct.rating && (
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${i < Math.floor(selectedProduct.rating!) ? 'text-amber-400' : 'text-slate-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-slate-400">
                          {typeof selectedProduct.rating === 'number' ? selectedProduct.rating.toFixed(1) : '0.0'} ({selectedProduct.stock || 0} disponibles)
                        </span>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-4 pt-6">
                      <motion.button
                        onClick={async () => {
                          // Agregar al carrito usando el hook
                          await addToCart(selectedProduct);
                          closeProductModal();
                        }}
                        className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-bold px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Agregar al carrito
                      </motion.button>
                      
                      <motion.button
                        onClick={() => toggleFavorite(selectedProduct.id)}
                        className={`p-4 rounded-xl transition-all duration-300 ${
                          favorites.includes(selectedProduct.id)
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(selectedProduct.id) ? 'fill-current' : ''}`} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-600/30 max-w-md w-full mx-4"
            >
              <div className="p-8 text-center">
                {/* Icono de advertencia */}
                <div className="p-4 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                
                {/* Título */}
                <h3 className="text-2xl font-bold text-slate-100 mb-4">
                  ¿Eliminar producto?
                </h3>
                
                {/* Mensaje */}
                <p className="text-slate-400 mb-8 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar este producto de tu carrito? Esta acción no se puede deshacer.
                </p>
                
                {/* Botones */}
                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setItemToDelete(null);
                    }}
                    className="px-6 py-3 text-slate-400 hover:text-slate-300 hover:underline font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancelar
                  </motion.button>
                  
                  <motion.button
                    onClick={() => itemToDelete && removeItem(itemToDelete)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-400/25 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}