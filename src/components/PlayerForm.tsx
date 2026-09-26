import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, FieldLabel, inputClass, StatusMessage, SubmitButton } from './FormAtoms'

export function PlayerForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setStatus(null)
    const { error } = await supabase.from('players').insert({ name: name.trim() })
    setPending(false)
    if (error) {
      setStatus({ kind: 'error', text: error.message })
    } else {
      setStatus({ kind: 'success', text: `Added "${name.trim()}".` })
      setName('')
      onSaved()
    }
  }

  return (
    <Card title="Add player" description="Player names must be unique.">
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        <label>
          <FieldLabel>Name</FieldLabel>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Jane Doe"
          />
        </label>
        <SubmitButton pending={pending} label="Add player" />
        <StatusMessage status={status} />
      </form>
    </Card>
  )
}
