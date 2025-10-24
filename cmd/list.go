package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/spf13/cobra"
)

var listDate DateOpts
var showAll bool  // --all
var showFull bool // --full

var listCmd = &cobra.Command{
	Use:     "list",
	Aliases: []string{"ls"},
	Short: "List diary files for the specified date range",
	RunE: func(cmd *cobra.Command, args []string) error {
		from, to, err := listDate.Resolve(time.Now())
		if err != nil {
			return err
		}

		years, months, weeks, days := enumerateFiles(from, to)
		allFiles := append(append(append(years, months...), weeks...), days...)

		base := filepath.Clean(env.Nikki)
		if base == "" {
			return fmt.Errorf("env.NIKKI is empty; set NIKKI to your diary directory")
		}

		for _, name := range allFiles {
			absPath := filepath.Join(base, name) // ← 常に絶対側で存在確認
			if !showAll {
				if info, err := os.Stat(absPath); err != nil || info.IsDir() {
					continue
				}
			}
			if showFull {
				fmt.Println(absPath) // 絶対パスで出力
			} else {
				fmt.Println(name) // ファイル名のみで出力
			}
		}
		return nil
	},
}

func init() {
	AddDateFlags(listCmd, &listDate)
	listCmd.Flags().BoolVarP(&showAll, "all", "a", false, "Show all files even if they don't exist")
	listCmd.Flags().BoolVarP(&showFull, "full", "f", false, "Show full path (prepend env.Nikki)")
	rootCmd.AddCommand(listCmd)
}
