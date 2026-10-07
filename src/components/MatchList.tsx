import { useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, inputClass } from './FormAtoms';
import {
  MATCH_STAGES,
  type MatchStage,
  type MatchWithDetails,
  type Team
} from '../lib/types';

const NO_EVENT_GROUP = '__no_event__';

export function MatchList({
  matches,
  teams,
  onChanged
}: {
  matches: MatchWithDetails[];
  teams: Team[];
  onChanged: () => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { label: string; matches: MatchWithDetails[] }
    >();
    for (const m of matches) {
      const key = m.event_id != null ? String(m.event_id) : NO_EVENT_GROUP;
      const label =
        m.event_id != null
          ? (m.event_name ?? `Event #${m.event_id}`)
          : 'No event';
      if (!map.has(key)) map.set(key, { label, matches: [] });
      map.get(key)!.matches.push(m);
    }
    return [...map.entries()]
      .sort(([a], [b]) => {
        if (a === NO_EVENT_GROUP) return 1;
        if (b === NO_EVENT_GROUP) return -1;
        return b.localeCompare(a);
      })
      .map(([, g]) => g);
  }, [matches]);

  return (
    <Card
      title="All matches"
      description={`${matches.length} match${matches.length === 1 ? '' : 'es'}, grouped by event`}
    >
      <div className="max-h-[32rem] space-y-6 overflow-y-auto pr-1">
        {groups.length === 0 && (
          <p className="text-sm text-slate-500">No matches yet.</p>
        )}
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </h3>
            <div className="space-y-3">
              {group.matches.map((m) => (
                <MatchRow
                  key={m.id}
                  match={m}
                  teams={teams}
                  onChanged={onChanged}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MatchRow({
  match,
  teams,
  onChanged
}: {
  match: MatchWithDetails;
  teams: Team[];
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [team0, setTeam0] = useState(match.team0?.toString() ?? '');
  const [team1, setTeam1] = useState(match.team1?.toString() ?? '');
  const [score0, setScore0] = useState(match.score0?.toString() ?? '');
  const [score1, setScore1] = useState(match.score1?.toString() ?? '');
  const [stage, setStage] = useState<MatchStage>(match.stage);
  const [startTime, setStartTime] = useState(match.start_time ?? '');
  const [matchOrder, setMatchOrder] = useState(
    match.match_order?.toString() ?? ''
  );
  const [refs, setRefs] = useState(match.refs ?? '');
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const { error } = await supabase
      .from('matches')
      .update({
        team0: team0 ? Number(team0) : null,
        team1: team1 ? Number(team1) : null,
        score0: score0 === '' ? null : Number(score0),
        score1: score1 === '' ? null : Number(score1),
        stage,
        start_time: startTime || null,
        match_order: matchOrder === '' ? null : Number(matchOrder),
        refs: refs.trim() || null
      })
      .eq('id', match.id);
    if (error) setError(error.message);
    else {
      setEditing(false);
      onChanged();
    }
  }

  async function remove() {
    if (!confirm('Delete this match?')) return;
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', match.id);
    if (error) setError(error.message);
    else onChanged();
  }

  return (
    <div className="rounded-md border border-court-700 bg-court-950 p-3">
      {error && <p className="mb-2 text-sm text-clay">{error}</p>}
      {editing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={team0}
              onChange={(e) => setTeam0(e.target.value)}
              className={inputClass}
            >
              <option value="">— none —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? `Team #${t.id}`}
                </option>
              ))}
            </select>
            <select
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              className={inputClass}
            >
              <option value="">— none —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? `Team #${t.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={score0}
              onChange={(e) => setScore0(e.target.value)}
              className={inputClass}
              placeholder="Score 0"
            />
            <input
              type="number"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              className={inputClass}
              placeholder="Score 1"
            />
          </div>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as MatchStage)}
            className={inputClass}
          >
            {MATCH_STAGES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              value={matchOrder}
              onChange={(e) => setMatchOrder(e.target.value)}
              className={inputClass}
              placeholder="Order"
            />
          </div>
          <input
            value={refs}
            onChange={(e) => setRefs(e.target.value)}
            className={inputClass}
            placeholder="Refs"
          />
          <div className="flex gap-3 pt-1">
            <button
              onClick={save}
              className="text-sm font-medium text-volt hover:brightness-95"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-slate-100">
              {match.team0_name ?? '—'} vs {match.team1_name ?? '—'}
            </span>
            <span className="ml-2 text-slate-500">
              {match.score0 ?? '-'}:{match.score1 ?? '-'} ·{' '}
              {match.stage.replace('_', ' ')}
              {match.start_time ? ` · ${match.start_time}` : ''}
            </span>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Edit
            </button>
            <button
              onClick={remove}
              className="text-sm text-clay hover:brightness-110"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
