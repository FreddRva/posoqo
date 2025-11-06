# Configuración de Consulta de DNI

## ¿Cómo obtener el token de APIperu.dev?

1. **Regístrate en APIperu.dev:**
   - Visita: https://apiperu.dev
   - Crea una cuenta gratuita
   - Plan gratuito: 100 consultas/día

2. **Obtén tu token:**
   - Ve a tu dashboard
   - Copia tu token de API

3. **Configura la variable de entorno:**
   ```bash
   # En el archivo .env del backend
   APIPERU_TOKEN=tu_token_aqui
   ```

4. **Para producción (Render.com, etc.):**
   - Agrega la variable de entorno en el panel de configuración
   - Variable: `APIPERU_TOKEN`
   - Valor: tu token de APIperu.dev

## Funcionamiento

- El endpoint `/api/dni/:dni` consulta los datos del DNI
- Si no hay token configurado, usa el modo demo (limitado)
- El frontend autocompleta el nombre cuando se ingresa el DNI
- Los datos se obtienen de RENIEC a través de APIperu.dev

## Planes de APIperu.dev

- **Gratuito:** 100 consultas/día
- **Básico:** $5/mes - 1,000 consultas/día
- **Pro:** $15/mes - 10,000 consultas/día
- **Enterprise:** Consultas ilimitadas

