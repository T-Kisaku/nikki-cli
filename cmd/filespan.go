// cmd/filespan.go
package cmd

import (
	"fmt"
	"sort"
	"time"
)

func yearFile(y int) string      { return fmt.Sprintf("%04d.md", y) }
func monthFile(y, m int) string  { return fmt.Sprintf("%04d-%02d.md", y, m) }
func dayFile(y, m, d int) string { return fmt.Sprintf("%04d-%02d-%02d.md", y, m, d) }
func weekFile(y, w int) string   { return fmt.Sprintf("%04d-w%02d.md", y, w) }

// from(含む) .. to(含まない) を JST 起点で列挙
func enumerateFiles(from, to time.Time) (years, months, weeks, days []string) {
	loc := from.Location()

	// 年
	{
		yStart := time.Date(from.Year(), 1, 1, 0, 0, 0, 0, loc)
		yEnd := time.Date(to.Year(), 1, 1, 0, 0, 0, 0, loc)
		if to.After(yEnd) {
			yEnd = yEnd.AddDate(1, 0, 0)
		}
		for y := yStart.Year(); y < to.Year() || (y == to.Year() && yStart.Before(to)); y++ {
			years = append(years, yearFile(y))
			yStart = yStart.AddDate(1, 0, 0)
		}
	}

	// 月
	{
		cur := time.Date(from.Year(), from.Month(), 1, 0, 0, 0, 0, loc)
		for cur.Before(to) {
			months = append(months, monthFile(cur.Year(), int(cur.Month())))
			cur = cur.AddDate(0, 1, 0)
		}
	}

	// 週（ISO）
	{
		// 開始をその週の月曜に丸める
		start := startOfISOWeek(from)
		for start.Before(to) {
			y, w := start.ISOWeek()
			weeks = append(weeks, weekFile(y, w))
			start = start.AddDate(0, 0, 7)
		}
	}

	// 日
	{
		cur := startOfDay(from)
		for cur.Before(to) {
			y, m, d := cur.Date()
			days = append(days, dayFile(y, int(m), d))
			cur = cur.AddDate(0, 0, 1)
		}
	}

	// 重複排除（範囲が年境界/月境界ちょうどで入る場合の保険）＆ソート
	years = uniqSorted(years)
	months = uniqSorted(months)
	weeks = uniqSorted(weeks)
	days = uniqSorted(days)
	return
}

func uniqSorted(in []string) []string {
	if len(in) == 0 {
		return in
	}
	m := make(map[string]struct{}, len(in))
	out := make([]string, 0, len(in))
	for _, s := range in {
		if _, ok := m[s]; !ok {
			m[s] = struct{}{}
			out = append(out, s)
		}
	}
	sort.Strings(out)
	return out
}

// 与えられた日時が属する ISO 週の月曜 00:00 を返す（JST）
func startOfISOWeek(t time.Time) time.Time {
	t = t.In(jst)
	wd := int(t.Weekday())
	if wd == 0 {
		wd = 7
	} // Sunday=7
	mon := t.AddDate(0, 0, -(wd - 1))
	return startOfDay(mon)
}
