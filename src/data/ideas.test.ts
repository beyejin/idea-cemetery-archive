import { describe, expect, it } from "vitest"

import * as ideaData from "./ideas"

const { ideas } = ideaData

describe("ideas data contract", () => {
  it("공개 요약 카드에 검은 항구와 팩매치를 포함한다", () => {
    expect(ideas).toHaveLength(17)
    expect(ideas.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["black-harbor", "pack-match"]),
    )
  })

  it("모든 id가 고유하다", () => {
    expect(new Set(ideas.map(({ id }) => id)).size).toBe(ideas.length)
  })

  it("실제 데이터의 승인된 판정자만 선택 옵션으로 제공한다", () => {
    const exports = ideaData as typeof ideaData & { allKillers?: string[] }

    expect(exports.allKillers).toEqual(["성원 튜터님", "밤송이클럽"])
  })

  it("승인된 두 기록만 판정자와 공개 동의 상태를 가진다", () => {
    const records = JSON.parse(JSON.stringify(ideas)) as Array<{
      id: string
      killedBy?: string | null
      visibility: string
      consentChecked: boolean
    }>
    const approvedRecords = records.filter(({ killedBy }) => Boolean(killedBy))

    expect(approvedRecords.map(({ id, killedBy }) => ({ id, killedBy }))).toEqual([
      { id: "black-harbor", killedBy: "성원 튜터님" },
      { id: "pack-match", killedBy: "밤송이클럽" },
    ])
    expect(
      approvedRecords.every(
        ({ visibility, consentChecked }) => visibility === "summary" && consentChecked,
      ),
    ).toBe(true)
    expect(
      records
        .filter(({ killedBy }) => !killedBy)
        .every(({ visibility, consentChecked }) =>
          visibility === "private" && !consentChecked,
        ),
    ).toBe(true)
  })

  it("실명과 원본 파일 경로를 포함하지 않는다", () => {
    const serialized = JSON.stringify(ideas)
    const forbiddenNames = [
      "\uD55C\uC608\uC9C4",
      "\uC784\uC9C0\uD638",
      "\uC591\uC9C0\uC6D0",
    ]

    forbiddenNames.forEach((name) => expect(serialized).not.toContain(name))
    expect(serialized).not.toMatch(/file:\/\/|slack\.com\/files/)
    expect(ideas.flatMap(({ artifacts }) => artifacts).every(({ available }) => !available)).toBe(
      true,
    )
  })
})
