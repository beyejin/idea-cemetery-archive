import rawIdeas from "./ideas.json"

import { CAUSES, type Cause, type Idea } from "../types"

export const ideas = rawIdeas as Idea[]

export const allCauses: Cause[] = CAUSES.filter((cause) =>
  ideas.some((idea) => idea.causes.includes(cause)),
)

export const allKillers = Array.from(
  new Set(ideas.flatMap(({ killedBy }) => (killedBy ? [killedBy] : []))),
)
