package models

type Service struct {
	ID          string   `db:"id"`
	Name        string   `db:"name"`
	Description string   `db:"description"`
	ImageURL    string   `db:"image_url"`
	Features    []string `db:"features"`
	IsActive    bool     `db:"is_active"`
	CreatedAt   string   `db:"created_at"`
	UpdatedAt   string   `db:"updated_at"`
}
