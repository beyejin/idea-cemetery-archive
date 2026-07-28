import { X } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { prepareNotionMarkdown } from "../lib/prepareNotionMarkdown"
import type { Artifact } from "../types"

interface NotionViewerDialogProps {
  artifact: Artifact
  onClose: () => void
}

export function NotionViewerDialog({ artifact, onClose }: NotionViewerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [source, setSource] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const documentUrl = `${import.meta.env.BASE_URL}${artifact.url?.replace(/^\//, "") ?? ""}`
  const markdown = useMemo(
    () => (source === null ? "" : prepareNotionMarkdown(source)),
    [source],
  )
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

  useEffect(() => {
    const controller = new AbortController()

    setSource(null)
    setError(false)

    void fetch(documentUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`문서 요청 실패: ${response.status}`)
        return response.text()
      })
      .then(setSource)
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return
        setError(true)
      })

    return () => controller.abort()
  }, [documentUrl])

  return (
    <dialog
      ref={dialogRef}
      className="notion-viewer"
      open={!supportsModalDialog}
      aria-labelledby="notion-viewer-title"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="notion-viewer-shell">
        <header className="notion-viewer-header">
          <div>
            <span>전체 공개 원문</span>
            <h2 id="notion-viewer-title">{artifact.name}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="문서 뷰어 닫기"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="notion-viewer-body">
          {source === null && !error ? (
            <p className="notion-viewer-status" role="status">
              원문 파일을 불러오는 중입니다.
            </p>
          ) : null}
          {error ? (
            <p className="notion-viewer-status" role="alert">
              원문 파일을 불러오지 못했습니다.
            </p>
          ) : null}
          {source !== null ? (
            <article className="notion-document">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={href?.startsWith("http") ? "noreferrer" : undefined}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </article>
          ) : null}
        </div>
      </div>
    </dialog>
  )
}
