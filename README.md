# nikki-cli

## Purpose

`Only 1 Markdown file, for 1 day`

## Commands

### `open`

| Option                | Description                                     | Example                    |
| --------------------- | ----------------------------------------------- | -------------------------- |
| `-f, --format <date>` | Open a journal for a specific date (YYYY-MM-DD) | `nikki open -f 2025-03-11` |
| `-t, --today`         | Open today's journal                            | `nikki open -t`            |
| `-y, --yesterday`     | Open yesterday's journal                        | `nikki open -y`            |
| `-tm, --tomorrow`     | Open tomorrow's journal                         | `nikki open -tm`           |

### `ai`

| Option                  | Description                                                                             | Example                                    |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| `--from <date>`         | Specify the start date (cannot be used with `--year`, `--month`, `--day`)               | `nikki ai --from 2025-03-01`               |
| `--to <date>`           | Specify the end date (cannot be used with `--year`, `--month`, `--day`)                 | `nikki ai --to 2025-03-10`                 |
| `--year <YYYY>`         | Specify the year (cannot be used with `--from`, `--to`)                                 | `nikki ai --year 2025`                     |
| `--month <MM>`          | Specify the month (requires `--year`, cannot be used with `--from`, `--to`)             | `nikki ai --year 2025 --month 03`          |
| `--day <DD>`            | Specify the day (requires `--year` and `--month`, cannot be used with `--from`, `--to`) | `nikki ai --year 2025 --month 03 --day 10` |
| `-p, --prompt <string>` | Pass a prompt to ask the AI                                                             | `nikki ai -p "Summarize my entries"`       |
| `--data <file>`         | Specify a custom data file for the journal                                              | `nikki ai --data nikki.json`               |

