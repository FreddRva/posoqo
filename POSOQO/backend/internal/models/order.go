package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Order struct {
	ID        string  `db:"id"`
	UserID    int64   `db:"user_id"`
	Status    string  `db:"status"`
	Total     float64 `db:"total"`
	Location  string  `db:"location"`
	CreatedAt string  `db:"created_at"`
	UpdatedAt string  `db:"updated_at"`
}

type OrderItem struct {
	ID        string  `db:"id"`
	OrderID   string  `db:"order_id"`
	ProductID string  `db:"product_id"`
	Quantity  int     `db:"quantity"`
	UnitPrice float64 `db:"unit_price"`
}

func MigrateOrdersTables(db *pgxpool.Pool) error {
	query := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE TABLE IF NOT EXISTS orders (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id BIGINT REFERENCES users(id),
		status VARCHAR(20) NOT NULL DEFAULT 'recibido',
		total NUMERIC(10,2) NOT NULL,
		location TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE IF NOT EXISTS order_items (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
		product_id UUID REFERENCES products(id),
		quantity INT NOT NULL,
		unit_price NUMERIC(10,2) NOT NULL
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating orders/order_items tables: %w", err)
	}
	return nil
}
