package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
)

// UploadImageHandler maneja la subida de imágenes
func UploadImageHandler(c *fiber.Ctx) error {
	// Obtener el archivo del form-data (campo "image")
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No se recibió ninguna imagen"})
	}

	// Crear carpeta uploads si no existe
	uploadDir := "uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.Mkdir(uploadDir, 0755)
	}

	// Generar nombre único para la imagen
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("img_%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(uploadDir, filename)

	// Guardar el archivo
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo guardar la imagen"})
	}

	// Construir URL pública (ajusta según tu dominio)
	publicURL := fmt.Sprintf("/uploads/%s", filename)

	return c.JSON(fiber.Map{
		"url": publicURL,
	})
}
