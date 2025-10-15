package config

import (
    "fmt"
    "os"

    "github.com/spf13/viper"
)

type Env struct {
    Nikki string
    Editor  string
}

func LoadEnv() Env {
    viper.AutomaticEnv()

    required := []string{"NIKKI", "EDITOR"}
    for _, key := range required {
        if !viper.IsSet(key) {
            fmt.Fprintf(os.Stderr, "Error: required env var %s is not set\n", key)
            os.Exit(1)
        }
    }

    return Env{
        Nikki: viper.GetString("NIKKI"),
        Editor:  viper.GetString("EDITOR"),
    }
}
