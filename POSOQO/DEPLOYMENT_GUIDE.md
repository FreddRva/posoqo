# 🚀 Guía de Deployment - POSOQO

## Backend (Railway)

### 1. Preparar el Backend
```bash
cd backend
```

### 2. Variables de Entorno en Railway
Configurar estas variables en Railway:
- `DB_HOST`: Host de la base de datos
- `DB_PORT`: Puerto (5432)
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `PORT`: Puerto del servidor (Railway lo asigna automáticamente)

### 3. Deploy en Railway
1. Conectar repositorio de GitHub
2. Seleccionar carpeta `backend`
3. Railway detectará automáticamente el Dockerfile
4. El backend estará disponible en: `https://tu-proyecto.railway.app`

### 4. Verificar Backend
Visitar: `https://tu-proyecto.railway.app/health`

## Frontend (Vercel)

### 1. Preparar el Frontend
```bash
cd frontend
```

### 2. Variables de Entorno en Vercel
Configurar estas variables en Vercel:
- `NEXTAUTH_URL`: URL de tu frontend (ej: https://posoqo.vercel.app)
- `NEXTAUTH_SECRET`: Clave secreta para NextAuth
- `NEXT_PUBLIC_API_URL`: URL de tu backend en Railway

### 3. Deploy en Vercel
1. Conectar repositorio de GitHub
2. Seleccionar carpeta `frontend`
3. Vercel detectará automáticamente que es Next.js
4. El frontend estará disponible en: `https://posoqo.vercel.app`

## Verificación

### Backend Health Check
```bash
curl https://tu-proyecto.railway.app/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "message": "POSOQO Backend funcionando correctamente",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### Frontend
- Visitar la URL de Vercel
- Verificar que la página cargue correctamente
- Verificar que las llamadas a la API funcionen

## URLs de Ejemplo

- **Backend**: `https://posoqo-backend.railway.app`
- **Frontend**: `https://posoqo.vercel.app`
- **Health Check**: `https://posoqo-backend.railway.app/health`

## Próximos Pasos

1. ✅ Verificar que backend funcione en Railway
2. ✅ Verificar que frontend funcione en Vercel
3. 🔄 Refactorizar código (backend y frontend)
4. 🔄 Mejorar diseño y UX
5. 🔄 Implementar dominio personalizado
