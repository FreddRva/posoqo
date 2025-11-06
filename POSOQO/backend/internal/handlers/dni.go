package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/gofiber/fiber/v2"
)

// DNIResponse representa la respuesta de la API de DNI
type DNIResponse struct {
	Success bool `json:"success"`
	Data    struct {
		Numero             string `json:"numero"`
		Nombres            string `json:"nombres"`
		ApellidoPaterno    string `json:"apellido_paterno"`
		ApellidoMaterno    string `json:"apellido_materno"`
		NombresCompletos   string `json:"nombres_completos"`
		CodigoVerificacion string `json:"codigo_verificacion"`
	} `json:"data"`
}

// DNIDataResponse es la respuesta normalizada que enviamos al frontend
type DNIDataResponse struct {
	DNI                string `json:"dni"`
	Nombres            string `json:"nombres"`
	ApellidoPaterno    string `json:"apellido_paterno"`
	ApellidoMaterno    string `json:"apellido_materno"`
	NombreCompleto     string `json:"nombre_completo"`
	CodigoVerificacion string `json:"codigo_verificacion"`
}

// ConsultarDNI consulta los datos de un DNI desde APIperu.dev
// @Summary Consultar datos de DNI
// @Description Consulta los datos de un DNI peruano desde APIperu.dev
// @Tags dni
// @Accept json
// @Produce json
// @Param dni path string true "Número de DNI (8 dígitos)"
// @Success 200 {object} DNIDataResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/dni/{dni} [get]
func ConsultarDNI(c *fiber.Ctx) error {
	dni := c.Params("dni")
	log.Printf("[DNI] Consultando DNI: %s", dni)

	// Validar que el DNI tenga exactamente 8 dígitos
	matched, _ := regexp.MatchString(`^\d{8}$`, dni)
	if !matched {
		log.Printf("[DNI] DNI inválido: %s", dni)
		return c.Status(400).JSON(fiber.Map{
			"error": "El DNI debe contener exactamente 8 dígitos numéricos",
		})
	}

	// Obtener el token de APIperu.dev desde variables de entorno
	apiToken := os.Getenv("APIPERU_TOKEN")
	if apiToken == "" {
		// Si no hay token, usar token de prueba (limitado)
		apiToken = "demo"
		log.Printf("[DNI] Usando token demo (APIPERU_TOKEN no configurado)")
	} else {
		log.Printf("[DNI] Token configurado correctamente")
	}

	// Construir la URL de la API
	apiURL := fmt.Sprintf("https://apiperu.dev/api/dni/%s", dni)
	log.Printf("[DNI] Consultando API: %s", apiURL)

	// Crear el request HTTP
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al crear la petición",
		})
	}

	// Agregar headers requeridos
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiToken))
	req.Header.Set("Content-Type", "application/json")

	// Realizar la petición
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[DNI] Error al hacer petición: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al consultar la API de DNI. Por favor intenta más tarde.",
		})
	}
	defer resp.Body.Close()

	log.Printf("[DNI] Respuesta de API: Status %d", resp.StatusCode)

	// Leer la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("[DNI] Error al leer respuesta: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al leer la respuesta",
		})
	}

	// Si la respuesta no es exitosa, retornar error
	if resp.StatusCode != http.StatusOK {
		log.Printf("[DNI] Error en respuesta: Status %d, Body: %s", resp.StatusCode, string(body))
		if resp.StatusCode == http.StatusNotFound {
			return c.Status(404).JSON(fiber.Map{
				"error": "DNI no encontrado en los registros",
			})
		}
		if resp.StatusCode == http.StatusTooManyRequests {
			return c.Status(429).JSON(fiber.Map{
				"error": "Límite de consultas excedido. Por favor intenta más tarde.",
			})
		}
		if resp.StatusCode == http.StatusUnauthorized {
			return c.Status(401).JSON(fiber.Map{
				"error": "Token de API inválido. Por favor contacta al administrador.",
			})
		}
		return c.Status(resp.StatusCode).JSON(fiber.Map{
			"error": fmt.Sprintf("Error al consultar el DNI (Status: %d)", resp.StatusCode),
		})
	}

	// Parsear la respuesta JSON - usar parseo genérico para manejar diferentes tipos
	var apiResponse DNIResponse
	var rawResponse map[string]interface{}
	
	// Parsear como mapa genérico para manejar tipos flexibles (números/strings)
	if jsonErr := json.Unmarshal(body, &rawResponse); jsonErr != nil {
		log.Printf("[DNI] Error al parsear JSON: %v", jsonErr)
		log.Printf("[DNI] Respuesta recibida: %s", string(body))
		return c.Status(500).JSON(fiber.Map{
			"error": fmt.Sprintf("Error al procesar la respuesta JSON: %v", jsonErr),
		})
	}
	
	// Función auxiliar para convertir codigo_verificacion (puede ser número o string)
	convertCodigoVerificacion := func(val interface{}) string {
		if val == nil {
			return ""
		}
		switch v := val.(type) {
		case string:
			return v
		case float64:
			// JSON numbers se parsean como float64
			return fmt.Sprintf("%.0f", v)
		case int:
			return fmt.Sprintf("%d", v)
		case int64:
			return fmt.Sprintf("%d", v)
		default:
			return fmt.Sprintf("%v", v)
		}
	}
	
	// Extraer datos de diferentes estructuras posibles
	log.Printf("[DNI] Estructura recibida: %+v", rawResponse)
	
	// Intentar extraer datos del campo "data"
	if data, ok := rawResponse["data"].(map[string]interface{}); ok {
		apiResponse.Success = true
		if numero, ok := data["numero"].(string); ok {
			apiResponse.Data.Numero = numero
		} else if numero, ok := data["numero"].(float64); ok {
			apiResponse.Data.Numero = fmt.Sprintf("%.0f", numero)
		}
		if nombres, ok := data["nombres"].(string); ok {
			apiResponse.Data.Nombres = nombres
		}
		if apellidoPaterno, ok := data["apellido_paterno"].(string); ok {
			apiResponse.Data.ApellidoPaterno = apellidoPaterno
		}
		if apellidoMaterno, ok := data["apellido_materno"].(string); ok {
			apiResponse.Data.ApellidoMaterno = apellidoMaterno
		}
		if nombresCompletos, ok := data["nombres_completos"].(string); ok {
			apiResponse.Data.NombresCompletos = nombresCompletos
		}
		// Manejar codigo_verificacion como número o string
		if codigoVerificacion, exists := data["codigo_verificacion"]; exists {
			apiResponse.Data.CodigoVerificacion = convertCodigoVerificacion(codigoVerificacion)
		}
		// Verificar si success está en el root
		if success, ok := rawResponse["success"].(bool); ok {
			apiResponse.Success = success
		}
	} else if success, ok := rawResponse["success"].(bool); ok && success {
		// Si no hay data pero hay success, intentar buscar datos en otros campos
		apiResponse.Success = true
		// Los datos podrían estar directamente en el root
		if numero, ok := rawResponse["numero"].(string); ok {
			apiResponse.Data.Numero = numero
		}
		if nombres, ok := rawResponse["nombres"].(string); ok {
			apiResponse.Data.Nombres = nombres
		}
		if apellidoPaterno, ok := rawResponse["apellido_paterno"].(string); ok {
			apiResponse.Data.ApellidoPaterno = apellidoPaterno
		}
		if apellidoMaterno, ok := rawResponse["apellido_materno"].(string); ok {
			apiResponse.Data.ApellidoMaterno = apellidoMaterno
		}
		if nombresCompletos, ok := rawResponse["nombres_completos"].(string); ok {
			apiResponse.Data.NombresCompletos = nombresCompletos
		}
		if codigoVerificacion, exists := rawResponse["codigo_verificacion"]; exists {
			apiResponse.Data.CodigoVerificacion = convertCodigoVerificacion(codigoVerificacion)
		}
	} else {
		// Intentar parsear como respuesta de error
		if errorMsg, ok := rawResponse["message"].(string); ok {
			return c.Status(500).JSON(fiber.Map{
				"error": fmt.Sprintf("Error de API: %s", errorMsg),
			})
		}
		if errorMsg, ok := rawResponse["error"].(string); ok {
			return c.Status(500).JSON(fiber.Map{
				"error": fmt.Sprintf("Error de API: %s", errorMsg),
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": fmt.Sprintf("Error al procesar la respuesta: formato desconocido. Respuesta: %s", string(body)),
		})
	}

	// Verificar si la consulta fue exitosa
	if !apiResponse.Success {
		return c.Status(404).JSON(fiber.Map{
			"error": "DNI no encontrado en los registros",
		})
	}

	// Validar que tengamos al menos el número de DNI
	if apiResponse.Data.Numero == "" {
		apiResponse.Data.Numero = dni // Usar el DNI consultado si no viene en la respuesta
	}

	// Normalizar y retornar los datos
	response := DNIDataResponse{
		DNI:                apiResponse.Data.Numero,
		Nombres:            apiResponse.Data.Nombres,
		ApellidoPaterno:    apiResponse.Data.ApellidoPaterno,
		ApellidoMaterno:    apiResponse.Data.ApellidoMaterno,
		NombreCompleto:     apiResponse.Data.NombresCompletos,
		CodigoVerificacion: apiResponse.Data.CodigoVerificacion,
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
	})
}
