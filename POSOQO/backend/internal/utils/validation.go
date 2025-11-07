package utils

import (
	"crypto/rand"
	"math/big"
	"regexp"
	"strings"
	"unicode"
)

// Valida formato de email
func IsValidEmail(email string) bool {
	email = strings.TrimSpace(email)
	re := regexp.MustCompile(`^[a-zA-Z0-9._%%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

// Valida contraseña: mínimo 8 caracteres
func IsValidPassword(password string) bool {
	return len(password) >= 8
}

// Valida contraseña fuerte: min 8, mayúscula, minúscula, número, símbolo
func IsStrongPassword(password string) bool {
	var hasMinLen, hasUpper, hasLower, hasNumber, hasSymbol bool
	runeCount := 0
	for _, c := range password {
		runeCount++
		switch {
		case unicode.IsUpper(c):
			hasUpper = true
		case unicode.IsLower(c):
			hasLower = true
		case unicode.IsNumber(c):
			hasNumber = true
		case unicode.IsPunct(c) || unicode.IsSymbol(c):
			hasSymbol = true
		}
	}
	hasMinLen = runeCount >= 8
	return hasMinLen && hasUpper && hasLower && hasNumber && hasSymbol
}

// Valida string: solo letras y espacios, longitud min y max
func IsValidName(name string, min, max int) bool {
	name = strings.TrimSpace(name)
	if len(name) < min || len(name) > max {
		return false
	}
	re := regexp.MustCompile(`^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$`)
	return re.MatchString(name)
}

// Valida longitud de string
func IsValidString(s string, min, max int) bool {
	s = strings.TrimSpace(s)
	return len(s) >= min && len(s) <= max
}

// Valida número en rango
func IsValidNumber(n, min, max int) bool {
	return n >= min && n <= max
}

// Valida formato de URL
func IsValidURL(url string) bool {
	re := regexp.MustCompile(`^(https?://)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*/?$`)
	return re.MatchString(url)
}

// Valida UUID v4
func IsValidUUID(uuid string) bool {
	re := regexp.MustCompile(`^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$`)
	return re.MatchString(uuid)
}

// Valida número de celular peruano
// Acepta formatos: 987654321, +51 987654321, 51 987654321, 0051 987654321
func IsValidPeruvianPhone(phone string) bool {
	if phone == "" {
		return false
	}

	// Limpiar el número: remover espacios, guiones, paréntesis
	cleaned := strings.ReplaceAll(phone, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")

	// Extraer solo dígitos
	digitsOnly := ""
	for _, char := range cleaned {
		if char >= '0' && char <= '9' {
			digitsOnly += string(char)
		} else if char == '+' {
			// Permitir + al inicio
			if len(digitsOnly) == 0 {
				continue
			}
		}
	}

	// Validar patrones de celular peruano
	// 1. Número directo: 9 dígitos, empieza con 9
	if len(digitsOnly) == 9 {
		return digitsOnly[0] == '9'
	}

	// 2. Con código país: +51 o 51 seguido de 9 dígitos
	if len(digitsOnly) == 11 {
		if digitsOnly[:2] == "51" {
			numberPart := digitsOnly[2:]
			return len(numberPart) == 9 && numberPart[0] == '9'
		}
	}

	// 3. Con código país completo: 0051 seguido de 9 dígitos
	if len(digitsOnly) == 13 {
		if digitsOnly[:4] == "0051" {
			numberPart := digitsOnly[4:]
			return len(numberPart) == 9 && numberPart[0] == '9'
		}
	}

	return false
}

// Genera una contraseña aleatoria segura de longitud n
func GenerateRandomPassword(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_"
	b := make([]byte, n)
	for i := range b {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		b[i] = letters[num.Int64()]
	}
	return string(b)
}
