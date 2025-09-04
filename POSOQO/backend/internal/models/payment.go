package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Payment struct {
	ID              string  `db:"id"`
	UserID          int64   `db:"user_id"`
	OrderID         *string `db:"order_id"`
	ReservationID   *string `db:"reservation_id"`
	StripePaymentID string  `db:"stripe_payment_id"`
	Amount          float64 `db:"amount"`
	Status          string  `db:"status"`
	Method          string  `db:"method"`
	CreatedAt       string  `db:"created_at"`
	UpdatedAt       string  `db:"updated_at"`
}

func MigratePaymentsTable(db *pgxpool.Pool) error {
	query := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE TABLE IF NOT EXISTS payments (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
		order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
		reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
		stripe_payment_id TEXT,
		amount NUMERIC(10,2) NOT NULL,
		status VARCHAR(20) NOT NULL,
		method VARCHAR(20) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating payments table: %w", err)
	}
	return nil
}
