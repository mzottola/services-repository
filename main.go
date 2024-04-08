package main

import (
	"context"
	"fmt"

	"github.com/qovery/qovery-client-go"
)

/*
// output
qovery service list
Name     | Type        | Status
httpgo   | Application | STOPPED
nginx    | Container   | STOPPED
twingate | Helm        | STOPPED
*/

func main() {
	// setup Qovery API Client
	cfg := qovery.NewConfiguration()

	cfg.AddDefaultHeader("content-type", "application/json")
	apiClient := qovery.NewAPIClient(cfg)

	// get information from project
	projectId := "018e3b90-744e-4174-adfb-3e1db59dce76"
	result, _, err := apiClient.EnvironmentsAPI.ListEnvironment(context.Background(), projectId).Execute()
	if err != nil {
		return
	}

	for _, environment := range result.Results {
		fmt.Printf("%s", environment.Name)
	}

}
