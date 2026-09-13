# QuestLife — Frontend

React + Vite + TypeScript + Tailwind CSS frontend for QuestLife, wired to
the backend in `server.zip`. **Read `NOTES.md` first** — it documents
exactly which screens use real backend data and which use clearly-marked
local stand-ins for endpoints the backend doesn't have yet.

## Setup

```bash
npm install
cp .env.example .env   # edit VITE_API_URL if your backend isn't on :4000
npm run dev
```

Make sure the backend from `server.zip` is running (`npm run dev` inside
`server/`, with Postgres reachable via its `DATABASE_URL`) — this frontend
talks to it over HTTP, it doesn't bundle it.

```bash
npm run build      # type-checks with tsc -b, then builds to dist/
npm run preview    # preview the production build locally
```

## Stack

- React 18 + Vite + TypeScript (strict mode) — see NOTES.md for why this
  stays on React 18 rather than 19
- Tailwind CSS (retro 16-bit theme: navy backgrounds, gold glow buttons,
  pixel borders, Press Start 2P headings, Inter body text)
- React Router DOM (client-side routing + a `ProtectedRoute` guard)
- Framer Motion (page/card entrances, the animated bottom-nav indicator,
  animated XP/attribute bars, the Quest Complete particle burst, floating
  landing-page particles — all wrapped in `MotionConfig
  reducedMotion="user"` so it respects OS-level reduced-motion settings)
- Recharts (the attribute radar chart on the Stats screen)
- Axios (single client in `src/api/client.ts`, auth token attached via
  request interceptor, 401s auto-clear the session)
- Lucide React icons

## Structure

```
src/
  api/           one file per backend resource (auth, profile, quests),
                 plus leaderboard.ts / shop.ts which are documented stubs
  assets/images/ hero-scene.jpg (real provided art) + a README explaining
                 which uploaded images were/weren't usable as assets
  components/    shared UI: PixelButton, PixelPanel, ToggleSwitch, TopBar,
                 BottomNav, QuestCard, QuestCompleteModal, CreateQuestModal,
                 FloatingActionButton, RadarChart (Recharts), WorldScene
                 (inline SVG, now a tall scrollable map), ProtectedRoute
  context/       AuthContext (login/register/logout/current user)
  pages/         one file per screen (Landing, Login, CharacterSelect,
                 WorldMap, Quests, Stats, Leaderboard, Shop, Settings)
  types/         TypeScript types mirroring the backend's actual response
                 shapes (see NOTES.md)
  utils/         gamification math mirrored from the backend, character
                 roster data, quest display helpers, local daily-completion
                 tracking, local-only settings helpers
```

## Screens

1. Landing — `/`
2. Login / Create Account (toggle on one page) — `/login`
3. **Character Selection** (new) — `/character-select` — shown right after
   registration (or any time from Settings), stores the pick in the
   backend's real `avatar_url` profile field
4. World Map — `/map` — now a tall, independently-scrollable map whose
   quest markers are positioned by each quest's real `map_index`, with a
   floating "+ New Quest" button
5. Daily Quests (Daily / Main / Side / Completed tabs) — `/quests` — also
   has the floating "+ New Quest" button
6. Quest Completion — modal shown from the Quests screen
7. Character Stats (incl. radar chart) — `/stats`
8. Leaderboard — `/leaderboard`
9. Shop — `/shop`
10. **Settings** (new) — `/settings` — reachable from every screen's
    top-bar gear icon; profile summary, avatar change, real backend
    timezone update, device-local notification/theme/music preferences
    (clearly marked as such), and logout

All authenticated screens live inside a shared 430px-max mobile shell
(`.app-shell` in `src/index.css`) with a bottom tab bar. Keyboard focus is
visible everywhere via `:focus-visible`, decorative SVG/emoji are
`aria-hidden`, and progress bars use `role="progressbar"` with numeric
`aria-value*` rather than the native `<meter>` element (per the brief).
