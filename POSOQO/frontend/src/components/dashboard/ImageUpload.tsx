// components/dashboard/ImageUpload.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ImageUploadProps } from '@/types/dashboard';

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  loading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    setUploading(true);
    
    try {
      // Usar Cloudinary directamente desde el frontend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'posoqo_products');
      formData.append('folder', 'posoqo/products');
      // No aplicar transformaciones en el upload para preservar imagen completa
      // Las transformaciones se aplicarán al mostrar la imagen si es necesario

      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      onImageUpload(data.secure_url);
      
      // Resetear el input para permitir seleccionar la misma imagen de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Imagen del Producto
      </label>
      
      {/* Área de subida */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : currentImage
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={uploading || loading}
        />
        
        {currentImage ? (
          <div className="space-y-4">
            <div className="relative w-full flex items-center justify-center">
              <div className="relative w-full max-w-xs min-h-[300px] bg-white rounded-lg flex items-center justify-center p-4 group cursor-pointer">
                <img
                  src={currentImage}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'none',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
                {/* Overlay para indicar que se puede cambiar */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center z-10">
                  <div className="text-white text-center pointer-events-none">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Haz clic para cambiar</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onImageUpload('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors z-20"
                  title="Eliminar imagen"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full px-3 py-1.5 hover:bg-blue-600 transition-colors z-20 text-xs font-medium flex items-center gap-1"
                  title="Cambiar imagen"
                  type="button"
                >
                  <Upload className="w-3 h-3" />
                  Cambiar
                </button>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium">
              Imagen cargada correctamente. Haz clic en la imagen para cambiarla.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {uploading || loading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600">
                  {uploading ? 'Subiendo imagen...' : 'Cargando...'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <ImageIcon className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    Arrastra una imagen aquí o{' '}
                    <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                      haz clic para seleccionar
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF hasta 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
