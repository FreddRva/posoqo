package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/microcosm-cc/bluemonday"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/utils"
)

type ReviewRequest struct {
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}

// Crear o actualizar reseña (solo si el usuario ya compró el producto)
func UpsertReview(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	productID := c.Params("product_id")

	fmt.Printf("[REVIEW] Usuario %d intentando reseñar producto %s\n", userID, productID)

	var req ReviewRequest
	if err := c.BodyParser(&req); err != nil {
		fmt.Printf("[REVIEW] Error parseando body: %v\n", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	
	fmt.Printf("[REVIEW] Rating: %d, Comment: %s\n", req.Rating, req.Comment)

	if !utils.IsValidNumber(req.Rating, 1, 5) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Rating inválido (1-5)"})
	}
	// Validar comentario solo si no está vacío (el comentario es opcional)
	if req.Comment != "" && !utils.IsValidString(req.Comment, 1, 500) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Comentario demasiado largo (máx 500 caracteres)"})
	}

	// Verificar que el usuario haya comprado Y recibido el producto
	// Solo permite reseñar productos cuando la orden esté en estado "entregado"
	// Esto asegura que el cliente realmente recibió el producto antes de reseñarlo
	var count int
	err := db.DB.QueryRow(context.Background(),
		`SELECT COUNT(*) FROM order_items oi
		 JOIN orders o ON oi.order_id = o.id
		 WHERE o.user_id = $1 AND oi.product_id = $2 
		 AND o.status = 'entregado'`, userID, productID).Scan(&count)
	
	fmt.Printf("[REVIEW] Ordenes encontradas con estado 'entregado': %d\n", count)
	
	if err != nil {
		fmt.Printf("[REVIEW] Error verificando orden: %v\n", err)
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"error": "Solo puedes reseñar productos que hayas comprado y recibido. Tu pedido debe estar en estado 'entregado' para poder reseñar."})
	}
	
	if count == 0 {
		fmt.Printf("[REVIEW] No se encontraron órdenes entregadas para este producto\n")
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"error": "Solo puedes reseñar productos que hayas comprado y recibido. Tu pedido debe estar en estado 'entregado' para poder reseñar."})
	}

	// Sanitizar comentario solo si no está vacío
	trimmedComment := strings.TrimSpace(req.Comment)
	var safeComment string
	if trimmedComment != "" {
		p := bluemonday.UGCPolicy()
		safeComment = p.Sanitize(trimmedComment)
	} else {
		safeComment = ""
	}

	fmt.Printf("[REVIEW] Guardando reseña - UserID: %d, ProductID: %s, Rating: %d, Comment: '%s'\n", userID, productID, req.Rating, safeComment)

	_, err = db.DB.Exec(context.Background(),
		`INSERT INTO reviews (user_id, product_id, rating, comment)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (user_id, product_id)
		 DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = CURRENT_TIMESTAMP`,
		userID, productID, req.Rating, safeComment)
	
	if err != nil {
		fmt.Printf("[REVIEW] ❌ Error guardando reseña: %v\n", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo guardar la reseña"})
	}
	
	fmt.Printf("[REVIEW] ✅ Reseña guardada exitosamente\n")
	
	// Verificar que la reseña se guardó correctamente
	var savedRating int
	var savedComment string
	var savedProductID string
	verifyErr := db.DB.QueryRow(context.Background(),
		"SELECT rating, COALESCE(comment, ''), product_id::text FROM reviews WHERE user_id = $1 AND product_id = $2",
		userID, productID).Scan(&savedRating, &savedComment, &savedProductID)
	
	if verifyErr != nil {
		fmt.Printf("[REVIEW] ⚠️ Error verificando reseña guardada: %v\n", verifyErr)
		
		// Intentar buscar todas las reseñas de este usuario para debug
		var totalUserReviews int
		countErr := db.DB.QueryRow(context.Background(),
			"SELECT COUNT(*) FROM reviews WHERE user_id = $1", userID).Scan(&totalUserReviews)
		if countErr == nil {
			fmt.Printf("[REVIEW] Total de reseñas del usuario %d: %d\n", userID, totalUserReviews)
		}
		
		// Intentar buscar todas las reseñas de este producto
		var totalProductReviews int
		prodErr := db.DB.QueryRow(context.Background(),
			"SELECT COUNT(*) FROM reviews WHERE product_id = $1", productID).Scan(&totalProductReviews)
		if prodErr == nil {
			fmt.Printf("[REVIEW] Total de reseñas del producto %s: %d\n", productID, totalProductReviews)
		} else {
			fmt.Printf("[REVIEW] Error contando reseñas del producto: %v\n", prodErr)
		}
	} else {
		fmt.Printf("[REVIEW] ✅ Verificación: Rating guardado: %d, Comment guardado: '%s', ProductID: %s\n", savedRating, savedComment, savedProductID)
		fmt.Printf("[REVIEW] ✅ ProductID recibido: %s, ProductID guardado: %s, Coinciden: %v\n", productID, savedProductID, productID == savedProductID)
	}
	
	return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "Reseña guardada"})
}

// Listar reseñas de un producto
func ListProductReviews(c *fiber.Ctx) error {
	productID := c.Params("product_id")
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	fmt.Printf("[REVIEW LIST] Listando reseñas para producto %s (página %d, límite %d)\n", productID, page, limit)

	// Verificar que el productID es un UUID válido y listar todas las reseñas para debug
	var allProductIDs []string
	allRows, _ := db.DB.Query(context.Background(), "SELECT DISTINCT product_id::text FROM reviews LIMIT 10")
	defer allRows.Close()
	for allRows.Next() {
		var pid string
		if err := allRows.Scan(&pid); err == nil {
			allProductIDs = append(allProductIDs, pid)
		}
	}
	fmt.Printf("[REVIEW LIST] ProductIDs de reseñas existentes (primeros 10): %v\n", allProductIDs)

	countQuery := `SELECT COUNT(*) FROM reviews WHERE product_id=$1::uuid`
	var total int
	if err := db.DB.QueryRow(context.Background(), countQuery, productID).Scan(&total); err != nil {
		fmt.Printf("[REVIEW LIST] Error contando reseñas (con cast UUID): %v\n", err)
		// Intentar con texto directo
		productIDTrimmed := strings.TrimSpace(productID)
		if err2 := db.DB.QueryRow(context.Background(), 
			`SELECT COUNT(*) FROM reviews WHERE product_id::text = $1`, productIDTrimmed).Scan(&total); err2 != nil {
			fmt.Printf("[REVIEW LIST] Error también con texto: %v\n", err2)
			return c.Status(500).JSON(fiber.Map{"error": "Error al contar reseñas"})
		}
	}
	
	fmt.Printf("[REVIEW LIST] Total de reseñas en BD para producto %s: %d\n", productID, total)
	
	offset := (page - 1) * limit
	listQuery := `SELECT r.rating, COALESCE(r.comment, '') as comment, r.created_at::text, u.name, r.product_id::text FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = $1::uuid ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`
	rows, err := db.DB.Query(context.Background(), listQuery, productID, limit, offset)
	if err != nil {
		fmt.Printf("[REVIEW LIST] Error consultando reseñas (con cast UUID): %v\n", err)
		// Intentar sin cast explícito pero con trim
		productIDTrimmed := strings.TrimSpace(productID)
		listQuerySimple := `SELECT r.rating, COALESCE(r.comment, '') as comment, r.created_at::text, u.name, r.product_id::text FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id::text = $1 ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`
		rows, err = db.DB.Query(context.Background(), listQuerySimple, productIDTrimmed, limit, offset)
		if err != nil {
			fmt.Printf("[REVIEW LIST] Error también con texto: %v\n", err)
			return c.Status(500).JSON(fiber.Map{"error": "Error al obtener reseñas"})
		}
	}
	defer rows.Close()

	reviews := []fiber.Map{}
	for rows.Next() {
		var rating int
		var comment, createdAt, userName, rowProductID string
		if err := rows.Scan(&rating, &comment, &createdAt, &userName, &rowProductID); err != nil {
			fmt.Printf("[REVIEW LIST] Error escaneando fila: %v\n", err)
			continue
		}
		fmt.Printf("[REVIEW LIST] Reseña encontrada: Rating=%d, Comment='%s', User=%s, ProductID=%s, CreatedAt=%s\n", rating, comment, userName, rowProductID, createdAt)
		reviews = append(reviews, fiber.Map{
			"rating":     rating,
			"comment":    comment,
			"created_at": createdAt,
			"user_name":  userName,
		})
	}
	
	fmt.Printf("[REVIEW LIST] Devolviendo %d reseñas (total en BD: %d)\n", len(reviews), total)
	
	return c.JSON(fiber.Map{
		"reviews": reviews,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + limit - 1) / limit,
		},
	})
}

// Verificar si el usuario puede reseñar un producto
func CanReviewProduct(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	productID := c.Params("product_id")

	var count int
	err := db.DB.QueryRow(context.Background(),
		`SELECT COUNT(*) FROM order_items oi
		 JOIN orders o ON oi.order_id = o.id
		 WHERE o.user_id = $1 AND oi.product_id = $2 
		 AND o.status = 'entregado'`, userID, productID).Scan(&count)

	canReview := err == nil && count > 0

	return c.JSON(fiber.Map{
		"can_review": canReview,
		"reason": func() string {
			if !canReview {
				return "Debes haber comprado y recibido este producto para poder reseñarlo"
			}
			return ""
		}(),
	})
}

// Listar reseñas del usuario autenticado
func ListMyReviews(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	rows, err := db.DB.Query(context.Background(),
		`SELECT r.rating, COALESCE(r.comment, '') as comment, r.created_at::text, p.name
		 FROM reviews r
		 JOIN products p ON r.product_id = p.id
		 WHERE r.user_id = $1
		 ORDER BY r.created_at DESC`, userID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener reseñas"})
	}
	defer rows.Close()

	reviews := []fiber.Map{}
	for rows.Next() {
		var rating int
		var comment, createdAt, productName string
		if err := rows.Scan(&rating, &comment, &createdAt, &productName); err != nil {
			continue
		}
		reviews = append(reviews, fiber.Map{
			"rating":       rating,
			"comment":      comment,
			"created_at":   createdAt,
			"product_name": productName,
		})
	}
	return c.JSON(reviews)
}
