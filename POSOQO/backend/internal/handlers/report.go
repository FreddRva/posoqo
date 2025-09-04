package handlers

import (
	"context"
	"encoding/csv"
	"fmt"
	"strconv"
	"time"

	"bytes"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"github.com/posoqo/backend/internal/db"
)

// Exportar ventas a CSV
func ExportSalesCSV(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(),
		`SELECT o.id, u.name, u.email, o.total, o.status, o.created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`)
	if err != nil {
		return c.Status(500).SendString("Error al obtener ventas")
	}
	defer rows.Close()

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", "attachment;filename=ventas.csv")
	writer := csv.NewWriter(c)
	defer writer.Flush()

	writer.Write([]string{"ID Pedido", "Cliente", "Email", "Total", "Estado", "Fecha"})
	for rows.Next() {
		var id, name, email, status string
		var total float64
		var createdAt time.Time
		if err := rows.Scan(&id, &name, &email, &total, &status, &createdAt); err != nil {
			continue
		}
		writer.Write([]string{id, name, email, fmt.Sprintf("%.2f", total), status, createdAt.Format("2006-01-02 15:04:05")})
	}
	return nil
}

// Exportar usuarios a CSV
func ExportUsersCSV(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(),
		`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`)
	if err != nil {
		return c.Status(500).SendString("Error al obtener usuarios")
	}
	defer rows.Close()

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", "attachment;filename=usuarios.csv")
	writer := csv.NewWriter(c)
	defer writer.Flush()

	writer.Write([]string{"ID", "Nombre", "Email", "Rol", "Fecha Registro"})
	for rows.Next() {
		var id int64
		var name, email, role string
		var createdAt time.Time
		if err := rows.Scan(&id, &name, &email, &role, &createdAt); err != nil {
			continue
		}
		writer.Write([]string{strconv.FormatInt(id, 10), name, email, role, createdAt.Format("2006-01-02 15:04:05")})
	}
	return nil
}

// Exportar ventas a PDF
func ExportSalesPDF(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(),
		`SELECT o.id, u.name, u.email, o.total, o.status, o.created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`)
	if err != nil {
		return c.Status(500).SendString("Error al obtener ventas")
	}
	defer rows.Close()

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Reporte de Ventas")
	pdf.Ln(12)
	pdf.SetFont("Arial", "B", 10)
	headers := []string{"ID Pedido", "Cliente", "Email", "Total", "Estado", "Fecha"}
	for _, h := range headers {
		pdf.CellFormat(32, 7, h, "1", 0, "C", false, 0, "")
	}
	pdf.Ln(-1)
	pdf.SetFont("Arial", "", 10)
	for rows.Next() {
		var id, name, email, status string
		var total float64
		var createdAt time.Time
		if err := rows.Scan(&id, &name, &email, &total, &status, &createdAt); err != nil {
			continue
		}
		pdf.CellFormat(32, 7, id, "1", 0, "C", false, 0, "")
		pdf.CellFormat(32, 7, name, "1", 0, "C", false, 0, "")
		pdf.CellFormat(32, 7, email, "1", 0, "C", false, 0, "")
		pdf.CellFormat(32, 7, fmt.Sprintf("%.2f", total), "1", 0, "C", false, 0, "")
		pdf.CellFormat(32, 7, status, "1", 0, "C", false, 0, "")
		pdf.CellFormat(32, 7, createdAt.Format("2006-01-02"), "1", 0, "C", false, 0, "")
		pdf.Ln(-1)
	}
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return c.Status(500).SendString("Error generando PDF")
	}
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", "attachment;filename=ventas.pdf")
	return c.SendStream(&buf)
}

// Exportar usuarios a PDF
func ExportUsersPDF(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(),
		`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`)
	if err != nil {
		return c.Status(500).SendString("Error al obtener usuarios")
	}
	defer rows.Close()

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Reporte de Usuarios")
	pdf.Ln(12)
	pdf.SetFont("Arial", "B", 10)
	headers := []string{"ID", "Nombre", "Email", "Rol", "Fecha Registro"}
	for _, h := range headers {
		pdf.CellFormat(40, 7, h, "1", 0, "C", false, 0, "")
	}
	pdf.Ln(-1)
	pdf.SetFont("Arial", "", 10)
	for rows.Next() {
		var id int64
		var name, email, role string
		var createdAt time.Time
		if err := rows.Scan(&id, &name, &email, &role, &createdAt); err != nil {
			continue
		}
		pdf.CellFormat(40, 7, fmt.Sprintf("%d", id), "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 7, name, "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 7, email, "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 7, role, "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 7, createdAt.Format("2006-01-02 15:04:05"), "1", 0, "C", false, 0, "")
		pdf.Ln(-1)
	}
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return c.Status(500).SendString("Error generando PDF")
	}
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", "attachment;filename=usuarios.pdf")
	return c.SendStream(&buf)
}
