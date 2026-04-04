# Cube Census: Forest Edition — Technical Design Document
_Last updated: 2025-12-30_

## 1. Intent & References
- **Goal:** Ship the Forest counting minigame described in `forest/PRD.md` and illustrated by `forest/design.png`: a 960×540 fixed-aspect Three.js diorama where the player counts only Yellow Chicks within 20 seconds and submits a guess.
- **Sources consulted:** `forest/PRD.md`, `forest/design.png`, `assets.json`, `ASSET_INDEX.md`, and Three.js execution guidance from `.codex/skills/threejs-builder/SKILL.md`.
- **Clarified decisions (per user):**
  1. Counter UI renders as a DOM overlay anchored to the screen center (not attached to the player mesh).
  2. Use the provided GLTF models “as is” for player, chicks, chickens, pigs, sheep, and foliage (no voxel primitives unless a loader failure occurs).
  3. Lighting spec in the PRD stands; no extra discussion needed.

## 2. Implementation Constraints
- **Single file deliverable:** `forest/index.html` contains HTML, inline CSS, and `<script type="module">` JavaScript.
- **Engine:** Three.js r160 via ES modules (from unpkg). Only use `MeshStandardMaterial` (scene) and `MeshBasicMaterial` (UI planes) as mandated.
- **Performance guardrails (per threejs-builder skill):**
  - Clamp DPR to `Math.min(devicePixelRatio, 2)`.
  - `renderer.outputColorSpace = THREE.SRGBColorSpace` and `renderer.toneMapping = THREE.ACESFilmicToneMapping` for consistent palette.
  - Reuse geometries/materials, avoid per-frame allocations, and keep draw calls low by instancing environment GLTFs.
- **World contract:** 1 Three.js unit ≈ 1 meter. Ground plane at `y = 0`. Characters rest such that their `minY == 0`.
- **States:** `loading → menu → playing → paused/results`, with a latching transition function (`setMode(next)`).
- **Input:** Keyboard only (WASD, arrow keys, Space/Enter/Backspace/P/Esc) per PRD table.
- **Persistence:** localStorage key `voxelCensus_bestStreak`.

## 3. Asset & Content Plan (from assets.json)
### 3.1 Character + NPC models
| Usage | Asset key | Path |
| --- | --- | --- |
| Player avatar | `Character_Male_1` | `assets/Characters/glTF/Character_Male_1.gltf` |
| Target (Yellow Chick) | `Chick` | `assets/Animals/glTF/Chick.gltf` |
| Distraction: Chicken | `Chicken` | `assets/Animals/glTF/Chicken.gltf` |
| Distraction: Pig | `Pig` | `assets/Animals/glTF/Pig.gltf` |
| Distraction: Sheep | `Sheep` | `assets/Animals/glTF/Sheep.gltf` |

### 3.2 Environment dressing
| Usage | Asset key | Path | Notes |
| --- | --- | --- | --- |
| Trees | `Tree_1`, `Tree_2`, `Tree_3` | `assets/Environment/glTF/Tree_*.gltf` | Random mix for variety |
| Bushes | `Bush` | `assets/Environment/glTF/Bush.gltf` | Collidable |
| Tall grass | `Grass_Big`, `Grass_Small` | `assets/Environment/glTF/Grass_*.gltf` | Non-colliding filler |
| Rocks | `Rock1`, `Rock2` | `assets/Environment/glTF/Rock*.gltf` | Collidable |
| Mushrooms | `Mushroom` | `assets/Environment/glTF/Mushroom.gltf` | Foreground parallax |
| Decorative flowers | `Flowers_1`, `Flowers_2` | `assets/Environment/glTF/Flowers_*.gltf` | Non-colliding |

### 3.3 Asset pipeline decisions
- Load `assets.json` via `fetch('../assets.json')`, filter needed keys, and create a `loadGltf(label, path)` helper using `GLTFLoader` (`three/addons/loaders/GLTFLoader.js`).
- After load, wrap each root in `makeAnchoredMesh(root, anchor = 'minY')` so ground contact is consistent.
- Build pooling for chicks/chickens/pigs/sheep to avoid reloading between rounds (clone scene graph per spawn).
- Fallback path (required by PRD but expected rare): if any GLTF fails, instantiate voxel primitives with the palette from PRD section 4.

## 4. Runtime Architecture
### 4.1 File layout (single HTML)
```
<body>
  <div id="hud">
    <div id="timer"></div>
    <div id="streak"></div>
    <div id="controls"></div>
    <div id="counterOverlay"> ... DOM counter ... </div>
    <div id="menu"></div>
    <canvas></canvas>
  </div>
  <script type="module">/* Three.js code */</script>
</body>
```

### 4.2 Module organization inside the script
- **Config constants:** sizes, colors, spawn counts, timings, camera numbers, DOM selectors.
- **State stores:**
  - `const gameState = { mode: 'loading', timer: 20, streak: 0, best: 0, submitted: false, currentCount: 0, actualChicks: 0 }`
  - `const world = { scene, camera, renderer, clock, mixerRegistry: [], npcControllers: [], colliders: [], assetCache: {} }`
- **Subsystem namespaces:**
  - `setupRenderer()`, `setupScene()`, `setupLights()`, `setupCamera()`
  - `initAssets()`
  - `createEnvironment()` (builds ground + occluders + background tree line)
  - `createPlayer()` and `updatePlayer(dt)`
  - `spawnNPCs()` / `updateNPCs(dt)`
  - `updateCamera(dt)` (edge pan logic)
  - `updateHud()` (DOM binding)
  - `runFX()` (UI pulses, confirmed sightings)
  - `handleStateTransition(nextMode)`

### 4.3 Game state diagram
`loading → menu → playing ↔ paused → results → (menu | playing)`
- Loading waits for GLTF/manifest fetch then calls `handleStateTransition('menu')`.
- Paused retains snapshot of timers and halts animations by skipping controller updates.

### 4.4 Data flow
1. `bootstrap()` loads manifest & GLTFs.
2. `setupScene()` builds static world + player placeholder.
3. `startRound()` spawns NPCs, resets timer/counter.
4. `setAnimationLoop(loop)` handles dt, updates, state gating.
5. DOM overlay updates mirror `gameState` each frame.

## 5. Rendering & Scene Composition
### 5.1 Reference-frame contract (per threejs-builder skill)
- Axes: +X right, +Y up, +Z toward camera. Gameplay uses X/Z plane.
- Camera: `PerspectiveCamera(45°, 960/540, 0.1, 200)` positioned at `(0, 11.5, 13)` looking at `(0, 0, 0)`; orbit disabled. Downward pitch ≈ 40°.
- Edge-pan: project player world position to NDC via `player.clone().project(camera)`; if x < -0.76 or x > 0.76 (≈12% screen), lerp camera target X.
- Calibration pass: On first load, attach `AxesHelper` + `ArrowHelper` to check GLTF facing; store `yawOffset` per asset (expected default is `-Z` forward, but we log to confirm).
- Units: Player height 1.6 units, ground plane extends `24 × 12` units.

### 5.2 Scene layers (front → back)
1. **Foreground parallax**: Non-collision mushrooms/grass near camera edges.
2. **Gameplay plane**: Ground tile plane, collidable trees/bushes/rocks, player, NPCs, confirmed-sighting particles.
3. **Backdrop**: Extra tree line (scaled/backed) + gradient sky plane (MeshBasicMaterial) + fog (`scene.fog = new THREE.FogExp2('#E9FFF2', 0.035)`).
4. **UI planes**: any in-world signage uses `MeshBasicMaterial`.

### 5.3 Lighting
- HemisphereLight (sky `#BFE8FF`, ground `#E9FFF2`, intensity 0.85).
- DirectionalLight at `(6, 12, 6)` with intensity 1.1, soft shadows (512-map). Optional low AmbientLight 0.15 for fill.
- Lights baked once; only intensity pulsing for urgency cues (timer low).

## 6. Core Subsystems
### 6.1 Asset Loading & Pooling
```js
const manifest = await fetch('../assets.json').then(r => r.json());
const ASSET_PATHS = {
  player: manifest.assets.characters.Male_1,
  chick: manifest.assets.animals.Chick,
  chicken: manifest.assets.animals.Chicken,
  pig: manifest.assets.animals.Pig,
  sheep: manifest.assets.animals.Sheep,
  trees: [manifest.assets.environment.flora.Tree_1, ...],
  bush: manifest.assets.environment.flora.Bush,
  rocks: [manifest.assets.environment.resources.Rock1, Rock2],
  grass: [manifest.assets.environment.flora.Grass_Big, Grass_Small],
  mushrooms: manifest.assets.environment.flora.Mushroom,
};
```
- `loadGltf(key)` caches the `GLTF.scene` root. For repeated use, `SkeletonUtils.clone()` if skinned; otherwise `scene.clone(true)`.
- Pools: maintain arrays of `npcPool.yellow`, `npcPool.chicken`, etc. Spawn by pulling from pool and enabling; return on round reset.

### 6.2 Input & Camera
- Input state object toggled by `keydown/keyup` listeners.
- Movement vectors derived from camera basis per skill instructions:
```js
const forward = new THREE.Vector3();
camera.getWorldDirection(forward);
forward.y = 0; forward.normalize();
const right = new THREE.Vector3().crossVectors(forward, UP); // ensures RH basis
```
- Edge-pan target `cameraRig.targetX`; actual camera position lerps toward target each frame with speed 6.5 units/sec.
- Pause/resume handled by event listeners gating updates.

### 6.3 Player Controller & Collision
- Player root is a `Group` containing GLTF plus floating UI anchor.
- Movement: acceleration/deceleration values per PRD table. Velocity clamped in `[-max, max]` each axis.
- Collision: maintain `colliders` array of AABBs. Proposed algorithm: attempt move per axis; for each collider, check overlap using `sweptAABB`. If collision, zero velocity along that axis and clamp position to collider edge ± clearance (0.12).
- Player may pass through NPCs (their colliders flagged `passThrough`).

### 6.4 NPC Controller
- `class Wanderer` holds reference to mesh, species config, `direction` vector, `speed`, `turnTimer`, `pauseTimer`, `sighted` flag.
- Behavior update pseudocode:
```js
turnTimer -= dt;
if (turnTimer <= 0) { pick random heading ± jitter; turnTimer = rand(minTurn, maxTurn); }
if (pauseTimer > 0) { pauseTimer -= dt; return; }
position.addScaledVector(direction, speed * dt);
wrap/clamp within bounds; if hitting collider, steer away by reflecting direction.
if (random < pauseChance) pauseTimer = rand(0.2, 0.5);
```
- Species config table (per PRD) defines `speedRange`, `turnRange`, `pauseRange`.
- Spawn counts: Yellow (6–14), White (3–10), Pigs (2–6), Sheep (2–6). Random seeds logged for reproducibility (use `Math.random()` with optional deterministic seed toggled).

### 6.5 Counting & Confirmed Sightings
- `gameState.currentCount` changed only by arrow keys, clamped 0–24. DOM overlay updates immediately and triggers CSS animation.
- Confirmed-sighting detection each frame for each yellow chick not yet `sighted`:
  1. Check planar distance `< 3.2`.
  2. Compute vector to chick, compare with player forward (dot ≥ cos 60° ≈ 0.5).
  3. Line-of-sight test: cast `Raycaster` from player eye height to chick; ensure no collider intersection before chick distance.
  4. If pass, mark `sighted = true`, emit particle burst (GPU instanced quads or Points), show floating text, slow global timeScale to 0.92 for 0.25s.

### 6.6 Timer, Submission, and Persistence
- Timer stored as float seconds; each loop `gameState.timer = Math.max(0, timer - dt * timeScale)`.
- Low-time cues triggered at 10s, 5s, 2s by toggling CSS classes on `#timer` and adjusting scene post-processing (color shift uniform).
- Submission: Space (or auto when timer hits 0). On submit, freeze movement, evaluate equality vs `gameState.actualChicks`, update streaks, store `best`, and show results overlay.

### 6.7 UI & DOM Overlay
- **Fixed HUD (DOM):**
  - `#counterOverlay`: central circle with number, up/down arrow buttons or key hints (“Press ↑/↓ to adjust”). Receives CSS `@keyframes pop` for changes.
  - `#timer`: top-center, large font with gradient background when urgent.
  - `#streak`: top-left small stack showing current/best.
  - `#controls`: top-right list (WASD, arrows, Space, Enter, P/Esc, Backspace).
  - `#menu` / `#results` overlays for states, toggled via CSS classes.
- DOM uses CSS variables for palette taken from PRD to keep consistent branding.
- `requestAnimationFrame` updates DOM through `updateHud()`; heavy operations (innerHTML) avoided.

### 6.8 Effects & Animation System
- Use a lightweight `FXTimeline` storing active tweens (counter pop, vignette, screen shake). Each entry has `duration`, `onUpdate`, `onComplete`.
- Confirmed sightings spawn GPU particles via `PointsMaterial` tinted `#FFD33D` with additive blending for 0.35s.
- Screen shake implemented by applying offsets to camera rig parent (lerped back).
- DOM overlays use CSS transitions (timer color/pulse, new best banner sliding).

### 6.9 Performance & Debug Hooks
- `renderer.info` logged at dev toggle to ensure draw calls < 120.
- Dev key `H` toggles helpers (AxesHelper, Bounding boxes) for verifying collisions.
- Stats: optional FPS counter hidden in production.

## 7. Game Flow & UI States
### 7.1 State specifics
- **Loading:** Show spinner overlay; background gradient. Once assets ready, transition to menu.
- **Menu:** Live scene at 35% speed; DOM overlay displays title, description, controls, best streak. Enter starts new round.
- **Playing:** Timer visible, DOM counter active, instructions pinned. Pause (P/Esc) overlays translucent layer.
- **Paused:** Freeze `timeScale` and skip updates; DOM overlay with resume controls.
- **Results:** Display actual vs submitted counts, difference, streak updates, instructions for Enter/Backspace.

### 7.2 Counter overlay behavior
- Always centered; number increments via arrow keys. Buttons for accessibility optional but present (click increments).
- Denied input (clamp) triggers CSS shake (translateX) and color flash (#B84A4A) for 120ms.

## 8. Data Structures & Algorithms
### 8.1 Configuration objects
```js
const SPECIES = {
  yellowChick: { speed: [2.2, 2.8], turn: [0.35, 0.9], pause: [0.2, 0.5], count: [6, 14], color: '#FFD33D' },
  chicken: { speed: [1.8, 2.2], turn: [0.7, 1.5], pause: [0.3, 0.7], count: [3, 10], color: '#F2F2F2' },
  pig: { speed: [1.5, 1.9], turn: [1.2, 2.0], pause: [0.6, 1.1], count: [2, 6], color: '#F3A0B4' },
  sheep: { speed: [1.6, 2.0], turn: [1.0, 1.8], pause: [0.4, 0.9], count: [2, 6], color: '#D9D9D9' },
};
```
- `const WORLD_BOUNDS = { x: [-12, 12], z: [-6, 6] }`.
- `const COLLIDER_SHRINK = 0.12`.

### 8.2 Main loop pseudocode
```js
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const rawDt = clock.getDelta();
  const dt = rawDt * globalTimeScale;
  if (!state.paused && state.mode === 'playing') {
    updatePlayer(dt);
    updateNPCs(dt);
    updateCamera(dt);
    updateConfirmedSightings(dt);
    updateTimer(dt);
  }
  runFX(dt);
  updateHud();
  renderer.render(scene, camera);
});
```

### 8.3 Confirmed sighting check
```js
function checkSightings() {
  for (const chick of yellowChicks) {
    if (chick.meta.sighted) continue;
    if (!withinRange(player.position, chick.position, 3.2)) continue;
    if (!inViewCone(playerForward, player.position, chick.position, 0.5)) continue;
    if (isOccluded(playerEye, chick.position)) continue;
    markSighted(chick);
  }
}
```
- `isOccluded` uses `Raycaster` against `colliderMeshes`.

## 9. Risks & Mitigations
| Risk | Mitigation |
| --- | --- |
| GLTF scale/orientation mismatch | Run calibration pass per threejs-builder instructions; store `yawOffset` constants. |
| High draw calls due to many GLTF instances | Use instancing for repeated trees/bushes where possible; reuse materials. |
| Collision tunneling at high speeds | Movement speeds are low; still, move axis-by-axis with small dt. |
| DOM overlay desync with canvas | `updateHud` reads from `gameState` immediately after updates. Use CSS `pointer-events: none` for overlays except counter buttons. |
| Counters not readable on small screens | Layout scales using CSS clamp fonts; maintain 16:9 letterboxing by wrapping canvas in container that sets `width: min(100vw, 100vh*16/9)`. |
| Confirmed sighting raycasts expensive | Only evaluate for unsighted chicks (max 14) and reuse single `Raycaster` instance. |

## 10. Implementation Roadmap
1. **Bootstrap & reference frame:** stub `index.html`, renderer setup, gradient background, calibration helpers to verify units/orientation.
2. **Asset loader + manifest filter:** fetch `assets.json`, load required GLTFs, anchor them, build pools.
3. **Environment assembly:** ground plane, gradient sky, occluders, background tree line; register collider volumes.
4. **Player controller:** instantiate avatar, input handling, collision resolution, floating anchor for counter.
5. **NPC system:** config-driven spawner, wander steering, pooling.
6. **Camera rig & edge pan:** implement threshold logic, confirm large-screen letterboxing.
7. **HUD & DOM overlay:** central counter, timer, controls, state overlays; wire to state machine.
8. **Gameplay logic:** timer, submission, state transitions, streak persistence.
9. **Confirmed sighting FX + time pressure cues.**
10. **Polish & QA:** stress test spawn counts, confirm performance, finalize CSS + responsive layout.

## 11. Testing & Debug Checklist
- ✅ Asset load success and fallback log.
- ✅ Player collision edges (can’t exit bounds, can weave between trees).
- ✅ NPCs stay within bounds and avoid obstacles.
- ✅ Counter clamps & denies gracefully.
- ✅ Timer low-warning cues trigger at 10s/5s/2s.
- ✅ Confirmed sighting triggers once per chick and respects occlusion.
- ✅ Pause/resume freeze everything (movement, animations, timers).
- ✅ localStorage best streak persists across refresh.
- ✅ DOM overlays stay centered regardless of window size.

This TDD aligns with the PRD, references the available GLTF assets, and applies the threejs-builder skill guidance (reference-frame contract first, ES-module structure, asset calibration, camera-relative controls). Implementation can now proceed in `forest/index.html` following the roadmap above.
