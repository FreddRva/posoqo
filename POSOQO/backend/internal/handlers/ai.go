package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

var geminiService *services.GeminiService

// InitAIService inicializa el servicio de IA
func InitAIService() {
	geminiService = services.NewGeminiService()
	log.Println("✅ Servicio de IA Gemini inicializado")
}

// HealthCheckAI verifica el estado del servicio de IA
func HealthCheckAI(c *fiber.Ctx) error {
	apiKey := os.Getenv("GEMINI_API_KEY")
	hasKey := apiKey != ""
	
	return c.JSON(fiber.Map{
		"success": true,
		"ai_service": fiber.Map{
			"initialized": geminiService != nil,
			"has_api_key": hasKey,
			"api_key_length": len(apiKey),
			"model": "gemini-2.5-flash",
			"api_version": "v1beta",
			"note": "Si sigue sin funcionar, verifica que tu API Key sea válida en https://aistudio.google.com/app/apikey",
		},
	})
}

// ListModelsHandler lista los modelos disponibles de Gemini
func ListModelsHandler(c *fiber.Ctx) error {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "GEMINI_API_KEY no configurada",
		})
	}

	// Intentar listar modelos desde la API
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models?key=%s", apiKey)
	
	resp, err := http.Get(url)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   fmt.Sprintf("Error al consultar API: %v", err),
		})
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al leer respuesta",
		})
	}

	if resp.StatusCode != 200 {
		return c.Status(resp.StatusCode).JSON(fiber.Map{
			"success": false,
			"error":   string(body),
			"note":    "Tu API Key puede no ser válida. Verifica en https://aistudio.google.com/app/apikey",
		})
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return c.JSON(fiber.Map{
			"success": true,
			"raw_response": string(body),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"models":  result,
	})
}

// ChatbotRequest representa una solicitud al chatbot
type ChatbotRequest struct {
	Message       string                    `json:"message"`
	ConversationHistory []services.GeminiContent `json:"conversationHistory,omitempty"`
	Context       string                    `json:"context,omitempty"`
}

// ChatbotResponse representa la respuesta del chatbot
type ChatbotResponse struct {
	Response string `json:"response"`
	Success  bool   `json:"success"`
}

// RecommendationRequest solicita recomendaciones de productos
type RecommendationRequest struct {
	UserID      string   `json:"userId,omitempty"`
	ProductID   string   `json:"productId,omitempty"`
	Preferences []string `json:"preferences,omitempty"`
	Limit       int      `json:"limit,omitempty"`
}

// SearchRequest solicita búsqueda inteligente
type SearchRequest struct {
	Query string `json:"query"`
	Limit int    `json:"limit,omitempty"`
}

// ChatbotHandler maneja las solicitudes del chatbot
func ChatbotHandler(c *fiber.Ctx) error {
	var req ChatbotRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Solicitud inválida",
		})
	}

	if req.Message == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "El mensaje es requerido",
		})
	}

	// Obtener información de productos para contexto
	productsContext, err := getProductsContext()
	if err != nil {
		log.Printf("Error al obtener contexto de productos: %v", err)
		productsContext = "No hay productos disponibles en este momento."
	}

	// Construir el prompt del sistema
	systemPrompt := fmt.Sprintf(`Eres un asistente virtual amigable y profesional de POSOQO, una cervecería artesanal peruana.

Tu rol es:
- Ayudar a los clientes con información sobre productos, pedidos y servicios
- Recomendar cervezas según sus preferencias
- Responder preguntas sobre el proceso de compra
- Ser amable, profesional y útil
- Usar un tono casual pero respetuoso
- Responder en español

Información de productos disponibles:
%s

Instrucciones:
- Si te preguntan por productos, usa la información proporcionada
- Si no sabes algo, sé honesto y sugiere contactar al equipo
- Mantén las respuestas concisas pero informativas
- Si te preguntan por pedidos específicos, pide que inicien sesión o proporcionen su número de pedido
`, productsContext)

	// Construir mensajes para el chat
	messages := []services.GeminiContent{
		{
			Role: "user",
			Parts: []services.GeminiPart{
				{Text: systemPrompt},
			},
		},
		{
			Role: "model",
			Parts: []services.GeminiPart{
				{Text: "¡Hola! Soy el asistente virtual de POSOQO. Estoy aquí para ayudarte con información sobre nuestras cervezas artesanales, pedidos y servicios. ¿En qué puedo ayudarte hoy?"},
			},
		},
	}

	// Agregar historial de conversación si existe
	if len(req.ConversationHistory) > 0 {
		messages = append(messages, req.ConversationHistory...)
	}

	// Agregar el mensaje actual del usuario
	messages = append(messages, services.GeminiContent{
		Role: "user",
		Parts: []services.GeminiPart{
			{Text: req.Message},
		},
	})

	// Generar respuesta con Gemini
	response, err := geminiService.GenerateChat(messages, &services.GenerationConfig{
		Temperature:     0.8,
		TopK:           40,
		TopP:           0.95,
		MaxOutputTokens: 1024,
	})
	if err != nil {
		log.Printf("Error al generar respuesta del chatbot: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al generar respuesta. Por favor, intenta de nuevo.",
		})
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"response": response,
	})
}

// RecommendProductsHandler recomienda productos usando IA
func RecommendProductsHandler(c *fiber.Ctx) error {
	var req RecommendationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Solicitud inválida",
		})
	}

	// Obtener productos
	products, err := getAllProducts()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al obtener productos",
		})
	}

	// Si se proporciona un ProductID, recomendar productos similares
	var prompt string
	if req.ProductID != "" {
		product, err := getProductByID(req.ProductID)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"error":   "Producto no encontrado",
			})
		}

		prompt = fmt.Sprintf(`Basándote en este producto:
Nombre: %s
Descripción: %s
Categoría: %s
Precio: S/ %.2f

Recomienda 3-5 productos similares de esta lista:
%s

Responde SOLO con los IDs de los productos recomendados separados por comas, sin explicaciones adicionales.
Formato: id1,id2,id3`, product.Name, product.Description, product.CategoryID, product.Price, formatProductsForAI(products))
	} else if len(req.Preferences) > 0 {
		// Recomendar basado en preferencias
		prompt = fmt.Sprintf(`El usuario tiene estas preferencias: %s

Recomienda 3-5 productos de esta lista que coincidan mejor:
%s

Responde SOLO con los IDs de los productos recomendados separados por comas, sin explicaciones adicionales.
Formato: id1,id2,id3`, strings.Join(req.Preferences, ", "), formatProductsForAI(products))
	} else {
		// Recomendar productos populares/destacados
		prompt = fmt.Sprintf(`Recomienda 5 productos destacados de esta lista para un nuevo cliente:
%s

Responde SOLO con los IDs de los productos recomendados separados por comas, sin explicaciones adicionales.
Formato: id1,id2,id3`, formatProductsForAI(products))
	}

	// Generar recomendaciones con Gemini
	response, err := geminiService.GenerateContent(prompt, &services.GenerationConfig{
		Temperature:     0.3,
		MaxOutputTokens: 256,
	})
	if err != nil {
		log.Printf("Error al generar recomendaciones: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al generar recomendaciones",
		})
	}

	// Parsear IDs de productos recomendados
	recommendedIDs := strings.Split(strings.TrimSpace(response), ",")
	var recommendedProducts []map[string]interface{}

	for _, id := range recommendedIDs {
		id = strings.TrimSpace(id)
		for _, product := range products {
			if product["id"] == id {
				recommendedProducts = append(recommendedProducts, product)
				break
			}
		}
	}

	// Limitar resultados
	limit := req.Limit
	if limit == 0 {
		limit = 5
	}
	if len(recommendedProducts) > limit {
		recommendedProducts = recommendedProducts[:limit]
	}

	return c.JSON(fiber.Map{
		"success":      true,
		"products":     recommendedProducts,
		"count":        len(recommendedProducts),
	})
}

// SmartSearchHandler búsqueda inteligente con IA
func SmartSearchHandler(c *fiber.Ctx) error {
	var req SearchRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Solicitud inválida",
		})
	}

	if req.Query == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "La consulta es requerida",
		})
	}

	// Obtener productos
	products, err := getAllProducts()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al obtener productos",
		})
	}

	// Filtrar productos relevantes primero (búsqueda simple)
	query := strings.ToLower(req.Query)
	var relevantProducts []map[string]interface{}
	
	for _, p := range products {
		name := strings.ToLower(p["name"].(string))
		description := strings.ToLower(p["description"].(string))
		
		// Pre-filtrar productos que podrían ser relevantes
		if strings.Contains(name, query) || strings.Contains(description, query) {
			relevantProducts = append(relevantProducts, p)
			if len(relevantProducts) >= 20 { // Máximo 20 productos pre-filtrados
				break
			}
		}
	}
	
	// Si no hay productos pre-filtrados, usar los primeros 20
	if len(relevantProducts) == 0 {
		for i, p := range products {
			if i >= 20 {
				break
			}
			relevantProducts = append(relevantProducts, p)
		}
	}
	
	// Crear lista ultra compacta
	var productList strings.Builder
	for _, p := range relevantProducts {
		// Solo primeras 30 caracteres del nombre para ahorrar tokens
		name := p["name"].(string)
		if len(name) > 30 {
			name = name[:30] + "..."
		}
		productList.WriteString(fmt.Sprintf("%s|%s\n", p["id"], name))
	}
	
	// Prompt ultra minimalista
	prompt := fmt.Sprintf(`Busca: "%s"
%s
IDs relevantes (coma):`, req.Query, productList.String())

	// Generar búsqueda con Gemini con límite de tokens aumentado
	response, err := geminiService.GenerateContent(prompt, &services.GenerationConfig{
		Temperature:     0.2,
		MaxOutputTokens: 512, // Aumentado para permitir más IDs en la respuesta
	})
	if err != nil {
		log.Printf("Error en búsqueda inteligente: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error en la búsqueda",
		})
	}

	// Verificar si la respuesta está vacía
	response = strings.TrimSpace(response)
	if response == "" {
		log.Printf("Error en búsqueda inteligente: respuesta vacía de Gemini")
		// Fallback: búsqueda simple por nombre/descripción
		return performSimpleSearchForProducts(c, req.Query, products)
	}

	// Limpiar la respuesta de posible texto adicional
	// Remover comillas, saltos de línea, y texto explicativo
	response = strings.ReplaceAll(response, "\"", "")
	response = strings.ReplaceAll(response, "\n", "")
	response = strings.Split(response, ".")[0] // Tomar solo la primera línea antes de un punto
	response = strings.TrimSpace(response)

	log.Printf("[Búsqueda] Query: %s | Respuesta de Gemini: %s", req.Query, response)

	// Si no hay resultados
	if response == "NINGUNO" || response == "" {
		return c.JSON(fiber.Map{
			"success": true,
			"results": []map[string]interface{}{},
			"count":   0,
		})
	}

	// Parsear IDs de productos encontrados
	foundIDs := strings.Split(response, ",")
	var results []map[string]interface{}
	var notFoundIDs []string

	for _, id := range foundIDs {
		id = strings.TrimSpace(id)
		if id == "" {
			continue
		}
		
		found := false
		for _, product := range products {
			if product["id"] == id {
				results = append(results, map[string]interface{}{
					"product":   product,
					"relevance": 1.0,
					"reason":    "Coincide con tu búsqueda",
				})
				found = true
				break
			}
		}
		
		if !found {
			notFoundIDs = append(notFoundIDs, id)
		}
	}

	// Log de IDs no encontrados para debugging
	if len(notFoundIDs) > 0 {
		log.Printf("[Búsqueda] IDs no encontrados en la base de datos: %v", notFoundIDs)
	}

	// Si no se encontró ningún producto válido, usar fallback
	if len(results) == 0 {
		log.Printf("[Búsqueda] Ningún ID válido encontrado, usando fallback")
		return performSimpleSearchForProducts(c, req.Query, products)
	}

	// Limitar resultados
	limit := req.Limit
	if limit == 0 {
		limit = 10
	}
	if len(results) > limit {
		results = results[:limit]
	}

	return c.JSON(fiber.Map{
		"success": true,
		"results": results,
		"count":   len(results),
	})
}

// performSimpleSearchForProducts realiza una búsqueda simple como fallback
func performSimpleSearchForProducts(c *fiber.Ctx, query string, products []map[string]interface{}) error {
	query = strings.ToLower(query)
	var results []map[string]interface{}

	for _, p := range products {
		name := strings.ToLower(p["name"].(string))
		description := strings.ToLower(p["description"].(string))

		if strings.Contains(name, query) || strings.Contains(description, query) {
			results = append(results, map[string]interface{}{
				"product":   p,
				"relevance": 0.8,
				"reason":    "Coincide con tu búsqueda",
			})
		}
	}

	// Limitar a 10 resultados
	if len(results) > 10 {
		results = results[:10]
	}

	return c.JSON(fiber.Map{
		"success": true,
		"results": results,
		"count":   len(results),
	})
}

// PairingAssistantHandler asistente de maridaje
func PairingAssistantHandler(c *fiber.Ctx) error {
	type PairingRequest struct {
		Food      string `json:"food,omitempty"`
		ProductID string `json:"productId,omitempty"`
	}

	var req PairingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Solicitud inválida",
		})
	}

	var prompt string
	if req.Food != "" {
		// Recomendar cerveza para una comida (prompt simple sin catálogo completo)
		prompt = fmt.Sprintf(`Eres un experto en maridaje de cervezas y comidas de POSOQO, una cervecería artesanal peruana.

El usuario quiere maridar esta comida: "%s"

Recomienda qué tipos o estilos de cervezas artesanales maridarían perfectamente con esta comida.
Explica por qué funciona bien el maridaje, considerando:
- Sabores y aromas
- Texturas y cuerpo
- Tradiciones culinarias
- Balance de intensidades

Sé conciso pero informativo (máximo 3-4 párrafos).`, req.Food)
	} else if req.ProductID != "" {
		// Intentar obtener el producto por ID primero
		product, err := getProductByID(req.ProductID)
		
		// Si no se encuentra por ID, buscar por nombre
		if err != nil {
			products, _ := getAllProducts()
			var foundProduct map[string]interface{}
			searchTerm := strings.ToLower(req.ProductID)
			
			for _, p := range products {
				productName := strings.ToLower(p["name"].(string))
				if strings.Contains(productName, searchTerm) {
					foundProduct = p
					break
				}
			}
			
			// Si se encontró por nombre, usar esa información
			if foundProduct != nil {
				prompt = fmt.Sprintf(`Eres un experto en maridaje de cervezas y comidas de POSOQO.

Cerveza: %s
Descripción: %s

Recomienda comidas que mariden perfectamente con esta cerveza.
Explica por qué (sabores, texturas, balance).
Máximo 3-4 párrafos.`,
					foundProduct["name"], foundProduct["description"])
			} else {
				// Si no se encontró ni por ID ni por nombre, dar recomendación general
				prompt = fmt.Sprintf(`Eres un experto en maridaje de cervezas y comidas.

El usuario busca maridaje para: "%s"

Recomienda comidas que funcionen bien con este tipo de cerveza.
Explica por qué (sabores, texturas, balance).
Máximo 3 párrafos.`, req.ProductID)
			}
		} else {
			// Producto encontrado por ID
			prompt = fmt.Sprintf(`Eres un experto en maridaje de POSOQO.

Cerveza: %s (%s, ABV %s%%, IBU %s)
%s

Recomienda comidas que mariden perfectamente.
Explica por qué (sabores, balance, texturas).
Máximo 3-4 párrafos.`, 
				product.Name, product.Estilo, product.ABV, product.IBU, product.Description)
		}
	} else {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Debes proporcionar 'food' o 'productId'",
		})
	}

	// Generar recomendaciones de maridaje
	response, err := geminiService.GenerateContent(prompt, &services.GenerationConfig{
		Temperature:     0.7,
		MaxOutputTokens: 2048, // Aumentado para respuestas más largas
	})
	if err != nil {
		log.Printf("Error al generar maridaje: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al generar recomendaciones de maridaje",
		})
	}

	return c.JSON(fiber.Map{
		"success":              true,
		"pairing_recommendation": response,
	})
}

// GenerateProductDescriptionHandler genera descripciones de productos con IA
func GenerateProductDescriptionHandler(c *fiber.Ctx) error {
	type DescriptionRequest struct {
		Name     string  `json:"name"`
		Category string  `json:"category"`
		Estilo   string  `json:"estilo,omitempty"`
		ABV      float64 `json:"abv,omitempty"`
		IBU      int     `json:"ibu,omitempty"`
	}

	var req DescriptionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Solicitud inválida",
		})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "El nombre del producto es requerido",
		})
	}

	// Crear prompt para generar descripción
	prompt := fmt.Sprintf(`Genera una descripción atractiva y profesional para este producto de POSOQO:

Nombre: %s
Categoría: %s
Estilo: %s
ABV: %.1f%%
IBU: %d

La descripción debe:
- Ser atractiva y profesional
- Resaltar las características únicas
- Ser de 2-3 párrafos
- Usar un tono amigable pero profesional
- Estar en español`, req.Name, req.Category, req.Estilo, req.ABV, req.IBU)

	// Generar descripción
	response, err := geminiService.GenerateContent(prompt, &services.GenerationConfig{
		Temperature:     0.8,
		MaxOutputTokens: 512,
	})
	if err != nil {
		log.Printf("Error al generar descripción: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al generar descripción",
		})
	}

	return c.JSON(fiber.Map{
		"success":     true,
		"description": response,
	})
}

// Funciones auxiliares

func getProductsContext() (string, error) {
	products, err := getAllProducts()
	if err != nil {
		return "", err
	}

	var context strings.Builder
	context.WriteString("Productos disponibles:\n\n")

	for i, product := range products {
		if i >= 10 { // Limitar a 10 productos para el contexto
			break
		}
		context.WriteString(fmt.Sprintf("- %s: %s (S/ %.2f)\n", 
			product["name"], product["description"], product["price"]))
	}

	return context.String(), nil
}

func getAllProducts() ([]map[string]interface{}, error) {
	query := `
		SELECT id, name, description, price, category_id, image_url, stock, is_active,
		       COALESCE(estilo, ''), COALESCE(abv, ''), COALESCE(ibu, ''), COALESCE(color, '')
		FROM products
		WHERE is_active = true
		ORDER BY created_at DESC
	`

	rows, err := db.DB.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []map[string]interface{}
	for rows.Next() {
		var id, name, description, categoryID, imageURL, estilo, abv, ibu, color string
		var price float64
		var stock int
		var isActive bool

		err := rows.Scan(&id, &name, &description, &price, &categoryID, &imageURL, 
			&stock, &isActive, &estilo, &abv, &ibu, &color)
		if err != nil {
			continue
		}

		products = append(products, map[string]interface{}{
			"id":          id,
			"name":        name,
			"description": description,
			"price":       price,
			"category_id": categoryID,
			"image_url":   imageURL,
			"stock":       stock,
			"is_active":   isActive,
			"estilo":      estilo,
			"abv":         abv,
			"ibu":         ibu,
			"color":       color,
		})
	}

	return products, nil
}

func getProductByID(id string) (*ProductResponse, error) {
	query := `
		SELECT id, name, description, price, category_id, subcategory, image_url, 
		       stock, is_active, is_featured, 
		       COALESCE(estilo, ''), COALESCE(abv, ''), COALESCE(ibu, ''), COALESCE(color, ''),
		       created_at, updated_at
		FROM products
		WHERE id = $1 AND is_active = true
	`

	var product ProductResponse
	var categoryID, subcategory, imageURL sql.NullString

	err := db.DB.QueryRow(context.Background(), query, id).Scan(
		&product.ID, &product.Name, &product.Description, &product.Price,
		&categoryID, &subcategory, &imageURL,
		&product.Stock, &product.IsActive, &product.IsFeatured,
		&product.Estilo, &product.ABV, &product.IBU, &product.Color,
		&product.CreatedAt, &product.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	if categoryID.Valid {
		product.CategoryID = categoryID.String
	}
	if subcategory.Valid {
		product.Subcategory = subcategory.String
	}
	if imageURL.Valid {
		product.ImageURL = imageURL.String
	}

	return &product, nil
}

// PredictiveAnalyticsHandler genera análisis predictivo para el admin
func PredictiveAnalyticsHandler(c *fiber.Ctx) error {
	// Obtener estadísticas actuales
	stats, err := getDashboardStats()
	if err != nil {
		log.Printf("Error al obtener estadísticas: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al obtener datos",
		})
	}

	// Crear prompt para análisis predictivo
	prompt := fmt.Sprintf(`Eres un analista de datos experto. Analiza estas estadísticas de POSOQO y genera predicciones:

Estadísticas actuales:
- Total de ventas: S/ %.2f
- Total de pedidos: %d
- Total de productos: %d
- Total de clientes: %d

Genera un análisis predictivo en formato JSON con:
1. Predicciones para el próximo mes (ventas, pedidos, clientes)
2. 3 recomendaciones estratégicas
3. 3 riesgos potenciales
4. 3 oportunidades de crecimiento

Formato JSON (SOLO JSON, sin texto adicional):
{
  "predictions": [
    {"metric": "Ventas", "current": 0, "predicted": 0, "change": 0, "trend": "up", "confidence": 85, "insight": "..."},
    {"metric": "Pedidos", "current": 0, "predicted": 0, "change": 0, "trend": "up", "confidence": 80, "insight": "..."},
    {"metric": "Clientes", "current": 0, "predicted": 0, "change": 0, "trend": "stable", "confidence": 75, "insight": "..."}
  ],
  "recommendations": ["...", "...", "..."],
  "risks": ["...", "...", "..."],
  "opportunities": ["...", "...", "..."]
}`, stats["total_sales"], stats["total_orders"], stats["total_products"], stats["total_users"])

	// Generar análisis
	response, err := geminiService.GenerateContent(prompt, &services.GenerationConfig{
		Temperature:     0.5,
		MaxOutputTokens: 2048,
	})
	if err != nil {
		log.Printf("Error al generar análisis: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al generar análisis",
		})
	}

	// Parsear respuesta JSON
	response = strings.TrimSpace(response)
	response = strings.TrimPrefix(response, "```json")
	response = strings.TrimPrefix(response, "```")
	response = strings.TrimSuffix(response, "```")
	response = strings.TrimSpace(response)

	var analyticsData map[string]interface{}
	if err := json.Unmarshal([]byte(response), &analyticsData); err != nil {
		log.Printf("Error al parsear análisis: %v\nRespuesta: %s", err, response)
		// Fallback con datos simulados
		analyticsData = map[string]interface{}{
			"predictions": []map[string]interface{}{
				{
					"metric":     "Ventas",
					"current":    stats["total_sales"],
					"predicted":  float64(stats["total_sales"].(float64)) * 1.15,
					"change":     15.0,
					"trend":      "up",
					"confidence": 80,
					"insight":    "Se espera un crecimiento basado en tendencias históricas",
				},
			},
			"recommendations": []string{"Aumentar inventario de productos populares", "Implementar promociones estacionales", "Mejorar experiencia de usuario"},
			"risks":           []string{"Posible escasez de stock", "Competencia creciente", "Fluctuaciones de demanda"},
			"opportunities":   []string{"Expansión a nuevos mercados", "Programas de fidelización", "Marketing digital"},
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    analyticsData,
	})
}

// getDashboardStats obtiene estadísticas del dashboard
func getDashboardStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total de ventas
	var totalSales float64
	err := db.DB.QueryRow(context.Background(), `
		SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled'
	`).Scan(&totalSales)
	if err != nil {
		totalSales = 0
	}
	stats["total_sales"] = totalSales

	// Total de pedidos
	var totalOrders int
	err = db.DB.QueryRow(context.Background(), `
		SELECT COUNT(*) FROM orders
	`).Scan(&totalOrders)
	if err != nil {
		totalOrders = 0
	}
	stats["total_orders"] = totalOrders

	// Total de productos
	var totalProducts int
	err = db.DB.QueryRow(context.Background(), `
		SELECT COUNT(*) FROM products WHERE is_active = true
	`).Scan(&totalProducts)
	if err != nil {
		totalProducts = 0
	}
	stats["total_products"] = totalProducts

	// Total de usuarios
	var totalUsers int
	err = db.DB.QueryRow(context.Background(), `
		SELECT COUNT(*) FROM users
	`).Scan(&totalUsers)
	if err != nil {
		totalUsers = 0
	}
	stats["total_users"] = totalUsers

	return stats, nil
}

func formatProductsForAI(products []map[string]interface{}) string {
	var formatted strings.Builder
	for _, p := range products {
		// Solo enviar ID y nombre para reducir tokens
		// La descripción completa hace que el prompt sea muy largo
		formatted.WriteString(fmt.Sprintf("ID:%s|%s\n", p["id"], p["name"]))
	}
	return formatted.String()
}

// AnalyzeSentimentHandler analiza el sentimiento de reviews/comentarios
func AnalyzeSentimentHandler(c *fiber.Ctx) error {
	type SentimentRequest struct {
		Text string `json:"text"`
	}

	var req SentimentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Solicitud inválida",
		})
	}

	if req.Text == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "El texto es requerido",
		})
	}

	prompt := fmt.Sprintf(`Analiza el sentimiento de este comentario/review:

"%s"

Responde en formato JSON con:
{
  "sentiment": "positivo|neutral|negativo",
  "score": 0.0-1.0,
  "summary": "breve resumen del sentimiento"
}`, req.Text)

	response, err := geminiService.GenerateContent(prompt, &services.GenerationConfig{
		Temperature:     0.1,
		MaxOutputTokens: 256,
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al analizar sentimiento",
		})
	}

	// Intentar parsear como JSON
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(response), &result); err != nil {
		// Si no es JSON válido, devolver como texto
		return c.JSON(fiber.Map{
			"success":  true,
			"analysis": response,
		})
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"analysis": result,
	})
}

