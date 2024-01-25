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

		e.GET("/health", func(c echo.Context) error {
			e.Logger.Print("health-check")
			return c.HTML(http.StatusOK, "Hello, go-simple-app ")
		})

		e.GET("/internal", func(c echo.Context) error {
			var privateServiceUrl = os.Getenv("PRIVATE_SERVICE_URL")
			e.Logger.Print(fmt.Sprintf("Calling internal service at %s on port 4200", privateServiceUrl))
			//resp, err := http.Get(tcpAddress)
			//if err != nil {
			//	e.Logger.Error(fmt.Sprintf("Issue: %s", err))
			//}
			//defer resp.Body.Close()
			//body, err := io.ReadAll(resp.Body)
			//e.Logger.Print("Body: ")
			//e.Logger.Print(fmt.Sprintf("%s", body))
			//e.Logger.Print("internal service called")
			//return c.HTML(http.StatusOK, "internal-service-called")

			strEcho := "Halo"
			servAddr := fmt.Sprintf("%s:4200", privateServiceUrl)
			tcpAddr, err := net.ResolveTCPAddr("tcp", servAddr)
			if err != nil {
				println("ResolveTCPAddr failed:", err.Error())
				os.Exit(1)
			}

			conn, err := net.DialTCP("tcp", nil, tcpAddr)
			if err != nil {
				println("Dial failed:", err.Error())
				os.Exit(1)
			}

			_, err = conn.Write([]byte(strEcho))
			if err != nil {
				println("Write to server failed:", err.Error())
				os.Exit(1)
			}

			println("write to server = ", strEcho)

			conn.Close()
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
