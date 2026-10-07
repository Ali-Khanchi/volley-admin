import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import type { MatchStage, MatchWithDetails } from './types'

type RawMatchRow = {
  id: number
  match_order: number | null
  team0: number | null
  team1: number | null
  score0: number | null
  score1: number | null
  refs: string | null
  start_time: string | null
  event_id: number | null
  stage: MatchStage
  event: { id: number; name: string | null } | null
  team0_info: { id: number; name: string | null } | null
  team1_info: { id: number; name: string | null } | null
}

export function useMatchesWithDetails() {
  const [matches, setMatches] = useState<MatchWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('matches')
      .select(
        `id, match_order, team0, team1, score0, score1, refs, start_time, event_id, stage,
         event:events!matches_event_id_fkey(id,name),
         team0_info:teams!matches_team0_fkey(id,name),
         team1_info:teams!matches_team1_fkey(id,name)`,
      )
      .order('match_order', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      const rows = (data ?? []) as unknown as RawMatchRow[]
      setMatches(
        rows.map((row) => ({
          id: row.id,
          match_order: row.match_order,
          team0: row.team0,
          team1: row.team1,
          team0_name: row.team0_info?.name ?? null,
          team1_name: row.team1_info?.name ?? null,
          score0: row.score0,
          score1: row.score1,
          refs: row.refs,
          start_time: row.start_time,
          event_id: row.event_id,
          event_name: row.event?.name ?? null,
          stage: row.stage,
        })),
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { matches, loading, error, refresh }
}
