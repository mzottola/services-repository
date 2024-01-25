package main

import (
	"fmt"
	"io"
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

		e.GET("/health", func(c echo.Context) error {
			e.Logger.Print("health-check")
			return c.HTML(http.StatusOK, "Hello, go-simple-app ")
		})

		e.GET("/internal", func(c echo.Context) error {
			var privateServiceUrl = os.Getenv("PRIVATE_SERVICE_URL")
			e.Logger.Print(fmt.Sprintf("Calling internal service at %s on port 4200", privateServiceUrl))
			resp, err := http.Get(fmt.Sprintf("https://%s:4200", privateServiceUrl))
			if err != nil {
				e.Logger.Error(fmt.Sprintf("Issue: %s", err))
			}
			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			e.Logger.Print("Body: ")
			e.Logger.Print(fmt.Sprintf("%s", body))
			e.Logger.Print("internal service called")
			return c.HTML(http.StatusOK, "internal-service-called")
		})

		return e
	}

	go func() {
		var e = createEcho()
		e.Logger.Fatal(e.Start(":" + "3000"))
	}()

	var e = createEcho()
	e.Logger.Fatal(e.Start(":" + "3001"))
}
