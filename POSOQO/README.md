# 🍺 POSOQO - Cervecería Artesanal Ayacuchana

Sistema de e-commerce para la venta de cervezas artesanales y productos relacionados.

## 📋 Descripción

POSOQO es una plataforma completa de e-commerce desarrollada para la comercialización de cervezas artesanales ayacuchanas. Incluye funcionalidades de catálogo de productos, carrito de compras, sistema de pedidos, reservas, pagos integrados, y panel de administración.

## 🏗️ Arquitectura

### Backend
- **Lenguaje:** Go 1.24+
- **Framework:** Fiber v2
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT (Access + Refresh Tokens)
- **Documentación:** Swagger

### Frontend
- **Framework:** Next.js 15
- **Lenguaje:** TypeScript
- **UI:** Tailwind CSS + Framer Motion
- **Autenticación:** NextAuth.js
- **Pagos:** Stripe

## 🚀 Instalación

### Prerrequisitos
- Go 1.24+ instalado
- Node.js 20+ y npm
- PostgreSQL 14+
- Variables de entorno configuradas

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
go mod download
```

3. Configurar variables de entorno:
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

4. Ejecutar migraciones:
```bash
go run cmd/main.go
# Las migraciones se ejecutan automáticamente
```

5. Iniciar servidor:
```bash
go run cmd/main.go
```

El servidor se iniciará en `http://localhost:4000`

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp env.example .env.local
# Editar .env.local con tus configuraciones
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## ⚙️ Configuración de Variables de Entorno

### Backend (.env)

```env
# Servidor
PORT=4000
NODE_ENV=development

# Base de Datos (OBLIGATORIO)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_segura  # ⚠️ OBLIGATORIO
DB_NAME=posoqo
DB_SSLMODE=prefer

# JWT Secrets (OBLIGATORIO en producción)
JWT_ACCESS_SECRET=tu-secret-access-min-32-chars
JWT_REFRESH_SECRET=tu-secret-refresh-min-32-chars

# Email SMTP (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
FROM_EMAIL=tu-email@gmail.com
FROM_NAME=POSOQO

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Cloudinary (Opcional)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Gemini AI (Opcional)
GEMINI_API_KEY=tu-gemini-api-key
```

### Frontend (.env.local)

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu-stripe-publishable-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu-upload-preset
```

## 📁 Estructura del Proyecto

```
POSOQO/
├── backend/
│   ├── cmd/
│   │   └── main.go              # Punto de entrada
│   ├── internal/
│   │   ├── db/                  # Conexión a BD
│   │   ├── handlers/            # Controladores HTTP
│   │   ├── middleware/          # Middlewares (auth, rate limit, etc.)
│   │   ├── models/              # Modelos de datos
│   │   ├── services/            # Servicios externos
│   │   └── utils/               # Utilidades
│   ├── migrations/              # Migraciones de BD
│   └── docs/                    # Documentación Swagger
│
└── frontend/
    ├── src/
    │   ├── app/                 # Páginas Next.js
    │   ├── components/          # Componentes React
    │   ├── contexts/            # Contextos React
    │   ├── hooks/               # Custom hooks
    │   ├── lib/                 # Utilidades y configuraciones
    │   └── types/               # Tipos TypeScript
    └── public/                  # Archivos estáticos
```

## 🔐 Seguridad

### Implementado
- ✅ Autenticación JWT con refresh tokens
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Rate limiting para prevenir ataques
- ✅ Headers de seguridad (CSP, HSTS, X-Frame-Options)
- ✅ Validación y sanitización de inputs
- ✅ Queries parametrizadas (prevención SQL injection)
- ✅ CORS configurado
- ✅ HTTPS en producción

### Recomendaciones
- Configurar variables de entorno correctamente
- Usar contraseñas fuertes para JWT secrets
- Habilitar SSL/TLS en producción
- Configurar firewall y WAF
- Realizar auditorías de seguridad periódicas

## 🧪 Testing

### Ejecutar tests del backend:
```bash
cd backend
go test ./...
```

### Ejecutar tests del frontend:
```bash
cd frontend
npm test
```

## 📚 Documentación

### API Documentation
La documentación Swagger está disponible en:
```
http://localhost:4000/swagger/
```

### Documentación de desarrollo
Ver `AUDITORIA_PROYECTO.md` para detalles de seguridad y mejoras.

## 🐳 Docker

### Backend con Docker Compose:
```bash
cd backend
docker-compose up -d
```

## 📝 Scripts Útiles

### Backend
- `go run cmd/main.go` - Ejecutar servidor
- `go test ./...` - Ejecutar tests
- `go mod tidy` - Limpiar dependencias

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 👥 Equipo

Desarrollado para POSOQO Cervecería Artesanal Ayacuchana

## 🔗 Enlaces Útiles

- [Documentación Swagger](http://localhost:4000/swagger/)
- [Health Check](http://localhost:4000/health)
- [Frontend](http://localhost:3000)

## ⚠️ Notas Importantes

- **NUNCA** commitees archivos `.env` al repositorio
- **SIEMPRE** configura `DB_PASSWORD` en producción
- Los endpoints de debug están deshabilitados en producción
- Usa contraseñas fuertes para JWT secrets en producción

