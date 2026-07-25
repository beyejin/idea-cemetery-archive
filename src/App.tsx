import { Archive, LockKey, MagnifyingGlass, X } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { IdeaCard } from "./components/IdeaCard"
import { IdeaDetailDialog } from "./components/IdeaDetailDialog"
import { allCauses, allKillers, ideas } from "./data/ideas"
import { filterIdeas } from "./lib/filterIdeas"
import type { Cause, Idea } from "./types"

export function App() {
  const [query, setQuery] = useState("")
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null)
  const [selectedKiller, setSelectedKiller] = useState<string | null>(null)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const filteredIdeas = useMemo(
    () =>
      filterIdeas(
        ideas,
        query,
        selectedCause ? [selectedCause] : [],
        selectedKiller,
      ),
    [query, selectedCause, selectedKiller],
  )

  const resetFilters = () => {
    setQuery("")
    setSelectedCause(null)
    setSelectedKiller(null)
  }

  return (
    <>
      <header className="site-header">
        <nav className="topbar" aria-label="주요 탐색">
          <a className="brand" href="#top" aria-label="아이디어 공동묘지 처음으로">
            <Archive weight="duotone" aria-hidden="true" />
            <span>아이디어 공동묘지</span>
          </a>
          <span className="privacy-note">
            <LockKey weight="bold" aria-hidden="true" />
            원문 제외 아카이브
          </span>
        </nav>

        <section className="hero" id="top" aria-labelledby="page-title">
          <img
            className="hero-image"
            src={`${import.meta.env.BASE_URL}assets/idea-cemetery-hero.webp`}
            alt=""
            width="1536"
            height="1024"
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-scrim" />
          <div className="hero-copy">
            <p className="eyebrow">묻힌 아이디어 기록소</p>
            <h1 id="page-title">죽은 아이디어도 흔적은 남긴다.</h1>
            <p>팀의 선택과 현실 속에서 멈춘 아이디어를 이유와 배움으로 보존합니다.</p>
            <a className="primary-link" href="#archive">
              기록 살펴보기
            </a>
          </div>
        </section>

        <section className="archive-status" aria-label="아카이브 현황">
          <div>
            <strong>{ideas.length}</strong>
            <span>정규화한 아이디어</span>
          </div>
          <div>
            <strong>35</strong>
            <span>Notion 원문 섹션</span>
          </div>
          <div>
            <strong>0</strong>
            <span>번들에 포함한 원본</span>
          </div>
        </section>
      </header>

      <main id="archive" className="archive-main">
        <section className="archive-intro" aria-labelledby="archive-title">
          <h2 id="archive-title">남겨진 기록</h2>
          <p>
            검색하거나 중단 원인과 판정자를 골라, 그때의 판단과 다음 시도에 남길 교훈을
            확인하세요.
          </p>
        </section>

        <section className="controls" aria-label="아이디어 찾기">
          <div className="search-field">
            <label htmlFor="idea-search">아이디어 검색</label>
            <span className="search-input-wrap">
              <MagnifyingGlass aria-hidden="true" />
              <input
                id="idea-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="제목, 설명, 판단, 배움 검색"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기">
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </span>
          </div>

          <div className="cause-filter">
            <label className="filter-label" htmlFor="cause-select">
              중단 원인
            </label>
            <span className="select-wrap">
              <select
                id="cause-select"
                value={selectedCause ?? ""}
                onChange={(event) =>
                  setSelectedCause(
                    event.currentTarget.value ? (event.currentTarget.value as Cause) : null,
                  )
                }
              >
                <option value="">전체 원인</option>
              {allCauses.map((cause) => (
                  <option key={cause} value={cause}>
                    {cause}
                  </option>
              ))}
              </select>
            </span>
          </div>

          <div className="killer-filter">
            <label className="filter-label" htmlFor="killer-select">
              Killed by
            </label>
            <span className="select-wrap">
              <select
                id="killer-select"
                value={selectedKiller ?? ""}
                onChange={(event) => setSelectedKiller(event.currentTarget.value || null)}
              >
                <option value="">전체 판정자</option>
                {allKillers.map((killer) => (
                  <option key={killer} value={killer}>
                    {killer}
                  </option>
                ))}
              </select>
            </span>
          </div>
        </section>

        <div className="result-summary" aria-live="polite">
          <p>
            <strong>{filteredIdeas.length}</strong>개의 기록
          </p>
          {filteredIdeas.length > 0 && (query || selectedCause || selectedKiller) ? (
            <button className="text-button" type="button" onClick={resetFilters}>
              검색과 필터 초기화
            </button>
          ) : null}
        </div>

        {filteredIdeas.length ? (
          <ul className="idea-list" aria-label="아이디어 목록">
            {filteredIdeas.map((idea, index) => (
              <IdeaCard key={idea.id} idea={idea} index={index} onOpen={setSelectedIdea} />
            ))}
          </ul>
        ) : (
          <section className="empty-state" aria-labelledby="empty-title">
            <Archive weight="duotone" aria-hidden="true" />
            <h3 id="empty-title">아직 묻힌 기록이 없습니다</h3>
            <p>검색어를 바꾸거나 선택한 중단 원인을 지워 보세요.</p>
            <button className="primary-button" type="button" onClick={resetFilters}>
              검색과 필터 초기화
            </button>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>정규화한 요약과 공개 동의를 확인한 정보만 표시합니다.</p>
      </footer>

      {selectedIdea ? (
        <IdeaDetailDialog idea={selectedIdea} onClose={() => setSelectedIdea(null)} />
      ) : null}
    </>
  )
}
