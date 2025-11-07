import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Grid3X3, List, Package } from 'lucide-react';
import { Category, FilterState, SortOption, ViewMode, Product } from '@/types/products';

interface ProductFiltersProps {
  categories: Category[];
  subcategories: Category[];
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  products?: Product[]; // Agregar productos para autocompletado
}

// Función para normalizar texto (quitar acentos, convertir a minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  subcategories,
  filters,
  onFiltersChange,
  onResetFilters,
  products = []
}) => {
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name-asc', label: 'Nombre A-Z' },
    { value: 'name-desc', label: 'Nombre Z-A' },
    { value: 'price-asc', label: 'Precio Menor' },
    { value: 'price-desc', label: 'Precio Mayor' },
    { value: 'popularity', label: 'Más Populares' }
  ];

  const viewModes: { value: ViewMode; label: string }[] = [
    { value: 'grid', label: 'Cuadrícula' },
    { value: 'list', label: 'Lista' }
  ];

  const handleSelectSuggestion = useCallback((product: Product) => {
    onFiltersChange({ search: product.name });
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.blur();
  }, [onFiltersChange]);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
    setShowSuggestions(value.length >= 2);
    setSelectedSuggestionIndex(-1);
  };

  // Generar sugerencias de autocompletado
  const suggestions = useMemo(() => {
    if (!filters.search || filters.search.length < 2 || !products.length) {
      return [];
    }

    const searchTerm = normalizeText(filters.search);
    const matches: { product: Product; score: number }[] = [];

    products.forEach(product => {
      const name = normalizeText(product.name);
      const description = product.description ? normalizeText(product.description) : '';
      
      let score = 0;
      
      // Coincidencia exacta al inicio del nombre (mayor prioridad)
      if (name.startsWith(searchTerm)) {
        score = 100;
      }
      // Coincidencia en cualquier parte del nombre
      else if (name.includes(searchTerm)) {
        score = 50;
      }
      // Coincidencia en descripción
      else if (description.includes(searchTerm)) {
        score = 25;
      }
      // Coincidencia en categoría
      else {
        const productCategory = categories.find(cat => cat.id === product.category_id);
        if (productCategory && normalizeText(productCategory.name).includes(searchTerm)) {
          score = 30;
        }
      }

      if (score > 0) {
        matches.push({ product, score });
      }
    });

    // Ordenar por score y limitar a 5 sugerencias
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(m => m.product);
  }, [filters.search, products, categories]);

  // Manejar teclado en sugerencias
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedSuggestionIndex, handleSelectSuggestion]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-400/20 p-6 mb-8 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-yellow-400/5 rounded-3xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
      
      {/* Header móvil */}
      <div className="flex items-center justify-between lg:hidden mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
            <Filter className="w-4 h-4 text-black" />
          </div>
          <h3 className="text-xl font-bold text-white">Filtros</h3>
        </div>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm border border-yellow-400/30 text-yellow-400 rounded-xl hover:from-yellow-500/30 hover:to-amber-500/30 transition-all duration-300"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMobileFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Contenido de filtros */}
      <motion.div
        initial={false}
        animate={{ height: showMobileFilters || window.innerWidth >= 1024 ? 'auto' : 0 }}
        className="overflow-visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {/* Búsqueda inteligente mejorada - Diseño Premium */}
          <div className="space-y-3 relative">
            <label className="block text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-black" />
              </div>
              Buscar Productos
            </label>
            <div className="relative group">
              {/* Efecto de brillo animado */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 rounded-xl opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300 animate-pulse" />
              
              {/* Contenedor principal del input */}
              <div className="relative bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-xl border-2 border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300 overflow-hidden">
                {/* Efecto de brillo interno */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Input mejorado */}
                <div className="relative flex items-center">
                  <div className="absolute left-4 z-10">
                    <Search className="w-5 h-5 text-yellow-400 group-hover:text-amber-400 transition-colors duration-300" />
                  </div>
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => filters.search.length >= 2 && setShowSuggestions(true)}
                    placeholder="Buscar productos..."
                    className="w-full pl-12 pr-14 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none font-medium text-base"
                  />
                  
                  {/* Indicadores de estado mejorados */}
                  <div className="absolute right-3 flex items-center gap-2">
                    {filters.search ? (
                      <>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-lg border border-green-400/30">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                          <span className="text-xs text-green-400 font-medium">Activo</span>
                        </div>
                        <button
                          onClick={() => onFiltersChange({ search: '' })}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-110"
                          title="Limpiar búsqueda"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                        <div className="w-1.5 h-1.5 bg-yellow-400/50 rounded-full" />
                        <span className="text-xs text-yellow-400/70 font-medium">Listo</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Barra de progreso cuando hay texto */}
                {filters.search && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 animate-pulse" />
                )}
              </div>
              
              {/* Autocompletado - Sugerencias */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-3 bg-gradient-to-br from-gray-900/98 via-gray-800/98 to-gray-900/98 backdrop-blur-2xl border-2 border-yellow-400/40 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                  style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 20px rgba(234, 179, 8, 0.2)' }}
                >
                  {/* Header del dropdown */}
                  <div className="px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border-b border-yellow-400/20">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                        Sugerencias ({suggestions.length})
                      </span>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400/30 scrollbar-track-gray-800">
                    {suggestions.map((product, index) => (
                      <motion.button
                        key={product.id}
                        onClick={() => handleSelectSuggestion(product)}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        className={`w-full px-4 py-3.5 flex items-center gap-3 text-left transition-all duration-200 ${
                          selectedSuggestionIndex === index
                            ? 'bg-gradient-to-r from-yellow-400/25 to-amber-500/25 border-l-4 border-yellow-400 shadow-lg'
                            : 'hover:bg-gray-700/60 border-l-4 border-transparent'
                        }`}
                        whileHover={{ x: 2 }}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border border-gray-600/50 shadow-inner">
                          <Package className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="text-white font-semibold text-base truncate mb-1.5">{product.name}</div>
                          {product.description && (
                            <div className="text-gray-400 text-xs line-clamp-2 leading-relaxed pr-2">{product.description}</div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-yellow-400 font-bold text-lg">
                            S/ {product.price.toFixed(2)}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-yellow-400">
              Categoría
            </label>
            <div className="relative group">
              <select
                value={filters.category}
                onChange={(e) => onFiltersChange({ category: e.target.value, subcategory: '' })}
                className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-yellow-400/30 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-white transition-all duration-300 hover:border-yellow-400/50 appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-800 text-white">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-gray-800 text-white">
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-yellow-400">
              Ordenar por
            </label>
            <div className="relative group">
              <select
                value={filters.sort}
                onChange={(e) => onFiltersChange({ sort: e.target.value as SortOption })}
                className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-yellow-400/30 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-white transition-all duration-300 hover:border-yellow-400/50 appearance-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end mt-8 pt-6 border-t border-yellow-400/30 relative z-10">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onResetFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-400/30 text-red-400 rounded-xl hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Limpiar Filtros</span>
            </motion.button>
            
            <span className="text-sm font-semibold text-gray-300">
              Vista:
            </span>
            <div className="flex items-center gap-2">
              {viewModes.map((mode) => (
                <motion.button
                  key={mode.value}
                  onClick={() => onFiltersChange({ viewMode: mode.value as ViewMode })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    filters.viewMode === mode.value
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/25'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
                  }`}
                >
                  {mode.value === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  {mode.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
