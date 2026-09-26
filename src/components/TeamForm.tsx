import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, FieldLabel, inputClass, StatusMessage, SubmitButton } from './FormAtoms'
import type { EventRow, Player } from '../lib/types'

export function TeamForm({
  players,
  events,
  onSaved,
}: {
  players: Player[]
  events: EventRow[]
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [eventId, setEventId] = useState('')
  const [captainId, setCaptainId] = useState('')
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setStatus(null)
    const { error } = await supabase.from('teams').insert({
      name: name.trim(),
      event_id: eventId ? Number(eventId) : null,
      captain_id: captainId ? Number(captainId) : null,
    })
    setPending(false)
    if (error) {
      setStatus({ kind: 'error', text: error.message })
    } else {
      setStatus({ kind: 'success', text: `Added team "${name.trim()}".` })
      setName('')
      setEventId('')
      setCaptainId('')
      onSaved()
    }
  }

  return (
    <Card title="Add team" description="Assign it to an event and, optionally, a captain.">
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        <label>
          <FieldLabel>Name</FieldLabel>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="The Spikers"
          />
        </label>
        <label>
          <FieldLabel>Event</FieldLabel>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
            <option value="">— none —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name ?? `Event #${ev.id}`}
                {ev.date ? ` (${ev.date})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          <FieldLabel>Captain</FieldLabel>
          <select value={captainId} onChange={(e) => setCaptainId(e.target.value)} className={inputClass}>
            <option value="">— none —</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? `Player #${p.id}`}
              </option>
            ))}
          </select>
        </label>
        <SubmitButton pending={pending} label="Add team" />
        <StatusMessage status={status} />
      </form>
    </Card>
  )
}
