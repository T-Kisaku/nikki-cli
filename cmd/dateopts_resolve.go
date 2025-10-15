// cmd/dateopts_resolve.go
package cmd

import (
	"fmt"
	"strconv"
	"time"
)

var jst = time.FixedZone("Asia/Tokyo", 9*60*60) // ユーザーはJST

// 与えられた now（テストしやすいように注入）を基準に [from, to) を返す
func (o DateOpts) Resolve(now time.Time) (from, to time.Time, err error) {
	now = now.In(jst)

	// 1) 単発日指定フラグが最優先
	dayFlags := 0
	if o.Today { dayFlags++ }
	if o.Yesterday { dayFlags++ }
	if o.Tomorrow { dayFlags++ }

	if dayFlags > 1 {
		return from, to, fmt.Errorf("use only one of --today/--yesterday/--tomorrow")
	}
	if o.Today {
		return dayRange(startOfDay(now))
	}
	if o.Yesterday {
		return dayRange(startOfDay(now.AddDate(0, 0, -1)))
	}
	if o.Tomorrow {
		return dayRange(startOfDay(now.AddDate(0, 0, 1)))
	}

	// 2) 週指定（ISO week）。年が未指定なら現在年
	if o.Week != "" {
		year := pickIntOrCurrent(o.Year, now.Year())
		week := pickIntOrCurrent(o.Week, isoWeek(now))
		if week < 1 || week > 53 {
			return from, to, fmt.Errorf("invalid --week: %d", week)
		}
		start := isoWeekStart(year, week, jst)
		return start, start.AddDate(0, 0, 7), nil
	}

	// 3) 年/月/日 粒度で
	if o.Year == "" && o.Month == "" && o.Day == "" {
		// 何も無いなら「今日」
		s := startOfDay(now)
		return s, s.AddDate(0, 0, 1), nil
	}

	year := pickIntMaybe(o.Year)
	month := pickIntMaybe(o.Month)
	day := pickIntMaybe(o.Day)

	if isZeroStr(o.Year) { year = now.Year() }
	if isZeroStr(o.Month) { month = int(now.Month()) }
	if isZeroStr(o.Day) { day = now.Day() }

	// 補完：月のみ指定→年は現在年。日だけ指定→年・月は現在。
	if o.Month != "" && year == 0 { year = now.Year() }
	if o.Day != "" {
		if year == 0 { year = now.Year() }
		if month == 0 { month = int(now.Month()) }
	}

	// 粒度分岐
	switch {
	case year != 0 && month == 0 && day == 0:
		// 年単位
		start := time.Date(year, 1, 1, 0, 0, 0, 0, jst)
		return start, start.AddDate(1, 0, 0), nil
	case year != 0 && month != 0 && day == 0:
		// 月単位
		start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, jst)
		return start, start.AddDate(0, 1, 0), nil
	case year != 0 && month != 0 && day != 0:
		// 日単位
		start := time.Date(year, time.Month(month), day, 0, 0, 0, 0, jst)
		return start, start.AddDate(0, 0, 1), nil
	default:
		return from, to, fmt.Errorf("invalid combination for --year/--month/--day")
	}
}

func startOfDay(t time.Time) time.Time {
	y, m, d := t.Date()
	return time.Date(y, m, d, 0, 0, 0, 0, t.Location())
}
func dayRange(start time.Time) (time.Time, time.Time, error) {
	return start, start.AddDate(0, 0, 1), nil
}
func isZeroStr(s string) bool { return s == "0" }
func pickIntOrCurrent(s string, cur int) int {
	if s == "" { return cur }
	if s == "0" { return cur }
	n, _ := strconv.Atoi(s)
	return n
}
func pickIntMaybe(s string) int {
	if s == "" || s == "0" { return 0 }
	n, _ := strconv.Atoi(s)
	return n
}
func isoWeek(t time.Time) int {
	_, w := t.ISOWeek()
	return w
}
func isoWeekStart(year, week int, loc *time.Location) time.Time {
	// ISO週の開始（月曜）を求める
	// 参考：年の第4日（Jan 4）を含む週がWeek1
	jan4 := time.Date(year, 1, 4, 0, 0, 0, 0, loc)
	// jan4 の週の月曜日
	weekday := int(jan4.Weekday())
	if weekday == 0 { weekday = 7 } // Sunday=7
	monday := jan4.AddDate(0, 0, - (weekday - 1))
	return monday.AddDate(0, 0, (week-1)*7)
}
