// components/dashboard/ProductModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { ProductModalProps, ProductFormData } from '@/types/dashboard';
import { ImageUpload } from './ImageUpload';

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  subcategories,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    subcategory_id: '',
    estilo: '',
    abv: '',
    ibu: '',
    color: '',
    is_active: true,
    is_featured: false,
    stock: 0
  });
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar formulario
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || '',
        estilo: product.estilo || '',
        abv: product.abv || '',
        ibu: product.ibu || '',
        color: product.color || '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        stock: product.stock || 0
      });
      setImageUrl(product.image_url || '');
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category_id: '',
        subcategory_id: '',
        estilo: '',
        abv: '',
        ibu: '',
        color: '',
        is_active: true,
        is_featured: false,
        stock: 0
      });
      setImageUrl('');
    }
    setErrors({});
  }, [product, isOpen]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Si se cambia la subcategoría, limpiar especificaciones técnicas si no es cerveza
      if (field === 'subcategory_id') {
        const selectedSubcategory = subcategories.find(sub => sub.id === value);
        const isCerveza = selectedSubcategory?.name?.toLowerCase() === 'cerveza';
        
        if (!isCerveza) {
          newData.estilo = '';
          newData.abv = '';
          newData.ibu = '';
          newData.color = '';
        }
      }
      
      return newData;
    });
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (!formData.category_id) newErrors.category_id = 'La categoría es requerida';
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const productData = {
      ...formData,
      image_url: imageUrl
    };

    onSave(productData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category_id: '',
      subcategory_id: '',
      estilo: '',
      abv: '',
      ibu: '',
      color: '',
      is_active: true,
      is_featured: false,
      stock: 0
    });
    setImageUrl('');
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {product ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda */}
                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nombre del producto"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Descripción del producto"
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.price ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                        {errors.price && (
                          <p className="text-sm text-red-600 mt-1">{errors.price}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.stock ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0"
                        />
                        {errors.stock && (
                          <p className="text-sm text-red-600 mt-1">{errors.stock}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Categorías */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Categorización</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría *
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => {
                          handleInputChange('category_id', e.target.value);
                          handleInputChange('subcategory_id', ''); // Reset subcategory
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.category_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <p className="text-sm text-red-600 mt-1">{errors.category_id}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategoría
                      </label>
                      <select
                        value={formData.subcategory_id}
                        onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!formData.category_id}
                      >
                        <option value="">Seleccionar subcategoría</option>
                        {subcategories
                          .filter(sub => sub.parent_id === formData.category_id)
                          .map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-6">
                  {/* Imagen */}
                  <ImageUpload
                    onImageUpload={setImageUrl}
                    currentImage={imageUrl}
                    loading={loading}
                  />

                  {/* Especificaciones técnicas - Solo para Cerveza */}
                  {(() => {
                    const selectedSubcategory = subcategories.find(sub => sub.id === formData.subcategory_id);
                    const isCerveza = selectedSubcategory?.name?.toLowerCase() === 'cerveza';
                    
                    if (!isCerveza) return null;
                    
                    return (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Especificaciones Técnicas</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Estilo
                            </label>
                            <input
                              type="text"
                              value={formData.estilo}
                              onChange={(e) => handleInputChange('estilo', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="IPA, Lager, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              ABV
                            </label>
                            <input
                              type="text"
                              value={formData.abv}
                              onChange={(e) => handleInputChange('abv', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="5.5%"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              IBU
                            </label>
                            <input
                              type="text"
                              value={formData.ibu}
                              onChange={(e) => handleInputChange('ibu', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="25"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Color
                            </label>
                            <input
                              type="text"
                              value={formData.color}
                              onChange={(e) => handleInputChange('color', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Dorado, Ámbar, etc."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Estado del producto */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Estado</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Producto activo</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Producto destacado</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {product ? 'Actualizar' : 'Crear'} Producto
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
