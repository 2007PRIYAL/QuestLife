Real art was later provided for this project (see `../../../NOTES.md` →
"Art assets"). Of the images supplied, only one has no baked-in fake UI
text/data drawn into the pixel art itself — the rest are full mockups of
each screen (with sample stats like "Lv. 12" burned into the artwork) that
were used as layout/style reference only, per the brief ("inspired by
these images... do not waste time trying to perfectly recreate artwork").

- `hero-scene.jpg` — the clean night scene of the hero, his dog, and the
  castle skyline (no UI baked in). Resized to 860px wide and re-encoded as
  JPEG (~400KB, down from a 2MB PNG) to keep the bundle light. Used as the
  full-bleed background on `Landing.tsx` and (dimmed) `Login.tsx`.

The World Map's river/forest/castle scene is still a hand-built inline SVG
(`src/components/WorldScene.tsx`) rather than a bitmap, since no clean
(non-mockup) art existed for that screen specifically. `CastleSkyline.tsx`
is the earlier SVG stand-in for the now-unused landing/login background —
kept in the repo but no longer imported anywhere.

If you get clean (non-mockup) art for the World Map, Quest Complete, or
other screens later, drop it in here and swap the relevant component/`<img>`
usage the same way `hero-scene.jpg` was wired in.
