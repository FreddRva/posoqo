package handlers

import (
	"context"
	"database/sql"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/utils"
)

// RaffleSubscriptionRequest representa la solicitud de suscripción al sorteo
type RaffleSubscriptionRequest struct {
	Nombre         string `json:"nombre"`
	Email          string `json:"email"`
	Telefono       string `json:"telefono"`
	Edad           int    `json:"edad"`
	AceptaTerminos bool   `json:"aceptaTerminos"`
}

// RaffleSubscriptionResponse representa la respuesta de suscripción
type RaffleSubscriptionResponse struct {
	Success             bool   `json:"success"`
	Message             string `json:"message"`
	NumeroParticipacion int    `json:"numero_participacion"`
	MesSorteo           string `json:"mes_sorteo"`
}

// SubscribeToRaffle godoc
// @Summary Suscribirse al sorteo mensual
// @Description Permite a los usuarios suscribirse al sorteo mensual de cervezas gratis
// @Tags raffle
// @Accept json
// @Produce json
// @Param subscription body RaffleSubscriptionRequest true "Datos de suscripción"
// @Success 200 {object} RaffleSubscriptionResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/raffle/subscribe [post]
func SubscribeToRaffle(c *fiber.Ctx) error {
	var req RaffleSubscriptionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	// Sanitización de inputs
	req.Nombre = strings.TrimSpace(req.Nombre)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Telefono = strings.TrimSpace(req.Telefono)

	// Validaciones
	if req.Nombre == "" || req.Email == "" || req.Telefono == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Todos los campos son obligatorios",
		})
	}

	if !req.AceptaTerminos {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Debes aceptar los términos y condiciones",
		})
	}

	if !utils.IsValidEmail(req.Email) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Email inválido",
		})
	}

	if req.Edad < 18 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Debes ser mayor de 18 años para participar",
		})
	}

	if len(req.Nombre) < 2 || len(req.Nombre) > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "El nombre debe tener entre 2 y 100 caracteres",
		})
	}

	if !utils.IsValidPeruvianPhone(req.Telefono) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Número de teléfono inválido. Debe ser un número peruano válido (ej: 987654321 o +51 987654321)",
		})
	}

	// Obtener el mes actual en formato YYYY-MM
	now := time.Now()
	mesSorteo := now.Format("2006-01")

	// Verificar si ya existe una suscripción para este email en este mes
	var existingID string
	err := db.DB.QueryRow(
		context.Background(),
		"SELECT id FROM raffle_subscriptions WHERE email = $1 AND mes_sorteo = $2",
		req.Email, mesSorteo,
	).Scan(&existingID)

	if err == nil {
		// Ya existe una suscripción para este email en este mes
		var numeroParticipacion int
		err = db.DB.QueryRow(
			context.Background(),
			"SELECT numero_participacion FROM raffle_subscriptions WHERE id = $1",
			existingID,
		).Scan(&numeroParticipacion)

		if err == nil {
			return c.JSON(fiber.Map{
				"success":              true,
				"message":              "Ya estás suscrito al sorteo de este mes",
				"numero_participacion": numeroParticipacion,
				"mes_sorteo":           mesSorteo,
			})
		}
	}

	// Generar número de participación único (entre 100 y 99999)
	rand.Seed(time.Now().UnixNano())
	numeroParticipacion := rand.Intn(99900) + 100

	// Verificar que el número no esté en uso para este mes
	var count int
	for {
		err = db.DB.QueryRow(
			context.Background(),
			"SELECT COUNT(*) FROM raffle_subscriptions WHERE numero_participacion = $1 AND mes_sorteo = $2",
			numeroParticipacion, mesSorteo,
		).Scan(&count)

		if err != nil || count == 0 {
			break
		}
		// Si el número ya existe, generar uno nuevo
		numeroParticipacion = rand.Intn(99900) + 100
	}

	// Insertar la suscripción en la base de datos
	_, err = db.DB.Exec(
		context.Background(),
		`INSERT INTO raffle_subscriptions (nombre, email, telefono, edad, numero_participacion, mes_sorteo)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		req.Nombre, req.Email, req.Telefono, req.Edad, numeroParticipacion, mesSorteo,
	)

	if err != nil {
		log.Printf("[RAFFLE] Error insertando suscripción: %v", err)
		// Si es error de duplicado, retornar mensaje específico
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return c.Status(http.StatusConflict).JSON(fiber.Map{
				"success": false,
				"error":   "Ya estás suscrito al sorteo de este mes",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Error al procesar la suscripción. Por favor intenta más tarde.",
		})
	}

	// Log de la suscripción
	log.Printf("[RAFFLE] Nueva suscripción: %s | Email: %s | Número: %d | Mes: %s",
		req.Nombre, req.Email, numeroParticipacion, mesSorteo)

	return c.JSON(fiber.Map{
		"success":              true,
		"message":              "¡Suscripción exitosa! Ya estás participando en el sorteo.",
		"numero_participacion": numeroParticipacion,
		"mes_sorteo":           mesSorteo,
	})
}

// GetCurrentRaffleConfig obtiene la configuración del sorteo del mes actual (público)
func GetCurrentRaffleConfig(c *fiber.Ctx) error {
	now := time.Now()
	mesSorteo := now.Format("2006-01")

	var config struct {
		ID             string    `json:"id"`
		MesSorteo      string    `json:"mes_sorteo"`
		Titulo         string    `json:"titulo"`
		Descripcion    string    `json:"descripcion"`
		FechaSorteo    time.Time `json:"fecha_sorteo"`
		HoraSorteo     string    `json:"hora_sorteo"`
		IsActive       bool      `json:"is_active"`
		PremioPrimero  string    `json:"premio_primero"`
		PremioSegundo  string    `json:"premio_segundo"`
		PremioTercero  string    `json:"premio_tercero"`
		PremioConsuelo string    `json:"premio_consuelo"`
	}

	err := db.DB.QueryRow(
		context.Background(),
		`SELECT id, mes_sorteo, titulo, descripcion, fecha_sorteo, hora_sorteo, is_active,
		        premio_primero, premio_segundo, premio_tercero, premio_consuelo
		 FROM raffles_config WHERE mes_sorteo = $1`,
		mesSorteo,
	).Scan(&config.ID, &config.MesSorteo, &config.Titulo, &config.Descripcion, &config.FechaSorteo,
		&config.HoraSorteo, &config.IsActive, &config.PremioPrimero, &config.PremioSegundo,
		&config.PremioTercero, &config.PremioConsuelo)

	if err != nil {
		// Si no existe configuración, retornar valores por defecto
		return c.JSON(fiber.Map{
			"mes_sorteo":      mesSorteo,
			"titulo":          "Sorteo Mensual POSOQO",
			"descripcion":     "Participa en nuestro sorteo mensual de cervezas artesanales POSOQO.",
			"fecha_sorteo":    time.Date(now.Year(), now.Month()+1, 0, 20, 0, 0, 0, time.UTC),
			"hora_sorteo":     "20:00:00",
			"is_active":       true,
			"premio_primero":  "Caja de 12 Cervezas",
			"premio_segundo":  "Pack de 6 Cervezas",
			"premio_tercero":  "Pack de 3 Cervezas",
			"premio_consuelo": "1 Cerveza + Descuento",
		})
	}

	return c.JSON(config)
}

// RaffleConfigRequest representa la solicitud de configuración de sorteo
type RaffleConfigRequest struct {
	MesSorteo      string `json:"mes_sorteo"`
	Titulo         string `json:"titulo"`
	Descripcion    string `json:"descripcion"`
	FechaSorteo    string `json:"fecha_sorteo"`
	HoraSorteo     string `json:"hora_sorteo"`
	IsActive       bool   `json:"is_active"`
	PremioPrimero  string `json:"premio_primero"`
	PremioSegundo  string `json:"premio_segundo"`
	PremioTercero  string `json:"premio_tercero"`
	PremioConsuelo string `json:"premio_consuelo"`
}

// ListRaffleConfigs lista todas las configuraciones de sorteos (admin)
func ListRaffleConfigs(c *fiber.Ctx) error {
	rows, err := db.DB.Query(
		context.Background(),
		`SELECT id, mes_sorteo, titulo, descripcion, fecha_sorteo, hora_sorteo, is_active,
		        premio_primero, premio_segundo, premio_tercero, premio_consuelo, created_at, updated_at
		 FROM raffles_config ORDER BY mes_sorteo DESC`,
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al obtener configuraciones",
		})
	}
	defer rows.Close()

	configs := []fiber.Map{}
	for rows.Next() {
		var id, mesSorteo, titulo, descripcion, horaSorteo, premioPrimero, premioSegundo, premioTercero, premioConsuelo string
		var fechaSorteo time.Time
		var isActive bool
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&id, &mesSorteo, &titulo, &descripcion, &fechaSorteo, &horaSorteo, &isActive,
			&premioPrimero, &premioSegundo, &premioTercero, &premioConsuelo, &createdAt, &updatedAt); err != nil {
			continue
		}

		configs = append(configs, fiber.Map{
			"id":              id,
			"mes_sorteo":      mesSorteo,
			"titulo":          titulo,
			"descripcion":     descripcion,
			"fecha_sorteo":    fechaSorteo.Format("2006-01-02"),
			"hora_sorteo":     horaSorteo,
			"is_active":       isActive,
			"premio_primero":  premioPrimero,
			"premio_segundo":  premioSegundo,
			"premio_tercero":  premioTercero,
			"premio_consuelo": premioConsuelo,
			"created_at":      createdAt,
			"updated_at":      updatedAt,
		})
	}

	return c.JSON(fiber.Map{
		"data": configs,
	})
}

// CreateOrUpdateRaffleConfig crea o actualiza una configuración de sorteo (admin)
func CreateOrUpdateRaffleConfig(c *fiber.Ctx) error {
	var req RaffleConfigRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Datos inválidos",
		})
	}

	// Validaciones
	if req.MesSorteo == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "El mes del sorteo es obligatorio",
		})
	}

	if req.Titulo == "" {
		req.Titulo = "Sorteo Mensual POSOQO"
	}

	if req.FechaSorteo == "" {
		// Si no se proporciona fecha, usar último día del mes
		now := time.Now()
		lastDay := time.Date(now.Year(), now.Month()+1, 0, 0, 0, 0, 0, time.UTC)
		req.FechaSorteo = lastDay.Format("2006-01-02")
	}

	if req.HoraSorteo == "" {
		req.HoraSorteo = "20:00:00"
	}

	if req.PremioPrimero == "" {
		req.PremioPrimero = "Caja de 12 Cervezas"
	}
	if req.PremioSegundo == "" {
		req.PremioSegundo = "Pack de 6 Cervezas"
	}
	if req.PremioTercero == "" {
		req.PremioTercero = "Pack de 3 Cervezas"
	}
	if req.PremioConsuelo == "" {
		req.PremioConsuelo = "1 Cerveza + Descuento"
	}

	// Intentar actualizar primero
	result, err := db.DB.Exec(
		context.Background(),
		`UPDATE raffles_config 
		 SET titulo = $1, descripcion = $2, fecha_sorteo = $3, hora_sorteo = $4, is_active = $5,
		     premio_primero = $6, premio_segundo = $7, premio_tercero = $8, premio_consuelo = $9
		 WHERE mes_sorteo = $10`,
		req.Titulo, req.Descripcion, req.FechaSorteo, req.HoraSorteo, req.IsActive,
		req.PremioPrimero, req.PremioSegundo, req.PremioTercero, req.PremioConsuelo, req.MesSorteo,
	)

	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al actualizar configuración",
		})
	}

	// Si no se actualizó ninguna fila, crear nueva
	if result.RowsAffected() == 0 {
		_, err = db.DB.Exec(
			context.Background(),
			`INSERT INTO raffles_config (mes_sorteo, titulo, descripcion, fecha_sorteo, hora_sorteo, is_active,
			                             premio_primero, premio_segundo, premio_tercero, premio_consuelo)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			req.MesSorteo, req.Titulo, req.Descripcion, req.FechaSorteo, req.HoraSorteo, req.IsActive,
			req.PremioPrimero, req.PremioSegundo, req.PremioTercero, req.PremioConsuelo,
		)

		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error al crear configuración",
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Configuración guardada exitosamente",
	})
}

// ListRaffleParticipants lista los participantes de un sorteo (admin)
func ListRaffleParticipants(c *fiber.Ctx) error {
	mesSorteo := c.Query("mes_sorteo", "")
	if mesSorteo == "" {
		mesSorteo = time.Now().Format("2006-01")
	}

	// Log para debug
	log.Printf("[RAFFLE] Consultando participantes para mes: %s", mesSorteo)

	// Primero verificar qué meses existen en la base de datos
	var availableMonths []string
	monthRows, err := db.DB.Query(
		context.Background(),
		`SELECT DISTINCT mes_sorteo FROM raffle_subscriptions ORDER BY mes_sorteo DESC`,
	)
	if err == nil {
		defer monthRows.Close()
		for monthRows.Next() {
			var month string
			if err := monthRows.Scan(&month); err == nil {
				availableMonths = append(availableMonths, month)
			}
		}
	}
	log.Printf("[RAFFLE] Meses disponibles en BD: %v", availableMonths)

	// Primero verificar directamente qué hay en la BD para este mes
	var debugCount int
	db.DB.QueryRow(
		context.Background(),
		`SELECT COUNT(*) FROM raffle_subscriptions WHERE TRIM(mes_sorteo) = TRIM($1)`,
		mesSorteo,
	).Scan(&debugCount)
	log.Printf("[RAFFLE] Count con TRIM para %s: %d", mesSorteo, debugCount)

	// Obtener todos los registros para debug
	debugRows, _ := db.DB.Query(
		context.Background(),
		`SELECT id, mes_sorteo, nombre, email FROM raffle_subscriptions LIMIT 10`,
	)
	if debugRows != nil {
		log.Printf("[RAFFLE] Primeros 10 registros en BD:")
		for debugRows.Next() {
			var id, mesDB, nombre, email string
			if err := debugRows.Scan(&id, &mesDB, &nombre, &email); err == nil {
				log.Printf("[RAFFLE]   ID: %s, Mes: '%s' (len=%d), Nombre: %s", id, mesDB, len(mesDB), nombre)
			}
		}
		debugRows.Close()
	}

	rows, err := db.DB.Query(
		context.Background(),
		`SELECT id, nombre, email, telefono, edad, numero_participacion, is_winner, prize_level, created_at, mes_sorteo
		 FROM raffle_subscriptions WHERE TRIM(mes_sorteo) = TRIM($1) ORDER BY created_at DESC`,
		mesSorteo,
	)
	if err != nil {
		log.Printf("[RAFFLE] Error en query: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al obtener participantes",
		})
	}
	defer rows.Close()

	participants := []fiber.Map{}
	rowCount := 0
	for rows.Next() {
		rowCount++
		var id, nombre, email, telefono, mesSorteoDB string
		var edad, numeroParticipacion int
		var isWinner bool
		var prizeLevel sql.NullString
		var createdAt time.Time

		if err := rows.Scan(&id, &nombre, &email, &telefono, &edad, &numeroParticipacion, &isWinner, &prizeLevel, &createdAt, &mesSorteoDB); err != nil {
			log.Printf("[RAFFLE] Error escaneando fila %d: %v", rowCount, err)
			continue
		}

		log.Printf("[RAFFLE] Participante encontrado: %s - %s (mes: '%s')", nombre, email, mesSorteoDB)

		// Convertir sql.NullString a string normal
		prizeLevelStr := ""
		if prizeLevel.Valid {
			prizeLevelStr = prizeLevel.String
		}

		participants = append(participants, fiber.Map{
			"id":                   id,
			"nombre":               nombre,
			"email":                email,
			"telefono":             telefono,
			"edad":                 edad,
			"numero_participacion": numeroParticipacion,
			"is_winner":            isWinner,
			"prize_level":          prizeLevelStr,
			"created_at":           createdAt,
		})
	}
	log.Printf("[RAFFLE] Total filas procesadas: %d, participantes agregados: %d", rowCount, len(participants))

	log.Printf("[RAFFLE] Participantes encontrados: %d para mes %s", len(participants), mesSorteo)

	return c.JSON(fiber.Map{
		"mes_sorteo":        mesSorteo,
		"participants":      participants,
		"total":             len(participants),
		"available_months":  availableMonths,
	})
}

// MarkWinner marca un participante como ganador (admin)
func MarkWinner(c *fiber.Ctx) error {
	participantID := c.Params("id")
	prizeLevel := c.Query("prize_level", "")

	if prizeLevel == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "El nivel del premio es obligatorio (first, second, third, consolation)",
		})
	}

	validLevels := map[string]bool{
		"first":       true,
		"second":      true,
		"third":       true,
		"consolation": true,
	}

	if !validLevels[prizeLevel] {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Nivel de premio inválido. Debe ser: first, second, third, o consolation",
		})
	}

	_, err := db.DB.Exec(
		context.Background(),
		`UPDATE raffle_subscriptions SET is_winner = TRUE, prize_level = $1 WHERE id = $2`,
		prizeLevel, participantID,
	)

	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al marcar ganador",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Ganador marcado exitosamente",
	})
}

// GetRaffleStats obtiene estadísticas de sorteos (admin)
func GetRaffleStats(c *fiber.Ctx) error {
	mesSorteo := c.Query("mes_sorteo", "")
	if mesSorteo == "" {
		mesSorteo = time.Now().Format("2006-01")
	}

	log.Printf("[RAFFLE STATS] Consultando estadísticas para mes: %s", mesSorteo)

	// Primero verificar todos los meses disponibles
	var allMonths []string
	monthRows, err := db.DB.Query(
		context.Background(),
		`SELECT DISTINCT mes_sorteo, COUNT(*) as count FROM raffle_subscriptions GROUP BY mes_sorteo ORDER BY mes_sorteo DESC`,
	)
	if err == nil {
		defer monthRows.Close()
		for monthRows.Next() {
			var month string
			var count int
			if err := monthRows.Scan(&month, &count); err == nil {
				allMonths = append(allMonths, month)
				log.Printf("[RAFFLE STATS] Mes %s tiene %d participantes", month, count)
			}
		}
	}

	var totalParticipants, totalWinners int
	err = db.DB.QueryRow(
		context.Background(),
		`SELECT COUNT(*) FROM raffle_subscriptions WHERE mes_sorteo = $1`,
		mesSorteo,
	).Scan(&totalParticipants)

	if err != nil {
		log.Printf("[RAFFLE STATS] Error contando participantes: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al obtener estadísticas",
		})
	}

	log.Printf("[RAFFLE STATS] Total participantes para %s: %d", mesSorteo, totalParticipants)

	err = db.DB.QueryRow(
		context.Background(),
		`SELECT COUNT(*) FROM raffle_subscriptions WHERE mes_sorteo = $1 AND is_winner = TRUE`,
		mesSorteo,
	).Scan(&totalWinners)

	if err != nil {
		totalWinners = 0
	}

	return c.JSON(fiber.Map{
		"mes_sorteo":         mesSorteo,
		"total_participants": totalParticipants,
		"total_winners":      totalWinners,
		"available_months":   allMonths,
	})
}
