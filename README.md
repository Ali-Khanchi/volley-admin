# Volleyball League Admin

A small React + Vite + TypeScript + Tailwind app for adding rows to the
`volleyball` Supabase schema: players, events, teams, roster memberships,
and matches. Foreign keys (captain, event, teams, players) are dropdowns
populated live from the database.

## 1. Setup

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npm run dev             # http://localhost:5173
```

`npm run build && npm run preview` produces a static production build and
serves it (also fine to serve `dist/` with any static file server or nginx).

## 2. Supabase setup checklist

1. **Expose the schema.** In Supabase: Project Settings → API → "Exposed
   schemas" → add `volleyball` (only `public` is exposed by default).
2. **Run `supabase/security.sql`** in the SQL editor. It enables Row Level
   Security on every table and adds policies so only signed-in
   (`authenticated`) users can read or write — the anon key by itself can't
   touch any data.
3. **Disable public sign-ups**: Authentication → Providers → Email → turn
   off "Allow new users to sign up". Then create accounts yourself for
   whoever should have access: Authentication → Users → "Add user" (set a
   password directly, or send an invite email). This keeps the login screen
   real but closed to anyone but people you added.
4. Use the **anon/public key** in `.env` — never the `service_role` key.
   The service_role key bypasses RLS entirely and must never reach a
   browser bundle.

If you'd rather not deal with per-user accounts at all, you can create a
single shared login for "the admin" — Supabase Auth doesn't care whether
one person or five use one account, it only matters that the RLS policies
gate on `authenticated`.

## 3. Why this is reasonably safe on a home network + VPN

The main risks for a self-hosted internal tool like this are: (a) someone
outside your trusted network reaching the app, and (b) the app itself
having a weak boundary between "can view the page" and "can write to the
database". This setup addresses both:

- **Network boundary**: don't port-forward this on your router. Only reach
  it over your VPN (WireGuard, Tailscale, etc.), so the app is never
  addressable from the public internet at all — that removes most
  automated scanning/attack traffic as a concern outright.
- **App boundary**: the frontend ships only the Supabase anon key, which is
  meant to be public — it's useless without a valid session because of the
  RLS policies above. Even if someone found your LAN/VPN IP, they'd hit the
  login screen and, without an account you created, could not read or
  write any row.
- **No service_role key ever in the browser.** This is the single most
  important rule with Supabase: the service_role key is equivalent to
  root/superuser on your database and must only ever live server-side (it
  isn't used anywhere in this app).

### A few things worth adding if you want to go further

- **HTTPS even on the LAN.** Browsers increasingly want secure contexts for
  some APIs, and it avoids ever sending credentials in plaintext. Easiest
  paths: `tailscale serve` (gives you a real HTTPS cert automatically if
  you use Tailscale) or a self-signed cert via `mkcert` for your LAN
  hostname.
- **Restrict Supabase Auth redirect/site URLs** in Authentication → URL
  Configuration to just your app's URL, so a leaked magic link can't be
  replayed from elsewhere.
- **Turn on Supabase's rate limiting / leaked-password protection**
  (Authentication → Policies) as extra hardening against credential
  stuffing, even though only a couple of accounts will exist.
- **Least-privilege policies**: the provided `security.sql` allows *any*
  authenticated user to read/write *everything*. If you have multiple
  organizers and want to restrict deletes, or make match results
  read-only for some people, tighten the `using`/`with check` clauses
  (the file has a commented-out example that allowlists by email).
- **Reverse proxy + Basic Auth as a second layer** (e.g. nginx or Caddy in
  front of the built static files) is a cheap extra speed bump if you want
  defense-in-depth beyond Supabase Auth, though with RLS in place it's
  optional rather than load-bearing.
- **Back up your database** (Supabase does daily backups on paid tiers;
  on the free tier, periodically export via `pg_dump` or the dashboard)
  since this is now the system of record for your league.

## 4. Project structure

```
src/
  lib/
    supabaseClient.ts   # single Supabase client, reads env vars only
    types.ts            # TS types mirroring the schema
    useReferenceData.ts # loads players/events/teams for dropdowns
  components/
    LoginGate.tsx        # Supabase Auth email/password gate
    FormAtoms.tsx         # shared input/button/card styling
    PlayerForm.tsx
    EventForm.tsx
    TeamForm.tsx
    TeamMembershipForm.tsx
    MatchForm.tsx
  App.tsx                 # tab navigation between the five forms
supabase/
  security.sql            # RLS setup — run this in Supabase's SQL editor
```
