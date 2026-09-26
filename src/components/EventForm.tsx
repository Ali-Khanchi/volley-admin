import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, FieldLabel, inputClass, StatusMessage, SubmitButton } from './FormAtoms'

export function EventForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [date, setDate] = useState('')
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setStatus(null)
    const { error } = await supabase.from('events').insert({
      name: name.trim(),
      type: type.trim() || null,
      date: date || undefined, // let the column default (now()) apply if left blank
    })
    setPending(false)
    if (error) {
      setStatus({ kind: 'error', text: error.message })
    } else {
      setStatus({ kind: 'success', text: `Added event "${name.trim()}".` })
      setName('')
      setType('')
      setDate('')
      onSaved()
    }
  }

  return (
    <Card title="Add event" description="A tournament, league night, or session.">
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        <label>
          <FieldLabel>Name</FieldLabel>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Fall League Night 3"
          />
        </label>
        <label>
          <FieldLabel>Type</FieldLabel>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
            placeholder="round_robin, tournament, pickup…"
          />
        </label>
        <label>
          <FieldLabel>Date</FieldLabel>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <SubmitButton pending={pending} label="Add event" />
        <StatusMessage status={status} />
      </form>
    </Card>
  )
}
