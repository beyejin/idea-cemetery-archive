import { FileText, LockKey, X } from "@phosphor-icons/react"
import { useEffect, useRef } from "react"

import type { Idea } from "../types"

interface IdeaDetailDialogProps {
  idea: Idea
  onClose: () => void
}

function formatDate(value: string | null) {
  if (!value) return "확인 필요"

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

export function IdeaDetailDialog({ idea, onClose }: IdeaDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const supportsModalDialog =
    typeof HTMLDialogElement !== "undefined" &&
    typeof HTMLDialogElement.prototype.showModal === "function"

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (supportsModalDialog && !dialog.open) dialog.showModal()
    closeButtonRef.current?.focus()

    return () => {
      if (dialog.open && typeof dialog.close === "function") dialog.close()
    }
  }, [supportsModalDialog])

  return (
    <dialog
      ref={dialogRef}
      className="idea-dialog"
      open={!supportsModalDialog}
      aria-labelledby="dialog-title"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog-panel">
        <header className="dialog-header">
          <div>
            <span className="dialog-source">{idea.sourceRound}</span>
            <h2 id="dialog-title">{idea.title}</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="상세 닫기">
            <X aria-hidden="true" />
          </button>
        </header>

        <p className="dialog-pitch">{idea.oneLinePitch}</p>

        {idea.killedBy ? (
          <dl className="dialog-killed-by">
            <div>
              <dt>Killed by</dt>
              <dd>{idea.killedBy}</dd>
            </div>
          </dl>
        ) : null}

        <dl className="date-grid">
          <div>
            <dt>제안일</dt>
            <dd>{formatDate(idea.proposedAt)}</dd>
          </div>
          <div>
            <dt>중단일</dt>
            <dd>{formatDate(idea.rejectedAt)}</dd>
          </div>
        </dl>

        <section>
          <h3>당시 판단</h3>
          <p>{idea.verdict}</p>
        </section>

        <section>
          <h3>남은 교훈</h3>
          <p>{idea.lessons}</p>
        </section>

        <section>
          <h3>보존 자료</h3>
          <ul className="artifact-list">
            {idea.artifacts.map((artifact) => (
              <li key={`${artifact.type}-${artifact.name}`}>
                <FileText aria-hidden="true" />
                <span>
                  <strong>{artifact.name}</strong>
                  <small>{artifact.note ?? "비공개 보관"}</small>
                </span>
                <LockKey aria-label="사이트 번들에 포함되지 않음" />
              </li>
            ))}
          </ul>
        </section>

        <div className="dialog-privacy">
          <LockKey aria-hidden="true" />
          원문 링크와 인물 정보는 공개 동의를 확인한 경우에만 표시합니다.
        </div>
      </div>
    </dialog>
  )
}
