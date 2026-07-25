import type { Cause, Idea } from "../types"

export function filterIdeas(
  ideas: Idea[],
  query: string,
  causes: Cause[],
  killedBy: string | null = null,
): Idea[] {
  const keyword = query.trim().toLocaleLowerCase("ko-KR")

  return ideas.filter((idea) => {
    const searchable = [idea.title, idea.oneLinePitch, idea.verdict, idea.lessons]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ko-KR")
    const matchesQuery = !keyword || searchable.includes(keyword)
    const matchesCause =
      causes.length === 0 || causes.some((cause) => idea.causes.includes(cause))
    const matchesKiller = !killedBy || idea.killedBy === killedBy

    return matchesQuery && matchesCause && matchesKiller
  })
}
