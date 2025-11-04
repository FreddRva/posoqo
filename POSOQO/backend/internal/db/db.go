package db

import (
	"context"
	"fmt"
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

	// Si no hay contraseña configurada, usar la contraseña por defecto
	if password == "" {
		password = "posoqoEvelinSuarez"
	}

	// Determinar SSL mode según el entorno
	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" {
		// Por defecto usar 'prefer' que funciona en desarrollo y producción
		sslMode = "prefer"
	}

	// URL con SSL configurado según el entorno
	url := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, dbname, sslMode)

	pool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		return err
	}
	if err := pool.Ping(context.Background()); err != nil {
		return err
	}
	DB = pool

	// Las migraciones se ejecutan en main.go usando migrations.RunMigrations()
	// para evitar duplicación y tener mejor control

	return nil
}
