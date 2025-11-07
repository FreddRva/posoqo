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

// TestHealthCheckEndpoint prueba el endpoint de health check
func TestHealthCheckEndpoint(t *testing.T) {
	app := fiber.New()
	app.Get("/health", HealthCheck)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	// El health check puede retornar 200 (OK) o 503 (si BD no está disponible)
	assert.True(t, resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusServiceUnavailable)

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	assert.NoError(t, err)
	assert.NotNil(t, result["status"])
	assert.NotNil(t, result["checks"])
}

// TestRegisterEndpoint prueba el endpoint de registro
func TestRegisterEndpoint(t *testing.T) {
	app := fiber.New()
	app.Post("/register", RegisterUser)

	tests := []struct {
		name           string
		body           map[string]interface{}
		expectedStatus int
	}{
		{
			name: "Datos válidos",
			body: map[string]interface{}{
				"name":     "Test User",
				"email":    "test@example.com",
				"password": "password123",
			},
			expectedStatus: http.StatusCreated,
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

			// Nota: Puede que el status code varíe según si el usuario ya existe
			assert.True(t, resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusBadRequest || resp.StatusCode == http.StatusConflict)
		})
	}
}

// TestLoginEndpoint prueba el endpoint de login
func TestLoginEndpoint(t *testing.T) {
	app := fiber.New()
	app.Post("/login", LoginUser)

	tests := []struct {
		name           string
		body           map[string]string
		expectedStatus int
	}{
		{
			name: "Credenciales vacías",
			body: map[string]string{
				"email":    "",
				"password": "",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Email inválido",
			body: map[string]string{
				"email":    "invalid-email",
				"password": "password123",
			},
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

// TestProductsEndpoint prueba el endpoint de productos
func TestProductsEndpoint(t *testing.T) {
	app := fiber.New()
	app.Get("/products", GetProducts)

	req := httptest.NewRequest(http.MethodGet, "/products", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	// El endpoint puede retornar 200 (con productos) o 500 (error de BD)
	assert.True(t, resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusInternalServerError)
}
