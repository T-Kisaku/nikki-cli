# nik-cl

## Motto

> "Only one Markdown file per day."

## Commands

### `edit`

Create or modify a journal entry for a specific date.

```sh
nik edit [date-spec] [options]
```

#### Options

| Option                      | Description                                                               | Example                 |
| --------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| `-t, --template <template>` | Apply a predefined template from the `journal_folder/template` directory. | `nik edit -t daily-log` |

#### Templates

Templates are stored in the `journal_folder/template` directory. Each template is a Markdown (`.md`) file that contains pre-defined content structures. To create or modify a template, navigate to the `template` folder inside your journal directory and add or edit `.md` files.

Example:

```sh
mkdir -p ~/journal/template
nano ~/journal/template/daily-log.md
```

You can then use the template with:

```sh
nik edit -t daily-log
```

### `ask`

Query your journal with flexible date filters.

```sh
nik ask [prompt] [options]
```

#### Options

| Option                        | Description                                                | Example                     |
| ----------------------------- | ---------------------------------------------------------- | --------------------------- |
| `--from <date-spec>`          | Specify the start date (cannot be used with `--date-spec`) | `nik ask --from 2025.03.01` |
| `--to <date-spec>`            | Specify the end date (cannot be used with `--date-spec`)   | `nik ask --to 2025.03.10`   |
| `-d, --date-spec <date-spec>` | Filter by a specific year, month, or day                   | `nik ask -d 2025`           |

### `md-to-json`

Convert Markdown journal files into JSON format.

```sh
nik md-to-json [md-files] [json-file] [options]
```

#### Options

| Option         | Description                                       |
| -------------- | ------------------------------------------------- |
| `-u, --update` | Skip conversion if the latest data already exists |

### `help`

Display available commands and usage details.

```sh
nik help
```

You can also get help for a specific command:

```sh
nik help <command>
```

Example:

```sh
nik help edit
```

## Configuration

You can configure `nik-cl` by placing a configuration file in `~/.nikconfig` or `~/.config/nik`.

```conf
journal_folder = "path/to/journal"
edit_command = "your_editor"
```

## JSON Format Structure

Converted journal entries follow this JSON structure:

```json
{
  "[year]": {
    "[month]": {
      "[date]": {
        "last-edited": "[timestamp]",
        "content": {
          "Title of #": {
            "text": "Main content here",
            "subsections": {
              "Title of ##": {
                "text": "Subcontent here",
                "subsections": {
                  "Title of ###": {
                    "text": "Nested content here"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## Date Specifications

You can specify dates using:

```plain
YYYY.MM.DD  | YYYY.MM  | YYYY  | yesterday  | today  | tomorrow
```

---

This revision improves clarity, formatting, and consistency while keeping the content concise and user-friendly.
