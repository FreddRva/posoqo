// Configuración de Cloudinary para upload directo desde frontend
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

// Debug: Verificar que las variables estén configuradas
if (typeof window !== 'undefined') {
  console.log('🔍 [DEBUG] Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  console.log('🔍 [DEBUG] Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  
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
  console.log('🔍 [DEBUG] Iniciando upload a Cloudinary...');
  console.log('🔍 [DEBUG] Archivo:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
  console.log('🔍 [DEBUG] Cloud Name configurado:', CLOUDINARY_CONFIG.cloudName);
  console.log('🔍 [DEBUG] Upload Preset configurado:', CLOUDINARY_CONFIG.uploadPreset);

  // Verificar que las variables de entorno estén configuradas
  if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
    console.error('❌ [DEBUG] Variables de entorno faltantes:', {
      cloudName: !!CLOUDINARY_CONFIG.cloudName,
      uploadPreset: !!CLOUDINARY_CONFIG.uploadPreset
    });
    return {
      success: false,
      error: 'Configuración de Cloudinary no disponible. Contacta al administrador.'
    };
  }

  // Validar tamaño del archivo (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    console.error('❌ [DEBUG] Archivo demasiado grande:', file.size);
    return {
      success: false,
      error: 'El archivo es demasiado grande. Máximo 5MB'
    };
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    console.error('❌ [DEBUG] Tipo de archivo no permitido:', file.type);
    return {
      success: false,
      error: 'Tipo de archivo no permitido. Solo JPG, PNG, GIF y WebP'
    };
  }

  const publicId = `posoqo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  
  console.log('🔍 [DEBUG] URL de upload:', uploadUrl);
  console.log('🔍 [DEBUG] Public ID generado:', publicId);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'posoqo/products');
  formData.append('public_id', publicId);

  console.log('🔍 [DEBUG] FormData preparado, enviando request...');

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('🔍 [DEBUG] Response status:', response.status);
    console.log('🔍 [DEBUG] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DEBUG] Error response body:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('❌ [DEBUG] Error data parsed:', errorData);
      } catch (e) {
        console.error('❌ [DEBUG] No se pudo parsear error como JSON');
      }
      
      throw new Error(errorData?.error?.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [DEBUG] Response data completa:', data);
    console.log('✅ [CLOUDINARY] Imagen subida exitosamente:', data.secure_url);
    
    return {
      success: true,
      url: data.secure_url
    };
  } catch (error: any) {
    console.error('❌ [DEBUG] Error completo:', error);
    console.error('❌ [CLOUDINARY] Error subiendo imagen:', error.message);
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

  // Verificar que el cloudName esté configurado
  if (!CLOUDINARY_CONFIG.cloudName) {
    console.warn('⚠️ Cloud Name no configurado, devolviendo URL original');
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
