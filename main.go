package main

import (
	"fmt"
	"net"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {

	var createEcho = func() *echo.Echo {
		e := echo.New()
		e.Use(middleware.Logger())
		e.Use(middleware.Recover())

		e.GET("/", func(c echo.Context) error {
			e.Logger.Print("hello from internal service")
			return c.HTML(http.StatusOK, "Hello")
		})

		e.GET("/health", func(c echo.Context) error {
			e.Logger.Print("health")
			return c.HTML(http.StatusOK, "health-internal-service")
		})

		return e
	}

	go func() {
		var e = createEcho()
		e.Logger.Fatal(e.Start(":" + "3000"))
	}()

	// Listen for incoming connections.
	l, err := net.Listen("tcp", "localhost:4200")
	if err != nil {
		fmt.Println("Error listening:", err.Error())
		os.Exit(1)
	}
	// Close the listener when the application closes.
	defer l.Close()
	fmt.Println("Listening on localhost:4200")
	for {
		// Listen for an incoming connection.
		conn, err := l.Accept()
		if err != nil {
			fmt.Println("Error accepting: ", err.Error())
			os.Exit(1)
		}
		// Handle connections in a new goroutine.
		go handleRequest(conn)
	}
}

// Handles incoming requests.
func handleRequest(conn net.Conn) {
	// Make a buffer to hold incoming data.
	buf := make([]byte, 1024)
	// Read the incoming connection into the buffer.
	_, err := conn.Read(buf)
	if err != nil {
		fmt.Println("Error reading:", err.Error())
	}
	fmt.Println("Message received")
	// Close the connection when you're done with it.
	conn.Close()
}
