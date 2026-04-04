# Cube Census: Forest Edition — Game Design Document

## 1. Summary
A 3D voxel “dollhouse” counting minigame where the player has **20 seconds** to **count all Yellow Chicks** wandering a cluttered forest clearing, then **submit a guessed number**; you win only if it matches the **exact spawned chick count**.

---

## 2. Technical Requirements
- **Rendering:** Three.js **r160**
- **Single HTML file** (one `index.html`) with inline CSS + JS
- **Unit system:** **World units** where **1 unit ≈ 1 meter** (reference: player height ≈ **1.6 units**)
- **Three.js allowed materials:** MeshStandardMaterial (primary), MeshBasicMaterial (UI planes)
- **Three.js allowed lights:** HemisphereLight + DirectionalLight (primary), optional AmbientLight (very low)
- **Geometries:** BoxGeometry (dominant voxel look), CylinderGeometry (optional trunks), PlaneGeometry (ground/UI)

**Assets**
- The provided atlas/mockup are **visual references**. V1 must be playable with **procedural voxel primitives** (boxes/planes) even if external textures fail to load.
- Optional: use a single **texture atlas image** as a ground/detail texture; must have a clean fallback to flat colors.

---

## 3. Canvas & Viewport
- **Internal render size:** 960×540 (16:9)
- **Responsive behavior:** scale-to-fit window with **letterboxing** (preserve aspect ratio)
- **Background:** vertical sky gradient (top → horizon) plus light fog feel via color haze:
  - Sky top: `#BFE8FF`
  - Horizon: `#E9FFF2`

---

## 4. Visual Style & Art Direction
**Look:** Low-poly voxel diorama (Quaternius-like), chunky silhouettes, soft lighting, bright readable colors.

### Palette (minimum set)
- Grass base: `#6CC04A`
- Grass shadow: `#4E9A33`
- Dirt path: `#B9855A`
- Trunk brown: `#8B5A3C`
- Leaf green A: `#8DDC4C`
- Leaf green B: `#A6F05A`
- Rock gray: `#9AA0A6`
- Bush green: `#63B84A`
- Chick yellow: `#FFD33D`
- Chicken white: `#F2F2F2`
- Pig pink: `#F3A0B4`
- Sheep wool: `#D9D9D9`
- UI ink dark: `#2A1B1B`
- UI accent red: `#B84A4A`

### Camera (dollhouse side-scroll)
- **Style:** Fixed elevated “toybox” view with shallow perspective.
- **Angle:** camera looks downward at ~35–45° pitch, slightly from front (so **depth/Z** is visible).
- **Behavior:** camera is mostly fixed but **pans left/right** when the player approaches screen edges (details in Section 6).
- **Goal:** keep counting readable; NPCs can be partially occluded by trees/bushes.

### Lighting mood
- Bright, soft daylight:
  - HemisphereLight: cool sky / warm ground
  - DirectionalLight: gentle sun; soft, non-dramatic shadows (if shadows are implemented, keep them subtle).

---

## 5. Player Specifications
### Appearance
- Voxel child-like character (block head/body/limbs), flat-shaded.
- A small “floating counter UI” hovers above the head (always visible).

### Size
- Height: **1.6 units**
- Width: **0.7 units**
- Depth: **0.45 units**

### Colors
- Shirt: `#C94C3A`
- Shorts: `#2E78C7`
- Skin: `#F2C9A0`
- Hair: `#E7C04B`

### Starting position
- World position: **X = 0, Z = 0**, centered horizontally, slightly front-middle depth.

### Movement constraints
- Player moves in **X (left/right)** and **Z (forward/back)** on a flat plane.
- Player cannot leave the clearing bounds and cannot pass through trees/rocks/bushes.

### Animation states (voxel-style, simple but expressive)
- **Idle:** gentle breathing bob + tiny head sway.
- **Walk:** bouncy step (slight vertical bob) with arm swing.
- **Counter change:** quick “nod” + UI pulse.
- **Submit:** brief “raise hands” / celebratory pose lock for 0.4s.
- **Result:** win bounce vs. lose slump.

(Animations can be done via simple transforms on voxel parts; no skeletal requirement.)

---

## 6. Physics & Movement
**Axis conventions**
- X = left/right
- Z = depth (forward/back)
- Y = up
- Up is **+Y**

### Core movement (top-down-ish but perspective)
| Property | Value | Unit |
|---|---:|---|
| Player max walk speed | 4.2 | units/sec |
| Player acceleration | 18 | units/sec² |
| Player deceleration | 22 | units/sec² |
| NPC max walk speed (varies by species) | 1.5–2.8 | units/sec |
| NPC turn smoothing | 0.18 | sec (time constant feel) |
| World bounds (half extents) | X: 12, Z: 6 | units |
| Camera pan speed (tracking) | 6.5 | units/sec |
| Camera edge-pan threshold | 12% | screen width (from left/right edges) |

### Camera pan rule (side-scroll feel)
- The camera has a **target X** that follows the player only when the player enters an edge zone:
  - If player screen-space X < 12% from left edge → camera target X decreases
  - If player screen-space X > 88% from left edge → camera target X increases
  - Otherwise camera target X holds (player can move within the “safe zone” without camera drift)
- Camera Z and Y remain constant (fixed dollhouse depth framing).

---

## 7. Obstacles / NPCs

## 7.1 Forest obstacles (occluders)
Purpose: create counting chaos by breaking line-of-sight and forcing repositioning.

### Trees
- **Shape:** trunk (box/cylinder) + cubic leafy canopy clusters (2–3 stacked boxes)
- **Footprint collider:** ~1.2×1.2 units
- **Height:** 4.5–6.0 units
- **Placement:** scattered with intentional “lanes” so the player can weave through.

### Bushes
- **Shape:** low blob of voxel cubes
- **Footprint:** ~1.4×1.0 units
- **Height:** ~0.9 units
- **Occlusion:** can hide chicks partially; should not fully block tall animals.

### Rocks
- **Shape:** irregular stacked boxes
- **Footprint:** ~1.2×1.2 units
- **Height:** ~0.7 units

**Obstacle density target**
- Trees: 12–18
- Bushes: 10–16
- Rocks: 6–10  
(All within bounds; keep a clear central “playable weave” region.)

---

## 7.2 NPCs (targets + distractions)

### Shared NPC rules (symmetry & fairness)
- All NPCs move using the same constraints as the player: **X/Z plane**, within world bounds.
- All NPCs **avoid obstacles** and do not overlap each other too tightly (keep readable clusters).
- NPCs can pass behind trees/bushes (visual occlusion), but must remain reachable/visible by repositioning.

### Target: Yellow Chicks
- **Count range (spawned per round):** 6–14 (uniform random)
- **Size:** 0.45(W) × 0.45(D) × 0.55(H) units
- **Color:** body `#FFD33D`, beak `#E88B2D`, comb `#C94C3A`
- **Movement:** erratic wander with frequent micro-turns
  - Speed: **2.2–2.8 units/sec**
  - Direction change: every **0.35–0.9 sec** (random)
  - Occasional “pause peck”: 0.2–0.5 sec (still counts as present)

### Distraction: White Chickens (look-alike)
- **Count range:** 3–10
- **Size:** slightly larger than chicks: 0.55×0.55×0.7
- **Color:** body `#F2F2F2` with red comb
- **Movement:** steadier than chicks
  - Speed: 1.8–2.2 units/sec
  - Direction change: 0.7–1.5 sec

### Distraction: Pigs
- **Count range:** 2–6
- **Size:** 0.9×0.5×0.6
- **Color:** `#F3A0B4`
- **Movement:** slow roam
  - Speed: 1.5–1.9 units/sec

### Distraction: Sheep
- **Count range:** 2–6
- **Size:** 0.95×0.6×0.8
- **Color:** wool `#D9D9D9`, face `#3A3A3A`
- **Movement:** medium roam + occasional stop
  - Speed: 1.6–2.0 units/sec
  - Rest: 0.4–0.9 sec occasionally

### Spawn rules
- Spawn all NPCs at round start (no mid-round spawns in V1).
- Spawn positions must:
  - Be within bounds
  - Not overlap obstacles (minimum 0.6 units clearance from tree trunks)
  - Avoid spawning too close to the player (minimum 2.5 units)

### Despawn condition
- None in V1 (all remain in scene until submission/time end).

---

## 8. World & Environment
### Ground
- One main ground plane with subtle tile variation (either via atlas texture or procedural color noise).
- Add faint “grid seams” or path strips to enhance depth reading.

### Layering / depth readability
- Back layer: denser tree line silhouettes (non-colliding set dressing) for forest feel.
- Mid layer: colliding trees/bushes/rocks (gameplay occluders).
- Foreground: a few bushes/flowers near camera edges to reinforce parallax (optional).

### If external asset loading fails
- All objects render as colored voxel primitives with the palette above.
- UI remains readable and fully functional.

---

## 9. Collision & Scoring
### Collision detection approach
- **Player vs. obstacles:** axis-aligned box collision (AABB) on X/Z footprints.
- **NPC vs. obstacles:** same AABB footprint rules (simple avoidance is fine; must not get stuck).
- **Player vs. NPC:** no hard collision required; allow passing through NPCs (prevents frustration while counting).

### Forgiving hitboxes (for movement smoothness)
- Obstacle colliders are **shrunk by 0.12 units** per side compared to the visible mesh footprint (player-friendly navigation).

### Win / lose logic
- Player’s submitted counter must equal **exact number of Yellow Chicks spawned** at round start.
- If time expires without manual submission: auto-submit current counter at **0.00** remaining.

### Score / progression (arcade framing)
- Track **streak**: consecutive correct rounds.
- Track **best streak** in localStorage: key `voxelCensus_bestStreak`
- Track last round result breakdown (for results screen):
  - Actual chicks
  - Player submitted
  - Difference (absolute)

(No points math needed; the “puzzle” is correctness under pressure.)

---

## 10. Controls
| Input | Action | Condition |
|---|---|---|
| W | Move forward (increase Z) | Playing |
| S | Move backward (decrease Z) | Playing |
| A | Move left (decrease X) | Playing |
| D | Move right (increase X) | Playing |
| ↑ Arrow | Increase counter by +1 | Playing (clamped) |
| ↓ Arrow | Decrease counter by -1 | Playing (clamped) |
| Space | Submit count immediately | Playing (once) |
| P or Escape | Pause / Resume | Playing / Paused |
| Enter | Start / Restart | Menu / Game Over |

**Counter clamp**
- Minimum: **0**
- Maximum: **24** (comfortably above max possible chicks to prevent “cap loss” confusion)

---

## 11. Game States

### 11.1 Menu
**Displayed**
- Title: Cube Census: Forest Edition”
- One-paragraph objective: “Count ONLY the Yellow Chicks.”
- **Controls list visible** (keyboard diagram style)
- “Press Enter to Start”
- Best streak display (from localStorage)

**Background**
- Live scene running slowly (NPCs wander at 35% speed) to show gameplay vibe.

---

### 11.2 Playing
**Active**
- Timer countdown (top-center)
- Best streak + current streak (top-left)
- Controls hint (top-right, compact)
- Floating counter UI above player (always)

**End triggers**
- Space submission OR timer hits 0.00 → lock input and transition to Results.

---

### 11.3 Paused
**Trigger:** P or Escape
- Overlay: semi-transparent dark veil + “PAUSED”
- Controls: “P/Esc to Resume, Enter to Restart, M to Menu (optional)”
- Everything frozen: timer, NPCs, camera.

---

### 11.4 Results (Game Over / Round Over)
**Displayed**
- “Correct!” or “Wrong!”
- Actual chick count
- Your submitted number
- Difference
- Current streak + best streak
- “Enter: Play Again” and “Backspace: Menu” (controls visible)

**Persistence**
- If correct: streak++
- If wrong: streak resets to 0
- Update best streak in `voxelCensus_bestStreak`

---

## 12. Game Feel & Juice (REQUIRED)

## 12.1 Input Response (same-frame acknowledgment)
- **Movement keys (WASD):**
  - Player immediately leans slightly into direction (max tilt 6°) even before reaching top speed.
- **Counter up/down:**
  - Floating UI number pops (scale up then settle) on every change.
  - Player does a quick “count nod” (head dips 6° then returns).
- **Denied counter input (trying to go below 0 or above max):**
  - UI ring flashes `#B84A4A` for 0.12s + tiny shake (2px screen-space equivalent).

## 12.2 Animation Timing (durations & easing targets)
- **UI pop on counter change:** 0.14s up, 0.18s settle (ease-out then ease-in)
  - Scale: 1.0 → 1.18 → 1.0
- **Player walk bob:** ~2.2 steps/sec at max speed (bouncy but not floaty)
- **Submit “lock-in”:** 0.08s freeze-frame + 0.25s zoom pulse (see screen effects)

## 12.3 Near-Miss Rewards (counting equivalent: “Confirmed Sighting”)
Purpose: reward the act of *visually verifying* a chick, not just mashing the counter.

- **Detection:** A Yellow Chick is within **3.2 units** of the player AND within a **60° forward view cone** AND is not heavily occluded (i.e., line between player and chick is not intersecting a tree trunk collider).
- **Reward (once per chick per round):**
  - Small floating text near chick: “CONFIRMED +1” (does not change the counter automatically)
  - Brief golden sparkle burst (simple quads/points) around chick for 0.35s
  - Micro time-dilation: 0.92× for 0.25s (subtle, just a “moment”)
- **Intent:** players learn to *move to get clean views* and mentally tally.

## 12.4 Screen Effects
| Effect | Trigger | Feel |
|---|---|---|
| Zoom pulse | Counter change, Submit | 1.00→1.03 scale, 0.18s |
| Flash vignette | Confirmed sighting | soft yellow vignette `#FFD33D` at 18% opacity, 0.20s |
| Screen shake | Wrong result reveal | 0.25s, small horizontal jitter (feels “uh-oh”) |
| Freeze frame | Submit | 0.08s dramatic lock-in |

## 12.5 Progressive Intensity (as time runs out)
- At **10s remaining:** timer text shifts to warmer color, subtle tick emphasis.
- At **5s remaining:** timer pulses every second; ambient scene slightly increases contrast.
- At **2s remaining:** stronger pulse + soft red vignette (opacity 12%) to raise urgency.

## 12.6 Idle Life (scene never feels static)
- Player idle: breathing bob 0.06 units amplitude, 2.5s cycle.
- Trees: ultra-subtle canopy sway (just enough to feel alive).
- NPCs: occasional peck / head-bob even while paused in place.
- UI: counter ring slowly rotates (very slowly) when not changing.

## 12.7 Milestone Celebrations
- Every time the player reaches a **new best streak**, show a small banner:
  - “NEW BEST STREAK!” slides in (0.22s) and out (0.22s), with gold accent.

## 12.8 Result / Failure Sequence
- **On submit:** freeze-frame 0.08s → camera zoom pulse 0.25s → fade to Results overlay 0.25s.
- **On wrong:** add 0.25s shake and briefly desaturate scene (0.35s) behind the overlay.
- **On correct:** player does a quick hop-in-place animation (no physics jump needed; just pose + bob) and a green-tinted flash (`#8DDC4C`, 12% opacity, 0.2s).

---

## 13. UX Requirements
- Controls must be **visible on Menu** and **during gameplay**.
- Timer must be large and readable; never hidden by the 3D scene.
- Counter UI must be readable at all times:
  - Use high-contrast outline and a stable screen-facing orientation (billboard feel).
- Forgiving navigation:
  - Obstacle colliders shrunk by **0.12 units** per side.
  - No player collision with NPCs.
- Accessibility-lite:
  - Color distinction: Yellow Chicks must be clearly more saturated than White Chickens; add a tiny signature (e.g., chick has a brighter beak or a slightly different head proportion).

---

## 14. Out of Scope (V1)
1. Sound effects / music
2. Multiple levels/biomes (only Forest clearing)
3. Online leaderboards
4. Power-ups (slow time, highlight chicks, etc.)
5. Complex flocking AI or advanced pathfinding
6. Mouse/touch controls (keyboard only in V1; can be added later)
7. Shadow-mapping quality settings

---

## 15. Success Criteria
- [ ] Runs from a **single HTML file** without errors
- [ ] Uses **Three.js r160**
- [ ] Controls visible on **menu** and **in-game**
- [ ] Timer defaults to **20 seconds** (configurable constant)
- [ ] Player moves in **X/Z** with clear camera edge-panning behavior
- [ ] Yellow Chicks + distractor NPCs spawn within defined ranges and wander
- [ ] Submit locks answer; auto-submit at time-out
- [ ] Win only if submitted count equals actual spawned Yellow Chick count
- [ ] Counter change has immediate feedback (pop + nod) and denied-input feedback
- [ ] “Confirmed sighting” near-miss equivalent triggers once per chick per round
- [ ] Pause freezes timer/NPCs/camera; resume restores cleanly
- [ ] Best streak persists via `localStorage` key `voxelCensus_bestStreak`
- [ ] Scene has idle life (breathing, subtle sway) even when player stands still

---