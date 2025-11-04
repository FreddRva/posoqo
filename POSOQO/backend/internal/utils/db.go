package utils

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// DefaultQueryTimeout es el timeout por defecto para queries de base de datos
const DefaultQueryTimeout = 10 * time.Second

// QueryWithTimeout crea un contexto con timeout para queries de base de datos
func QueryWithTimeout() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), DefaultQueryTimeout)
}

// QueryWithCustomTimeout crea un contexto con timeout personalizado
func QueryWithCustomTimeout(timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), timeout)
}

// SafeQuery ejecuta una query con timeout y manejo de errores mejorado
func SafeQuery(pool *pgxpool.Pool, query string, args ...interface{}) error {
	ctx, cancel := QueryWithTimeout()
	defer cancel()

	_, err := pool.Exec(ctx, query, args...)
	if err != nil {
		// No exponer detalles internos de la base de datos
		if ctx.Err() == context.DeadlineExceeded {
			return ErrQueryTimeout
		}
		return ErrDatabaseError
	}
	return nil
}

// SafeQueryRow ejecuta QueryRow con timeout
func SafeQueryRow(pool *pgxpool.Pool, query string, args ...interface{}) (pgx.Row, context.CancelFunc) {
	ctx, cancel := QueryWithTimeout()
	return pool.QueryRow(ctx, query, args...), cancel
}

// SafeQueryRows ejecuta Query con timeout
func SafeQueryRows(pool *pgxpool.Pool, query string, args ...interface{}) (pgx.Rows, context.CancelFunc, error) {
	ctx, cancel := QueryWithTimeout()
	rows, err := pool.Query(ctx, query, args...)
	return rows, cancel, err
}

// Errores comunes sin exponer detalles internos
var (
	ErrQueryTimeout  = &QueryError{Message: "La operación tardó demasiado tiempo", Code: "QUERY_TIMEOUT"}
	ErrDatabaseError = &QueryError{Message: "Error en la base de datos", Code: "DATABASE_ERROR"}
)

// QueryError es un error personalizado para queries
type QueryError struct {
	Message string
	Code    string
}

func (e *QueryError) Error() string {
	return e.Message
}
