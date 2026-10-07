import { useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, inputClass } from './FormAtoms';
import { TeamForm } from './TeamForm';
import type { EventRow, Player, TeamWithRoster } from '../lib/types';

const NO_EVENT_GROUP = '__no_event__';

export function TeamsPage({
  teams,
  players,
  events,
  onChanged
}: {
  teams: TeamWithRoster[];
  players: Player[];
  events: EventRow[];
  onChanged: () => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; teams: TeamWithRoster[] }>();
    for (const team of teams) {
      const key =
        team.event_id != null ? String(team.event_id) : NO_EVENT_GROUP;
      const label =
        team.event_id != null
          ? (team.event_name ?? `Event #${team.event_id}`)
          : 'No event';
      if (!map.has(key)) map.set(key, { label, teams: [] });
      map.get(key)!.teams.push(team);
    }
    return [...map.entries()]
      .sort(([a], [b]) => {
        if (a === NO_EVENT_GROUP) return 1;
        if (b === NO_EVENT_GROUP) return -1;
        return b.localeCompare(a);
      })
      .map(([, g]) => g);
  }, [teams]);

  return (
    <div className="space-y-8">
      <TeamForm players={players} events={events} onSaved={onChanged} />

      <Card
        title="All teams"
        description={`${teams.length} team${teams.length === 1 ? '' : 's'}, grouped by event`}
      >
        <div className="max-h-[32rem] space-y-6 overflow-y-auto pr-1">
          {groups.length === 0 && (
            <p className="text-sm text-slate-500">No teams yet.</p>
          )}
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {group.label}
              </h3>
              <div className="space-y-3">
                {group.teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    players={players}
                    events={events}
                    onChanged={onChanged}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TeamCard({
  team,
  players,
  events,
  onChanged
}: {
  team: TeamWithRoster;
  players: Player[];
  events: EventRow[];
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(team.name ?? '');
  const [draftCaptain, setDraftCaptain] = useState(
    team.captain_id?.toString() ?? ''
  );
  const [draftEvent, setDraftEvent] = useState(team.event_id?.toString() ?? '');
  const [addPlayerId, setAddPlayerId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const availablePlayers = players.filter(
    (p) => !team.members.some((m) => m.player_id === p.id)
  );

  async function saveTeam() {
    const { error } = await supabase
      .from('teams')
      .update({
        name: draftName.trim(),
        captain_id: draftCaptain ? Number(draftCaptain) : null,
        event_id: draftEvent ? Number(draftEvent) : null
      })
      .eq('id', team.id);
    if (error) setError(error.message);
    else {
      setEditing(false);
      onChanged();
    }
  }

  async function deleteTeam() {
    if (
      !confirm(
        `Delete team "${team.name ?? team.id}"? This fails if matches still reference it.`
      )
    )
      return;
    const { error } = await supabase.from('teams').delete().eq('id', team.id);
    if (error) setError(error.message);
    else onChanged();
  }

  async function addPlayer() {
    if (!addPlayerId) return;
    const { error } = await supabase
      .from('team_memberships')
      .insert({ team_id: team.id, player_id: Number(addPlayerId) });
    if (error) setError(error.message);
    else {
      setAddPlayerId('');
      onChanged();
    }
  }

  async function removeMember(membershipId: number) {
    const { error } = await supabase
      .from('team_memberships')
      .delete()
      .eq('id', membershipId);
    if (error) setError(error.message);
    else onChanged();
  }

  return (
    <div className="rounded-md border border-court-700 bg-court-950 p-3">
      {error && <p className="mb-2 text-sm text-clay">{error}</p>}

      {editing ? (
        <div className="space-y-2">
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className={`${inputClass} mt-0`}
          />
          <select
            value={draftEvent}
            onChange={(e) => setDraftEvent(e.target.value)}
            className={inputClass}
          >
            <option value="">— no event —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name ?? `Event #${ev.id}`}
              </option>
            ))}
          </select>
          <select
            value={draftCaptain}
            onChange={(e) => setDraftCaptain(e.target.value)}
            className={inputClass}
          >
            <option value="">— no captain —</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? `Player #${p.id}`}
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              onClick={saveTeam}
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-100">
              #{team.id} — {team.name ?? `Team #${team.id}`}
            </p>
            <p className="text-xs text-slate-500">
              Captain: {team.captain_name ?? '—'}
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Edit
            </button>
            <button
              onClick={deleteTeam}
              className="text-sm text-clay hover:brightness-110"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 border-t border-court-800 pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Roster
        </p>
        {team.members.length === 0 && (
          <p className="text-sm text-slate-500">No players yet.</p>
        )}
        <ul className="space-y-1">
          {team.members.map((m) => (
            <li
              key={m.membership_id}
              className="flex items-center justify-between text-sm text-slate-200"
            >
              <span>{m.player_name ?? `Player #${m.player_id}`}</span>
              <button
                onClick={() => removeMember(m.membership_id)}
                className="text-xs text-clay hover:brightness-110"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex gap-2">
          <select
            value={addPlayerId}
            onChange={(e) => setAddPlayerId(e.target.value)}
            className={`${inputClass} mt-0`}
          >
            <option value="">Add player…</option>
            {availablePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? `Player #${p.id}`}
              </option>
            ))}
          </select>
          <button
            onClick={addPlayer}
            disabled={!addPlayerId}
            className="shrink-0 rounded-md bg-volt px-3 py-2 text-sm font-medium text-court-950 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
