<div align="center">

<img src="public/favicon.svg" width="76" alt="Spectra logo" />

# Spectra

**Eight things, one hidden gradient. Put them in order before the scale reveals the truth.**

A tiny daily game: every day you get one axis — calories, speed, year invented, bite force —
and eight things to drag into order from least to most. Lock it in and the scale lights up,
flinging each item to where it really belongs. You score points for every pair you got right,
so even a hunch pays off.

[![CI](https://github.com/viktor-lorentz/Spectra/actions/workflows/ci.yml/badge.svg)](https://github.com/viktor-lorentz/Spectra/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-a78bfa.svg)](LICENSE)
![React](https://img.shields.io/badge/React-18-0a0a12?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-0a0a12?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-0a0a12?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-rankings-0a0a12?logo=supabase)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-hosting-0a0a12?logo=cloudflare)

<br />

<img src="docs/screenshots/02-play.png" width="30%" alt="Dragging the tiles into order" />
<img src="docs/screenshots/03-results.png" width="30%" alt="The reveal and today's ranking" />
<img src="docs/screenshots/05-archive.png" width="30%" alt="The archive of past puzzles" />

</div>

---

## Why it's fun

Most trivia asks you to *know the exact answer*. Spectra only asks you to know **the order** —
and that's a much more forgiving, much more addictive question. Is an ostrich faster than a
greyhound? Which came first, the DVD or the iPod? You rarely know every value, but you usually
know *most* of the pairs, and the Kendall-tau score rewards exactly that. It spreads scores out
nicely, so the daily "you beat 94% of players" actually means something, and a round takes about
two minutes.

## Features

- 🎚️ **A new puzzle every day** at **00:00 UTC**, the same for everyone, with a live countdown to
  the next one. A full year is scheduled up front from a bank of **139 fact sets**.
- 🧠 **Smooth 0–1000 scoring** via normalized Kendall-tau distance — every correctly ordered pair
  earns points, a perfect order is 1000, a fully reversed one is 0.
- 📊 **Today's ranking** — after you finish, see where you landed on a live histogram of everyone's
  scores today, powered by a free Cloudflare Worker + D1 backend. Falls back to a built-in estimate
  when you're offline.
- 📈 **Local statistics** — games played, win rate, current & max streak, average score and a
  personal score distribution, all stored on your device.
- 🗓️ **Archive** — replay any past puzzle. Archive rounds never touch your streak or the daily
  ranking.
- 🔗 **Spoiler-free sharing** — copy a Wordle-style emoji grid that shows how close you got without
  giving away the answer.
- 🌗 **Dark & light themes**, mobile-first, with micro-animations and reduced-motion support.
- 🆓 **Completely free** — no ads, no accounts, no paywalls.

## Tech stack

| | |
|---|---|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Animation | Framer Motion (drag-to-reorder + the reveal) |
| Backend | Supabase (Postgres + RPC) for anonymous score aggregation |
| Tests | Vitest |
| Hosting | Cloudflare Pages (any static host works — Netlify, Vercel, GitHub Pages) |

The game is fully playable with **no backend at all** — the ranking just switches to a deterministic
offline estimate. The backend only exists to make "you beat X% of players today" real.

## Run it locally

```bash
# 1. install
npm install

# 2. (re)generate the puzzle schedule from the set bank
npm run generate

# 3. start the dev server
npm run dev          # http://localhost:5173
```

Other handy scripts:

```bash
npm test             # run the unit tests (scoring, scheduling, sharing, stats…)
npm run typecheck    # tsc --noEmit
npm run build        # production build into dist/
npm run preview      # serve the production build locally
```

Want the real ranking locally? Copy `.env.example` to `.env` and fill in your Supabase URL + anon
key (see below). Leave them empty to use the offline estimate.

## Deploy

### 1. The backend (Supabase) — free tier, ~3 minutes

Create a free project at [supabase.com](https://supabase.com), open **SQL Editor**, and run
[`supabase/schema.sql`](supabase/schema.sql). Then grab your **Project URL** and **anon key** from
**Settings → API**. Full walkthrough: [`supabase/README.md`](supabase/README.md).

**Anti-abuse built in:** Row Level Security locks the table so only two validated `SECURITY DEFINER`
functions are reachable; one score per player per day; strict range checks; the anonymous client id
is only ever stored as an `md5` dedupe hash.

### 2. The frontend — Cloudflare Pages (recommended)

1. Push this repo to GitHub, then in the Cloudflare dashboard: **Workers & Pages → Create → Pages →
   Connect to Git** and pick the repo.
2. Build settings: **Framework preset** `Vite`, **Build command** `npm run build`, **Output
   directory** `dist`.
3. Add two environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy. You get a free `https://spectra-xxxx.pages.dev` URL; add a custom domain anytime under
   the project's **Custom domains** tab (no code change needed).

The `public/_redirects` file already handles SPA fallback on Pages/Netlify.

<details>
<summary>Other hosts (Netlify, Vercel, GitHub Pages)</summary>

- **Netlify / Vercel** — framework preset "Vite", output `dist`, add the two `VITE_SUPABASE_*` env
  vars.
- **GitHub Pages** — this repo includes `.github/workflows/deploy-pages.yml`. Enable Pages
  (Settings → Pages → Source: GitHub Actions) and push to `main`. Add `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY` as repo **Variables** for live rankings.
</details>

> **Custom domain later:** share links adapt to wherever the app is served, so no code change is
> needed. For the richest link previews, you can also hard-code your final URL into the `og:url` /
> `og:image` tags in `index.html`.

## Adding more puzzles

All the content lives in one file: [`src/data/sets.json`](src/data/sets.json). Each entry is one
axis and its eight items:

```jsonc
{
  "id": "animal-landspeed",          // unique, stable slug
  "axis": "Land speed",              // shown as the title
  "prompt": "Order these animals from slowest to fastest on land.",
  "unit": "km/h",                    // appended to revealed values ("" for none)
  "lowLabel": "Slowest",
  "highLabel": "Fastest",
  "category": "animals",
  "format": "integer",               // "integer" | "number" | "year"
  "items": [
    { "name": "Hippo", "value": 30, "emoji": "🦛" },
    { "name": "Cheetah", "value": 112, "emoji": "🐆", "note": "Optional fun fact." }
    // …exactly 8, each with a DISTINCT value
  ]
}
```

Then regenerate the schedule:

```bash
npm run generate        # appends new future days; already-published dates never change
```

The generator **validates** every set (exactly 8 items, strictly distinct values) and lays future
days out as shuffled passes of the whole bank, so sets are spaced out and nothing published is ever
rewritten. Use `npm run generate:fresh` to rebuild the schedule from scratch (do this only before
launch).

> Ordering is graded on **relative order**, so exact values can be approximate — what matters is
> that the eight values sort into the intended order.

## How scoring works

Your order is compared to the true order with **normalized Kendall-tau**: with 8 items there are
28 pairs, and your score is `1000 × (concordant pairs ÷ 28)`. Get every pair right → 1000; reverse
everything → 0. The share grid marks each slot: 🟩 exact, 🟨 off by one, ⬛ further out.

## Project structure

```
src/
  data/        sets.json (the content) + generated puzzles.json (the schedule)
  lib/         scoring, daily scheduling, stats, ranking, sharing, formatting
  hooks/       useGame, useCountdown, useTheme
  components/  board, reveal, modals, charts…
scripts/       generate-puzzles.mjs
supabase/      schema.sql (the rankings backend) + setup guide
```

## License

MIT — see [LICENSE](LICENSE).
