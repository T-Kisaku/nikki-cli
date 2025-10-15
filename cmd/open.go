package cmd

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/spf13/cobra"
)

var openDate DateOpts

var openCmd = &cobra.Command{
	Use:   "open",
	Short: "Open a diary file in your editor",
	RunE: func(cmd *cobra.Command, args []string) error {
		from, _, err := openDate.Resolve(time.Now())
		if err != nil {
			return err
		}

		// どの粒度かを判定してファイル名を決める
		var file string
		switch {
		case openDate.Today || openDate.Yesterday || openDate.Tomorrow || openDate.Day != "":
			y, m, d := from.In(jst).Date()
			file = dayFile(y, int(m), d)
		case openDate.Week != "":
			y, w := from.In(jst).ISOWeek()
			file = weekFile(y, w)
		case openDate.Month != "":
			y, m, _ := from.In(jst).Date()
			file = monthFile(y, int(m))
		case openDate.Year != "":
			y := from.In(jst).Year()
			file = yearFile(y)
		default:
			y, m, d := from.In(jst).Date()
			file = dayFile(y, int(m), d)
		}

		// 絶対パス解決
		base := filepath.Clean(env.Nikki)
		if base == "" {
			return fmt.Errorf("env.NIKKI is empty; set NIKKI to your diary directory")
		}
		path := filepath.Join(base, file)

		// ファイルが存在しなければ作成
		if _, err := os.Stat(path); os.IsNotExist(err) {
			if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
				return err
			}
			if err := os.WriteFile(path, []byte(""), 0o644); err != nil {
				return err
			}
		}

		// Editor 実行
		editor := env.Editor
		if editor == "" {
			editor = "nvim" // デフォルト
		}

		cmdEditor := exec.Command(editor, path)
		cmdEditor.Stdin = os.Stdin
		cmdEditor.Stdout = os.Stdout
		cmdEditor.Stderr = os.Stderr

		return cmdEditor.Run()
	},
}

func init() {
	AddDateFlags(openCmd, &openDate)
	rootCmd.AddCommand(openCmd)
}
