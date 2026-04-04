## Playwright MCP Cheatsheet (Codex)

This reference is for using the Playwright MCP tools during frontend testing tasks (especially canvas/WebGL games).

### Mental Model

- Use MCP to reproduce a user flow and collect evidence: console, network, screenshots, and state.
- Prefer explicit readiness over time-based waits.
- Treat *any* console error (or failed asset request) as a product failure unless explicitly allowed.

### High-signal tool patterns

**Navigate + wait for app readiness**

- `mcp__playwright__browser_navigate` to the URL.
- `mcp__playwright__browser_wait_for` when a specific text appears (DOM UIs).
- For canvas apps, prefer `mcp__playwright__browser_evaluate` to poll a `window` readiness flag:
  - Example readiness seam (recommended in app code): `window.__TEST__ = { ready: true }`
- For DOM inspection, `mcp__playwright__browser_snapshot` is often higher-signal than raw HTML, and is safer than “guessing selectors”.

**Assert state (white-box)**

- `mcp__playwright__browser_evaluate` to read `window.__TEST__`:
  - `window.__TEST__.sceneKey`, `window.__TEST__.score`, `window.__TEST__.entities`, etc.

**Drive input**

- `mcp__playwright__browser_click` / `mcp__playwright__browser_drag` for pointer flows.
- `mcp__playwright__browser_press_key` for keyboard-driven movement/combat.
- `mcp__playwright__browser_type` for text fields (menus, names, chats).

**Fail fast on “silent” errors**

- `mcp__playwright__browser_console_messages` and fail on any `error`-level messages.
- `mcp__playwright__browser_network_requests` and fail on non-2xx/3xx for required assets.

**Visual evidence**

- `mcp__playwright__browser_take_screenshot` for a deterministic frame (lock viewport/DPR first).
- If you need pixel diffs in-repo, use `scripts/imgdiff.py`.

### Recommended “test seams” to add to the app

Minimal, stable, and read-only is best:

- `window.__TEST__.ready` (boolean)
- `window.__TEST__.version` (string)
- `window.__TEST__.state()` (returns JSON-serializable state snapshot)
- `window.__TEST__.commands` (optional small set of commands like `reset()`, `seed(n)`, `skipIntro()`)

Avoid exposing raw engine objects unless you also provide stable wrappers.
