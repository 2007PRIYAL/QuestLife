# NOTES — read this first

I read every file in `server.zip` (routes, controllers, services, schemas,
and `migrations/001_initial_schema.sql`) before writing any frontend code.
The backend is **not modified** anywhere. A few things the reference
screens need don't exist in it yet, so here's exactly what's real, what's
stubbed, and what to add to make the stubs real.

## This revision: Character Selection, scrollable World Map, Create Quest, Settings

Four features added on top of the existing, working codebase (nothing
below this section was rewritten or redesigned):

- **Character Selection** (`src/pages/CharacterSelect.tsx`, `/character-select`)
  — four cosmetic characters (Nox, Nova, Kai, Echo), defined in
  `src/utils/characters.ts`. The only backend call is a real
  `PATCH /api/profile` writing the chosen character's id into the
  existing, unmodified `avatar_url` column. New users land here right
  after registration (detected via the backend's own `hero-default` seed
  value, see `NEEDS_CHARACTER_SELECTION()`); anyone can revisit it later
  from Settings → Change Avatar.
- **Scrollable World Map** (`src/components/WorldScene.tsx`,
  `src/pages/WorldMap.tsx`) — the map is now a tall (1800px) inline SVG in
  its own independently-scrolling viewport, so the top bar and bottom nav
  stay pinned. Quest markers are grouped and positioned by each quest's
  real `map_index` field (1–10, already part of the existing quest
  schema) — nothing about their placement is invented. The lowest-tier
  incomplete quest pulses as the "current" marker; tiers where every quest
  is complete (per `localCompletions`) show a cleared/checkmark state.
  Castle/Lake/Dark Woods remain purely decorative scenery, same as before.
- **Create Quest** (`src/components/CreateQuestModal.tsx`,
  `src/components/FloatingActionButton.tsx`) — a floating "+" button on
  both World Map and Quests opens a modal whose fields are a 1:1 match for
  `createQuestSchema` (title, description, type, category, map_index,
  is_recurring) and calls the real, already-existing
  `POST /api/quests` via `createQuestRequest()`. On success it refreshes
  the quest list from the backend — no local-only fake quests.
- **Settings** (`src/pages/Settings.tsx`, `/settings`) — reachable from
  every screen via the top bar's gear icon (`TopBar` now defaults to
  navigating here if a screen doesn't override `onSettingsClick`).
  - Avatar and **Timezone** are real `PATCH /api/profile` calls against
    existing fields.
  - Username/email are shown read-only, with an explicit note that
    there's no backend route to change them.
  - Notifications, Theme, and Music are honestly presented as **not**
    backend-backed: Notifications is a per-device `localStorage` toggle
    (`src/utils/localSettings.ts`, same pattern as `localCompletions.ts`);
    Theme and Music are shown as fixed/"coming soon" rather than faking
    functionality that doesn't exist yet.
  - Logout is fully functional (clears the auth token via `AuthContext`).

## Visual polish pass (earlier revision)

The backend wiring below is unchanged from the first pass. What changed is
purely presentational, once real art and a firmer deadline arrived:

- **Framer Motion** everywhere the brief asked for it: Landing entrance +
  a looping floating-particle starfield, Login card/mode-toggle
  transitions, an animated bottom-nav active indicator (`layoutId`), quest
  card stagger/hover with `AnimatePresence`, a real particle-burst **Quest
  Complete** modal, animated XP/attribute bar fills (Stats + TopBar),
  World Map marker entrance + a pulsing glow on the active main-quest
  marker, Leaderboard podium/row stagger, and Shop card hover/tap.
  `MotionConfig reducedMotion="user"` is set app-wide in `App.tsx`, so all
  of this automatically respects the OS `prefers-reduced-motion` setting
  — no separate reduced-motion code path was needed.
- **Recharts** now renders the attribute radar chart
  (`src/components/RadarChart.tsx`), replacing the earlier hand-rolled SVG
  version, per the tech-stack spec.
- **Real artwork**: the Landing and Login screens now use the actual
  uploaded hero/castle scene (`src/assets/images/hero-scene.jpg`) instead
  of the inline SVG skyline. See `src/assets/images/README.md` for exactly
  which uploaded image this is and why the others weren't used as
  backgrounds (they're full mockups with fake stats baked into the pixel
  art, not clean reusable assets).
- **Stack note — React 18, not 19**: the original brief asked for React
  19. This build intentionally stays on React 18.3 (already the base of
  the first pass) rather than bump the major version, because this
  environment has no network access to actually run `npm install` /
  `npm run build` and confirm React 19 + Recharts 2.x + Framer Motion 11
  compile and render together cleanly. Every file was instead verified by
  hand (JSX tag balance, import usage, prop shapes against each library's
  types) — see the "Manual verification" section below. If you want React
  19, it's very likely a safe bump given nothing here uses legacy APIs,
  but please run `npm install && npm run build` yourself before trusting
  it, since I couldn't.

## Manual verification (no network / no `npm install` in this environment)

I could not run `npm install`, `tsc`, or `vite build` here, so instead of
skipping verification I did it by hand, file by file, for every file this
pass touched:

- Read every touched file in full and traced every JSX open/close tag by
  eye (an automated regex-based checker was tried first, but it produces
  false positives on generics like `useState<Profile | null>` and on
  attributes containing `<`/`>`, e.g. `onClick={() => x}` — so it was
  discarded in favor of manual reading).
- Ran a script across every touched file confirming each named import is
  referenced at least once in that file's body (catches
  `noUnusedLocals`-style issues without needing `tsc`).
- Confirmed every brace `{}`/paren `()` count matches per file.
- Cross-checked every changed component's prop usage against the
  library's actual TypeScript types from memory (`HTMLMotionProps<'button'>`,
  Recharts' `Radar`/`PolarGrid`/etc. props, `AnimatePresence` requiring a
  stable `key` on its direct children for exit animations to fire).
- Confirmed `RadarChart`'s prop signature change (dropped the old `size`
  prop, which nothing was passing) doesn't break its one call site in
  `Stats.tsx`.

This is a best-effort substitute for a real compiler and cannot catch
every possible mistake — if `npm run build` surfaces something, it's most
likely a version-compatibility issue between React 18 and Framer
Motion/Recharts' type definitions rather than a structural JSX error,
since that's the category this process is weakest at catching.

**Update (final packaging pass):** a global TypeScript compiler (`tsc`,
independent of this project's own uninstalled `node_modules`) turned out
to be available in this environment after all. Every `.ts`/`.tsx` file in
`src/` (39 files) was parsed with TypeScript's own parser
(`ts.createSourceFile`, checking `parseDiagnostics`) — this catches real
syntax errors (unbalanced braces, malformed JSX, invalid TypeScript)
independent of whether the project's dependencies are installed. Result:
**zero syntax errors** across the whole `src/` tree. This doesn't replace
a full `tsc --noEmit` type-check against real installed dependency types
(still not possible without network access to `npm install`), but it is
a genuine parser pass, not just eyeballing. Every `navigate()` / `to=`
target was also cross-checked against the routes declared in `App.tsx` —
all resolve to real routes, no dead links.

## What's fully live (real Axios calls, real backend)

| Screen | Backend calls used |
|---|---|
| Login / Create Account | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Character Selection | `GET /api/profile`, `PATCH /api/profile` (`avatar_url`) |
| World Map | `GET /api/profile`, `GET /api/quests` |
| Daily Quests (list) | `GET /api/profile`, `GET /api/quests` |
| Create Quest (World Map + Quests) | `POST /api/quests` |
| Character Stats | `GET /api/profile` |
| Settings | `GET /api/profile`, `PATCH /api/profile` (`avatar_url`, `timezone`) |

Types in `src/types/index.ts` are copied field-for-field from what your
controllers/services actually `SELECT` and `RETURNING`, not guessed.

## What's stubbed, and why — leaderboard, shop, quest completion

These three are the backend's actual gaps, confirmed by reading every
route/controller file and the migration: the DB tables exist for all
three, but **no route, controller, or service exposes them over HTTP**.
Nothing below was worked around by inventing a fake endpoint — each stub
is clearly isolated to one `src/api/*.ts` file and is easy to swap out.

### 1. Completing a quest
`quest_completions` is a real table and `gamification.service.ts` has the
XP/level/reward math, but **no route ever calls it or inserts a row** —
completing a quest currently does nothing server-side.

`src/api/quests.ts` → `completeQuestRequest()` first tries
`POST /api/quests/:id/complete`. If you add that route, it'll start
working with zero frontend changes. Until then it 404s and falls back to
a client-only reward preview (using the quest's real `base_xp`/
`base_coins`/`attribute_points`), and logs a `console.warn` so this is
never silently hidden. "Completed today" state is tracked in
`localStorage` (`src/utils/localCompletions.ts`) instead of the DB, since
there's nowhere server-side to persist it.

Suggested endpoint shape:
```
POST /api/quests/:id/complete
→ { success: true, data: { quest, xp_awarded, coins_awarded,
    attribute_points_awarded, attribute_category, leveled_up, new_level } }
```

### 2. Leaderboard
There is no route, controller, or service that lists/ranks other users at
all — `src/api/leaderboard.ts` returns local sample data, clearly marked.
Swap the body of `fetchLeaderboard()` for a real `apiClient.get('/leaderboard')`
call once `GET /api/leaderboard` exists; `LeaderboardEntry` is the shape
the page already expects.

### 3. Shop
`shop_items` and `inventory` tables exist in the migration, but nothing
reads or writes them. `src/api/shop.ts` returns local sample items and a
purchase function that only mutates local state — no coins are actually
deducted server-side. Swap in `GET /api/shop/items` and
`POST /api/shop/purchase` once they exist; `ShopItem` is the shape the
page already expects.

### 4. Google / GitHub login
The login screen shows both buttons per the design, but they're disabled
(with a `title` tooltip) since there's no OAuth route on this backend.

### 5. Forgot password
Same treatment — the link is present but explains there's no reset route
yet, rather than pretending to send an email.

## Art assets
**Update (this revision):** real art was later provided — 9 images, one of
which (the hero/dog/castle night scene) has no baked-in fake UI and is now
used as the Landing/Login background (`src/assets/images/hero-scene.jpg`,
swapped in for `<CastleSkyline />`). The other 8 are full-screen mockups
with sample data baked into the pixel art (e.g. "Lv. 12", "1,250" coins)
— per the brief these were treated as style/layout reference only, not as
literal background files, since using them directly would show fake
non-functional numbers next to the real backend-driven ones. The World Map
scene (`src/components/WorldScene.tsx`) is still inline SVG since no clean
art existed for that screen specifically. See
`src/assets/images/README.md` for the full breakdown.

## Everything else
Auth token is stored in `localStorage` and attached via an Axios request
interceptor (`src/api/client.ts`). A 401 clears it automatically. Every
page handles loading and error states and shows the backend's real
`message` (from your Zod-validation-aware error middleware) instead of a
generic string.
