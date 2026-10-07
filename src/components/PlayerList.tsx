import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, inputClass } from './FormAtoms'
import type { Player } from '../lib/types'

export function PlayerList({ players, onChanged }: { players: Player[]; onChanged: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function startEdit(p: Player) {
    setEditingId(p.id)
    setDraftName(p.name ?? '')
    setError(null)
  }

  async function saveEdit(id: number) {
    const { error } = await supabase.from('players').update({ name: draftName.trim() }).eq('id', id)
    if (error) setError(error.message)
    else {
      setEditingId(null)
      onChanged()
    }
  }

  async function handleDelete(id: number, name: string | null) {
    if (!confirm(`Delete player "${name ?? id}"? This fails if they're a captain or on a roster.`)) return
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) setError(error.message)
    else onChanged()
  }

  return (
    <Card title="All players" description={`${players.length} player${players.length === 1 ? '' : 's'}`}>
      {error && <p className="mb-3 text-sm text-clay">{error}</p>}
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {players.length === 0 && <p className="text-sm text-slate-500">No players yet.</p>}
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-md border border-court-700 bg-court-950 px-3 py-2"
          >
            {editingId === p.id ? (
              <>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className={`${inputClass} mt-0`}
                  autoFocus
                />
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => saveEdit(p.id)} className="text-sm font-medium text-volt hover:brightness-95">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-sm text-slate-400 hover:text-slate-200">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm text-slate-100">{p.name ?? `Player #${p.id}`}</span>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => startEdit(p)} className="text-sm text-slate-400 hover:text-slate-200">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id, p.name)} className="text-sm text-clay hover:brightness-110">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
