package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var DB *pgxpool.Pool

func InitDB() error {
	// Cargar variables de entorno
	_ = godotenv.Load()

	var url string

	// Prioridad 1: Usar DATABASE_URL si está disponible (común en Render, Railway, Heroku, etc.)
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL != "" {
		log.Println("✅ Usando DATABASE_URL para conexión a base de datos")
		url = databaseURL
	} else {
		// Prioridad 2: Construir URL desde variables individuales
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		sslMode := os.Getenv("DB_SSL_MODE")

		// Validar variables requeridas
		if host == "" || port == "" || user == "" || dbname == "" {
			return fmt.Errorf("variables de base de datos requeridas no configuradas: DB_HOST=%s, DB_PORT=%s, DB_USER=%s, DB_NAME=%s",
				host, port, user, dbname)
		}

		// Validar contraseña en producción
		if password == "" {
			if os.Getenv("NODE_ENV") == "production" {
				return fmt.Errorf("DB_PASSWORD debe estar configurado en producción")
			}
			log.Println("⚠️ DB_PASSWORD no configurado. La conexión fallará si no se proporciona contraseña.")
		}

		// Configurar SSL mode (por defecto 'disable' para desarrollo, 'require' para producción)
		if sslMode == "" {
			if os.Getenv("NODE_ENV") == "production" {
				sslMode = "require"
			} else {
				sslMode = "disable"
			}
		}

		// Construir URL de conexión
		if password != "" {
			url = fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, dbname, sslMode)
		} else {
			url = fmt.Sprintf("postgresql://%s@%s:%s/%s?sslmode=%s", user, host, port, dbname, sslMode)
		}
		log.Printf("✅ Construyendo URL de conexión desde variables individuales (Host: %s)", host)
	}

	// Intentar conectar
	log.Println("🔌 Intentando conectar a la base de datos...")
	pool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		return fmt.Errorf("error creando pool de conexiones: %w", err)
	}

	// Verificar conexión
	if err := pool.Ping(context.Background()); err != nil {
		pool.Close()
		return fmt.Errorf("error verificando conexión (ping fallido): %w", err)
	}

	DB = pool
	log.Println("✅ Conexión a base de datos establecida exitosamente")

	// Las migraciones se ejecutan desde migrations.RunMigrations() en main.go
	// No ejecutar aquí para evitar duplicación

	return nil
}
