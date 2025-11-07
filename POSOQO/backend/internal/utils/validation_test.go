package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsValidEmail(t *testing.T) {
	tests := []struct {
		name     string
		email    string
		expected bool
	}{
		{"Email válido", "test@example.com", true},
		{"Email válido con subdominio", "test@mail.example.com", true},
		{"Email inválido sin @", "testexample.com", false},
		{"Email inválido sin dominio", "test@", false},
		{"Email vacío", "", false},
		{"Email con espacios", "test @example.com", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, IsValidEmail(tt.email))
		})
	}
}

func TestIsValidPassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		expected bool
	}{
		{"Password válido (8 caracteres)", "password123", true},
		{"Password válido (más de 8)", "P@ssw0rd!", true},
		{"Password válido (exactamente 8)", "password", true},
		{"Password muy corto (7 caracteres)", "short12", false},
		{"Password muy corto (3 caracteres)", "abc", false},
		{"Password vacío", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, IsValidPassword(tt.password))
		})
	}
}

func TestIsStrongPassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		expected bool
	}{
		{"Password fuerte válido", "P@ssw0rd!", true},
		{"Password sin símbolo", "Password123", false},
		{"Password sin mayúscula", "p@ssw0rd!", false},
		{"Password sin minúscula", "P@SSW0RD!", false},
		{"Password sin número", "P@ssword!", false},
		{"Password muy corto", "P@ss0rd", false},
		{"Password vacío", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, IsStrongPassword(tt.password))
		})
	}
}

func TestIsValidName(t *testing.T) {
	tests := []struct {
		name     string
		value    string
		min      int
		max      int
		expected bool
	}{
		{"Nombre válido", "John Doe", 2, 50, true},
		{"Nombre muy corto", "J", 2, 50, false},
		{"Nombre muy largo", string(make([]byte, 51)), 2, 50, false},
		{"Nombre con números", "John123", 2, 50, false},
		{"Nombre vacío", "", 2, 50, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, IsValidName(tt.value, tt.min, tt.max))
		})
	}
}

func TestSanitizeForLog(t *testing.T) {
	tests := []struct {
		name          string
		input         string
		expected      string
		shouldBeEqual bool // Para casos especiales como string vacío
	}{
		{"Email", "user@example.com", "u***@example.com", false},
		{"Token largo", "abcdefghijklmnopqrstuvwxyz1234567890", "abcd***7890", false},
		{"String corto", "secret", "***", false},
		{"String vacío", "", "", true}, // String vacío devuelve string vacío
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeForLog(tt.input)
			if tt.shouldBeEqual {
				assert.Equal(t, tt.input, result)
			} else {
				// Verificar que el resultado no contiene información sensible completa
				assert.NotEqual(t, tt.input, result)
				if tt.expected != "" {
					assert.Equal(t, tt.expected, result)
				}
			}
		})
	}
}
