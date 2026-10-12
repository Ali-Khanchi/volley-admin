import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import type { EventRow, Player, Team } from './types'

// Central place that loads the lists every dropdown in the app pulls from,
// and exposes a refresh() so a form can update every dropdown right after
// it inserts a new row (e.g. adding a player should immediately show up
// in the "captain" dropdown on the Teams form).
export function useReferenceData() {
  const [players, setPlayers] = useState<Player[]>([])
  const [events, setEvents] = useState<EventRow[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedOnce = useRef(false)

  const refresh = useCallback(async () => {
    // Only block the UI with "Loading…" before the first load; later refreshes
    // (after add/edit/delete) run quietly so scroll position is preserved.
    if (!hasLoadedOnce.current) setLoading(true)
    setError(null)
    const [playersRes, eventsRes, teamsRes] = await Promise.all([
      supabase.from('players').select('id,name').order('name', { ascending: true }),
      supabase.from('events').select('id,name,type,date').order('date', { ascending: false }),
      supabase.from('teams').select('id,name,captain_id,event_id').order('name', { ascending: true }),
    ])

    const firstError = playersRes.error || eventsRes.error || teamsRes.error
    if (firstError) {
      setError(firstError.message)
    } else {
      setPlayers(playersRes.data ?? [])
      setEvents(eventsRes.data ?? [])
      setTeams(teamsRes.data ?? [])
    }
    hasLoadedOnce.current = true
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { players, events, teams, loading, error, refresh }
}
