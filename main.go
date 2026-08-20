package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	host := getEnv("PGHOST", "")
	port := getEnv("PGPORT", "5432")
	user := getEnv("PGUSER", "")
	password := getEnv("PGPASSWORD", "")
	dbname := getEnv("PGDATABASE", "postgres")
	sslmode := getEnv("PGSSLMODE", "require")

	if host == "" || user == "" || password == "" {
		log.Fatal("PGHOST, PGUSER, and PGPASSWORD must be set")
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("failed to open connection: %v", err)
	}
	defer db.Close()

	// Keep the process alive, checking the connection periodically
	for {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		err := db.PingContext(ctx)
		cancel()

		if err != nil {
			log.Printf("ping failed: %v", err)
		} else {
			var version string
			ctx2, cancel2 := context.WithTimeout(context.Background(), 10*time.Second)
			if err := db.QueryRowContext(ctx2, "SELECT version();").Scan(&version); err != nil {
				log.Printf("query failed: %v", err)
			} else {
				log.Printf("connected OK — %s", version)
			}
			cancel2()
		}

		time.Sleep(30 * time.Second)
	}
}
