## Phaser / Canvas / WebGL Testing Notes

### Why canvas/WebGL tests get flaky

Common nondeterminism sources:
- variable frame times (CPU load, headless rendering)
- time-based movement/physics without fixed timestep
- RNG for loot/spawns/AI
- async asset loading and “first frame” races
- font loading differences affecting layout (if mixed DOM+canvas)

The fix is not “more retries”; it’s **deterministic mode + explicit readiness**.

### Deterministic mode (recommended pattern)

When `?test=1` (or a build-time flag) is enabled:
- seed RNG from a known value (and expose it)
- freeze or control time (fixed timestep) for simulation-sensitive assertions
- disable camera shake, screen flash, particles, and audio if they introduce nondeterminism
- ensure assets are preloaded before the first interactive frame

### Add a minimal test seam

Expose a stable API (avoid leaking internal Phaser objects unless wrapped):

- `window.__TEST__ = { ready: false, seed, sceneKey, state: () => ({...}) }`
- set `ready = true` only after:
  - preload completed
  - first scene created
  - first render tick occurred (optional but helpful for screenshot timing)

If you need to expose entities, expose *IDs + essential fields* (x/y/hp/state), not sprite instances.

### What to assert (avoid brittle assertions)

Prefer invariants that match player-visible behavior:
- “player can start” (scene key, UI state)
- “pressing attack spawns hitbox and reduces enemy HP”
- “collecting coin increments score”

Avoid:
- raw pixel-perfect sprite positions unless you fixed dt and RNG
- asserting on ordering of internally iterated arrays/maps

### Screenshot testing: make it reliable

Before comparing screenshots:
- fix viewport size + device scale factor
- fix RNG seed + fixed dt
- wait on `__TEST__.ready` and optionally a `__TEST__.frameCount >= N`
- keep snapshots targeted (menus/first scene), not every frame

---

## UI slicing regressions (nine-slice / ribbons / bars)

Canvas UI bugs (9-slice seams, padded-frame “side bars”, segmented ribbons, transparent HUD bases) are easiest to catch with a **purpose-built UI harness scene** rather than trying to reproduce in the full game flow.

### Recommended harness pattern

Create a dedicated test page/scene (e.g., `test.html`) that:
- loads only UI assets
- renders each element on **multiple backdrops** (dark UI background + “world green” + paper/wood) to expose transparency problems
- renders **raw frames** and **assembled output** side-by-side
- supports keyboard toggles (`1..N`) *and* a programmatic seam via `window.__TEST__.commands.showTest(n)`

This is especially high-signal for 9-slice work because the failure mode is visual (gaps/bands), and the correct output is hard to assert via internal state alone.

### What to render (minimum set)

- **Raw frames**: all 9 frames of a 3×3 sheet (catches loader `frameWidth/spacing` errors)
- **Assembled panel**: several target sizes (catches trim/overlap math issues)
- **Ribbons/banners**: show “raw crop+scale” *and* “stitched multi-slice” (catches internal transparent gutters)
- **Bars**: base + track + fill (cropped) over a “world” backdrop (catches transparent-window issues)

### Playwright screenshot workflow (practical)

1. Start a static server for `public/`
2. `page.goto('/test.html')`
3. `await page.waitForFunction(() => window.__TEST__?.ready)`
4. Switch modes: `await page.evaluate(() => window.__TEST__.commands.showTest(5))`
5. Screenshot: `page.screenshot({ fullPage: true })`

For CI: store the screenshots and diff them with `scripts/imgdiff.py` (after making viewport/DPR deterministic).
