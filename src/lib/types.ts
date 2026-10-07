export interface Player {
  id: number
  name: string | null
}

export const EVENT_TYPES = ['1v1', 'round_robin', 'tournament'] as const
export type EventType = (typeof EVENT_TYPES)[number]

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

// --- Joined shapes used by the list views ---

export interface TeamMember {
  membership_id: number
  player_id: number
  player_name: string | null
}

export interface TeamWithRoster {
  id: number
  name: string | null
  captain_id: number | null
  captain_name: string | null
  event_id: number | null
  event_name: string | null
  members: TeamMember[]
}

export interface MatchWithDetails {
  id: number
  match_order: number | null
  team0: number | null
  team1: number | null
  team0_name: string | null
  team1_name: string | null
  score0: number | null
  score1: number | null
  refs: string | null
  start_time: string | null
  event_id: number | null
  event_name: string | null
  stage: MatchStage
}
