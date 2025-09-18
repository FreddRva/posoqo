package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var DB *pgxpool.Pool

func InitDB() error {
	// Cargar variables de entorno
	_ = godotenv.Load()

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	// Si no hay contraseña configurada, usar la contraseña por defecto
	if password == "" {
		password = "posoqoEvelinSuarez"
	}

	// URL con SSL habilitado para producción
	url := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=require", user, password, host, port, dbname)

	pool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		return err
	}
	if err := pool.Ping(context.Background()); err != nil {
		return err
	}
	DB = pool

	// Ejecutar migraciones
	if err := runMigrations(); err != nil {
		log.Printf("Error ejecutando migraciones: %v", err)
		return err
	}

	return nil
}

func runMigrations() error {
	log.Println("🔄 Ejecutando migraciones de base de datos...")

	// Lista de archivos de migración en orden
	migrations := []string{
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
		"016_add_order_id_to_notifications.sql",
		"017_create_cart_tables.sql",
		"018_create_payments_table.sql",
		"019_add_is_read_to_notifications.sql",
	}

	for _, migration := range migrations {
		if err := executeMigration(migration); err != nil {
			return fmt.Errorf("error en migración %s: %w", migration, err)
		}
	}

	log.Println("✅ Migraciones completadas exitosamente")
	return nil
}

func executeMigration(filename string) error {
	// Leer archivo de migración
	migrationPath := filepath.Join("migrations", filename)
	content, err := os.ReadFile(migrationPath)
	if err != nil {
		// Si no existe el archivo, continuar (migración opcional)
		log.Printf("⚠️  Archivo de migración %s no encontrado, saltando...", filename)
		return nil
	}

	// Ejecutar migración
	_, err = DB.Exec(context.Background(), string(content))
	if err != nil {
		return fmt.Errorf("error ejecutando %s: %w", filename, err)
	}

	log.Printf("✅ Migración %s ejecutada", filename)
	return nil
}
