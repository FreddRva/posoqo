package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Favorite struct {
	ID        string `db:"id"`
	UserID    int64  `db:"user_id"`
	ProductID string `db:"product_id"`
	CreatedAt string `db:"created_at"`
}

func MigrateFavoritesTable(db *pgxpool.Pool) error {
	query := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE TABLE IF NOT EXISTS favorites (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
		product_id UUID REFERENCES products(id) ON DELETE CASCADE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id, product_id)
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating favorites table: %w", err)
	}
	return nil
}
