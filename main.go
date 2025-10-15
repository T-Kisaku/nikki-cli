package main

import (
	"fmt"

	"github.com/T-Kisaku/nikki-cli/cmd"
)

func main() {
	if err := cmd.Execute(); err != nil {
		fmt.Println(err)
	}
}
