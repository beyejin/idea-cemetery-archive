/// <reference types="node" />

import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import { prepareNotionMarkdown } from "./prepareNotionMarkdown"

describe("prepareNotionMarkdown", () => {
  it("Notion 토글과 표를 전체 문서용 Markdown으로 펼친다", () => {
    const source = `# 원문

<details>
<summary>예전 아이디어</summary>
\t<details>
\t<summary>1차</summary>
\t\t### 핵심 재미
\t\t<table header-row="true">
<tr><td>요소</td><td>적용 지점</td></tr>
<tr><td>동시성</td><td>충돌 처리</td></tr>
\t\t</table>
\t\t마지막 문장
\t</details>
</details>`

    const prepared = prepareNotionMarkdown(source)

    expect(prepared).toContain("## 예전 아이디어")
    expect(prepared).toContain("### 1차")
    expect(prepared).toContain("##### 핵심 재미")
    expect(prepared).toContain("| 요소 | 적용 지점 |")
    expect(prepared).toContain("| 동시성 | 충돌 처리 |")
    expect(prepared).toContain("마지막 문장")
    expect(prepared).not.toMatch(/<\/?(?:details|summary|table|tr|td)\b/)
  })

  it("보존된 Notion 원문을 처음부터 마지막 섹션까지 유지한다", () => {
    const source = readFileSync(resolve("public/documents/notion-ideas.md"), "utf8")

    const prepared = prepareNotionMarkdown(source)

    expect(prepared).toContain("# 아이디어 — Notion 원문 공개본")
    expect(prepared).toContain("## 팀원 기획서")
    expect(prepared).toContain("시맨틱_게임_아레나_기획서.pdf")
    expect(prepared).not.toMatch(/<\/?(?:details|summary|table|tr|td|colgroup|col)\b/)
  })
})
