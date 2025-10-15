// cmd/dateopts.go
package cmd

import (
	"github.com/spf13/cobra"
)

type DateOpts struct {
	// 文字列にしておくと --year / --year=2025 / --year(値省略) を扱いやすい
	Year  string // ""=未指定, "0"=現在年, "2025"=指定年
	Month string // ""=未指定, "0"=現在月, "1..12"=指定月
	Day   string // ""=未指定, "0"=現在日, "1..31"=指定日
	Week  string // ""=未指定, "0"=現在週, "1..53"=ISO週番号

	Today     bool
	Yesterday bool
	Tomorrow  bool
}

// どのコマンドにも同じフラグを生やすヘルパー
func AddDateFlags(cmd *cobra.Command, o *DateOpts) {
	fs := cmd.Flags()

	fs.StringVarP(&o.Year, "year", "y", "", "Target year (optional; -y or -y=YYYY; -y uses current year)")
	fs.StringVarP(&o.Month, "month", "m", "", "Target month (1-12; -m or -m=MM)")
	fs.StringVarP(&o.Day, "day", "d", "", "Target day (1-31; -d or -d=DD)")
	fs.StringVarP(&o.Week, "week", "w", "", "Target ISO week (1-53; -w or -w=WW)")

	// 引数省略（--year など）時の既定値
	fs.Lookup("year").NoOptDefVal = "0"
	fs.Lookup("month").NoOptDefVal = "0"
	fs.Lookup("day").NoOptDefVal = "0"
	fs.Lookup("week").NoOptDefVal = "0"

	fs.BoolVarP(&o.Today, "today", "t", false, "Use today")
	fs.BoolVarP(&o.Yesterday, "yesterday", "Y", false, "Use yesterday")
	fs.BoolVarP(&o.Tomorrow, "tomorrow", "T", false, "Use tomorrow")
}
