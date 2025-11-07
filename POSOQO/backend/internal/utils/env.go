package utils

import (
	"fmt"
	"os"
	"strings"
)

// ValidateRequiredEnv valida que las variables de entorno requeridas estén configuradas
func ValidateRequiredEnv(vars []string) error {
	var missing []string
	for _, v := range vars {
		if os.Getenv(v) == "" {
			missing = append(missing, v)
		}
	}

	if len(missing) > 0 {
		return fmt.Errorf("variables de entorno faltantes: %s", strings.Join(missing, ", "))
	}

	return nil
}

// GetEnvWithDefault obtiene una variable de entorno o retorna un valor por defecto
func GetEnvWithDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// GetEnvRequired obtiene una variable de entorno requerida, retorna error si no existe
func GetEnvRequired(key string) (string, error) {
	value := os.Getenv(key)
	if value == "" {
		return "", fmt.Errorf("variable de entorno requerida no configurada: %s", key)
	}
	return value, nil
}

// IsProduction retorna true si estamos en producción
func IsProduction() bool {
	return os.Getenv("NODE_ENV") == "production"
}

// IsDevelopment retorna true si estamos en desarrollo
func IsDevelopment() bool {
	return !IsProduction()
}

// ValidateEnvSecrets valida que los secrets no sean valores por defecto en producción
func ValidateEnvSecrets() error {
	if !IsProduction() {
		return nil // En desarrollo, permitir valores por defecto
	}

	secrets := map[string]string{
		"JWT_ACCESS_SECRET":  "your-super-secret-access-key-change-in-production",
		"JWT_REFRESH_SECRET": "your-super-secret-refresh-key-change-in-production",
	}

	var invalid []string
	for key, defaultValue := range secrets {
		if os.Getenv(key) == defaultValue {
			invalid = append(invalid, key)
		}
	}

	if len(invalid) > 0 {
		return fmt.Errorf("los siguientes secrets no pueden usar valores por defecto en producción: %s",
			strings.Join(invalid, ", "))
	}

	return nil
}
