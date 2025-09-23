// Configuración de Cloudinary para upload directo desde frontend
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '789811178947175',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'posoqo-upload',
};

// Verificar que las variables estén configuradas
if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado');
  }
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
    console.warn('⚠️ NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET no está configurado');
  }
}

// Función para subir imagen directamente a Cloudinary
export const uploadImageToCloudinary = async (file: File): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> => {
  // Validar tamaño del archivo (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      error: 'El archivo es demasiado grande. Máximo 5MB'
    };
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Tipo de archivo no permitido. Solo JPG, PNG, GIF y WebP'
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'posoqo/products');
  formData.append('public_id', `posoqo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [CLOUDINARY] Imagen subida exitosamente:', data.secure_url);
    
    return {
      success: true,
      url: data.secure_url
    };
  } catch (error: any) {
    console.error('❌ [CLOUDINARY] Error subiendo imagen:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al subir imagen'
    };
  }
};

// Función para generar URL optimizada de Cloudinary
export const getCloudinaryUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
} = {}): string => {
  // Si no es una URL de Cloudinary, devolverla tal como está
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  // Extraer el public_id de la URL
  const urlParts = url.split('/');
  const publicIdWithExt = urlParts[urlParts.length - 1];
  const publicId = publicIdWithExt.split('.')[0];
  
  let transformation = `f_${format},q_${quality}`;
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformation}/posoqo/products/${publicId}`;
};
