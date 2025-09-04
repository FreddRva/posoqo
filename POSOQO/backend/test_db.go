package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	// Cargar variables de entorno
	_ = godotenv.Load()

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	if password == "" {
		password = "posoqoEvelinSuarez"
	}

	url := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbname)

	pool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		log.Fatal("Error conectando a la base de datos:", err)
	}
	defer pool.Close()

	// Verificar si la tabla existe
	var tableExists bool
	err = pool.QueryRow(context.Background(),
		"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reservations')").Scan(&tableExists)
	if err != nil {
		log.Fatal("Error verificando tabla:", err)
	}

	fmt.Printf("Tabla reservations existe: %v\n", tableExists)

	if tableExists {
		// Contar reservas
		var count int
		err = pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM reservations").Scan(&count)
		if err != nil {
			log.Fatal("Error contando reservas:", err)
		}
		fmt.Printf("Total de reservas: %d\n", count)

		// Listar algunas reservas
		rows, err := pool.Query(context.Background(),
			"SELECT id, user_id, date, time, people, payment_method, status, advance FROM reservations LIMIT 5")
		if err != nil {
			log.Fatal("Error consultando reservas:", err)
		}
		defer rows.Close()

		fmt.Println("\nReservas encontradas:")
		for rows.Next() {
			var id, userID, date, time, paymentMethod, status string
			var people int
			var advance float64
			if err := rows.Scan(&id, &userID, &date, &time, &people, &paymentMethod, &status, &advance); err != nil {
				fmt.Printf("Error escaneando: %v\n", err)
				continue
			}
			fmt.Printf("ID: %s, User: %s, Date: %s, Time: %s, People: %d, Status: %s\n",
				id, userID, date, time, people, status)
		}
	}
}
