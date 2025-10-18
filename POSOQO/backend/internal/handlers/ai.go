package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/FreddRva/posoqo/internal/db"
	"github.com/FreddRva/posoqo/internal/services"
	"github.com/gofiber/fiber/v2"
)

var geminiService *services.GeminiService

// InitAIService inicializa el servicio de IA
func InitAIService() {
	geminiService = services.NewGeminiService()
	log.Println("✅ Servicio de IA Gemini inicializado")
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

	// Crear prompt para búsqueda inteligente
	prompt := fmt.Sprintf(`El usuario busca: "%s"

Encuentra los productos más relevantes de esta lista:
%s

Responde SOLO con los IDs de los productos más relevantes separados por comas, ordenados por relevancia.
Formato: id1,id2,id3
Si no encuentras productos relevantes, responde "NINGUNO".`, req.Query, formatProductsForAI(products))

	// Generar búsqueda con Gemini
	response, err := geminiService.GenerateContent(prompt, &services.GenerationConfig{
		Temperature:     0.2,
		MaxOutputTokens: 256,
	})
	if err != nil {
		log.Printf("Error en búsqueda inteligente: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error en la búsqueda",
		})
	}

	// Si no hay resultados
	if strings.TrimSpace(response) == "NINGUNO" {
		return c.JSON(fiber.Map{
			"success":  true,
			"products": []map[string]interface{}{},
			"count":    0,
			"message":  "No se encontraron productos para tu búsqueda",
		})
	}

	// Parsear IDs de productos encontrados
	foundIDs := strings.Split(strings.TrimSpace(response), ",")
	var foundProducts []map[string]interface{}

	for _, id := range foundIDs {
		id = strings.TrimSpace(id)
		for _, product := range products {
			if product["id"] == id {
				foundProducts = append(foundProducts, product)
				break
			}
		}
	}

	// Limitar resultados
	limit := req.Limit
	if limit == 0 {
		limit = 10
	}
	if len(foundProducts) > limit {
		foundProducts = foundProducts[:limit]
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"products": foundProducts,
		"count":    len(foundProducts),
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
		// Recomendar cerveza para una comida
		products, _ := getAllProducts()
		prompt = fmt.Sprintf(`El usuario quiere maridar esta comida: "%s"

Productos disponibles:
%s

Recomienda las mejores cervezas para maridar con esta comida y explica por qué.
Incluye los IDs de los productos recomendados.`, req.Food, formatProductsForAI(products))
	} else if req.ProductID != "" {
		// Recomendar comidas para una cerveza
		product, err := getProductByID(req.ProductID)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"error":   "Producto no encontrado",
			})
		}

		prompt = fmt.Sprintf(`Esta es la cerveza:
Nombre: %s
Descripción: %s
Estilo: %s
ABV: %.1f%%
IBU: %d

Recomienda qué comidas maridarían perfectamente con esta cerveza y explica por qué.`, 
			product.Name, product.Description, product.Estilo, product.ABV, product.IBU)
	} else {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Debes proporcionar 'food' o 'productId'",
		})
	}

	// Generar recomendaciones de maridaje
	response, err := geminiService.GenerateContent(prompt, &services.GenerationConfig{
		Temperature:     0.7,
		MaxOutputTokens: 1024,
	})
	if err != nil {
		log.Printf("Error al generar maridaje: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error al generar recomendaciones de maridaje",
		})
	}

	return c.JSON(fiber.Map{
		"success":        true,
		"recommendation": response,
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
		       estilo, abv, ibu, color
		FROM products
		WHERE is_active = true
		ORDER BY created_at DESC
	`

	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []map[string]interface{}
	for rows.Next() {
		var id, name, description, categoryID, imageURL, estilo, color string
		var price, abv float64
		var stock, ibu int
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

func getProductByID(id string) (*Product, error) {
	query := `
		SELECT id, name, description, price, category_id, subcategory_id, image_url, 
		       stock, is_active, is_featured, estilo, abv, ibu, color, created_at, updated_at
		FROM products
		WHERE id = $1 AND is_active = true
	`

	var product Product
	var subcategoryID *string

	err := db.DB.QueryRow(query, id).Scan(
		&product.ID, &product.Name, &product.Description, &product.Price,
		&product.CategoryID, &subcategoryID, &product.ImageURL,
		&product.Stock, &product.IsActive, &product.IsFeatured,
		&product.Estilo, &product.ABV, &product.IBU, &product.Color,
		&product.CreatedAt, &product.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	if subcategoryID != nil {
		product.SubcategoryID = *subcategoryID
	}

	return &product, nil
}

func formatProductsForAI(products []map[string]interface{}) string {
	var formatted strings.Builder
	for _, p := range products {
		formatted.WriteString(fmt.Sprintf("ID: %s, Nombre: %s, Descripción: %s, Precio: S/ %.2f\n",
			p["id"], p["name"], p["description"], p["price"]))
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

