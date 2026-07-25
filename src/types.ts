export const CAUSES = [
  "범위 과다",
  "차별성 부족",
  "시장 선점",
  "프론트엔드 부담",
  "기술 깊이 부족",
  "수익 모델 불명확",
  "팀 선택",
  "튜터 피드백",
  "일정 부족",
  "다른 아이디어에 흡수",
  "확인 필요",
] as const

export type Cause = (typeof CAUSES)[number]

export interface Artifact {
  name: string
  type: "pdf" | "md" | "zip" | "notion"
  available: boolean
  note?: string
}

export interface Idea {
  id: string
  title: string
  oneLinePitch: string
  proposedAt: string | null
  rejectedAt: string | null
  causes: Cause[]
  verdict: string
  lessons: string
  artifacts: Artifact[]
  resurrectedAs: string | null
  visibility: "private" | "summary" | "public"
  consentChecked: boolean
  sourceRound: string
}
