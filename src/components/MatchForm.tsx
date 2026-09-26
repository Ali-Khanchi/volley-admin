import { FormEvent, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, FieldLabel, inputClass, StatusMessage, SubmitButton } from './FormAtoms'
import { MATCH_STAGES, type EventRow, type Team } from '../lib/types'

export function MatchForm({
  events,
  teams,
  onSaved,
}: {
  events: EventRow[]
  teams: Team[]
  onSaved: () => void
}) {
  const [eventId, setEventId] = useState('')
  const [team0, setTeam0] = useState('')
  const [team1, setTeam1] = useState('')
  const [score0, setScore0] = useState('')
  const [score1, setScore1] = useState('')
  const [refs, setRefs] = useState('')
  const [startTime, setStartTime] = useState('')
  const [stage, setStage] = useState<(typeof MATCH_STAGES)[number]>('round_robin')
  const [matchOrder, setMatchOrder] = useState('')
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  // If an event is picked, narrow the team dropdowns to that event's teams.
  const teamOptions = useMemo(() => {
    if (!eventId) return teams
    return teams.filter((t) => String(t.event_id) === eventId)
  }, [teams, eventId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (team0 && team1 && team0 === team1) {
      setStatus({ kind: 'error', text: 'Team 0 and Team 1 must be different.' })
      return
    }
    setPending(true)
    setStatus(null)
    const { error } = await supabase.from('matches').insert({
      event_id: eventId ? Number(eventId) : null,
      team0: team0 ? Number(team0) : null,
      team1: team1 ? Number(team1) : null,
      score0: score0 === '' ? null : Number(score0),
      score1: score1 === '' ? null : Number(score1),
      refs: refs.trim() || null,
      start_time: startTime || null,
      stage,
      match_order: matchOrder === '' ? null : Number(matchOrder),
    })
    setPending(false)
    if (error) {
      setStatus({ kind: 'error', text: error.message })
    } else {
      setStatus({ kind: 'success', text: 'Match added.' })
      setTeam0('')
      setTeam1('')
      setScore0('')
      setScore1('')
      setRefs('')
      setStartTime('')
      setMatchOrder('')
      onSaved()
    }
  }

  return (
    <Card title="Add match" description="Scores and results can be left blank and filled in later.">
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        <label>
          <FieldLabel>Event</FieldLabel>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
            <option value="">— none —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name ?? `Event #${ev.id}`}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <FieldLabel>Team 0</FieldLabel>
            <select value={team0} onChange={(e) => setTeam0(e.target.value)} className={inputClass}>
              <option value="">— none —</option>
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? `Team #${t.id}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            <FieldLabel>Team 1</FieldLabel>
            <select value={team1} onChange={(e) => setTeam1(e.target.value)} className={inputClass}>
              <option value="">— none —</option>
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? `Team #${t.id}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <FieldLabel>Score 0</FieldLabel>
            <input
              type="number"
              value={score0}
              onChange={(e) => setScore0(e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <FieldLabel>Score 1</FieldLabel>
            <input
              type="number"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label>
          <FieldLabel>Stage</FieldLabel>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as typeof stage)}
            className={inputClass}
          >
            {MATCH_STAGES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <FieldLabel>Start time</FieldLabel>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <FieldLabel>Match order</FieldLabel>
            <input
              type="number"
              value={matchOrder}
              onChange={(e) => setMatchOrder(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label>
          <FieldLabel>Refs</FieldLabel>
          <input
            value={refs}
            onChange={(e) => setRefs(e.target.value)}
            className={inputClass}
            placeholder="Free text — e.g. team name on ref duty"
          />
        </label>

        <SubmitButton pending={pending} label="Add match" />
        <StatusMessage status={status} />
      </form>
    </Card>
  )
}
