package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

// TestLoginValidation valida que el endpoint de login rechace datos inválidos
func TestLoginValidation(t *testing.T) {
	app := fiber.New()
	app.Post("/login", LoginUser)

	tests := []struct {
		name           string
		body           map[string]string
		expectedStatus int
	}{
		{
			name:           "Email vacío",
			body:           map[string]string{"email": "", "password": "password123"},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Password vacío",
			body:           map[string]string{"email": "test@example.com", "password": ""},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Email inválido",
			body:           map[string]string{"email": "invalid-email", "password": "password123"},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			resp, _ := app.Test(req)

			assert.Equal(t, tt.expectedStatus, resp.StatusCode)
		})
	}
}

// TestRegisterValidation valida que el endpoint de registro rechace datos inválidos
func TestRegisterValidation(t *testing.T) {
	app := fiber.New()
	app.Post("/register", RegisterUser)

	tests := []struct {
		name           string
		body           map[string]interface{}
		expectedStatus int
	}{
		{
			name: "Nombre muy corto",
			body: map[string]interface{}{
				"name":     "A",
				"email":    "test@example.com",
				"password": "password123",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Email inválido",
			body: map[string]interface{}{
				"name":     "Test User",
				"email":    "invalid-email",
				"password": "password123",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Password muy corto",
			body: map[string]interface{}{
				"name":     "Test User",
				"email":    "test@example.com",
				"password": "short",
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			resp, _ := app.Test(req)

			assert.Equal(t, tt.expectedStatus, resp.StatusCode)
		})
	}
}
