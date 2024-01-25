package main

import (
	"net/http"

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
		e.Logger.Fatal(e.Start(":" + "4200"))
	}()

	var e = createEcho()
	e.Logger.Fatal(e.Start(":" + "3000"))
}
