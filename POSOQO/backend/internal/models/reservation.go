package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Reservation struct {
	ID            string  `db:"id"`
	UserID        int64   `db:"user_id"`
	Date          string  `db:"date"`
	Time          string  `db:"time"`
	People        int     `db:"people"`
	PaymentMethod string  `db:"payment_method"`
	Status        string  `db:"status"`
	Advance       float64 `db:"advance"`
	CreatedAt     string  `db:"created_at"`
	UpdatedAt     string  `db:"updated_at"`
}

func MigrateReservationsTable(db *pgxpool.Pool) error {
	query := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE TABLE IF NOT EXISTS reservations (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
		date DATE NOT NULL,
		time TIME NOT NULL,
		people INT NOT NULL,
		payment_method VARCHAR(20) NOT NULL,
		status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
		advance NUMERIC(10,2) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating reservations table: %w", err)
	}
	return nil
}
