package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Product struct {
	ID            string  `db:"id"`
	Name          string  `db:"name"`
	Description   string  `db:"description"`
	Price         float64 `db:"price"`
	ImageURL      string  `db:"image_url"`
	CategoryID    string  `db:"category_id"`
	SubcategoryID string  `db:"subcategory_id"`
	Estilo        string  `db:"estilo"`
	ABV           string  `db:"abv"`
	IBU           string  `db:"ibu"`
	Color         string  `db:"color"`
	IsActive      bool    `db:"is_active"`
	CreatedAt     string  `db:"created_at"`
	UpdatedAt     string  `db:"updated_at"`
}

func MigrateProductsTable(db *pgxpool.Pool) error {
	query := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE TABLE IF NOT EXISTS products (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		name TEXT NOT NULL,
		description TEXT,
		price NUMERIC(10,2) NOT NULL,
		image_url TEXT,
		category_id UUID REFERENCES categories(id),
		subcategory TEXT,
		is_active BOOLEAN DEFAULT TRUE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating products table: %w", err)
	}
	return nil
}
