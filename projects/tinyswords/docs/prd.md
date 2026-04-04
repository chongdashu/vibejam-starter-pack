# Castle Clash Duel - Game Design Document

## 1. Summary
A top-down 2D real-time strategy 1v1 where each side spawns melee or ranged units, issues simple move/attack commands, and wins by destroying the opponent’s castle before their own falls.
- Assumptions:
  - Single-player vs AI by default (AI controls Red), with deterministic behavior (no networking in V1).
  - Uses provided art assets from relative paths exactly as listed.
  - Symmetrical lane-based map with mild terrain variance (grass/dirt) but no terrain blocking.
  - Maximum on-field units is capped for readability/performance.
  - Desktop (mouse/keyboard) + mobile (touch) are supported.
  - If tilemap JSON is not provided, the map is built as a simple repeated tile pattern from the tileset image.

## 2. Technical Requirements
- Rendering: **Phaser 3 (v3.70.0)** via CDN
- Single HTML file with inline CSS and JS
- Unit system: **pixels**
- Use Phaser Arcade Physics for overlap/hit testing and basic velocity movement (no rigid-body simulation required)

## 3. Canvas & Viewport
- Dimensions: **960×540**
- Background: muted grass-green (#7FAE5E) under the tilemap; subtle vignette overlay (dark edges) for focus
- Aspect ratio behavior: **letterboxed** (scale to fit, maintain aspect ratio, center canvas). UI anchored to screen corners, not world.

## 4. Visual Style & Art Direction
- Art style: colorful, readable, slightly “toy-like” medieval fantasy; sprites are the hero—UI is minimal and clean.
- Mood/atmosphere: light tactical tension; fast, responsive skirmishes in the center lane.
- Color palette (purposeful):
  - Grass base: **#7FAE5E**
  - Dirt lane: **#C6A15B**
  - Deep shadow: **#1B1F2A**
  - UI panel dark: **#2A2F3A**
  - UI panel light: **#3A4252**
  - Blue team primary: **#2B6DE8**
  - Blue team accent: **#7EC8FF**
  - Red team primary: **#E23B3B**
  - Red team accent: **#FF8A7A**
  - Neutral highlight (selection/confirm): **#F6E27F**
  - Damage flash: **#FFFFFF**
  - Heal/positive (if used later): **#61E294**
- Camera: fixed top-down view of the full battlefield (no camera panning). Slight screen shake only on major impacts (castle hits, unit deaths).

## 5. Player Specifications
### Player “role” (RTS commander)
- The player is not a character; the player controls **Blue** by selecting units and issuing commands, and by spawning units from the bottom UI bar.
- Starting position:
  - Blue castle on left quarter of map, centered vertically.
  - Red castle on right quarter, centered vertically.
- Movement constraints (symmetry requirement):
  - Units move freely in 2D (top-down) with simple pathing: steer directly toward target; avoid stacking with light separation.

### Selectable Units (shared rules)
- All units have:
  - Team: Blue or Red
  - HP, move speed, attack range, attack cooldown
  - Targeting: prefer nearest enemy unit in aggro radius; otherwise attack-move toward enemy castle when commanded or when spawned (AI)
- Visual identification:
  - Team sprites are separate assets (Blue Units vs Red Units).
  - Selection ring: subtle ellipse under feet (generated shape) tinted **#F6E27F**; enemy selection (if inspected) uses **#FF8A7A**.

## 6. Physics & Movement
Top-down RTS: no gravity, no jumping. “Up” is **negative Y** (Phaser default).

| Property | Value | Unit |
|----------|-------|------|
| Gravity | 0 | px/sec² |
| Jump velocity | 0 | px/sec |
| Move/scroll speed | N/A (camera fixed) | px/sec |
| Max fall speed | 0 | px/sec |
| Ground position | N/A | px |

**Unit movement (exact feel targets)**
- Acceleration into movement: **instant** (no ramp), but with a 80 ms “start-run” blend (see Juice).
- Max unit speed:
  - Warrior: **110 px/sec**
  - Archer: **95 px/sec**
- Separation (anti-stacking): when units overlap, apply gentle push so they don’t fully occupy the same spot:
  - Separation strength: **60 px/sec** equivalent steering away from nearest friendly within **22 px**.

## 7. Obstacles/Enemies
### Enemy = opposing team units + enemy castle
- Appearance: uses provided Red/Blue sprites
- Movement behavior:
  - Units: free 2D movement; steering toward commanded point/target
  - Castle: stationary
- Constraints symmetry:
  - Player units and AI units follow identical movement, attack ranges, cooldowns, and collision rules.

### AI (Red) behavior (V1, deterministic)
- Red spawns units periodically and issues simple attack-move toward Blue castle.
- Spawn cadence ramps slowly over time for pressure (see Progressive Intensity).
- Composition rule:
  - If Blue has > (Red melee + 1) archers on field, Red favors spawning warriors.
  - Otherwise Red alternates archer/warrior.

### Spawn timing (base)
- Red spawns one unit every **3.0 sec** at start, improving to **2.0 sec** by 4 minutes (linear ramp).
- Blue spawns on demand via UI buttons, limited by “Supply” (see Scoring & Economy).

## 8. World & Environment
### Map layout (symmetrical)
- World size: **1600×540 px** (camera shows 960×540 centered; but since camera is fixed, the world can still be wider—units can traverse fully)
- Core lane:
  - A central dirt lane band from x=0..1600 with lane center at y=270.
  - Dirt width: **220 px** (y=160..380), grass above/below.
- Castles:
  - Blue castle center: **(260, 270)**
  - Red castle center: **(1340, 270)**
- Spawn pads (invisible circles):
  - Blue spawn point: **(360, 270)**
  - Red spawn point: **(1240, 270)**
- Decorations: optional, non-colliding (if present in tileset); must not obstruct movement in V1.

### Tilemap usage
- Primary terrain from: `Terrain/Tileset/Tilemap_color1.png`
- If a tilemap JSON is available, load it; otherwise:
  - Build a simple procedural symmetric pattern: grass tiles everywhere, dirt tiles in the lane rectangle.
  - Ensure lane edges are visually crisp for readability (use darker dirt-edge tiles if available; otherwise accept flat fill).

## 9. Collision & Scoring
### Collision approach
- Units and projectiles use simple hit shapes:
  - Units: circular hit test based on sprite footprint
  - Projectiles: small circle
  - Castle: rectangle or circle approximating base
- Forgiving hitboxes (required):
  - Unit hurt radius = **(visual foot radius - 6 px)**, minimum **10 px**
  - Castle hurtbox shrunk inward by **12 px** from sprite bounds

### Combat rules (exact stats)
**Warrior (melee)**
- Max HP: **140**
- Attack damage: **18**
- Attack range: **22 px** (must be close)
- Attack cooldown: **0.75 sec**
- Windup (cannot retarget mid-swing): **0.20 sec**
- On hit: triggers dust impact FX at target contact point
- Priority: attacks closest enemy within **140 px** aggro; otherwise continues toward commanded destination.

**Archer (ranged)**
- Max HP: **90**
- Attack damage: **14**
- Attack range: **190 px**
- Attack cooldown: **1.05 sec**
- Windup: **0.25 sec**
- Projectile: Arrow sprite `Units/Blue Units/Archer/Arrow.png`
  - Speed: **420 px/sec**
  - Lifetime: **0.9 sec** or despawn on hit
  - Slight random spread: ± **4 degrees** (keeps volleys lively but still fair)
- Minimum range (to prevent point-blank dominance): if enemy is within **40 px**, archer attempts to backstep for **0.35 sec** while still allowed to shoot (symmetrically applied to both teams).

**Castle (objective)**
- Max HP: **1200**
- Takes damage from both unit types (melee direct, ranged via arrows)
- No attacks in V1 (keeps readability and avoids turret balancing)

### Game over
- Game over triggers immediately when a castle HP reaches **0**:
  - If Red castle destroyed → Blue wins
  - If Blue castle destroyed → Blue loses

### Score
- Score is for progression/feedback (not win condition):
  - +1 per **10 damage** dealt to enemy castle (rounded down per event)
  - +15 per enemy unit kill
  - +5 per “near-miss” micro event (see Juice) — RTS-appropriate version: “Last-Second Save”
- High score storage: `localStorage` key = **"castle-clash-duel_highscore"**

### Economy (simple, readable)
- Resource: **Supply**
- Supply starts at **6**, max **20**
- Supply regenerates: **+1 every 2.0 sec**
- Unit costs:
  - Warrior: **3 supply**
  - Archer: **4 supply**
- Supply UI shows current and max; denied spawns give clear feedback (see Input Response).

## 10. Controls
| Input | Action | Condition |
|-------|--------|-----------|
| Left Click (world) | Select nearest friendly unit within 28 px | Playing |
| Left Click + drag | Box-select friendly units | Playing |
| Right Click (world) | Command selected units: move; if clicking enemy unit/castle, attack it | Playing (desktop) |
| Tap (world) | Select friendly unit; double-tap selects all same-type on screen | Playing (mobile) |
| Tap on ground (with selection) | Command move | Playing (mobile) |
| Tap on enemy | Command attack | Playing (mobile) |
| UI Button: Warrior | Spawn Warrior at Blue spawn pad | Playing, if supply ≥ 3 |
| UI Button: Archer | Spawn Archer at Blue spawn pad | Playing, if supply ≥ 4 |
| A key | Quick-spawn Archer | Playing, if supply ≥ 4 |
| W key | Quick-spawn Warrior | Playing, if supply ≥ 3 |
| Shift (held) | Queue commands (adds waypoint/target to unit command queue, max 3) | Playing (desktop) |
| P or Esc | Pause/Resume | Playing/Paused |
| Enter / Space | Start match from menu; Retry from game over | Menu/Game Over |

## 11. Game States
### Menu
- Display:
  - Title: “Castle Clash Duel”
  - Two large buttons: **Start** and **How to Play**
  - Controls panel always visible:
    - “Select: Click/Tap”
    - “Command: Right-click / Tap ground or enemy”
    - “Spawn: W Warrior (3), A Archer (4)”
    - “Pause: P / Esc”
- Start:
  - Start button, or Enter/Space

### Playing
- Active systems:
  - Unit spawning (player UI + AI)
  - Selection & commands
  - Combat & projectiles
  - Score, supply, castle HP bars, unit health bars
- UI shown:
  - Top-left: Blue castle HP bar + numeric
  - Top-right: Red castle HP bar + numeric
  - Top-center: Score + Best
  - Bottom-center: Spawn buttons (Warrior/Archer) with costs and cooldown-free (only supply-limited)
  - Bottom-left: Controls hint (compact)
  - Cursor: custom cursor sprite `UI Elements/UI Elements/Cursors/Cursor_01.png` (desktop only)

### Paused
- Trigger: P or Esc
- Display: dark overlay (60% opacity), “PAUSED”, controls reminder, “Press P/Esc to resume”
- Everything frozen: unit movement, attacks, projectiles, AI timers, supply regen

### Game Over
- Trigger: castle HP reaches 0
- Display:
  - “VICTORY” (if Red castle destroyed) or “DEFEAT”
  - Final score, Best score
  - “Press Enter/Space or Tap to Retry”
- Retry resets match state but keeps best score in localStorage

## 12. Game Feel & Juice (REQUIRED)
### 12.1 Input Response
- Selection:
  - Same-frame selection ring appears under unit(s)
  - Selected unit portrait “pips” appear above bottom UI bar (small icons tinted by team)
  - Selection sound is out of scope; use a visual “ping”: tiny expanding circle (120 ms) at selection point
- Command acknowledgment (move/attack):
  - Same-frame ground marker: a brief dust puff + ring at clicked location (use `Particle FX/Dust_01.png`)
  - Attack command on enemy: red/blue crosshair ring flashes on target for **140 ms**
- Spawn button press:
  - Button depress animation (scale to 0.94 for 80 ms, ease-out)
  - Spawned unit pops in with a 120 ms scale-up (0.85 → 1.0) + dust puff at spawn pad
- Denied input (not enough supply):
  - Spawn button shakes horizontally **6 px** for **180 ms**
  - Button briefly flashes tint **#FF8A7A** for **120 ms**
  - Supply number pulses (scale 1.0 → 1.15 → 1.0 over 200 ms)

### 12.2 Animation Timing
- Unit animation states (minimum required from assets):
  - Idle: loops at **8 fps**
  - Run: loops at **10 fps**
  - Attack/Shoot: plays once at **12 fps**
- Blend rules (feel, not tech):
  - Transition Idle→Run: must happen within **80 ms** of movement start
  - Transition Run→Idle: after **120 ms** of zero velocity (prevents flicker)
  - Attack lock: during windup (Warrior 0.20s, Archer 0.25s) unit faces target and reduces move speed to **20%** (keeps attacks readable)
- UI transitions:
  - Menu overlay fade: **220 ms** ease-out
  - Game Over banner drop-in: **260 ms** with slight overshoot (ends at rest)

### 12.3 Near-Miss Rewards (RTS-appropriate: “Last-Second Save”)
- Detection:
  - When a Blue unit would take lethal damage, but receives a command (move or attack) within **0.35 sec** before the lethal hit and survives for **0.6 sec** afterward, count as a “Save”.
  - Also triggers if an archer arrow misses a Blue unit by **≤ 10 px** within 0.25 sec of a move command (a “Dodge”).
- Visual:
  - Brief slow-mo pulse: **0.85x time scale for 220 ms**
  - Unit gets a gold outline flash **120 ms**
  - Floating text: “SAVE +5” or “DODGE +5” rising 24 px over 600 ms
- Score:
  - +5 points per event, max 1 event per unit per 4 seconds (anti-spam)

### 12.4 Screen Effects
| Effect | Trigger | Feel |
|--------|---------|------|
| Shake | Castle hit (every 60 damage chunk), unit death | 6 px for 120 ms (castle), 3 px for 90 ms (death) |
| Flash | “Save/Dodge”, castle at <25% HP | White overlay at 18% opacity for 90 ms (save), red/blue tint pulse at 12% opacity for 140 ms (low HP) |
| Zoom pulse | Victory/Defeat banner | Scale 1.0 → 1.03 → 1.0 over 260 ms |
| Time dilation | “Save/Dodge”, Game Over final blow | 0.85x for 220 ms (save), 0.6x for 350 ms (final blow) |

### 12.5 Progressive Intensity
Score/time thresholds increase pressure while staying fair and symmetrical:
- At 0: normal saturation, AI spawn every 3.0 sec
- At 200 score or 90 sec: subtle vignette strengthens by 10%, AI spawn → 2.6 sec
- At 450 score or 180 sec: lane contrast increases (dirt slightly darker), AI spawn → 2.3 sec
- At 700 score or 240 sec: “battle heat” overlay (very subtle warm tint), AI spawn → 2.0 sec
- At either castle <25% HP: heartbeat UI pulse on that castle HP bar (scale 1.0 → 1.06 every 0.8 sec)

### 12.6 Idle Life
- Units:
  - Idle breathing bob: ±2 px vertical over 1.2 sec sine wave
  - Occasional micro turn-in-place toward nearest enemy every 1.0–2.0 sec (keeps battlefield “alive”)
- Environment:
  - Ambient dust motes drifting along the lane (low alpha, slow)
- UI:
  - Spawn buttons have a slow sheen sweep every 5 seconds (very subtle)
  - Supply number gently pulses when full (to encourage spending)

### 12.7 Milestone Celebrations
- Every **250 score**:
  - Top-center banner: “Milestone +250!” (220 ms fade-in, 400 ms hold, 220 ms fade-out)
  - Confetti substitute (no extra assets): 12 tiny colored rectangles burst near score for 600 ms
- New high score:
  - “NEW BEST!” tag next to score with gold tint **#F6E27F**, persists until match end

### 12.8 Death Sequence
- Unit death:
  - Freeze-frame **70 ms**
  - Unit flashes white **60 ms**, then fades to 0 alpha over **180 ms**
  - Dust impact FX bursts outward (6–10 particles) and quickly dissipates (300 ms)
- Castle destruction:
  - Freeze-frame **120 ms**
  - Strong screen shake: 10 px for 260 ms
  - Desaturate world by 40% over 400 ms, then show Game Over overlay
  - Castle sprite “cracks” effect simulated by quick jitter + two dust bursts (no new art required)

## 13. UX Requirements
- Controls visible on menu screen (required): include mouse + touch instructions
- Controls hint during gameplay (required): compact strip bottom-left
- Forgiving collision: unit hurt radius reduced by **6 px**, castle hurtbox shrunk by **12 px**
- Mobile/touch:
  - Tap-to-select, tap-to-command
  - Clear selection state always visible (rings + unit pips)
  - UI buttons sized for touch: minimum **72×72 px** hit area each
- Readability:
  - Health bars always visible over units when damaged in last 2 seconds; otherwise fade to 30% alpha
  - Castle HP bars always visible, large, and color-coded

## 14. Out of Scope (V1)
- Online multiplayer / matchmaking / netcode
- Fog of war, scouting, hidden information
- Additional unit types, upgrades, tech trees
- Resource harvesting, buildings beyond the single castle objective
- Complex pathfinding with obstacles (no walls/forests that block)
- Audio/music (visual feedback only)
- Skins/cosmetics/settings menu
- Replays or spectating

## 15. Success Criteria
- [ ] Runs from single HTML file without errors
- [ ] Uses Phaser 3.70.0 and loads provided assets (with graceful fallback if a tilemap JSON is missing)
- [ ] Controls visible on menu AND during gameplay
- [ ] Selection and command inputs give same-frame visual acknowledgment
- [ ] Two unit types implemented (Warrior melee, Archer ranged) with idle/run/attack animations
- [ ] Archer fires arrow projectiles with defined speed, lifetime, and hit rules
- [ ] Symmetrical gameplay constraints: both teams’ units follow the same movement/attack rules
- [ ] Supply system limits spawning; denied spawns have clear feedback
- [ ] Near-miss (“Save/Dodge”) events trigger slow-mo + bonus + floating text
- [ ] Score updates with visual feedback; high score persists via localStorage key `"castle-clash-duel_highscore"`
- [ ] Pause/resume works and freezes all combat/spawns/projectiles
- [ ] Castle destruction triggers impactful death sequence and correct Victory/Defeat state
- [ ] Collision feels fair due to specified hitbox shrink and readable HP bars