const TABLE_PATTERN = /<table\b[^>]*>([\s\S]*?)<\/table>/gi
const ROW_PATTERN = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
const CELL_PATTERN = /<td\b[^>]*>([\s\S]*?)<\/td>/gi

function normalizeTableCell(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " / ")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\|/g, "\\|")
    .trim()
}

function convertNotionTables(source: string) {
  return source.replace(TABLE_PATTERN, (table, body: string) => {
    const rows = Array.from(body.matchAll(ROW_PATTERN), ([, row]) =>
      Array.from(row.matchAll(CELL_PATTERN), ([, cell]) => normalizeTableCell(cell)),
    ).filter((row) => row.length > 0)

    if (rows.length === 0) return table

    const columnCount = Math.max(...rows.map((row) => row.length))
    const fillRow = (row: string[]) => [...row, ...Array(columnCount - row.length).fill("")]
    const formatRow = (row: string[]) => `| ${fillRow(row).join(" | ")} |`

    return [
      formatRow(rows[0]),
      `| ${Array(columnCount).fill("---").join(" | ")} |`,
      ...rows.slice(1).map(formatRow),
    ].join("\n")
  })
}

export function prepareNotionMarkdown(source: string) {
  let detailsDepth = 0

  return convertNotionTables(source)
    .replace(/<br\s*\/?>/gi, "  \n")
    .split(/\r?\n/)
    .flatMap((line) => {
      const trimmed = line.trim()

      if (/^<details(?:\s[^>]*)?>$/i.test(trimmed)) {
        detailsDepth += 1
        return []
      }

      if (/^<\/details>$/i.test(trimmed)) {
        detailsDepth = Math.max(0, detailsDepth - 1)
        return []
      }

      const summary = trimmed.match(/^<summary>([\s\S]*?)<\/summary>$/i)
      if (summary) {
        const headingLevel = Math.min(detailsDepth + 1, 6)
        return `${"#".repeat(headingLevel)} ${summary[1].trim()}`
      }

      let preparedLine = line
      let removedTabs = 0

      while (removedTabs < detailsDepth && preparedLine.startsWith("\t")) {
        preparedLine = preparedLine.slice(1)
        removedTabs += 1
      }

      preparedLine = preparedLine.replace(/^\t+/, (tabs) => "  ".repeat(tabs.length))

      const heading = preparedLine.match(/^(#{1,6})(\s+.*)$/)
      if (heading && detailsDepth > 0) {
        const headingLevel = Math.min(heading[1].length + detailsDepth, 6)
        return `${"#".repeat(headingLevel)}${heading[2]}`
      }

      return preparedLine
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
