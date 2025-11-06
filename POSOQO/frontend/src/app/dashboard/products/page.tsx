"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, AlertCircle } from 'lucide-react';
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
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-700">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Gestión de Productos</h1>
            <p className="text-stone-600">Administra tu catálogo de productos y cervezas</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Producto</span>
          </motion.button>
        </div>

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

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Lista de productos */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-xl shadow-sm border border-stone-200"
          >
            <Package className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-800 mb-2">
              {allProducts.length === 0 ? 'No hay productos' : 'No se encontraron productos'}
            </h3>
            <p className="text-stone-600 mb-6">
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
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
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
  );
}