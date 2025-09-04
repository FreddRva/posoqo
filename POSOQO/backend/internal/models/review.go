package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Review struct {
	ID        string `db:"id"`
	UserID    int64  `db:"user_id"`
	ProductID string `db:"product_id"`
	Rating    int    `db:"rating"`
	Comment   string `db:"comment"`
	CreatedAt string `db:"created_at"`
}

func MigrateReviewsTable(db *pgxpool.Pool) error {
	query := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE TABLE IF NOT EXISTS reviews (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
		product_id UUID REFERENCES products(id) ON DELETE CASCADE,
		rating INT CHECK (rating >= 1 AND rating <= 5),
		comment TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id, product_id)
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating reviews table: %w", err)
	}
	return nil
}
