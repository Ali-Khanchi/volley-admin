import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, FieldLabel, inputClass, StatusMessage, SubmitButton } from './FormAtoms'
import { DateFields } from './DateFields'
import { partsToIsoDate } from '../lib/dateParts'
import { EVENT_TYPES, type EventType } from '../lib/types'

const today = new Date()

export function EventForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<EventType>(EVENT_TYPES[0])
  const [day, setDay] = useState(today.getDate())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setStatus(null)
    const { error } = await supabase.from('events').insert({
      name: name.trim(),
      type,
      date: partsToIsoDate(day, month, year),
    })
    setPending(false)
    if (error) {
      setStatus({ kind: 'error', text: error.message })
    } else {
      setStatus({ kind: 'success', text: `Added event "${name.trim()}".` })
      setName('')
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
          <select value={type} onChange={(e) => setType(e.target.value as EventType)} className={inputClass}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          <FieldLabel>Date</FieldLabel>
          <DateFields day={day} month={month} year={year} onChange={({ day, month, year }) => {
            setDay(day)
            setMonth(month)
            setYear(year)
          }} />
        </label>
        <SubmitButton pending={pending} label="Add event" />
        <StatusMessage status={status} />
      </form>
    </Card>
  )
}
