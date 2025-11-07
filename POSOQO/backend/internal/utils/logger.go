package utils

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

// LogLevel representa el nivel de logging
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
)

var (
	currentLogLevel LogLevel
	isProduction    bool
)

func init() {
	env := os.Getenv("NODE_ENV")
	isProduction = env == "production"

	// En producción, solo mostrar WARN y ERROR
	// En desarrollo, mostrar todos los niveles
	logLevelStr := os.Getenv("LOG_LEVEL")
	switch strings.ToUpper(logLevelStr) {
	case "DEBUG":
		currentLogLevel = DEBUG
	case "INFO":
		currentLogLevel = INFO
	case "WARN":
		currentLogLevel = WARN
	case "ERROR":
		currentLogLevel = ERROR
	default:
		if isProduction {
			currentLogLevel = WARN
		} else {
			currentLogLevel = DEBUG
		}
	}
}

// LogDebug registra mensajes de debug (solo en desarrollo)
func LogDebug(format string, v ...interface{}) {
	if currentLogLevel <= DEBUG && !isProduction {
		log.Printf("[DEBUG] "+format, v...)
	}
}

// LogInfo registra mensajes informativos
func LogInfo(format string, v ...interface{}) {
	if currentLogLevel <= INFO {
		log.Printf("[INFO] "+format, v...)
	}
}

// LogWarn registra advertencias
func LogWarn(format string, v ...interface{}) {
	if currentLogLevel <= WARN {
		log.Printf("[WARN] "+format, v...)
	}
}

// LogError registra errores
func LogError(format string, v ...interface{}) {
	if currentLogLevel <= ERROR {
		log.Printf("[ERROR] "+format, v...)
	}
}

// LogSecurity registra eventos de seguridad
func LogSecurity(format string, v ...interface{}) {
	// Los eventos de seguridad siempre se registran
	log.Printf("[SECURITY] "+format, v...)
}

// LogRequest registra información de requests HTTP
func LogRequest(method, path string, statusCode int, duration time.Duration, ip string) {
	if currentLogLevel <= INFO {
		log.Printf("[REQUEST] %s %s | IP: %s | Status: %d | Duration: %v",
			method, path, ip, statusCode, duration)
	}
}

// LogDatabase registra operaciones de base de datos
func LogDatabase(operation string, err error) {
	if err != nil {
		LogError("Database %s failed: %v", operation, err)
	} else if currentLogLevel <= DEBUG {
		LogDebug("Database %s completed", operation)
	}
}

// SanitizeForLog sanitiza información sensible antes de loguear
func SanitizeForLog(input string) string {
	if len(input) == 0 {
		return ""
	}

	// Ocultar emails parcialmente: user@example.com -> u***@example.com
	if strings.Contains(input, "@") {
		parts := strings.Split(input, "@")
		if len(parts) == 2 {
			if len(parts[0]) > 1 {
				parts[0] = string(parts[0][0]) + "***"
			}
			return strings.Join(parts, "@")
		}
	}

	// Ocultar tokens/secretos: mostrar solo primeros y últimos caracteres
	if len(input) > 20 {
		return input[:4] + "***" + input[len(input)-4:]
	}

	// Si es corto, puede ser sensible, ocultar todo
	if len(input) < 10 {
		return "***"
	}

	return input[:3] + "***"
}

// LogWithContext registra con contexto adicional
func LogWithContext(level LogLevel, context map[string]interface{}, message string, v ...interface{}) {
	msg := fmt.Sprintf(message, v...)

	var contextStr strings.Builder
	for key, value := range context {
		contextStr.WriteString(fmt.Sprintf(" %s=%v", key, value))
	}

	fullMsg := msg
	if contextStr.Len() > 0 {
		fullMsg = msg + " |" + contextStr.String()
	}

	switch level {
	case DEBUG:
		LogDebug(fullMsg)
	case INFO:
		LogInfo(fullMsg)
	case WARN:
		LogWarn(fullMsg)
	case ERROR:
		LogError(fullMsg)
	}
}
