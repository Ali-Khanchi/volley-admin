import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import type { TeamWithRoster } from './types'

type RawTeamRow = {
  id: number
  name: string | null
  captain_id: number | null
  event_id: number | null
  captain: { id: number; name: string | null } | null
  event: { id: number; name: string | null } | null
  team_memberships: { id: number; player: { id: number; name: string | null } | null }[]
}

export function useTeamsWithRoster() {
  const [teams, setTeams] = useState<TeamWithRoster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('teams')
      .select(
        `id, name, captain_id, event_id,
         captain:players!teams_captain_id_fkey(id,name),
         event:events!teams_event_id_fkey(id,name),
         team_memberships(id, player:players!team_memberships_player_id_fkey(id,name))`,
      )
      .order('name', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      const rows = (data ?? []) as unknown as RawTeamRow[]
      setTeams(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          captain_id: row.captain_id,
          captain_name: row.captain?.name ?? null,
          event_id: row.event_id,
          event_name: row.event?.name ?? null,
          members: row.team_memberships.map((m) => ({
            membership_id: m.id,
            player_id: m.player?.id ?? 0,
            player_name: m.player?.name ?? null,
          })),
        })),
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { teams, loading, error, refresh }
}
