import { FormEvent, ReactNode, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

export function LoginGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setSubmitting(false)
  }

  // Still checking localStorage/session on first render.
  if (session === undefined) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Checking session…
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-lg border border-court-700 bg-court-900 p-8"
        >
          <h1 className="font-display text-2xl font-semibold text-slate-50">Sign in</h1>
          <p className="mt-1 text-sm text-slate-400">
            League admin access only. Accounts are created in Supabase, not here.
          </p>

          <label className="mt-6 block text-sm text-slate-300">
            Email
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-court-700 bg-court-950 px-3 py-2 text-slate-100 outline-none focus:border-volt focus:ring-1 focus:ring-volt"
            />
          </label>

          <label className="mt-4 block text-sm text-slate-300">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-court-700 bg-court-950 px-3 py-2 text-slate-100 outline-none focus:border-volt focus:ring-1 focus:ring-volt"
            />
          </label>

          {error && <p className="mt-4 text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-volt py-2 font-medium text-court-950 transition hover:brightness-95 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    )
  }

  return <>{children}</>
}

export function SignOutButton() {
  return (
    <button
      onClick={() => supabase.auth.signOut()}
      className="text-sm text-slate-400 underline decoration-dotted underline-offset-4 hover:text-slate-200"
    >
      Sign out
    </button>
  )
}
