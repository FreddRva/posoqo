# Configuración de Google OAuth para POSOQO

## Pasos para configurar Google OAuth

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.developers.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombra tu proyecto (ej: "POSOQO Auth")

### 2. Habilitar Google Identity API

1. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google Identity" o "Google+ API"
3. Haz clic en "Habilitar"

### 3. Crear credenciales OAuth 2.0

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "ID de cliente OAuth 2.0"
3. Selecciona "Aplicación web"
4. Configura las URIs de redirección autorizadas:
   - **Desarrollo**: `http://localhost:3000/api/auth/callback/google`
   - **Producción**: `https://tu-dominio.com/api/auth/callback/google`

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la carpeta `frontend` con:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-seguro-aqui

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### 5. Configurar el backend

Asegúrate de que tu backend tenga el endpoint `/auth/social-login` configurado para manejar el login con Google.

### 6. Probar la configuración

1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a `http://localhost:3000/login`
3. Haz clic en "Continuar con Google"
4. Deberías ser redirigido a Google para autenticarte

## Solución de problemas

### Error: "redirect_uri_mismatch"
- Verifica que las URIs de redirección en Google Console coincidan exactamente con las de tu aplicación

### Error: "invalid_client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctamente configurados

### Error: "access_denied"
- Verifica que el dominio esté autorizado en Google Console

## Notas importantes

- **NEXTAUTH_SECRET**: Debe ser una cadena aleatoria segura (mínimo 32 caracteres)
- **Dominios de producción**: Asegúrate de agregar tu dominio de producción a las URIs de redirección
- **HTTPS**: Google requiere HTTPS en producción para OAuth
