# Spectra backend (Supabase)

The game is fully playable with **no backend** — the ranking just uses a deterministic
offline estimate. This optional backend makes the "you beat X% of players today" line and the
distribution curve **real**, using Supabase's free tier.

## Set it up (about 3 minutes)

1. Create a free project at [supabase.com](https://supabase.com) → **New project**.
2. Open **SQL Editor → New query**, paste the contents of [`schema.sql`](./schema.sql), and **Run**.
   This creates the `scores` table (locked down with Row Level Security) and the two functions
   the app calls: `submit_score` and `get_distribution`.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
4. Put those in your frontend environment:
   - Locally: copy `../.env.example` to `../.env` and fill them in.
   - On Cloudflare Pages / Netlify / Vercel: add them as build-time environment variables.

That's it. The app auto-detects the backend when both variables are present.

## How it stays safe & spam-resistant

- **Row Level Security is on with no table policies**, so the public anon key can't read or write
  the `scores` table directly. Everything goes through two `SECURITY DEFINER` functions.
- **One score per player per day** — the primary key `(day, client_hash)` makes resubmits no-ops.
- **Strict validation** — day and score ranges are checked server-side.
- **No PII** — the anonymous client id is only ever stored as an `md5` dedupe hash with the day.

Want stronger protection (per-IP limits, bot challenges)? Wrap `submit_score` in a Supabase Edge
Function and add rate limiting or a [Turnstile](https://www.cloudflare.com/products/turnstile/)
check there — the frontend contract (`submit_score` / `get_distribution`) stays the same.

## Quick test

```bash
curl -s "$VITE_SUPABASE_URL/rest/v1/rpc/get_distribution" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"p_day": 0}'
# -> {"buckets":[...20 zeros...],"total":0,"mean":0}
```
