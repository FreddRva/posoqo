# 🚀 Guía de Deployment - POSOQO

## 📋 Prerequisitos

- Cuenta en [Railway.app](https://railway.app)
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [GitHub](https://github.com)
- Git instalado localmente

## 🔧 Backend en Railway

### 1. Preparar el repositorio
```bash
cd POSOQO/backend
git init
git add .
git commit -m "Initial commit - Backend ready for deployment"
```

### 2. Subir a GitHub
1. Crear repositorio en GitHub: `posoqo-backend`
2. Conectar repositorio local:
```bash
git remote add origin https://github.com/tu-usuario/posoqo-backend.git
git push -u origin main
```

### 3. Deploy en Railway
1. Ir a [Railway.app](https://railway.app)
2. Hacer clic en "New Project"
3. Seleccionar "Deploy from GitHub repo"
4. Conectar con GitHub y seleccionar `posoqo-backend`
5. Railway detectará automáticamente el Dockerfile

### 4. Configurar servicios
1. **PostgreSQL Database:**
   - En Railway, hacer clic en "New Service"
   - Seleccionar "Database" → "PostgreSQL"
   - Railway generará automáticamente las variables de entorno

2. **Redis:**
   - Hacer clic en "New Service"
   - Seleccionar "Database" → "Redis"
   - Railway generará automáticamente las variables de entorno

### 5. Variables de entorno en Railway
Configurar estas variables en el servicio backend:

```env
# Database (Railway las genera automáticamente)
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_SSL_MODE=require

# Redis (Railway las genera automáticamente)
REDIS_URL=${{Redis.REDIS_URL}}

# Server
PORT=4000
BASE_URL=https://tu-frontend-url.vercel.app

# JWT Secrets (CAMBIAR EN PRODUCCIÓN)
JWT_ACCESS_SECRET=tu-super-secreto-access-key-muy-largo-y-seguro
JWT_REFRESH_SECRET=tu-super-secreto-refresh-key-muy-largo-y-seguro

# CORS
ALLOWED_ORIGINS=https://tu-frontend-url.vercel.app

# Environment
NODE_ENV=production
DEBUG=false
```

## 🎨 Frontend en Vercel

### 1. Preparar el repositorio
```bash
cd POSOQO/frontend
git init
git add .
git commit -m "Initial commit - Frontend ready for deployment"
```

### 2. Subir a GitHub
1. Crear repositorio en GitHub: `posoqo-frontend`
2. Conectar repositorio local:
```bash
git remote add origin https://github.com/tu-usuario/posoqo-frontend.git
git push -u origin main
```

### 3. Deploy en Vercel
1. Ir a [Vercel](https://vercel.com)
2. Hacer clic en "New Project"
3. Importar desde GitHub: `posoqo-frontend`
4. Vercel detectará automáticamente que es un proyecto Next.js

### 4. Variables de entorno en Vercel
Configurar estas variables en Vercel:

```env
# NextAuth
NEXTAUTH_URL=https://tu-frontend-url.vercel.app
NEXTAUTH_SECRET=tu-nextauth-secret-muy-largo-y-seguro

# API
NEXT_PUBLIC_API_URL=https://tu-backend-url.railway.app

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Stripe (opcional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu-stripe-publishable-key
STRIPE_SECRET_KEY=tu-stripe-secret-key
```

## 🔄 Proceso completo

### Paso 1: Backend
1. Subir backend a GitHub
2. Deploy en Railway
3. Configurar PostgreSQL y Redis
4. Configurar variables de entorno
5. Obtener URL del backend (ej: `https://posoqo-backend-production.railway.app`)

### Paso 2: Frontend
1. Subir frontend a GitHub
2. Deploy en Vercel
3. Configurar variables de entorno con la URL del backend
4. Obtener URL del frontend (ej: `https://posoqo-frontend.vercel.app`)

### Paso 3: Actualizar CORS
1. En Railway, actualizar `ALLOWED_ORIGINS` con la URL final del frontend
2. En Vercel, actualizar `NEXT_PUBLIC_API_URL` con la URL final del backend

## 🗄️ Base de datos

### Ejecutar migraciones
Una vez que el backend esté desplegado, ejecutar las migraciones:

```bash
# Conectar a la base de datos de Railway
psql "postgresql://usuario:password@host:puerto/database"

# Ejecutar las migraciones
\i migrations/001_initial_schema.sql
\i migrations/002_add_products_table.sql
\i migrations/003_add_orders_table.sql
\i migrations/004_email_verifications.sql
\i migrations/005_add_user_address_fields.sql
\i migrations/006_notifications.sql
\i migrations/007_add_featured_products.sql
\i migrations/009_favorites.sql
\i migrations/010_complaints.sql
\i migrations/011_reservations.sql
\i migrations/012_add_user_active_field.sql
\i migrations/013_add_order_coordinates.sql
```

## 🔍 Verificación

1. **Backend:** Verificar que `https://tu-backend-url.railway.app/health` responda
2. **Frontend:** Verificar que la aplicación cargue correctamente
3. **Base de datos:** Verificar que las tablas se crearon correctamente
4. **CORS:** Verificar que el frontend puede comunicarse con el backend

## 💰 Costos estimados

- **Railway:** $5/mes (hobby plan) + $5/mes por base de datos
- **Vercel:** Gratis (hobby plan)
- **Total:** ~$10-15/mes

## 🆘 Troubleshooting

### Backend no inicia
- Verificar variables de entorno
- Revisar logs en Railway
- Verificar que la base de datos esté conectada

### Frontend no carga
- Verificar variables de entorno
- Verificar que la URL del backend sea correcta
- Revisar logs en Vercel

### CORS errors
- Verificar `ALLOWED_ORIGINS` en el backend
- Verificar `NEXT_PUBLIC_API_URL` en el frontend
