package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/gofiber/fiber/v2"
)

// GeocodingResponse representa la respuesta de Nominatim
type GeocodingResponse struct {
	PlaceID     int    `json:"place_id"`
	DisplayName string `json:"display_name"`
	Lat         string `json:"lat"`
	Lon         string `json:"lon"`
	Type        string `json:"type"`
}

// SearchAddress busca direcciones usando Nominatim
func SearchAddress(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Query parameter 'q' is required"})
	}

	// Construir URL para Nominatim
	baseURL := "https://nominatim.openstreetmap.org/search"
	params := url.Values{}
	params.Add("format", "json")
	params.Add("q", query)
	params.Add("countrycodes", "PE")
	params.Add("limit", "5")

	// Hacer la petición a Nominatim
	resp, err := http.Get(fmt.Sprintf("%s?%s", baseURL, params.Encode()))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al buscar dirección"})
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return c.Status(500).JSON(fiber.Map{"error": "Error en el servicio de geocoding"})
	}

	// Decodificar la respuesta
	var results []GeocodingResponse
	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al procesar respuesta"})
	}

	return c.JSON(results)
}

// ReverseGeocodingResponse representa la respuesta de Nominatim para reverse geocoding
type ReverseGeocodingResponse struct {
	PlaceID     int    `json:"place_id"`
	DisplayName string `json:"display_name"`
	Lat         string `json:"lat"`
	Lon         string `json:"lon"`
	Type        string `json:"type"`
}

// ReverseAddress busca la dirección usando coordenadas
func ReverseAddress(c *fiber.Ctx) error {
	lat := c.Query("lat")
	lon := c.Query("lon")
	if lat == "" || lon == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Los parámetros 'lat' y 'lon' son requeridos"})
	}

	// Construir URL para Nominatim reverse geocoding
	baseURL := "https://nominatim.openstreetmap.org/reverse"
	params := url.Values{}
	params.Add("format", "jsonv2")
	params.Add("lat", lat)
	params.Add("lon", lon)
	params.Add("countrycodes", "PE")

	// Hacer la petición a Nominatim
	resp, err := http.Get(fmt.Sprintf("%s?%s", baseURL, params.Encode()))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al buscar dirección"})
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return c.Status(500).JSON(fiber.Map{"error": "Error en el servicio de geocoding"})
	}

	// Decodificar la respuesta
	var result ReverseGeocodingResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al procesar respuesta"})
	}

	return c.JSON(result)
}
