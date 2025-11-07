# Guía de Deployment - POSOQO

## 📋 Pre-requisitos

### Variables de Entorno Requeridas

Antes de desplegar, asegúrate de configurar todas las variables de entorno necesarias:

```bash
# Entorno
NODE_ENV=production
PORT=4000

# Base de Datos
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=posoqo_user
DB_PASSWORD=your-secure-password
DB_NAME=posoqo
DB_SSLMODE=require

# JWT Secrets (DEBEN ser únicos y fuertes)
JWT_ACCESS_SECRET=your-strong-random-secret-here
JWT_REFRESH_SECRET=your-strong-random-secret-here

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@posoqo.com
SMTP_FROM_NAME=POSOQO

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend API (opcional)
RESEND_API_KEY=your-resend-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# CORS (opcional, para personalizar)
CORS_ORIGINS=https://posoqo.com,https://www.posoqo.com

# Logging
LOG_LEVEL=WARN
```

## 🚀 Deployment Steps

### 1. Preparar Base de Datos

```bash
# Conectar a la base de datos y ejecutar migraciones
# Las migraciones se ejecutan automáticamente al iniciar el servidor
# Pero puedes ejecutarlas manualmente si lo prefieres:
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/001_initial_schema.sql
# ... (ejecutar todas las migraciones en orden)
```

### 2. Build del Backend

```bash
cd backend
go mod download
go build -o main ./cmd/main.go
```

### 3. Deploy con Docker (Recomendado)

```bash
# Build de la imagen
docker build -t posoqo-backend .

# Ejecutar contenedor
docker run -d \
  --name posoqo-backend \
  -p 4000:4000 \
  --env-file .env.production \
  posoqo-backend
```

### 4. Deploy en Render

1. Conectar tu repositorio a Render
2. Crear un nuevo Web Service
3. Configurar:
   - **Build Command**: `cd backend && go mod download && go build -o main ./cmd/main.go`
   - **Start Command**: `./backend/main`
   - **Environment**: Docker o Go
4. Agregar todas las variables de entorno
5. Deploy

### 5. Deploy en Railway

1. Conectar tu repositorio a Railway
2. Crear un nuevo proyecto
3. Configurar variables de entorno
4. Railway detectará automáticamente que es un proyecto Go
5. Deploy

### 6. Deploy en Fly.io

```bash
# Instalar flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Crear app
fly launch

# Configurar variables de entorno
fly secrets set JWT_ACCESS_SECRET=your-secret
fly secrets set JWT_REFRESH_SECRET=your-secret
# ... (configurar todas las variables)

# Deploy
fly deploy
```

## 🔍 Verificación Post-Deployment

### 1. Health Check

```bash
curl https://your-domain.com/health
```

Deberías recibir:
```json
{
  "status": "ok",
  "message": "POSOQO Backend funcionando correctamente",
  "checks": {
    "database": { "status": "ok" },
    "memory": { "status": "ok" },
    "goroutines": { "status": "ok" }
  }
}
```

### 2. Verificar Endpoints

```bash
# Root endpoint
curl https://your-domain.com/

# Swagger docs
curl https://your-domain.com/swagger/
```

### 3. Verificar Logs

```bash
# Ver logs en tiempo real
# Render: Dashboard -> Logs
# Railway: Dashboard -> Deployments -> View Logs
# Fly.io: fly logs
```

## 🔒 Checklist de Seguridad Pre-Deployment

- [ ] Todas las variables de entorno configuradas
- [ ] Secrets JWT no son valores por defecto
- [ ] Contraseña de BD configurada
- [ ] CORS configurado para producción
- [ ] HTTPS habilitado
- [ ] Endpoints de debug deshabilitados
- [ ] Rate limiting activo
- [ ] Logging configurado correctamente
- [ ] Migraciones ejecutadas
- [ ] Certificados SSL configurados

## 📊 Monitoreo

### Health Check Endpoint

El endpoint `/health` proporciona información sobre:
- Estado de la base de datos
- Uso de memoria
- Número de goroutines

### Logs

Los logs incluyen:
- Requests HTTP
- Errores
- Eventos de seguridad
- Operaciones de base de datos

## 🔄 Actualizaciones

### Actualizar Código

1. Hacer cambios en el código
2. Commit y push a la rama principal
3. El servicio se actualiza automáticamente (si está configurado)

### Actualizar Base de Datos

1. Crear nueva migración
2. Las migraciones se ejecutan automáticamente al iniciar el servidor
3. Verificar que las migraciones se aplicaron correctamente

## 🐛 Troubleshooting

### Error: "DB_PASSWORD debe estar configurado"

**Solución**: Asegúrate de configurar la variable de entorno `DB_PASSWORD`.

### Error: "Base de datos no disponible"

**Solución**: 
1. Verificar que la BD esté accesible
2. Verificar credenciales
3. Verificar firewall/red

### Error: "JWT_ACCESS_SECRET no puede usar el valor por defecto"

**Solución**: Configurar un secret único y fuerte en producción.

### Rate Limiting muy restrictivo

**Solución**: Ajustar `GeneralRateLimiter` en `middleware/auth.go` si es necesario.

## 📝 Notas Adicionales

- El servidor expone el puerto 4000 por defecto
- Las migraciones se ejecutan automáticamente al iniciar
- Los logs de DEBUG solo se muestran en desarrollo
- Los endpoints de debug solo están disponibles en desarrollo

## 🔗 Recursos

- [Documentación de Go](https://golang.org/doc/)
- [Fiber Documentation](https://docs.gofiber.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

