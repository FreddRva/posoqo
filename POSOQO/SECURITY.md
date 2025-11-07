# Guía de Seguridad - POSOQO

## Configuración de Seguridad

### Variables de Entorno Críticas

Las siguientes variables de entorno **DEBEN** estar configuradas en producción:

- `JWT_ACCESS_SECRET`: Secret para tokens de acceso (debe ser único y fuerte)
- `JWT_REFRESH_SECRET`: Secret para tokens de refresh (debe ser único y fuerte)
- `DB_PASSWORD`: Contraseña de la base de datos (obligatoria)
- `DB_HOST`: Host de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `SMTP_HOST`: Host del servidor SMTP
- `SMTP_USER`: Usuario SMTP
- `SMTP_PASSWORD`: Contraseña SMTP
- `GOOGLE_CLIENT_ID`: ID del cliente de Google OAuth
- `GOOGLE_CLIENT_SECRET`: Secret del cliente de Google OAuth

### Seguridad de Contraseñas

- Las contraseñas se hashean usando `bcrypt` con coste por defecto (10)
- Longitud mínima: 8 caracteres
- Se requiere validación de email antes de permitir login con email/password

### Tokens JWT

- Access tokens expiran en 15 minutos
- Refresh tokens expiran en 7 días
- Los tokens se almacenan en cookies httpOnly (frontend)
- Los secrets JWT deben ser únicos y no usar valores por defecto en producción

### Rate Limiting

- Endpoints de autenticación: 5 requests por minuto por IP
- Endpoints generales: 100 requests por minuto por IP
- Los límites se aplican automáticamente a través de middleware

### Protección CSRF

- Se requiere header `X-CSRF-Token` en todas las requests que modifican datos (POST, PUT, DELETE, PATCH)
- Los métodos GET, HEAD y OPTIONS están exentos

### Logging

- Los logs de DEBUG solo se muestran en desarrollo
- Información sensible (emails, tokens) se sanitiza antes de loguear
- Los eventos de seguridad siempre se registran

### Base de Datos

- Las conexiones usan SSL cuando está disponible
- Las contraseñas nunca se almacenan en texto plano
- Las migraciones se ejecutan automáticamente al iniciar el servidor

### Endpoints de Debug

- Los endpoints de debug (`/debug/*`) solo están disponibles en desarrollo
- En producción, estos endpoints están completamente deshabilitados

## Mejores Prácticas

1. **Nunca** hardcodear contraseñas o secrets en el código
2. **Siempre** validar entrada del usuario
3. **Siempre** sanitizar datos antes de loguear
4. **Siempre** usar HTTPS en producción
5. **Siempre** mantener las dependencias actualizadas
6. **Siempre** revisar logs de seguridad regularmente

## Checklist de Despliegue

- [ ] Todas las variables de entorno críticas están configuradas
- [ ] Los secrets JWT no son valores por defecto
- [ ] La contraseña de la base de datos está configurada
- [ ] HTTPS está habilitado
- [ ] Los endpoints de debug están deshabilitados
- [ ] El rate limiting está activo
- [ ] El logging está configurado correctamente
- [ ] Las migraciones se han ejecutado
- [ ] Los certificados SSL están configurados

## Incidentes de Seguridad

Si descubres una vulnerabilidad de seguridad:

1. **NO** la reportes públicamente
2. Contacta al equipo de desarrollo inmediatamente
3. Proporciona detalles sobre la vulnerabilidad
4. Espera confirmación antes de hacer pública la información

