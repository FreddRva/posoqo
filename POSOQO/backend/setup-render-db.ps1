# Script para configurar base de datos en Render
Write-Host "🔄 Configurando base de datos POSOQO en Render..." -ForegroundColor Yellow

# Variables de entorno - CAMBIAR ESTOS VALORES POR LOS DE TU RENDER
$DB_HOST = "dpg-xxxxxxxxxxxxxxxxxxxxx-a.oregon-postgres.render.com"  # Cambiar por tu host de Render
$DB_PORT = "5432"
$DB_USER = "posoqo_user"  # Cambiar por tu usuario de Render
$DB_PASSWORD = "tu_password_aqui"  # Cambiar por tu password de Render
$DB_NAME = "posoqo"  # Cambiar por tu nombre de DB de Render

# Crear string de conexión
$connectionString = "postgresql://$DB_USER`:$DB_PASSWORD@$DB_HOST`:$DB_PORT/$DB_NAME"

Write-Host "🔗 Conectando a: $DB_HOST" -ForegroundColor Blue

# Ejecutar script de configuración inicial
Write-Host "📝 Ejecutando configuración inicial..." -ForegroundColor Blue
psql $connectionString -f scripts/setup-db.sql

# Ejecutar migraciones en orden
Write-Host "🚀 Ejecutando migraciones..." -ForegroundColor Blue
$migrations = @(
    "001_initial_schema.sql",
    "002_add_products_table.sql", 
    "003_add_orders_table.sql",
    "004_email_verifications.sql",
    "005_add_user_address_fields.sql",
    "006_notifications.sql",
    "007_add_featured_products.sql",
    "009_favorites.sql",
    "010_complaints.sql",
    "011_reservations.sql",
    "012_add_user_active_field.sql",
    "013_add_order_coordinates.sql"
)

foreach ($migration in $migrations) {
    Write-Host "📋 Ejecutando: $migration" -ForegroundColor Green
    psql $connectionString -f migrations/$migration
}

Write-Host "✅ ¡Base de datos POSOQO configurada exitosamente en Render!" -ForegroundColor Green