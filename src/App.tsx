import { useState } from 'react'
import { LoginGate, SignOutButton } from './components/LoginGate'
import { PlayerForm } from './components/PlayerForm'
import { PlayerList } from './components/PlayerList'
import { EventForm } from './components/EventForm'
import { EventList } from './components/EventList'
import { TeamsPage } from './components/TeamsPage'
import { MatchForm } from './components/MatchForm'
import { MatchList } from './components/MatchList'
import { useReferenceData } from './lib/useReferenceData'
import { useTeamsWithRoster } from './lib/useTeamsWithRoster'
import { useMatchesWithDetails } from './lib/useMatchesWithDetails'

const TABS = ['Players', 'Events', 'Teams', 'Matches'] as const
type Tab = (typeof TABS)[number]

function AdminApp() {
  const [tab, setTab] = useState<Tab>('Players')
  const { players, events, teams, loading, error, refresh } = useReferenceData()
  const {
    teams: teamsWithRoster,
    loading: teamsLoading,
    error: teamsError,
    refresh: refreshTeams,
  } = useTeamsWithRoster()
  const {
    matches,
    loading: matchesLoading,
    error: matchesError,
    refresh: refreshMatches,
  } = useMatchesWithDetails()

  // Any mutation anywhere can affect dropdowns elsewhere (e.g. a new player
  // should show up in the roster add-dropdown immediately), so refresh everything.
  async function refreshAll() {
    await Promise.all([refresh(), refreshTeams(), refreshMatches()])
  }

  const anyLoading = loading || teamsLoading || matchesLoading
  const anyError = error ?? teamsError ?? matchesError

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
              tab === t ? 'bg-volt text-court-950' : 'bg-court-900 text-slate-300 hover:bg-court-800'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {anyError && (
        <p className="mb-6 rounded-md border border-clay/40 bg-clay/10 px-4 py-2 text-sm text-clay">
          Couldn't load data: {anyError}
        </p>
      )}

      {anyLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-8">
          {tab === 'Players' && (
            <>
              <PlayerForm onSaved={refreshAll} />
              <PlayerList players={players} onChanged={refreshAll} />
            </>
          )}
          {tab === 'Events' && (
            <>
              <EventForm onSaved={refreshAll} />
              <EventList events={events} onChanged={refreshAll} />
            </>
          )}
          {tab === 'Teams' && (
            <TeamsPage teams={teamsWithRoster} players={players} events={events} onChanged={refreshAll} />
          )}
          {tab === 'Matches' && (
            <>
              <MatchForm events={events} teams={teams} onSaved={refreshAll} />
              <MatchList matches={matches} teams={teams} onChanged={refreshAll} />
            </>
          )}
        </div>
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
