"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, AlertCircle, Sparkles, Award } from 'lucide-react';
import { useDashboardProducts } from '@/hooks/useDashboardProducts';
import { ProductStats } from '@/components/dashboard/ProductStats';
import { ProductFilters } from '@/components/dashboard/ProductFilters';
import { ProductCard } from '@/components/dashboard/ProductCard';
import { ProductModal } from '@/components/dashboard/ProductModal';

export default function ProductsPage() {
  const {
    products,
    allProducts,
    categories,
    allCategories,
    allSubcategories,
    loading,
    error,
    isModalOpen,
    editingProduct,
    saving,
    searchQuery,
    selectedCategory,
    stats,
    setSearchQuery,
    setSelectedCategory,
    openCreateModal,
    openEditModal,
    closeModal,
    saveProduct,
    deleteProduct,
    toggleActive,
    toggleFeatured,
    setError
  } = useDashboardProducts();

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Package className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          </motion.div>
          <p className="text-yellow-300 text-2xl font-bold">Cargando Productos...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 md:p-8 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-yellow-400/20"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-2xl p-4">
                  <Package className="w-8 h-8 text-black" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  Gestión de Productos
                </h1>
                <p className="text-gray-400 text-sm md:text-base mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Administra tu catálogo premium
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 rounded-xl text-black font-bold shadow-lg shadow-yellow-500/30 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Producto</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <ProductStats {...stats} />

        {/* Filtros */}
        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={allCategories}
          onClearFilters={handleClearFilters}
        />

        {/* Error Premium */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-500/40 rounded-2xl p-4 md:p-6 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 rounded-xl p-2">
                <AlertCircle className="w-6 h-6 text-red-300" />
              </div>
              <span className="text-red-200 font-medium flex-1">{error}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100 text-xl font-bold"
              >
                ✕
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Lista de productos */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-yellow-400/20 shadow-xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Package className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">
              {allProducts.length === 0 ? 'No hay productos' : 'No se encontraron productos'}
            </h3>
            <p className="text-gray-400 mb-6">
              {allProducts.length === 0 
                ? 'Comienza creando tu primer producto'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {allProducts.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCreateModal}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 rounded-xl text-black font-bold shadow-lg shadow-yellow-500/30 transition-all"
              >
                Crear Primer Producto
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onEdit={openEditModal}
                  onDelete={deleteProduct}
                  onToggleActive={toggleActive}
                  onToggleFeatured={toggleFeatured}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal de producto */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={closeModal}
          product={editingProduct}
          categories={allCategories}
          subcategories={allSubcategories}
          onSave={saveProduct}
          loading={saving}
        />
      </div>
    </div>
  );
}