import { ArrowUpRight } from "@phosphor-icons/react"

import type { Idea } from "../types"

interface IdeaCardProps {
  idea: Idea
  index: number
  onOpen: (idea: Idea) => void
}

function formatProposedAt(value: string | null) {
  if (!value) return "시기 미상"

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`))
}

export function IdeaCard({ idea, index, onOpen }: IdeaCardProps) {
  return (
    <li
      className="idea-list-item"
      style={{ "--card-index": index } as React.CSSProperties}
    >
      <article className="idea-record">
        <span className="grave-marker" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>

        <div className="record-meta">
          <span>{formatProposedAt(idea.proposedAt)}</span>
          <small>{idea.sourceRound}</small>
        </div>

        <div className="record-copy">
          <h3>
            <button
              type="button"
              onClick={() => onOpen(idea)}
              aria-label={`${idea.title} 기록 열기`}
            >
              {idea.title}
            </button>
          </h3>
        <p>{idea.oneLinePitch}</p>
          <div className="cause-list" aria-label={`${idea.title} 중단 원인`}>
            {idea.causes.map((cause) => (
              <span key={cause}>{cause}</span>
            ))}
          </div>
          <span className="record-hint" aria-hidden="true">
            기록 열기
            <ArrowUpRight />
          </span>
        </div>
      </article>
    </li>
  )
}
