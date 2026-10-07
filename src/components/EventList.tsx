import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, inputClass } from './FormAtoms'
import { DateFields } from './DateFields'
import { isoDateToParts, partsToIsoDate } from '../lib/dateParts'
import { EVENT_TYPES, type EventRow, type EventType } from '../lib/types'

const currentYear = new Date().getFullYear()

export function EventList({ events, onChanged }: { events: EventRow[]; onChanged: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftType, setDraftType] = useState<EventType>(EVENT_TYPES[0])
  const [draftDate, setDraftDate] = useState({ day: 1, month: 1, year: currentYear })
  const [error, setError] = useState<string | null>(null)

  function startEdit(ev: EventRow) {
    setEditingId(ev.id)
    setDraftName(ev.name ?? '')
    setDraftType(
      (EVENT_TYPES as readonly string[]).includes(ev.type ?? '') ? (ev.type as EventType) : EVENT_TYPES[0],
    )
    setDraftDate(isoDateToParts(ev.date) ?? { day: 1, month: 1, year: currentYear })
    setError(null)
  }

  async function saveEdit(id: number) {
    const { error } = await supabase
      .from('events')
      .update({
        name: draftName.trim(),
        type: draftType,
        date: partsToIsoDate(draftDate.day, draftDate.month, draftDate.year),
      })
      .eq('id', id)
    if (error) setError(error.message)
    else {
      setEditingId(null)
      onChanged()
    }
  }

  async function handleDelete(id: number, name: string | null) {
    if (!confirm(`Delete event "${name ?? id}"? This fails if teams or matches still reference it.`)) return
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) setError(error.message)
    else onChanged()
  }

  return (
    <Card title="All events" description={`${events.length} event${events.length === 1 ? '' : 's'}`}>
      {error && <p className="mb-3 text-sm text-clay">{error}</p>}
      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {events.length === 0 && <p className="text-sm text-slate-500">No events yet.</p>}
        {events.map((ev) => (
          <div key={ev.id} className="rounded-md border border-court-700 bg-court-950 px-3 py-2">
            {editingId === ev.id ? (
              <div className="space-y-2">
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className={`${inputClass} mt-0`}
                  autoFocus
                />
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value as EventType)}
                  className={inputClass}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <DateFields
                  day={draftDate.day}
                  month={draftDate.month}
                  year={draftDate.year}
                  onChange={setDraftDate}
                />
                <div className="flex gap-3 pt-1">
                  <button onClick={() => saveEdit(ev.id)} className="text-sm font-medium text-volt hover:brightness-95">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-sm text-slate-400 hover:text-slate-200">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="text-slate-100">{ev.name ?? `Event #${ev.id}`}</span>
                  <span className="ml-2 text-slate-500">
                    {ev.type ?? '—'} · {ev.date ?? '—'}
                  </span>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => startEdit(ev)} className="text-sm text-slate-400 hover:text-slate-200">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(ev.id, ev.name)} className="text-sm text-clay hover:brightness-110">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
