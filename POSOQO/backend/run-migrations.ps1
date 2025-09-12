# Script para ejecutar migraciones en Render
Write-Host "Ejecutando migraciones en base de datos de Render..." -ForegroundColor Yellow

# Variables de conexion
$DB_HOST = "dpg-d2suuigdl3ps73ftaa2g-a.oregon-postgres.render.com"
$DB_PORT = "5432"
$DB_USER = "posoqouser"
$DB_PASSWORD = "PJH7SStAqigJAPvKMd3XNL1Ff8phuUGV"
$DB_NAME = "posoqo"

# Crear string de conexion
$connectionString = "postgresql://$DB_USER`:$DB_PASSWORD@$DB_HOST`:$DB_PORT/$DB_NAME"

Write-Host "Conectando a: $DB_HOST" -ForegroundColor Blue

# Verificar conexion
Write-Host "Verificando conexion..." -ForegroundColor Blue
psql $connectionString -c "SELECT version();"

# Ejecutar script de configuracion inicial
Write-Host "Ejecutando configuracion inicial..." -ForegroundColor Blue
psql $connectionString -f scripts/setup-db.sql

# Ejecutar migraciones en orden
Write-Host "Ejecutando migraciones..." -ForegroundColor Blue
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
    Write-Host "Ejecutando: $migration" -ForegroundColor Green
    psql $connectionString -f migrations/$migration
}

# Verificar que el usuario admin se creo correctamente
Write-Host "Verificando usuario admin..." -ForegroundColor Blue
psql $connectionString -c "SELECT id, name, email, role FROM users WHERE role = 'admin';"

Write-Host "Migraciones ejecutadas exitosamente!" -ForegroundColor Green
Write-Host "Ahora puedes hacer login con: rvfredy9@gmail.com / password" -ForegroundColor Cyan
