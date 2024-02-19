package main

import (
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
		e.Logger.Print("hello main page")
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

	filevariable := os.Getenv("MZO_FILE_ENV_VARIABLE")
        e.Logger.Print(filevariable)

	e.Logger.Fatal(e.Start(":" + httpPort))
}
