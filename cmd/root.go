package cmd

import (
	"github.com/spf13/cobra"

	"github.com/T-Kisaku/nikki-cli/internal/buildinfo"
	"github.com/T-Kisaku/nikki-cli/internal/config"
)

var (
	env     config.Env
	rootCmd = &cobra.Command{
		Use:     buildinfo.Name,
		Version: buildinfo.Version,
		Short:   "A tiny, fast CLI",
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			env = config.LoadEnv()
			return nil
		},
	}
)

func Execute() error {
	return rootCmd.Execute()
}
