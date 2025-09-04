package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Category struct {
	ID       string  `db:"id"`
	Name     string  `db:"name"`
	ParentID *string `db:"parent_id"`
}

func MigrateCategoriesTable(db *pgxpool.Pool) error {
	query := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE TABLE IF NOT EXISTS categories (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		name TEXT NOT NULL UNIQUE,
		parent_id UUID REFERENCES categories(id) ON DELETE SET NULL
	);
	`
	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return fmt.Errorf("error creating categories table: %w", err)
	}
	return nil
}
