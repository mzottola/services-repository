package main

import (
	"net"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/", func(c echo.Context) error {
		e.Logger.Print("hello main page webhook trigger")
		for key, values := range c.Request().Header {
                    e.Logger.Print("Header: ", key)
                    for _, value := range values {
                        e.Logger.Print("  Value: ", value)
                    }
                }

		return c.HTML(http.StatusOK, "Hello, go-simple-app ")
	})

	e.GET("/ping", func(c echo.Context) error {
		e.Logger.Print("hello ping")
		return c.JSON(http.StatusOK, struct{ Status string }{Status: "OK"})
	})

	e.POST("/webhook-mzo-3", func(c echo.Context) error {
		e.Logger.Print("hello webhookmzo3")
		return c.JSON(http.StatusOK, struct{ Status string }{Status: "OK"})
	})

	httpPort := os.Getenv("HTTP_PORT")
	if httpPort == "" {
		httpPort = "8080"
	}

	go func() {
		e2 := echo.New()
		e2.Use(middleware.Logger())
		e2.Use(middleware.Recover())

		e2.GET("/", func(c echo.Context) error {
			return c.HTML(http.StatusOK, "Hello from port 8081")
		})

		e2.Logger.Fatal(e2.Start(":8081"))
	}()

	go func() {
		ln, err := net.Listen("tcp", ":3000")
		if err != nil {
			e.Logger.Fatal(err)
		}
		e.Logger.Print("TCP server started on: tcp://localhost:3000")
		for {
			conn, err := ln.Accept()
			if err != nil {
				e.Logger.Error(err)
				continue
			}
			go func(c net.Conn) {
				defer c.Close()
				c.Write([]byte("hello from TCP server\n"))
			}(conn)
		}
	}()

	e.Logger.Fatal(e.Start(":" + httpPort))
}

