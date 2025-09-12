# 🔒 Guía de Seguridad - POSOQO Backend

## ⚠️ Datos Sensibles

### Variables de Entorno Críticas
- `JWT_ACCESS_SECRET` - **NUNCA** committear
- `JWT_REFRESH_SECRET` - **NUNCA** committear  
- `DB_PASSWORD` - **NUNCA** committear
- `GOOGLE_CLIENT_SECRET` - **NUNCA** committear
- `STRIPE_SECRET_KEY` - **NUNCA** committear

### Generación de Secrets Seguros
```bash
# Generar JWT secrets (mínimo 32 caracteres)
openssl rand -base64 32

# Generar NEXTAUTH_SECRET
openssl rand -base64 32
```

## 🛡️ Configuración de Seguridad

### 1. Base de Datos
- ✅ Conexión SSL habilitada en producción
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Triggers de auditoría deshabilitados temporalmente

### 2. Autenticación
- ✅ JWT con expiración
- ✅ Refresh tokens
- ✅ Rate limiting en endpoints de auth
- ✅ Validación de email obligatoria

### 3. Headers de Seguridad
- ✅ CORS configurado
- ✅ Headers de seguridad habilitados
- ✅ Rate limiting global

## 🚨 Checklist de Despliegue

### Antes de Deploy
- [ ] Cambiar todos los secrets por defecto
- [ ] Verificar que no hay credenciales hardcodeadas
- [ ] Configurar variables de entorno en Render
- [ ] Verificar conexión SSL a la base de datos

### Después de Deploy
- [ ] Probar login con credenciales reales
- [ ] Verificar que los logs no muestran datos sensibles
- [ ] Confirmar que las rutas protegidas funcionan
- [ ] Revisar métricas de seguridad

## 🔍 Monitoreo

### Logs a Revisar
- Intentos de login fallidos
- Requests a rutas protegidas sin auth
- Errores de base de datos
- Rate limiting activado

### Alertas Recomendadas
- Múltiples intentos de login fallidos
- Requests anómalos
- Errores de autenticación masivos

## 📝 Notas de Seguridad

- El usuario admin por defecto debe cambiarse en producción
- Las contraseñas deben ser complejas
- Los tokens JWT tienen expiración de 15 minutos
- Los refresh tokens expiran en 7 días
- Se recomienda rotar secrets periódicamente
