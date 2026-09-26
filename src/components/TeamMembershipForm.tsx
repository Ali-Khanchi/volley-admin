import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, FieldLabel, inputClass, StatusMessage, SubmitButton } from './FormAtoms'
import type { Player, Team } from '../lib/types'

export function TeamMembershipForm({
  players,
  teams,
  onSaved,
}: {
  players: Player[]
  teams: Team[]
  onSaved: () => void
}) {
  const [teamId, setTeamId] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!teamId || !playerId) return
    setPending(true)
    setStatus(null)
    const { error } = await supabase.from('team_memberships').insert({
      team_id: Number(teamId),
      player_id: Number(playerId),
    })
    setPending(false)
    if (error) {
      setStatus({ kind: 'error', text: error.message })
    } else {
      setStatus({ kind: 'success', text: 'Added player to team.' })
      setPlayerId('')
      onSaved()
    }
  }

  return (
    <Card title="Add roster spot" description="Put a player on a team.">
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        <label>
          <FieldLabel>Team</FieldLabel>
          <select required value={teamId} onChange={(e) => setTeamId(e.target.value)} className={inputClass}>
            <option value="">Select a team…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name ?? `Team #${t.id}`}
              </option>
            ))}
          </select>
        </label>
        <label>
          <FieldLabel>Player</FieldLabel>
          <select required value={playerId} onChange={(e) => setPlayerId(e.target.value)} className={inputClass}>
            <option value="">Select a player…</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? `Player #${p.id}`}
              </option>
            ))}
          </select>
        </label>
        <SubmitButton pending={pending} label="Add to roster" />
        <StatusMessage status={status} />
      </form>
    </Card>
  )
}
