"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Search, Filter, Menu, 
  Grid3X3, Heart, ShoppingCart, 
  Eye, X, ChevronDown, UtensilsCrossed, Beer, Coffee
} from "lucide-react";
import { useNotifications } from "@/components/NotificationSystem";
import { useCombinedNotifications } from "@/lib/notificationUtils";
import { useRecentlyViewed } from "@/lib/recentlyViewedContext";

// Componentes dinámicos
const Map = dynamic(() => import("@/components/ProductsMap"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-stone-800 rounded-lg animate-pulse"></div>
});

// Tipos e interfaces
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'popularity';
type ViewMode = 'grid' | 'list';

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
  subcategory?: string;
  stock?: number;
  rating?: number;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
}

// Configuración
const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || "http://localhost:4000";
const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000];
const DEBOUNCE_DELAY = 300;

// Mapeos de texto
const CATEGORY_LABELS: Record<string, string> = {
  comidas: "Comidas",
  bebidas: "Bebidas",
  cerveza: "Cervezas",
};

const SORT_LABELS: Record<SortOption, string> = {
  'name-asc': 'Nombre A-Z',
  'name-desc': 'Nombre Z-A',
  'price-asc': 'Precio menor',
  'price-desc': 'Precio mayor',
  'popularity': 'Más populares'
};

// Componente interno que usa useSearchParams
function ProductsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { addNotification } = useNotifications();
  const { manager } = useCombinedNotifications();
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados principales
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de UI
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const { recentlyViewed, updateRecentlyViewed } = useRecentlyViewed();

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<string>(searchParams.get("filter") || "all");
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Actualizar filtro cuando cambien los parámetros de URL
  useEffect(() => {
    const urlFilter = searchParams.get("filter");
    if (urlFilter) {
      setFilter(urlFilter);
    }
  }, [searchParams]);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Actualizar viewMode basado en mobile
  useEffect(() => {
    setViewMode(isMobile ? 'list' : 'grid');
  }, [isMobile]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          apiFetch<{ success: boolean; data: Product[]; total: number }>("/products"),
          apiFetch<{ data: Category[] }>("/categories")
        ]);


        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        
        // Calcular rango de precios real
        const prices = productsRes.data.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange([minPrice, maxPrice]);

        // Cargar favoritos iniciales
        const localFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavorites(localFavs);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar productos";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sincronizar favoritos con backend si está autenticado
  useEffect(() => {
    const loadFavoritesFromBackend = async () => {
      if (session?.accessToken) {
        try {
          const res = await apiFetch<{ data: any[] }>("/protected/favorites", { authToken: session.accessToken });
          
          // Los productos vienen directamente en res.data, no en res.data.product_id
          const backendFavs = res.data?.map((product: any) => product.id) || [];
          
          setFavorites(backendFavs);
          localStorage.setItem("favorites", JSON.stringify(backendFavs));
        } catch (error) {
          console.error('Error cargando favoritos del backend:', error);
          // Si falla, limpiar favoritos locales para evitar desincronización
          setFavorites([]);
          localStorage.setItem("favorites", JSON.stringify([]));
        }
      } else {
        // Si no está autenticado, usar favoritos locales
        const localFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavorites(localFavs);
      }
    };

    loadFavoritesFromBackend();
  }, [session]);

  // Manejar favoritos
  const toggleFavorite = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    const isFavorite = favorites.includes(productId);

    try {
      if (isFavorite) {
        // Remover de favoritos
        if (session?.accessToken) {
          await apiFetch(`/protected/favorites/${productId}`, { 
            method: "DELETE", 
            authToken: session.accessToken 
          });
        }
        
        // Solo actualizar estado local si la operación del backend fue exitosa
        const newFavorites = favorites.filter(id => id !== productId);
        setFavorites(newFavorites);
        localStorage.setItem("favorites", JSON.stringify(newFavorites));
        manager.userRemovedFromFavorites(product?.name || 'Producto');
      } else {
        // Agregar a favoritos
        if (session?.accessToken) {
          await apiFetch(`/protected/favorites`, { 
            method: "POST", 
            authToken: session.accessToken,
            body: JSON.stringify({ product_id: productId })
          });
        }
        
        // Solo actualizar estado local si la operación del backend fue exitosa
        const newFavorites = [...favorites, productId];
        setFavorites(newFavorites);
        localStorage.setItem("favorites", JSON.stringify(newFavorites));
        manager.userAddedToFavorites(product?.name || 'Producto');
      }
    } catch (error) {
      console.error('Error en toggleFavorite:', error);
      
      // Si hay error, recargar favoritos del backend para sincronizar
      if (session?.accessToken) {
        try {
          const res = await apiFetch<{ data: any[] }>("/protected/favorites", { authToken: session.accessToken });
          const backendFavs = res.data?.map((product: any) => product.id) || [];
          setFavorites(backendFavs);
          localStorage.setItem("favorites", JSON.stringify(backendFavs));
        } catch (syncError) {
          console.error('Error sincronizando favoritos:', syncError);
        }
      }
      
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar favoritos. Intenta de nuevo."
      });
    }
  };

  // Manejar carrito
  const addToCart = (product: Product) => {
    if (!product || !product.id) {
      console.error('Product is invalid:', product);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);

    const updatedCart = existingItem
      ? cart.map((item: any) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [
          ...cart, 
          {
            ...product,
            quantity: 1,
            image_url: product.image_url || product.image || "/file.svg",
          }
        ];

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    setAddedToCart(product.id);
    
    // Notificaciones
    manager.userAddedToCart(product.name);
    setTimeout(() => setAddedToCart(null), 1500);
  };

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    console.log("🔍 [FILTER] Aplicando filtro:", filter);
    console.log("🔍 [FILTER] Total productos:", products.length);
    console.log("🔍 [FILTER] Categorías disponibles:", categories.map(c => c.name));
    console.log("🔍 [FILTER] Productos con categorías:", products.map(p => ({
      name: p.name,
      category_id: p.category_id,
      subcategory_id: p.subcategory_id
    })));
    
    return products.filter(product => {
      // Búsqueda
      const searchMatch = debouncedSearch
        ? Object.values(product).some(
            value => value?.toString().toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : true;

      // Filtro por categoría principal
      let categoryMatch = true;
      
      if (filter !== "all") {
        // Primero intentar usar las categorías de la base de datos
        if (categories.length > 0) {
          let selectedCategory = null;
          
          // Buscar categoría específica según el filtro
          if (filter === "cerveza" || filter === "cervezas") {
            selectedCategory = categories.find(cat => 
              cat.name.toLowerCase() === 'cervezas' ||
              cat.name.toLowerCase() === 'cerveza'
            );
          } else if (filter === "comidas" || filter === "comida") {
            selectedCategory = categories.find(cat => 
              cat.name.toLowerCase() === 'comidas' || 
              cat.name.toLowerCase() === 'comida' ||
              cat.name.toLowerCase() === 'food' ||
              cat.name.toLowerCase() === 'gastronomía'
            );
          } else if (filter === "bebidas") {
            selectedCategory = categories.find(cat => 
              cat.name.toLowerCase() === 'bebidas' ||
              cat.name.toLowerCase() === 'bebida'
            );
          }
          
          if (selectedCategory) {
            // Filtrar por category_id o subcategory (usando la misma lógica que la página principal)
            categoryMatch = product.category_id === selectedCategory.id ||
                           product.subcategory === selectedCategory.id;
            
            // Si es filtro de "bebidas", también incluir productos de subcategorías (cervezas, refrescos, etc.)
            if (!categoryMatch && (filter === "bebidas" || filter === "bebida")) {
              // Buscar si el producto pertenece a una subcategoría de bebidas
              const subcategoriesOfBebidas = categories.filter(cat => 
                cat.name.toLowerCase() === 'cervezas' ||
                cat.name.toLowerCase() === 'cerveza' ||
                cat.name.toLowerCase() === 'refrescos' ||
                cat.name.toLowerCase() === 'refresco'
              );
              
              categoryMatch = subcategoriesOfBebidas.some(subcat => 
                product.category_id === subcat.id || product.subcategory === subcat.id
              );
            }
            
            console.log(`🔍 [FILTER] Producto ${product.name}: categoryMatch=${categoryMatch}, category_id=${product.category_id}, subcategory=${product.subcategory}, selectedCategory.id=${selectedCategory.id}`);
          } else {
            // Si no encuentra la categoría en BD, usar filtro por texto como fallback
            const productText = `${product.name} ${product.description}`.toLowerCase();
            
            if (filter === "cerveza") {
              categoryMatch = productText.includes('cerveza') || 
                             productText.includes('beer') ||
                             product.name.toLowerCase().includes('cerveza') ||
                             product.description.toLowerCase().includes('cerveza');
            } else if (filter === "comidas" || filter === "comida") {
              categoryMatch = productText.includes('comida') || 
                             productText.includes('food') ||
                             productText.includes('gastronomía') ||
                             productText.includes('plato') ||
                             product.name.toLowerCase().includes('comida') ||
                             product.description.toLowerCase().includes('comida');
            } else if (filter === "bebidas") {
              // Para bebidas, excluir cervezas y comidas
              const isCerveza = productText.includes('cerveza') || 
                               productText.includes('beer') ||
                               product.name.toLowerCase().includes('cerveza');
              const isComida = productText.includes('comida') || 
                              productText.includes('food') ||
                              product.name.toLowerCase().includes('comida');
              categoryMatch = !isCerveza && !isComida;
            }
          }
        } else {
          // Si no hay categorías en BD, usar filtro por texto
          const productText = `${product.name} ${product.description}`.toLowerCase();
          
          if (filter === "cerveza") {
            categoryMatch = productText.includes('cerveza') || 
                           productText.includes('beer') ||
                           product.name.toLowerCase().includes('cerveza') ||
                           product.description.toLowerCase().includes('cerveza');
          } else if (filter === "comidas" || filter === "comida") {
            categoryMatch = productText.includes('comida') || 
                           productText.includes('food') ||
                           productText.includes('gastronomía') ||
                           productText.includes('plato') ||
                           product.name.toLowerCase().includes('comida') ||
                           product.description.toLowerCase().includes('comida');
          } else if (filter === "bebidas") {
            // Para bebidas, excluir cervezas y comidas
            const isCerveza = productText.includes('cerveza') || 
                             productText.includes('beer') ||
                             product.name.toLowerCase().includes('cerveza');
            const isComida = productText.includes('comida') || 
                            productText.includes('food') ||
                            product.name.toLowerCase().includes('comida');
            categoryMatch = !isCerveza && !isComida;
          }
        }
      }

      // Precio
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

      // Categorías múltiples
      const categoriesMatch = selectedCategories.length === 0 || 
        selectedCategories.some(catId => 
          product.category_id === catId || product.subcategory === catId
        );

      return searchMatch && categoryMatch && priceMatch && categoriesMatch;
    });
  }, [products, debouncedSearch, filter, priceRange, selectedCategories]);
  
  // Log del resultado del filtrado
  console.log("🔍 [FILTER] Productos filtrados:", filteredProducts.length);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'popularity': return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  // Abrir modal de detalles del producto
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    if (product && product.id) {
      updateRecentlyViewed(product);
    }
  };

  // Cerrar modal
  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Función para limpiar favoritos y sincronizar con backend
  const clearFavorites = async () => {
    try {
      if (session?.accessToken) {
        // Obtener favoritos actuales del backend
        const res = await apiFetch<{ data: any[] }>("/protected/favorites", { authToken: session.accessToken });
        const backendFavs = res.data?.map((fav: any) => fav.product_id) || [];
        
        // Eliminar todos los favoritos del backend
        for (const productId of backendFavs) {
          try {
            await apiFetch(`/protected/favorites/${productId}`, { 
              method: "DELETE", 
              authToken: session.accessToken 
            });
          } catch (error) {
            console.error(`Error eliminando favorito ${productId}:`, error);
          }
        }
      }
      
      // Limpiar estado local
      setFavorites([]);
      localStorage.setItem("favorites", JSON.stringify([]));
      
      addNotification({
        type: "success",
        title: "Éxito",
        message: "Favoritos limpiados correctamente"
      });
    } catch (error) {
      console.error('Error limpiando favoritos:', error);
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudieron limpiar los favoritos"
      });
    }
  };

  // Componentes de UI
  const LoadingState = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="text-yellow-100">Cargando productos...</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center text-red-400 max-w-md p-6 bg-stone-900/80 rounded-xl">
        <p className="text-xl mb-2">Error al cargar productos</p>
        <p className="text-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-yellow-400 text-stone-900 rounded-lg font-medium"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-yellow-200 text-lg">No se encontraron productos</p>
        <p className="text-yellow-200/60 text-sm">
          Intenta ajustar los filtros o la búsqueda
        </p>
        <button
          onClick={() => {
            setSearchQuery("");
            setFilter("all");
            setSelectedCategories([]);
            setPriceRange(DEFAULT_PRICE_RANGE);
          }}
          className="mt-4 px-4 py-2 text-yellow-400 border border-yellow-400/30 rounded-lg hover:bg-yellow-400/10 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );

  const ProductCard = ({ product }: { product: Product }) => {
    const isFavorite = favorites.includes(product.id);
    const isAdded = addedToCart === product.id;

    return (
      <div className={`
        bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-600/30 
        hover:shadow-2xl hover:border-slate-500/50 transition-all duration-300 group relative overflow-hidden
        ${viewMode === 'list' ? 'flex flex-col md:flex-row p-6' : 'p-4 flex flex-col'}
      `}>
        {/* Favoritos */}
        <button
          onClick={() => toggleFavorite(product.id)}
          className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all ${
            isFavorite 
              ? "text-red-500 bg-red-500/10" 
              : "text-yellow-300/70 hover:text-yellow-400 bg-stone-800/70 hover:bg-stone-700/70"
          }`}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Imagen */}
        <div className={`
          bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border border-slate-600/30 shadow-inner 
          flex items-center justify-center overflow-hidden
          ${viewMode === 'list' ? 'w-full md:w-32 h-32 md:mr-6 mb-4 md:mb-0' : 'aspect-square mb-4'}
        `}>
          <img
            src={
              product.image_url
                ? (product.image_url.startsWith('http')
                    ? product.image_url
                    : `${UPLOADS_URL}${product.image_url}`)
                : "/file.svg"
            }
            alt={product.name}
            className="object-contain w-full h-full"
            loading="lazy"
            onError={(e) => { 
              (e.target as HTMLImageElement).src = '/file.svg'; 
            }}
          />
        </div>

        {/* Contenido */}
        <div className={`flex-1 flex flex-col ${viewMode === 'list' ? 'md:py-2' : ''}`}>
          <div className="flex-1">
            <h2 
              className={`font-extrabold text-yellow-100 mb-2 ${
                viewMode === 'list' ? 'text-lg md:text-xl' : 'text-base'
              }`}
              title={product.name}
            >
              {product.name}
            </h2>
            
            <p className={`text-yellow-200 mb-3 ${
              viewMode === 'list' 
                ? 'text-sm md:text-base line-clamp-2 md:line-clamp-3' 
                : 'text-xs md:text-sm line-clamp-2'
            }`}>
              {product.description}
            </p>
          </div>

          <div className="mt-auto">
            <span className="font-bold text-green-400 text-lg md:text-xl block mb-3">
              S/ {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
            </span>

            <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-wrap' : ''}`}>
              <button
                onClick={() => addToCart(product)}
                className={`flex items-center justify-center gap-2 ${
                  isAdded 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-400 text-stone-900 hover:bg-yellow-300'
                } px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex-1`}
                disabled={isAdded}
              >
                <ShoppingCart className="w-4 h-4" />
                {isAdded ? "¡Agregado!" : "Agregar"}
              </button>
              
              <button
                onClick={() => openProductModal(product)}
                className="flex items-center justify-center gap-2 bg-yellow-400 text-stone-900 px-3 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizado condicional
  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-10 px-4 md:px-6 relative overflow-hidden">
      {/* Fondo profesional con patrón sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(120,119,198,0.05)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
              Nuestros Productos
            </h1>
            <p className="text-slate-300 text-lg">Descubre nuestra selección artesanal</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Contador */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-600/30">
              <span className="text-slate-300 text-sm">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            
            {/* Toggle de vista */}
            <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-600/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 shadow-lg' 
                    : 'text-slate-300 hover:text-amber-400'
                }`}
                aria-label="Vista de cuadrícula"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 shadow-lg' 
                    : 'text-slate-300 hover:text-amber-400'
                }`}
                aria-label="Vista de lista"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            
            {/* Filtros móvil */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 px-3 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        {/* Barra de búsqueda y filtros (Desktop) */}
        <div className="hidden md:block bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-600/30 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all"
              />
            </div>

             {/* Filtro por categoría */}
             <div className="relative min-w-[180px]">
               <select
                 value={filter}
                 onChange={(e) => setFilter(e.target.value)}
                 className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 appearance-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all pr-8"
               >
                 <option value="all">Todas las categorías</option>
                 {categories.length === 0 ? (
                   // Si no hay categorías en BD, mostrar las hardcodeadas
                   <>
                     <option value="cerveza">Cervezas</option>
                     <option value="comidas">Comidas</option>
                     <option value="bebidas">Bebidas</option>
                   </>
                 ) : (
                   // Si hay categorías en BD, mostrar solo las que NO tienen subcategorías o son subcategorías
                   categories.filter(cat => {
                     // Si es "Bebidas" y hay subcategorías como "Cervezas", no mostrar
                     if (cat.name.toLowerCase() === 'bebidas' || cat.name.toLowerCase() === 'bebida') {
                       const hasSubcategories = categories.some(subcat => 
                         subcat.name.toLowerCase() === 'cervezas' ||
                         subcat.name.toLowerCase() === 'cerveza' ||
                         subcat.name.toLowerCase() === 'refrescos' ||
                         subcat.name.toLowerCase() === 'refresco'
                       );
                       return !hasSubcategories;
                     }
                     return true;
                   }).map((cat) => (
                     <option key={cat.id} value={cat.name.toLowerCase()}>
                       {CATEGORY_LABELS[cat.name.toLowerCase()] || cat.name}
                     </option>
                   ))
                 )}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
             </div>

            {/* Ordenamiento */}
            <div className="relative min-w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 appearance-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all pr-8"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
            </div>

            {/* Botón de filtros avanzados */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
                showFilters 
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 shadow-lg' 
                  : 'bg-slate-800/80 text-slate-100 hover:bg-slate-700/80 border border-slate-600/50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>


          </div>

          {/* Filtros avanzados */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-yellow-400/20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rango de precios */}
                <div>
                  <label className="block text-yellow-200 text-sm font-medium mb-3">
                    Rango de precios: S/ {priceRange[0]} - S/ {priceRange[1]}
                  </label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min={DEFAULT_PRICE_RANGE[0]}
                      max={DEFAULT_PRICE_RANGE[1]}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full h-2 bg-yellow-400/30 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min={DEFAULT_PRICE_RANGE[0]}
                      max={DEFAULT_PRICE_RANGE[1]}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-yellow-400/30 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Categorías múltiples */}
                <div className="lg:col-span-2">
                  <label className="block text-yellow-200 text-sm font-medium mb-3">
                    Filtrar por categorías
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto p-1">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 text-yellow-100 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, cat.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter((id) => id !== cat.id));
                            }
                          }}
                          className="rounded border-yellow-400/30 text-yellow-400 focus:ring-yellow-400"
                        />
                        {CATEGORY_LABELS[cat.name.toLowerCase()] || cat.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros móvil (Drawer) */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto md:hidden">
            <div className="flex min-h-screen">
              {/* Fondo oscuro */}
              <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setMobileFiltersOpen(false)}
              />
              
              {/* Panel de filtros */}
              <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-stone-900 shadow-xl">
                <div className="flex items-center justify-between px-4 py-4 border-b border-yellow-400/20">
                  <h2 className="text-lg font-medium text-yellow-100">Filtros</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-yellow-400 hover:text-yellow-300"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Contenido del filtro */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Buscador */}
                  <div>
                    <label htmlFor="mobile-search" className="block text-sm font-medium text-yellow-200 mb-2">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400" />
                      <input
                        id="mobile-search"
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-yellow-400/30 rounded-lg text-yellow-100 placeholder-yellow-200/60 focus:border-yellow-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Categoría principal */}
                  <div>
                    <label htmlFor="mobile-category" className="block text-sm font-medium text-yellow-200 mb-2">
                      Categoría
                    </label>
                     <select
                       id="mobile-category"
                       value={filter}
                       onChange={(e) => setFilter(e.target.value)}
                       className="w-full px-3 py-2 bg-stone-800 border border-yellow-400/30 rounded-lg text-yellow-100 focus:border-yellow-400 outline-none transition-all"
                     >
                       <option value="all">Todas las categorías</option>
                       {categories.length === 0 ? (
                         // Si no hay categorías en BD, mostrar las hardcodeadas
                         <>
                           <option value="cerveza">Cervezas</option>
                           <option value="comidas">Comidas</option>
                           <option value="bebidas">Bebidas</option>
                         </>
                       ) : (
                         // Si hay categorías en BD, mostrar solo las que NO tienen subcategorías o son subcategorías
                         categories.filter(cat => {
                           // Si es "Bebidas" y hay subcategorías como "Cervezas", no mostrar
                           if (cat.name.toLowerCase() === 'bebidas' || cat.name.toLowerCase() === 'bebida') {
                             const hasSubcategories = categories.some(subcat => 
                               subcat.name.toLowerCase() === 'cervezas' ||
                               subcat.name.toLowerCase() === 'cerveza' ||
                               subcat.name.toLowerCase() === 'refrescos' ||
                               subcat.name.toLowerCase() === 'refresco'
                             );
                             return !hasSubcategories;
                           }
                           return true;
                         }).map((cat) => (
                           <option key={cat.id} value={cat.name.toLowerCase()}>
                             {CATEGORY_LABELS[cat.name.toLowerCase()] || cat.name}
                           </option>
                         ))
                       )}
                     </select>
                  </div>

                  {/* Ordenamiento */}
                  <div>
                    <label htmlFor="mobile-sort" className="block text-sm font-medium text-yellow-200 mb-2">
                      Ordenar por
                    </label>
                    <select
                      id="mobile-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full px-3 py-2 bg-stone-800 border border-yellow-400/30 rounded-lg text-yellow-100 focus:border-yellow-400 outline-none transition-all"
                    >
                      {Object.entries(SORT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rango de precios */}
                  <div>
                    <label className="block text-sm font-medium text-yellow-200 mb-2">
                      Rango de precios
                    </label>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs text-yellow-200/80">
                        <span>S/ {priceRange[0]}</span>
                        <span>S/ {priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min={DEFAULT_PRICE_RANGE[0]}
                        max={DEFAULT_PRICE_RANGE[1]}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full h-2 bg-yellow-400/30 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min={DEFAULT_PRICE_RANGE[0]}
                        max={DEFAULT_PRICE_RANGE[1]}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-yellow-400/30 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Categorías múltiples */}
                  <div>
                    <label className="block text-sm font-medium text-yellow-200 mb-2">
                      Categorías específicas
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2 text-yellow-100 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, cat.id]);
                              } else {
                                setSelectedCategories(selectedCategories.filter((id) => id !== cat.id));
                              }
                            }}
                            className="rounded border-yellow-400/30 text-yellow-400 focus:ring-yellow-400"
                          />
                          {CATEGORY_LABELS[cat.name.toLowerCase()] || cat.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer del panel */}
                <div className="border-t border-yellow-400/20 p-4">
                  <button
                    type="button"
                    className="w-full bg-yellow-400 text-stone-900 px-4 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Mostrar {sortedProducts.length} {sortedProducts.length === 1 ? 'producto' : 'productos'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {sortedProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-12">
            {/* Sección de Cervezas */}
            {(filter === "all" || filter === "cerveza") && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Beer className="w-6 h-6 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-amber-400">Nuestras Cervezas</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-400/50 to-transparent"></div>
                </div>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }>
                  {sortedProducts.filter(p => {
                    // Usar categorías de BD si están disponibles
                    if (categories.length > 0) {
                      const cervezaCategory = categories.find(cat => 
                        cat.name.toLowerCase() === 'cervezas' ||
                        cat.name.toLowerCase() === 'cerveza'
                      );
                      if (cervezaCategory) {
                        return p.category_id === cervezaCategory.id || p.subcategory === cervezaCategory.id;
                      }
                    }
                    // Fallback por texto
                    const productText = `${p.name} ${p.description}`.toLowerCase();
                    return productText.includes('cerveza') || 
                           productText.includes('beer') ||
                           p.name.toLowerCase().includes('cerveza') ||
                           p.description.toLowerCase().includes('cerveza');
                  }).map((product) => (
                    <div key={product.id}>
                      {ProductCard({ product })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de Comidas */}
            {(filter === "all" || filter === "comidas" || filter === "comida") && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <UtensilsCrossed className="w-6 h-6 text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-orange-400">Gastronomía Andina</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-orange-400/50 to-transparent"></div>
                </div>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }>
                  {sortedProducts.filter(p => {
                    // Usar categorías de BD si están disponibles
                    if (categories.length > 0) {
                      const comidaCategory = categories.find(cat => 
                        cat.name.toLowerCase() === 'comidas' || 
                        cat.name.toLowerCase() === 'comida' ||
                        cat.name.toLowerCase() === 'food' ||
                        cat.name.toLowerCase() === 'gastronomía'
                      );
                      if (comidaCategory) {
                        return p.category_id === comidaCategory.id || p.subcategory === comidaCategory.id;
                      }
                    }
                    // Fallback por texto
                    const productText = `${p.name} ${p.description}`.toLowerCase();
                    return productText.includes('comida') || 
                           productText.includes('food') ||
                           productText.includes('gastronomía') ||
                           productText.includes('plato') ||
                           p.name.toLowerCase().includes('comida') ||
                           p.description.toLowerCase().includes('comida');
                  }).map((product) => (
                    <div key={product.id}>
                      {ProductCard({ product })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de Bebidas */}
            {(filter === "all" || filter === "bebidas") && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Coffee className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-blue-400">Bebidas</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-400/50 to-transparent"></div>
                </div>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }>
                  {sortedProducts.filter(p => {
                    // Usar categorías de BD si están disponibles
                    if (categories.length > 0) {
                      const bebidaCategory = categories.find(cat => 
                        cat.name.toLowerCase() === 'bebidas' ||
                        cat.name.toLowerCase() === 'bebida'
                      );
                      
                      if (bebidaCategory) {
                        // Incluir productos de la categoría bebidas
                        let isBebida = p.category_id === bebidaCategory.id || p.subcategory === bebidaCategory.id;
                        
                        // También incluir productos de subcategorías de bebidas (cervezas, refrescos, etc.)
                        if (!isBebida) {
                          const subcategoriesOfBebidas = categories.filter(cat => 
                            cat.name.toLowerCase() === 'cervezas' ||
                            cat.name.toLowerCase() === 'cerveza' ||
                            cat.name.toLowerCase() === 'refrescos' ||
                            cat.name.toLowerCase() === 'refresco'
                          );
                          
                          isBebida = subcategoriesOfBebidas.some(subcat => 
                            p.category_id === subcat.id || p.subcategory === subcat.id
                          );
                        }
                        
                        return isBebida;
                      }
                      
                      // Fallback: excluir cervezas y comidas por categoría
                      const cervezaCategory = categories.find(cat => 
                        cat.name.toLowerCase() === 'cervezas' ||
                        cat.name.toLowerCase() === 'cerveza'
                      );
                      const comidaCategory = categories.find(cat => 
                        cat.name.toLowerCase() === 'comidas' || 
                        cat.name.toLowerCase() === 'comida' ||
                        cat.name.toLowerCase() === 'food' ||
                        cat.name.toLowerCase() === 'gastronomía'
                      );
                      
                      const isCerveza = cervezaCategory && (p.category_id === cervezaCategory.id || p.subcategory === cervezaCategory.id);
                      const isComida = comidaCategory && (p.category_id === comidaCategory.id || p.subcategory === comidaCategory.id);
                      
                      return !isCerveza && !isComida;
                    }
                    
                    // Fallback por texto
                    const productText = `${p.name} ${p.description}`.toLowerCase();
                    const isCerveza = productText.includes('cerveza') || 
                                    productText.includes('beer') ||
                                    p.name.toLowerCase().includes('cerveza');
                    const isComida = productText.includes('comida') || 
                                   productText.includes('food') ||
                                   p.name.toLowerCase().includes('comida');
                     
                    return !isCerveza && !isComida;
                  }).map((product) => (
                    <div key={product.id}>
                      {ProductCard({ product })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Productos vistos recientemente */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-purple-400">Productos que viste recientemente</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-400/50 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentlyViewed.filter(product => product && product.id).map((product) => (
                <div key={product.id} className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-600/30 hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 group relative overflow-hidden p-4">
                  {/* Favoritos */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all ${
                      favorites.includes(product.id)
                        ? "text-red-500 bg-red-500/10" 
                        : "text-purple-300/70 hover:text-purple-400 bg-slate-800/70 hover:bg-slate-700/70"
                    }`}
                    aria-label={favorites.includes(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Imagen */}
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border border-slate-600/30 shadow-inner flex items-center justify-center overflow-hidden aspect-square mb-4">
                    <img
                      src={
                        product.image_url
                          ? (product.image_url.startsWith('http')
                              ? product.image_url
                              : `${UPLOADS_URL}${product.image_url}`)
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
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-100 text-lg line-clamp-2 group-hover:text-purple-200 transition-colors">
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
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mapa de ubicación (solo desktop) */}
        {!isMobile && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-emerald-400">¿Dónde encontrarnos?</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-400/50 to-transparent"></div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl overflow-hidden border border-slate-600/30 h-96 shadow-xl">
              <Map />
            </div>
          </div>
        )}

        {/* Modal de detalles del producto */}
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-stone-900 rounded-2xl shadow-2xl border border-yellow-400/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Header del modal */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-yellow-100 mb-2">{selectedProduct.name}</h2>
                    <p className="text-stone-400 text-lg">Cerveza Ayacuchana Artesanal</p>
                  </div>
                  <button
                    onClick={closeProductModal}
                    className="text-stone-400 hover:text-white transition-colors p-2 rounded-full hover:bg-stone-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Imagen con efectos premium */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-8 border border-yellow-400/20 shadow-2xl">
                      <div className="relative group">
                        {/* Efecto de resplandor */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent rounded-2xl blur-xl scale-110 group-hover:bg-yellow-400/30 transition-all duration-700"></div>
                        
                        {/* Imagen con efecto flotante */}
                        <div className="relative transform group-hover:scale-105 transition-all duration-700">
                          <img
                            src={
                              selectedProduct.image_url
                                ? (selectedProduct.image_url.startsWith('http')
                                    ? selectedProduct.image_url
                                    : `${UPLOADS_URL}${selectedProduct.image_url}`)
                                : "/file.svg"
                            }
                            alt={selectedProduct.name}
                            className="w-full h-auto object-contain rounded-xl"
                            onError={(e) => { 
                              (e.target as HTMLImageElement).src = '/file.svg'; 
                            }}
                          />
                          
                          {/* Efecto de brillo */}
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 via-transparent to-transparent rounded-xl pointer-events-none"></div>
                          
                          {/* Efecto de reflejo */}
                          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-t-xl"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información detallada */}
                  <div className="space-y-6">
                    {/* Precio prominente */}
                    <div className="text-4xl font-bold text-green-400 mb-4">
                      S/ {typeof selectedProduct.price === 'number' ? selectedProduct.price.toFixed(2) : '0.00'}
                    </div>
                    
                    {/* Descripción */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-yellow-100">Descripción</h3>
                      <p className="text-stone-300 leading-relaxed text-lg">
                        {selectedProduct.description}
                      </p>
                    </div>

                    {/* Características del producto */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-yellow-100">Características</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                          <div className="text-stone-400 text-sm mb-1">Estilo</div>
                          <div className="text-yellow-200 font-semibold">Cerveza Artesanal</div>
                        </div>
                        <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                          <div className="text-stone-400 text-sm mb-1">Origen</div>
                          <div className="text-yellow-200 font-semibold">Ayacucho, Perú</div>
                        </div>
                        <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                          <div className="text-stone-400 text-sm mb-1">Disponibilidad</div>
                          <div className="text-green-400 font-semibold">En Stock</div>
                        </div>
                        <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                          <div className="text-stone-400 text-sm mb-1">Categoría</div>
                          <div className="text-yellow-200 font-semibold">Cerveza</div>
                        </div>
                      </div>
                    </div>

                    {/* Rating si existe */}
                    {selectedProduct.rating && (
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-yellow-100">Calificación</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-6 h-6 ${i < Math.floor(selectedProduct.rating!) ? 'text-yellow-400' : 'text-stone-600'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-lg text-stone-300">
                            {typeof selectedProduct.rating === 'number' ? selectedProduct.rating.toFixed(1) : '0.0'} / 5.0
                          </span>
                        </div>
                        <p className="text-stone-400 text-sm">
                          {selectedProduct.stock || 0} unidades disponibles
                        </p>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={() => {
                          addToCart(selectedProduct);
                          closeProductModal();
                        }}
                        className="flex-1 flex items-center justify-center gap-3 bg-yellow-400 text-stone-900 px-6 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        Agregar al carrito
                      </button>
                      
                      <button
                        onClick={() => toggleFavorite(selectedProduct.id)}
                        className={`p-4 rounded-xl transition-all duration-300 ${
                          favorites.includes(selectedProduct.id)
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-stone-700 text-stone-300 hover:bg-stone-600 border border-stone-600'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${favorites.includes(selectedProduct.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-10 px-4 md:px-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-yellow-100">Cargando productos...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}