import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import type { MatchStage, MatchWithDetails } from './types';

type RawMatchRow = {
  id: number;
  match_order: number | null;
  team0: number | null;
  team1: number | null;
  score0: number | null;
  score1: number | null;
  refs: string | null;
  start_time: string | null;
  event_id: number | null;
  stage: MatchStage;
  events: { id: number; name: string | null; date: string } | null;
  team0_info: { id: number; name: string | null } | null;
  team1_info: { id: number; name: string | null } | null;
  isFriendly: boolean;
};

export function useMatchesWithDetails() {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const refresh = useCallback(async () => {
    // Only block the UI with "Loading…" before the first load; later refreshes
    // (after add/edit/delete) run quietly so scroll position is preserved.
    if (!hasLoadedOnce.current) setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('matches')
      .select(
        `id, match_order, team0, team1, score0, score1, refs, start_time, event_id, stage, isFriendly,
         team0_info:teams!matches_team0_fkey(id,name),
         team1_info:teams!matches_team1_fkey(id,name),
         events (
            id, name, date
         )`
      )
      .order('events(date)', { ascending: false })
      .order('match_order', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      const rows = (data ?? []) as unknown as RawMatchRow[];
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
          event_name: row.events?.name ?? null,
          stage: row.stage,
          isFriendly: row.isFriendly
        }))
      );
    }
    hasLoadedOnce.current = true;
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  console.log(matches);

  return { matches, loading, error, refresh };
}
