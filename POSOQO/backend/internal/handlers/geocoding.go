package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GeocodingRequest representa la petición de geocoding
type GeocodingRequest struct {
	Query string `json:"query"`
	Type  string `json:"type"` // "search" o "reverse"
	Lat   string `json:"lat,omitempty"`
	Lng   string `json:"lng,omitempty"`
}

// GeocodingResponse representa la respuesta de geocoding
type GeocodingResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// SearchLocation busca ubicaciones usando Nominatim
func SearchLocation(c *fiber.Ctx) error {
	var req GeocodingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error parsing request body",
		})
	}

	if req.Query == "" {
		return c.Status(400).JSON(GeocodingResponse{
			Success: false,
			Error:   "Query parameter is required",
		})
	}

	// Construir URL de Nominatim
	url := fmt.Sprintf("https://nominatim.openstreetmap.org/search?q=%s&format=json&limit=10&countrycodes=pe&addressdetails=1&extratags=1", req.Query)

	// Crear cliente HTTP con timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Crear request
	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return c.Status(500).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error creating request",
		})
	}

	// Agregar headers necesarios
	httpReq.Header.Set("User-Agent", "POSOQO/1.0")
	httpReq.Header.Set("Accept", "application/json")

	// Hacer request
	resp, err := client.Do(httpReq)
	if err != nil {
		return c.Status(500).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error making request to Nominatim",
		})
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(500).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error reading response",
		})
	}

	// Parsear JSON
	var data interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return c.Status(500).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error parsing JSON response",
		})
	}

	return c.JSON(GeocodingResponse{
		Success: true,
		Data:    data,
	})
}

// ReverseGeocoding hace geocoding inverso usando Nominatim
func ReverseGeocoding(c *fiber.Ctx) error {
	var req GeocodingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error parsing request body",
		})
	}

	if req.Lat == "" || req.Lng == "" {
		return c.Status(400).JSON(GeocodingResponse{
			Success: false,
			Error:   "Lat and Lng parameters are required",
		})
	}

	// Construir URL de Nominatim para reverse geocoding
	url := fmt.Sprintf("https://nominatim.openstreetmap.org/reverse?lat=%s&lon=%s&format=json&addressdetails=1", req.Lat, req.Lng)

	// Crear cliente HTTP con timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Crear request
	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return c.Status(500).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error creating request",
		})
	}

	// Agregar headers necesarios
	httpReq.Header.Set("User-Agent", "POSOQO/1.0")
	httpReq.Header.Set("Accept", "application/json")

	// Hacer request
	resp, err := client.Do(httpReq)
	if err != nil {
		return c.Status(500).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error making request to Nominatim",
		})
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(500).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error reading response",
		})
	}

	// Parsear JSON
	var data interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return c.Status(500).JSON(GeocodingResponse{
			Success: false,
			Error:   "Error parsing JSON response",
		})
	}

	return c.JSON(GeocodingResponse{
		Success: true,
		Data:    data,
	})
}