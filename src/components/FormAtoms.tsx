import { ReactNode } from 'react'

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="block text-sm text-slate-300">{children}</span>
}

export const inputClass =
  'mt-1 w-full rounded-md border border-court-700 bg-court-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-volt focus:ring-1 focus:ring-volt'

export function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-md bg-volt px-4 py-2 text-sm font-medium text-court-950 transition hover:brightness-95 disabled:opacity-60"
    >
      {pending ? 'Saving…' : label}
    </button>
  )
}

export function StatusMessage({ status }: { status: { kind: 'success' | 'error'; text: string } | null }) {
  if (!status) return null
  return (
    <p className={`mt-3 text-sm ${status.kind === 'success' ? 'text-volt' : 'text-clay'}`}>
      {status.text}
    </p>
  )
}

export function Card({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-court-700 bg-court-900 p-6">
      <h2 className="font-display text-lg font-semibold text-slate-50">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  )
}
