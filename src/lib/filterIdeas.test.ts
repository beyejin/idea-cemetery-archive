import { describe, expect, it } from "vitest"

import type { Idea } from "../types"
import { filterIdeas } from "./filterIdeas"

const fixtures: Idea[] = [
  {
    id: "aqua-clash",
    title: "Aqua Clash",
    oneLinePitch: "수영장 레인을 점령하는 실시간 팀 전략 게임",
    proposedAt: null,
    rejectedAt: null,
    causes: ["프론트엔드 부담"],
    verdict: "시각화 범위가 컸다.",
    lessons: "수영 규칙을 몰라도 이해되는 룰이 필요하다.",
    artifacts: [],
    resurrectedAs: null,
    visibility: "private",
    consentChecked: false,
    sourceRound: "1차",
    killedBy: "성원 튜터님",
  },
  {
    id: "abyss-crew",
    title: "Abyss Crew",
    oneLinePitch: "심해 기지에서 협동하는 배신자 생존 게임",
    proposedAt: null,
    rejectedAt: null,
    causes: ["범위 과다"],
    verdict: "실시간 화면 구현 범위가 컸다.",
    lessons: "데모 장면과 MVP 범위를 함께 계산해야 한다.",
    artifacts: [],
    resurrectedAs: null,
    visibility: "private",
    consentChecked: false,
    sourceRound: "1차",
    killedBy: "밤송이클럽",
  },
]

describe("filterIdeas", () => {
  it("제목과 설명에서 검색한다", () => {
    expect(filterIdeas(fixtures, "수영", [])).toEqual([fixtures[0]])
  })

  it("선택한 원인 중 하나라도 포함한 아이디어만 남긴다", () => {
    expect(filterIdeas(fixtures, "", ["범위 과다"])).toEqual([fixtures[1]])
  })

  it("선택한 판정자의 아이디어만 남긴다", () => {
    expect(filterIdeas(fixtures, "", [], "밤송이클럽")).toEqual([fixtures[1]])
  })

  it("검색 결과가 없으면 빈 배열을 반환한다", () => {
    expect(filterIdeas(fixtures, "없는 말", [])).toEqual([])
  })
})
