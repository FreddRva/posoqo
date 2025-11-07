package utils

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base32"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

const (
	// Configuración de seguridad
	MaxFailedAttempts     = 5  // Máximo de intentos fallidos
	LockoutDurationMinutes = 30 // Duración del bloqueo en minutos
	FailedAttemptWindow   = 15 // Ventana de tiempo para contar intentos (minutos)
	
	// CSRF
	CSRFTokenLength = 32
	CSRFTokenExpiry = 24 * time.Hour
)

// GenerateCSRFToken genera un token CSRF seguro
func GenerateCSRFToken() (string, error) {
	bytes := make([]byte, CSRFTokenLength)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// ConstantTimeCompare compara dos strings en tiempo constante para prevenir timing attacks
func ConstantTimeCompare(a, b string) bool {
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

// GenerateTOTPSecret genera un secreto para TOTP usando la librería otp
func GenerateTOTPSecret(email string) (string, error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "POSOQO",
		AccountName: email,
		Period:      30,
		Digits:      otp.DigitsSix,
		Algorithm:   otp.AlgorithmSHA1,
	})
	if err != nil {
		return "", err
	}
	return key.Secret(), nil
}

// ValidateTOTP valida un código TOTP usando la librería otp
func ValidateTOTP(secret, code string) bool {
	// Validar que el código tenga 6 dígitos
	if len(code) != 6 {
		return false
	}
	// Validar el código TOTP con la librería
	return totp.Validate(code, secret)
}

// GenerateBackupCodes genera códigos de respaldo para 2FA
func GenerateBackupCodes(count int) ([]string, error) {
	codes := make([]string, count)
	for i := 0; i < count; i++ {
		bytes := make([]byte, 4) // 8 caracteres hexadecimales
		if _, err := rand.Read(bytes); err != nil {
			return nil, err
		}
		codes[i] = fmt.Sprintf("%08s", hex.EncodeToString(bytes))
	}
	return codes, nil
}

// SanitizeInput limpia y sanitiza input de usuario
func SanitizeInput(input string) string {
	// Eliminar caracteres de control
	result := make([]rune, 0, len(input))
	for _, r := range input {
		if r >= 32 || r == '\n' || r == '\t' {
			result = append(result, r)
		}
	}
	
	return string(result)
}

// ValidateRateLimitKey genera una clave para rate limiting
func ValidateRateLimitKey(identifier string, endpoint string) string {
	return fmt.Sprintf("%s:%s", identifier, endpoint)
}

// ShouldLockAccount determina si una cuenta debe ser bloqueada
func ShouldLockAccount(failedAttempts int) bool {
	return failedAttempts >= MaxFailedAttempts
}

// GetLockoutDuration retorna la duración del bloqueo
func GetLockoutDuration() time.Duration {
	return time.Duration(LockoutDurationMinutes) * time.Minute
}

// GetFailedAttemptWindow retorna la ventana de tiempo para intentos fallidos
func GetFailedAttemptWindow() time.Duration {
	return time.Duration(FailedAttemptWindow) * time.Minute
}

// GenerateQRCodeURL genera la URL del QR code para 2FA usando la librería otp
func GenerateQRCodeURL(email, secret string) (string, error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "POSOQO",
		AccountName: email,
		Secret:      []byte(secret),
		Period:      30,
		Digits:      otp.DigitsSix,
		Algorithm:   otp.AlgorithmSHA1,
	})
	if err != nil {
		return "", err
	}
	
	// Retornar la URL del QR code
	return key.URL(), nil
}

// DecodeBase32Secret decodifica un secreto base32
func DecodeBase32Secret(secret string) ([]byte, error) {
	return base32.StdEncoding.DecodeString(secret)
}

