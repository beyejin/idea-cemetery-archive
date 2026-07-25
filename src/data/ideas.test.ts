import { describe, expect, it } from "vitest"

import { ideas } from "./ideas"

describe("ideas data contract", () => {
  it("1차 공개 요약 카드 15개를 제공한다", () => {
    expect(ideas).toHaveLength(15)
  })

  it("모든 id가 고유하다", () => {
    expect(new Set(ideas.map(({ id }) => id)).size).toBe(ideas.length)
  })

  it("공개 동의 전까지 모든 카드를 private으로 둔다", () => {
    expect(ideas.every(({ visibility }) => visibility === "private")).toBe(true)
    expect(ideas.every(({ consentChecked }) => consentChecked === false)).toBe(true)
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
