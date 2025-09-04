package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Cart struct {
	ID        string `db:"id"`
	UserID    int64  `db:"user_id"`
	CreatedAt string `db:"created_at"`
	UpdatedAt string `db:"updated_at"`
}

type CartItem struct {
	ID        string `db:"id"`
	CartID    string `db:"cart_id"`
	ProductID string `db:"product_id"`
	Quantity  int    `db:"quantity"`
}

func MigrateCartsTables(db *pgxpool.Pool) error {
	query := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE TABLE IF NOT EXISTS carts (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id)
	);
	CREATE TABLE IF NOT EXISTS cart_items (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
		product_id UUID REFERENCES products(id),
		quantity INT NOT NULL,
		UNIQUE(cart_id, product_id)
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating carts/cart_items tables: %w", err)
	}
	return nil
}
