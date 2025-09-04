package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID       int64  `db:"id"`
	Name     string `db:"name"`
	LastName string `db:"last_name"`
	DNI      string `db:"dni"`
	Phone    string `db:"phone"`
	Email    string `db:"email"`
	Password string `db:"password"`
	Role     string `db:"role"`
}

func MigrateUsersTable(db *pgxpool.Pool) error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		last_name VARCHAR(100) NOT NULL,
		dni VARCHAR(20) NOT NULL,
		phone VARCHAR(20) NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		role VARCHAR(20) NOT NULL DEFAULT 'client',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating users table: %w", err)
	}
	return nil
}
