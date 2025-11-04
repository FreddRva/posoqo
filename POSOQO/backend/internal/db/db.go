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

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslMode := os.Getenv("DB_SSL_MODE")

	// Validar que la contraseña esté configurada en producción
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
	var url string
	if password != "" {
		url = fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, dbname, sslMode)
	} else {
		url = fmt.Sprintf("postgresql://%s@%s:%s/%s?sslmode=%s", user, host, port, dbname, sslMode)
	}

	pool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		return err
	}
	if err := pool.Ping(context.Background()); err != nil {
		return err
	}
	DB = pool

	// Las migraciones se ejecutan desde migrations.RunMigrations() en main.go
	// No ejecutar aquí para evitar duplicación

	return nil
}
