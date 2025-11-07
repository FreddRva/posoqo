package handlers

import (
	"context"
	"runtime"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/db"
)

// HealthCheckResponse representa la respuesta del health check
type HealthCheckResponse struct {
	Status    string                 `json:"status"`
	Message   string                 `json:"message"`
	Timestamp time.Time              `json:"timestamp"`
	Version   string                 `json:"version"`
	Checks    map[string]interface{} `json:"checks"`
}

// HealthCheck verifica el estado del servidor y sus dependencias
func HealthCheck(c *fiber.Ctx) error {
	health := HealthCheckResponse{
		Status:    "ok",
		Message:   "POSOQO Backend funcionando correctamente",
		Timestamp: time.Now(),
		Version:   "1.0.0",
		Checks:    make(map[string]interface{}),
	}

	allChecksPassed := true

	// Check 1: Base de datos
	dbCheck := checkDatabase()
	health.Checks["database"] = dbCheck
	if dbCheck["status"] != "ok" {
		allChecksPassed = false
		health.Status = "degraded"
		health.Message = "Algunos servicios no están disponibles"
	}

	// Check 2: Memoria
	memCheck := checkMemory()
	health.Checks["memory"] = memCheck
	if memCheck["status"] != "ok" {
		allChecksPassed = false
		health.Status = "degraded"
		health.Message = "Algunos servicios no están disponibles"
	}

	// Check 3: Goroutines
	goroutineCheck := checkGoroutines()
	health.Checks["goroutines"] = goroutineCheck
	if goroutineCheck["status"] != "ok" {
		allChecksPassed = false
		health.Status = "degraded"
		health.Message = "Algunos servicios no están disponibles"
	}

	// Si todos los checks pasaron, mantener status "ok"
	if allChecksPassed {
		health.Status = "ok"
		health.Message = "POSOQO Backend funcionando correctamente"
	}

	// Si la base de datos falla, retornar 503
	if dbCheck["status"] != "ok" {
		return c.Status(503).JSON(health)
	}

	// Si otros checks fallan pero DB está OK, retornar 200 con status "degraded"
	return c.JSON(health)
}

// checkDatabase verifica la conexión a la base de datos
func checkDatabase() map[string]interface{} {
	// Verificar que la conexión DB esté inicializada
	if db.DB == nil {
		return map[string]interface{}{
			"status":  "error",
			"message": "Conexión a base de datos no inicializada",
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	start := time.Now()
	err := db.DB.Ping(ctx)
	duration := time.Since(start)

	if err != nil {
		return map[string]interface{}{
			"status":  "error",
			"message": "No se pudo conectar a la base de datos",
			"error":   err.Error(),
		}
	}

	// Verificar que se pueda hacer una consulta simple
	var result string
	err = db.DB.QueryRow(ctx, "SELECT 'OK' as status").Scan(&result)
	if err != nil {
		return map[string]interface{}{
			"status":  "error",
			"message": "Error ejecutando consulta de prueba",
			"error":   err.Error(),
		}
	}

	return map[string]interface{}{
		"status":       "ok",
		"message":      "Conexión a base de datos exitosa",
		"latency":      duration.Milliseconds(),
		"latency_unit": "ms",
	}
}

// checkMemory verifica el uso de memoria
func checkMemory() map[string]interface{} {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Obtener memoria en MB
	allocMB := float64(m.Alloc) / 1024 / 1024
	totalAllocMB := float64(m.TotalAlloc) / 1024 / 1024
	sysMB := float64(m.Sys) / 1024 / 1024
	numGC := m.NumGC

	// Considerar memoria OK si no excede 512MB (ajustable según necesidades)
	memoryLimitMB := 512.0
	status := "ok"
	message := "Memoria dentro de límites normales"

	if sysMB > memoryLimitMB {
		status = "warning"
		message = "Uso de memoria elevado"
	}

	return map[string]interface{}{
		"status":         status,
		"message":        message,
		"allocated_mb":   allocMB,
		"total_alloc_mb": totalAllocMB,
		"system_mb":      sysMB,
		"gc_cycles":      numGC,
	}
}

// checkGoroutines verifica el número de goroutines
func checkGoroutines() map[string]interface{} {
	numGoroutines := runtime.NumGoroutine()

	// Considerar normal hasta 1000 goroutines (ajustable)
	maxGoroutines := 1000
	status := "ok"
	message := "Número de goroutines normal"

	if numGoroutines > maxGoroutines {
		status = "warning"
		message = "Número elevado de goroutines"
	}

	return map[string]interface{}{
		"status":    status,
		"message":   message,
		"count":     numGoroutines,
		"max_limit": maxGoroutines,
	}
}
