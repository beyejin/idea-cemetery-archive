import { describe, expect, it } from "vitest"

import * as ideaData from "./ideas"

const { ideas } = ideaData

describe("ideas data contract", () => {
  it("공개 요약 카드에 최종 프로젝트 후보를 포함한다", () => {
    expect(ideas).toHaveLength(19)
    expect(ideas.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["black-harbor", "pack-match", "ieum", "crewon"]),
    )
  })

  it("모든 id가 고유하다", () => {
    expect(new Set(ideas.map(({ id }) => id)).size).toBe(ideas.length)
  })

  it("실제 데이터의 승인된 판정자만 선택 옵션으로 제공한다", () => {
    const exports = ideaData as typeof ideaData & { allKillers?: string[] }

    expect(exports.allKillers).toEqual(["성원 튜터님", "밤송이 클럽"])
  })

  it("판정자가 확인된 기록에 판정자를 표시한다", () => {
    const records = JSON.parse(JSON.stringify(ideas)) as Array<{
      id: string
      killedBy?: string | null
    }>
    const judgedRecords = records.filter(({ killedBy }) => Boolean(killedBy))

    expect(judgedRecords.map(({ id, killedBy }) => ({ id, killedBy }))).toEqual([
      { id: "black-harbor", killedBy: "성원 튜터님" },
      { id: "pack-match", killedBy: "밤송이 클럽" },
      { id: "ieum", killedBy: "밤송이 클럽" },
      { id: "crewon", killedBy: "밤송이 클럽" },
    ])
  })

  it("비공개 상태 없이 확보한 원문만 공개 링크로 제공한다", () => {
    const records = JSON.parse(JSON.stringify(ideas)) as Array<{
      id: string
      artifacts: Array<Record<string, unknown>>
      [key: string]: unknown
    }>
    const artifacts = records.flatMap(({ artifacts }) => artifacts)

    expect(
      records.every((record) => !("visibility" in record) && !("consentChecked" in record)),
    ).toBe(true)
    expect(artifacts.every((artifact) => !("available" in artifact))).toBe(true)
    expect(artifacts.map(({ note }) => note).join(" ")).not.toContain("비공개")

    const blackHarbor = records.find(({ id }) => id === "black-harbor")
    const packMatch = records.find(({ id }) => id === "pack-match")
    const ieum = records.find(({ id }) => id === "ieum")
    const crewon = records.find(({ id }) => id === "crewon")
    expect(blackHarbor?.artifacts[0].url).toContain("documents/black-harbor-rulebook.md")
    expect(packMatch?.artifacts[0]).not.toHaveProperty("url")
    expect(packMatch?.artifacts[0].note).toBe("대화 첨부 원문 · 원본 미수집")
    expect(ieum?.artifacts[0].url).toContain("documents/ieum-plan-v2.md")
    expect(crewon?.artifacts[0].url).toContain("documents/crewon-team-plan.pdf")
  })

  it("공개 웹에서 사용할 수 없는 내부 파일 경로를 포함하지 않는다", () => {
    const serialized = JSON.stringify(ideas)

    expect(serialized).not.toMatch(/file:\/\/|slack\.com\/files/)
  })
})
