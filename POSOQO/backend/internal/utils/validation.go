package utils

import (
	"crypto/rand"
	"math/big"
	"net"
	"regexp"
	"strings"
	"unicode"
)

// Valida formato de email con validación más estricta
func IsValidEmail(email string) bool {
	email = strings.TrimSpace(email)
	if email == "" {
		return false
	}

	// Validación básica de formato
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return false
	}

	// Validaciones adicionales
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false
	}

	localPart := parts[0]
	domain := parts[1]

	// Validar parte local (antes del @)
	if len(localPart) == 0 || len(localPart) > 64 {
		return false
	}

	// Validar dominio
	if len(domain) == 0 || len(domain) > 255 {
		return false
	}

	// Rechazar emails temporales comunes
	tempEmailDomains := []string{
		"10minutemail.com",
		"guerrillamail.com",
		"mailinator.com",
		"tempmail.com",
		"throwaway.email",
		"yopmail.com",
		"maildrop.cc",
		"getnada.com",
	}
	domainLower := strings.ToLower(domain)
	for _, tempDomain := range tempEmailDomains {
		if strings.Contains(domainLower, tempDomain) {
			return false
		}
	}

	return true
}

// Verifica que el dominio del email tenga registros MX (servidores de email)
// Esto verifica que el dominio pueda recibir emails
// Retorna true si el dominio tiene registros MX válidos, false si no
func VerifyEmailDomain(email string) (bool, error) {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false, nil
	}

	domain := parts[1]

	// Dominios comunes que sabemos que son válidos (para evitar consultas DNS innecesarias)
	knownValidDomains := []string{
		"gmail.com", "googlemail.com",
		"yahoo.com", "yahoo.es", "ymail.com",
		"hotmail.com", "outlook.com", "live.com", "msn.com",
		"icloud.com", "me.com", "mac.com",
		"protonmail.com", "proton.me",
		"yandex.com", "mail.com", "aol.com",
	}
	domainLower := strings.ToLower(domain)
	for _, validDomain := range knownValidDomains {
		if domainLower == validDomain {
			return true, nil
		}
	}

	// Intentar resolver registros MX del dominio
	// Los registros MX indican qué servidores pueden recibir emails para este dominio
	mxRecords, err := net.LookupMX(domain)
	if err != nil {
		// Si no se pueden resolver los registros MX, intentar verificar si el dominio existe
		// Algunos dominios pequeños pueden no tener registros MX pero sí registros A/AAAA
		_, lookupErr := net.LookupHost(domain)
		if lookupErr != nil {
			// El dominio no existe en absoluto
			return false, err
		}
		// El dominio existe pero no tiene registros MX
		// Por seguridad, rechazamos dominios sin MX ya que no pueden recibir emails confiablemente
		return false, nil
	}

	// Si hay al menos un registro MX válido, el dominio puede recibir emails
	if len(mxRecords) > 0 {
		// Verificar que al menos uno tenga un host válido
		for _, mx := range mxRecords {
			if mx.Host != "" && mx.Host != "." {
				// Limpiar el host (quitar punto final si existe)
				host := strings.TrimSuffix(mx.Host, ".")
				if host != "" {
					return true, nil
				}
			}
		}
	}

	// No se encontraron registros MX válidos
	return false, nil
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
