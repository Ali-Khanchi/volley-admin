import { useState } from 'react'
import { LoginGate, SignOutButton } from './components/LoginGate'
import { PlayerForm } from './components/PlayerForm'
import { EventForm } from './components/EventForm'
import { TeamForm } from './components/TeamForm'
import { TeamMembershipForm } from './components/TeamMembershipForm'
import { MatchForm } from './components/MatchForm'
import { useReferenceData } from './lib/useReferenceData'

const TABS = ['Players', 'Events', 'Teams', 'Rosters', 'Matches'] as const
type Tab = (typeof TABS)[number]

function AdminApp() {
  const [tab, setTab] = useState<Tab>('Players')
  const { players, events, teams, loading, error, refresh } = useReferenceData()

  return (
    <div className="mx-auto min-h-full max-w-3xl px-4 py-10">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-50">
            Volleyball League Admin
          </h1>
          <p className="mt-1 text-sm text-slate-400">Add players, events, teams, rosters and matches.</p>
        </div>
        <SignOutButton />
      </header>

      <nav className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t
                ? 'bg-volt text-court-950'
                : 'bg-court-900 text-slate-300 hover:bg-court-800'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {error && (
        <p className="mb-6 rounded-md border border-clay/40 bg-clay/10 px-4 py-2 text-sm text-clay">
          Couldn't load dropdown data: {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          {tab === 'Players' && <PlayerForm onSaved={refresh} />}
          {tab === 'Events' && <EventForm onSaved={refresh} />}
          {tab === 'Teams' && <TeamForm players={players} events={events} onSaved={refresh} />}
          {tab === 'Rosters' && (
            <TeamMembershipForm players={players} teams={teams} onSaved={refresh} />
          )}
          {tab === 'Matches' && <MatchForm events={events} teams={teams} onSaved={refresh} />}
        </>
      )}
    </div>
  )
}

export default function App() {
  return (
    <LoginGate>
      <AdminApp />
    </LoginGate>
  )
}
