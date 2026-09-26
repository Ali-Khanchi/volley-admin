export interface Player {
  id: number
  name: string | null
}

export interface EventRow {
  id: number
  name: string | null
  type: string | null
  date: string | null // ISO date
}

export interface Team {
  id: number
  name: string | null
  captain_id: number | null
  event_id: number | null
}

export interface TeamMembership {
  id: number
  team_id: number | null
  player_id: number | null
}

export const MATCH_STAGES = ['round_robin', 'semi1', 'semi2', 'third', 'final'] as const
export type MatchStage = (typeof MATCH_STAGES)[number]

export interface Match {
  id: number
  match_order: number | null
  team0: number | null
  team1: number | null
  score0: number | null
  score1: number | null
  refs: string | null
  start_time: string | null // "HH:MM"
  event_id: number | null
  stage: MatchStage
}
