import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { App } from "./App"

describe("App", () => {
  it("전체 공개 아카이브와 실제 자료 링크를 보여준다", async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText("전체 공개 아카이브")).toBeInTheDocument()
    expect(
      screen.getByText("아이디어와 제공받은 원문을 공개 아카이브로 보존합니다."),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "검은 항구 기록 열기" }))
    const dialog = screen.getByRole("dialog", { name: "검은 항구" })
    expect(
      within(dialog).getByRole("link", { name: /검은 항구 5분 룰북/ }),
    ).toHaveAttribute("href", expect.stringContaining("documents/black-harbor-rulebook.md"))
    expect(within(dialog).queryByText(/공개 동의/)).not.toBeInTheDocument()
  })

  it("검색어를 입력해도 검색창 이름을 유지한다", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole("searchbox", { name: "아이디어 검색" }), "수영")

    const searchbox = screen.getByRole("searchbox", { name: "아이디어 검색" })
    const clearButton = screen.getByRole("button", { name: "검색어 지우기" })

    expect(searchbox).toHaveValue("수영")
    expect(searchbox.closest("label")).toBeNull()
    expect(screen.getByText("아이디어 검색")).toHaveAttribute("for", "idea-search")
    expect(clearButton.closest("label")).toBeNull()
  })

  it("검색어와 일치하는 아이디어만 보여준다", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole("searchbox", { name: "아이디어 검색" }), "수영")

    expect(screen.getByText("Aqua Clash")).toBeInTheDocument()
    expect(screen.getByText("Race Maker: Poolside")).toBeInTheDocument()
    expect(screen.queryByText("Rumor Market")).not.toBeInTheDocument()
  })

  it("아이디어를 하나의 기록 목록으로 보여준다", () => {
    render(<App />)

    const list = screen.getByRole("list", { name: "아이디어 목록" })

    expect(within(list).getAllByRole("listitem")).toHaveLength(17)
    expect(list).toHaveClass("idea-list")
    expect(document.querySelector(".idea-grid")).not.toBeInTheDocument()
  })

  it("선택한 중단 원인에 해당하는 기록만 보여준다", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(
      screen.getByRole("combobox", { name: "중단 원인" }),
      "프론트엔드 부담",
    )

    const list = screen.getByRole("list", { name: "아이디어 목록" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(3)
    expect(screen.getByText("Abyss Crew")).toBeInTheDocument()
    expect(screen.queryByText("Bid Kingdom")).not.toBeInTheDocument()
  })

  it("판정자를 선택해 해당 기록만 보여주고 초기화한다", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Killed by" }),
      "밤송이클럽",
    )

    const filteredList = screen.getByRole("list", { name: "아이디어 목록" })
    expect(within(filteredList).getAllByRole("listitem")).toHaveLength(1)
    expect(screen.getByText("팩매치")).toBeInTheDocument()
    expect(screen.queryByText("검은 항구")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "검색과 필터 초기화" }))
    const resetList = screen.getByRole("list", { name: "아이디어 목록" })
    expect(within(resetList).getAllByRole("listitem")).toHaveLength(17)
  })

  it("판정자가 있는 카드에 KILLED BY 표식을 보여준다", () => {
    render(<App />)

    const openButton = screen.getByRole("button", { name: "검은 항구 기록 열기" })
    const card = openButton.closest("article")

    expect(card).not.toBeNull()
    expect(within(card as HTMLElement).getByText("KILLED BY")).toBeInTheDocument()
    expect(within(card as HTMLElement).getByText("성원 튜터님")).toBeInTheDocument()
  })

  it("상세 기록에서 승인된 판정자를 보여준다", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "검은 항구 기록 열기" }))

    const dialog = screen.getByRole("dialog", { name: "검은 항구" })
    expect(within(dialog).getByText("Killed by")).toBeInTheDocument()
    expect(within(dialog).getByText("성원 튜터님")).toBeInTheDocument()
  })

  it("카드에서 상세 기록을 열고 닫는다", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Aqua Clash 기록 열기" }))

    const dialog = screen.getByRole("dialog", { name: "Aqua Clash" })
    expect(within(dialog).getByText(/수영 지식이라는 개성/)).toBeInTheDocument()

    await user.click(within(dialog).getByRole("button", { name: "상세 닫기" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("결과가 없으면 empty state에서 검색을 초기화한다", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(
      screen.getByRole("searchbox", { name: "아이디어 검색" }),
      "달에 가는 고양이",
    )

    expect(screen.getByText("아직 묻힌 기록이 없습니다")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "검색과 필터 초기화" }))
    const list = screen.getByRole("list", { name: "아이디어 목록" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(17)
  })
})
