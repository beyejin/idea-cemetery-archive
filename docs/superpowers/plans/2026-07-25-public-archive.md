# 전체 공개 아카이브 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 실명과 제공 원문을 공개하는 단일 정책으로 사이트의 잠금 구조를 제거하고 실제 원문 링크를 제공한다.

**Architecture:** `Idea`의 개인정보 상태 필드를 없애고 `Artifact.url`의 존재만으로 링크 가능 여부를 표현한다. Notion 본문과 로컬 룰북은 `public/documents`에 정적 파일로 보존해 GitHub Pages에서 같은 출처로 제공한다.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, GitHub Pages

## Global Constraints

- 실명을 포함한 아이디어 기록과 사용자가 제공한 원문은 공개한다.
- 확인되지 않은 날짜와 판단 근거는 만들지 않는다.
- 원본을 확보하지 못한 파일은 `원본 미수집`으로 표시한다.
- 새로운 의존성을 추가하지 않는다.
- 기존 17개 아이디어와 검색·필터 기능을 유지한다.

---

### Task 1: 공개 데이터 계약과 회귀 테스트

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/data/ideas.test.ts`
- Modify: `src/types.ts`
- Modify: `src/data/ideas.json`

**Interfaces:**
- Consumes: 기존 `Idea`, `Artifact`, `ideas` 데이터
- Produces: `Artifact.url?: string`과 비공개 상태 필드가 없는 `Idea`

- [x] **Step 1: 공개 동작을 요구하는 실패 테스트 작성**

```tsx
it("공개 원문 아카이브와 실제 자료 링크를 보여준다", async () => {
  const user = userEvent.setup()
  render(<App />)

  expect(screen.getByText("전체 공개 아카이브")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "검은 항구 기록 열기" }))
  expect(screen.getByRole("link", { name: /검은 항구 5분 룰북/ })).toHaveAttribute(
    "href",
    expect.stringContaining("documents/black-harbor-rulebook.md"),
  )
  expect(screen.queryByText(/공개 동의/)).not.toBeInTheDocument()
})
```

```ts
it("비공개 상태 없이 확보한 원문만 공개 링크로 제공한다", () => {
  const records = JSON.parse(JSON.stringify(ideas)) as Array<Record<string, unknown>>
  const artifacts = ideas.flatMap(({ artifacts }) => artifacts)

  expect(records.every((record) => !("visibility" in record) && !("consentChecked" in record))).toBe(true)
  expect(artifacts.every((artifact) => !("available" in artifact))).toBe(true)
  expect(artifacts.map(({ note }) => note).join(" ")).not.toContain("비공개")
  expect(ideas.find(({ id }) => id === "black-harbor")?.artifacts[0].url).toContain(
    "documents/black-harbor-rulebook.md",
  )
  expect(ideas.find(({ id }) => id === "pack-match")?.artifacts[0]).not.toHaveProperty("url")
})
```

- [x] **Step 2: 테스트가 기존 잠금 정책 때문에 실패하는지 확인**

Run: `npm run test:run -- src/App.test.tsx src/data/ideas.test.ts`

Expected: `전체 공개 아카이브`, `Artifact.url`, 기존 비공개 필드 제거 기대가 실패한다.

- [x] **Step 3: 최소 데이터 계약 구현**

```ts
export interface Artifact {
  name: string
  type: "pdf" | "md" | "zip" | "notion"
  url?: string
  note?: string
}
```

`Idea`에서 `visibility`, `consentChecked`를 제거하고 각 아이디어의 Notion 자료에 `/documents/notion-ideas.md`를 연결한다. 검은 항구 자료에는 `/documents/black-harbor-rulebook.md`를 연결한다.

- [x] **Step 4: 데이터 테스트 재실행**

Run: `npm run test:run -- src/data/ideas.test.ts`

Expected: 데이터 계약 테스트가 통과하고 App 테스트는 아직 공개 UI가 없어 실패한다.

### Task 2: 공개 원문 UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/IdeaDetailDialog.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: `Artifact.url?: string`
- Produces: 원문 링크와 `원본 미수집` 상태를 구분하는 상세 화면

- [x] **Step 1: 공개 배지와 동적 링크 수 구현**

```ts
const publicArtifactCount = ideas.flatMap(({ artifacts }) => artifacts).filter(({ url }) => url).length
```

상단 배지를 `전체 공개 아카이브`, 세 번째 통계를 `공개 자료 링크`, 하단 문구를 공개 보존 정책으로 바꾼다.

- [x] **Step 2: 보존 자료 링크 구현**

```tsx
{artifact.url ? (
  <a href={`${import.meta.env.BASE_URL}${artifact.url.replace(/^\//, "")}`} target="_blank" rel="noreferrer">
    <FileText aria-hidden="true" />
    <span><strong>{artifact.name}</strong><small>{artifact.note}</small></span>
    <ArrowUpRight aria-hidden="true" />
  </a>
) : (
  <div><FileText aria-hidden="true" /><span><strong>{artifact.name}</strong><small>{artifact.note ?? "원본 미수집"}</small></span></div>
)}
```

잠금 아이콘과 상세 공개 동의 경고를 삭제한다.

- [x] **Step 3: 링크와 비링크 카드에 동일한 레이아웃 적용**

`.artifact-list li > a`와 `.artifact-list li > div`에 기존 카드 그리드 스타일을 적용하고 링크 hover/focus 상태를 추가한다.

- [x] **Step 4: UI 테스트 재실행**

Run: `npm run test:run -- src/App.test.tsx`

Expected: 공개 원문 동작과 기존 검색·필터 테스트가 모두 통과한다.

### Task 3: 원문 공개본과 운영 문서

**Files:**
- Create: `public/documents/notion-ideas.md`
- Create: `public/documents/black-harbor-rulebook.md`
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Modify: `docs/SESSION-HANDOFF.md`

**Interfaces:**
- Consumes: Notion `아이디어` 페이지와 로컬 `기타 자료/archive/검은 항구/rulebook.md`
- Produces: GitHub Pages가 정적으로 제공하는 두 Markdown URL

- [x] **Step 1: Notion 본문 공개본 생성**

본문, 토글, 표, 실명을 유지한다. Notion 내부 `file://` 토큰은 공개 링크가 아니므로 디코딩한 파일명과 `원본 파일 미수집` 문구로 바꾼다.

- [x] **Step 2: 검은 항구 룰북 복사**

로컬 원문을 내용 변경 없이 `public/documents/black-harbor-rulebook.md`에 보존한다.

- [x] **Step 3: 공개 정책 문서 반영**

README와 CONTRIBUTING의 익명화·비공개 원문 규칙을 전체 공개 정책으로 바꾸고, 인수인계 문서의 데이터 필드를 현재 계약과 맞춘다.

- [x] **Step 4: 전체 검증**

Run: `npm run test:run && npm run build && git diff --check`

Expected: 테스트 0 failures, build exit 0, whitespace 오류 없음. `dist/documents/notion-ideas.md`와 `dist/documents/black-harbor-rulebook.md`가 존재한다.

- [x] **Step 5: 명시적 파일만 커밋하고 main에 push**

```bash
git add README.md CONTRIBUTING.md docs/SESSION-HANDOFF.md docs/superpowers public/documents src/App.tsx src/App.test.tsx src/components/IdeaDetailDialog.tsx src/data/ideas.json src/data/ideas.test.ts src/styles.css src/types.ts
git commit -m "feat: 아이디어 원문 전체 공개"
git push origin main
```
