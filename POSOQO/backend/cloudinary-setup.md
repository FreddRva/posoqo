# Configuración de Cloudinary para POSOQO

## 🚀 Pasos para configurar Cloudinary

### 1. Crear cuenta en Cloudinary
1. Ve a [cloudinary.com](https://cloudinary.com)
2. Regístrate con tu email
3. Confirma tu cuenta

### 2. Obtener credenciales
1. En el dashboard de Cloudinary, ve a "Settings" → "API Keys"
2. Copia las siguientes credenciales:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**

### 3. Configurar variables de entorno

#### Para desarrollo local:
Crea un archivo `.env` en `POSOQO/backend/` con:

```env
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

#### Para producción (Render.com):
1. Ve a tu dashboard de Render
2. Selecciona tu servicio de backend
3. Ve a "Environment"
4. Agrega las variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### 4. Verificar configuración
Después de configurar las variables, reinicia tu servidor y verás en los logs:
```
✅ Cloudinary inicializado correctamente
```

## 🔧 Funcionalidades

- **Subida automática**: Las imágenes se suben automáticamente a Cloudinary
- **Fallback local**: Si Cloudinary falla, usa almacenamiento local
- **Optimización**: Cloudinary optimiza automáticamente las imágenes
- **CDN global**: Las imágenes se sirven desde una CDN rápida

## 📁 Estructura de carpetas en Cloudinary
Las imágenes se organizan en:
```
posoqo/
├── posoqo-20241201-123456-abcd1234.jpg
├── posoqo-20241201-123457-efgh5678.png
└── ...
```

## 🛡️ Seguridad
- Las credenciales están en variables de entorno
- Solo se permiten tipos de imagen específicos
- Tamaño máximo de 5MB por imagen
- Nombres de archivo únicos para evitar conflictos
