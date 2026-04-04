## Flake Reduction (Frontend)

### First classify the flake

1. **Readiness flake**: app not ready when test interacts (most common).
2. **Timing flake**: animation/transition/physics changes outcome by milliseconds.
3. **Environment flake**: viewport/DPR/fonts/GPU differences change rendering.
4. **Data flake**: network/backend state changes.
5. **Concurrency flake**: tests interfere via shared storage, ports, global state.

### Triage workflow

- Re-run locally with the same flags as CI (headless, same viewport, same env vars).
- Capture evidence on failure:
  - console messages
  - network requests with status codes
  - screenshot at failure moment
  - a “state dump” from a stable test seam (e.g., `window.__TEST__.state()`)

### Fix patterns (in order of leverage)

**Readiness**
- Add explicit “ready” signals; wait on them.
- Avoid broad `waitForTimeout`; prefer `waitForFunction` or DOM conditions.

**Determinism**
- Seed RNG, control time, and remove animation variability.
- For canvas/WebGL: fixed timestep mode for tests.

**Isolation**
- Reset storage between tests.
- Use unique test data; avoid shared accounts/state.
- Avoid depending on test execution order.

**Environment**
- Lock viewport/DPR/locale/timezone.
- Ensure fonts are installed/loaded deterministically (or use default system fonts).

**Temporary guardrails**
- Retries are acceptable only as a short-term measure with a tracked follow-up.

