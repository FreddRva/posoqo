package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Coupon struct {
	ID         string  `db:"id"`
	Code       string  `db:"code"`
	Value      float64 `db:"value"`
	Type       string  `db:"type"` // 'fixed' o 'percent'
	Expiration string  `db:"expiration"`
	IsActive   bool    `db:"is_active"`
	CreatedAt  string  `db:"created_at"`
	UpdatedAt  string  `db:"updated_at"`
}

func MigrateCouponsTable(db *pgxpool.Pool) error {
	query := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE TABLE IF NOT EXISTS coupons (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		code VARCHAR(50) NOT NULL UNIQUE,
		value NUMERIC(10,2) NOT NULL,
		type VARCHAR(10) NOT NULL CHECK (type IN ('fixed', 'percent')),
		expiration DATE NOT NULL,
		is_active BOOLEAN DEFAULT TRUE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating coupons table: %w", err)
	}
	return nil
}
