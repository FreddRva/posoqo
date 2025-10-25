package migrations

import (
	"context"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/posoqo/backend/internal/db"
)

// RunMigrations ejecuta todas las migraciones SQL pendientes
func RunMigrations() error {
	fmt.Println("🔄 Iniciando sistema de migraciones...")

	// Crear tabla de control de migraciones si no existe
	_, err := db.DB.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			id SERIAL PRIMARY KEY,
			filename VARCHAR(255) UNIQUE NOT NULL,
			executed_at TIMESTAMP DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("error creando tabla de migraciones: %w", err)
	}

	// Obtener migraciones ya ejecutadas
	rows, err := db.DB.Query(context.Background(), "SELECT filename FROM schema_migrations")
	if err != nil {
		return fmt.Errorf("error consultando migraciones: %w", err)
	}
	defer rows.Close()

	executed := make(map[string]bool)
	for rows.Next() {
		var filename string
		if err := rows.Scan(&filename); err != nil {
			continue
		}
		executed[filename] = true
	}

	// Obtener archivos de migración
	migrationsDir := "migrations"
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("error leyendo directorio de migraciones: %w", err)
	}

	// Filtrar y ordenar archivos .sql
	var sqlFiles []fs.DirEntry
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			sqlFiles = append(sqlFiles, file)
		}
	}
	sort.Slice(sqlFiles, func(i, j int) bool {
		return sqlFiles[i].Name() < sqlFiles[j].Name()
	})

	// Ejecutar migraciones pendientes
	migrationsApplied := 0
	for _, file := range sqlFiles {
		filename := file.Name()
		
		if executed[filename] {
			fmt.Printf("⏭️  Saltando migración ya ejecutada: %s\n", filename)
			continue
		}

		fmt.Printf("🔄 Aplicando migración: %s\n", filename)

		// Leer archivo SQL
		sqlPath := filepath.Join(migrationsDir, filename)
		sqlContent, err := os.ReadFile(sqlPath)
		if err != nil {
			return fmt.Errorf("error leyendo migración %s: %w", filename, err)
		}

		// Ejecutar SQL
		_, err = db.DB.Exec(context.Background(), string(sqlContent))
		if err != nil {
			return fmt.Errorf("error ejecutando migración %s: %w", filename, err)
		}

		// Registrar migración ejecutada
		_, err = db.DB.Exec(context.Background(),
			"INSERT INTO schema_migrations (filename) VALUES ($1)", filename)
		if err != nil {
			return fmt.Errorf("error registrando migración %s: %w", filename, err)
		}

		fmt.Printf("✅ Migración aplicada: %s\n", filename)
		migrationsApplied++
	}

	if migrationsApplied == 0 {
		fmt.Println("✅ No hay migraciones pendientes")
	} else {
		fmt.Printf("✅ %d migración(es) aplicada(s) exitosamente\n", migrationsApplied)
	}

	return nil
}

