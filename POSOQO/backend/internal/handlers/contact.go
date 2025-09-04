package handlers

import (
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/utils"
)

// ContactRequest representa la solicitud de contacto
type ContactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

// ContactUs godoc
// @Summary Enviar mensaje de contacto
// @Description Envía un mensaje de contacto desde el formulario del sitio web
// @Tags contact
// @Accept json
// @Produce json
// @Param contact body ContactRequest true "Datos del mensaje de contacto"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/contact [post]
func ContactUs(c *fiber.Ctx) error {
	var req ContactRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Datos inválidos",
		})
	}

	// Sanitización de inputs
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Subject = strings.TrimSpace(req.Subject)
	req.Message = strings.TrimSpace(req.Message)

	// Validaciones
	if req.Name == "" || req.Email == "" || req.Subject == "" || req.Message == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Todos los campos son obligatorios",
		})
	}

	if !utils.IsValidEmail(req.Email) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Email inválido",
		})
	}

	if len(req.Name) < 2 || len(req.Name) > 50 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "El nombre debe tener entre 2 y 50 caracteres",
		})
	}

	if len(req.Subject) < 5 || len(req.Subject) > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "El asunto debe tener entre 5 y 100 caracteres",
		})
	}

	if len(req.Message) < 10 || len(req.Message) > 1000 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "El mensaje debe tener entre 10 y 1000 caracteres",
		})
	}

	// Obtener información del cliente para auditoría
	clientIP := c.IP()
	userAgent := c.Get("User-Agent")

	// Log del intento de contacto
	log.Printf("[CONTACT] %s | IP: %s | User-Agent: %s | Subject: %s",
		req.Email, clientIP, userAgent, req.Subject)

	// Enviar email (si está configurado)
	if os.Getenv("SMTP_HOST") != "" {
		go sendContactEmail(req)
	} else {
		// Si no hay configuración de email, solo log
		log.Printf("[CONTACT] Email no enviado - SMTP no configurado | From: %s | Subject: %s | Message: %s",
			req.Email, req.Subject, req.Message)
	}

	return c.JSON(fiber.Map{
		"message": "Mensaje enviado correctamente. Te responderemos pronto.",
	})
}

func sendContactEmail(req ContactRequest) {
	// Configuración del email
	toEmail := os.Getenv("FROM_EMAIL")
	if toEmail == "" {
		toEmail = "contacto@posoqo.com" // Email por defecto
	}

	subject := fmt.Sprintf("Nuevo mensaje de contacto: %s", req.Subject)

	body := fmt.Sprintf(`
Nuevo mensaje de contacto desde el sitio web POSOQO

Nombre: %s
Email: %s
Asunto: %s

Mensaje:
%s

---
Este mensaje fue enviado desde el formulario de contacto de posoqo.com
	`, req.Name, req.Email, req.Subject, req.Message)

	// Enviar email usando la función existente
	err := sendEmail(toEmail, subject, body)
	if err != nil {
		log.Printf("[CONTACT] Error enviando email: %v", err)
	} else {
		log.Printf("[CONTACT] Email enviado correctamente a %s", toEmail)
	}
}

// sendEmail envía un email usando SMTP
func sendEmail(to, subject, body string) error {
	// Obtener configuración SMTP desde variables de entorno
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("FROM_EMAIL")

	// Validar configuración
	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("configuración SMTP incompleta")
	}

	// Construir mensaje
	message := fmt.Sprintf("From: %s\r\n", fromEmail)
	message += fmt.Sprintf("To: %s\r\n", to)
	message += fmt.Sprintf("Subject: %s\r\n", subject)
	message += "\r\n"
	message += body

	// Autenticación
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Enviar email
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{to}, []byte(message))
	if err != nil {
		return fmt.Errorf("error enviando email: %v", err)
	}

	return nil
}
