# Script de restauración de base de datos POSOQO
Write-Host "🔄 Iniciando restauración de base de datos POSOQO..." -ForegroundColor Yellow

# 1. Detener contenedores existentes
Write-Host "📦 Deteniendo contenedores existentes..." -ForegroundColor Blue
docker compose down -v

# 2. Levantar solo la base de datos
Write-Host "🐘 Levantando base de datos PostgreSQL..." -ForegroundColor Blue
docker compose up -d db

# 3. Esperar a que la base de datos esté lista
Write-Host "⏳ Esperando a que la base de datos esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Verificar que la base de datos esté funcionando
Write-Host "🔍 Verificando estado de la base de datos..." -ForegroundColor Blue
$dbStatus = docker ps --filter "name=posoqo-postgres" --format "table {{.Status}}"
Write-Host $dbStatus

# 5. Ejecutar script de configuración inicial
Write-Host "📝 Ejecutando configuración inicial..." -ForegroundColor Blue
docker exec -i posoqo-postgres psql -U posoqo_user -d posoqo < scripts/setup-db.sql

# 6. Ejecutar migraciones en orden
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
    docker exec -i posoqo-postgres psql -U posoqo_user -d posoqo < migrations/$migration
}

# 7. Verificar tablas creadas
Write-Host "🔍 Verificando tablas creadas..." -ForegroundColor Blue
docker exec -i posoqo-postgres psql -U posoqo_user -d posoqo -c "\dt"

# 8. Levantar el backend
Write-Host "🚀 Levantando backend..." -ForegroundColor Blue
docker compose up -d backend

Write-Host "✅ ¡Base de datos POSOQO restaurada exitosamente!" -ForegroundColor Green
Write-Host "🌐 Backend disponible en: http://localhost:4000" -ForegroundColor Cyan
Write-Host "🗄️ Base de datos disponible en: localhost:5432" -ForegroundColor Cyan
