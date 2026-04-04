# Oak Woods Platformer - Baseline Implementation Plan

## Goal
Replicate the mockup scene with:
1. Three parallax background layers
2. Flat ground using the tileset
3. Animated character with movement controls

## Project Context
- **Build tool**: Vite + TypeScript
- **Framework**: Phaser 3.90.0
- **Resolution**: 320x180 (pixel art)
- **Status**: `src/` directory is empty (clean slate)

## Files to Create

```
src/
├── main.ts              # Game config & entry point
├── vite-env.d.ts        # Vite type definitions
└── scenes/
    ├── BootScene.ts     # Asset loader
    └── GameScene.ts     # Main gameplay
```

---

## Step 1: Project Setup

### 1.1 Create `src/vite-env.d.ts`
```typescript
/// <reference types="vite/client" />
```

### 1.2 Create `src/main.ts`
- Game dimensions: 320x180
- Renderer: Canvas with `pixelArt: true`, `roundPixels: true`
- Physics: Arcade with gravity `{ y: 900 }`
- Scenes: [BootScene, GameScene]
- Parent container: `game-container`

---

## Step 2: BootScene - Asset Loading

### 2.1 Create `src/scenes/BootScene.ts`

**Preload phase:**
- Load `assets/oakwoods/assets.json` as JSON
- Display simple loading text

**Create phase:**
- Parse the manifest JSON
- Load all images from `images.backgrounds` array
- Load all images from `images.decorations` array
- Load character spritesheet: `oakwoods-char-blue` (64x49 frames)
- Load tileset image: `oakwoods-tileset`
- Store manifest in registry for other scenes
- Start GameScene when complete

---

## Step 3: GameScene - Core Gameplay

### 3.1 Create `src/scenes/GameScene.ts`

**Create phase - Background layers:**
- Add 3 tiled sprites for parallax backgrounds
- Layer 1 (furthest): `scrollFactorX: 0.1`
- Layer 2 (mid): `scrollFactorX: 0.3`
- Layer 3 (near): `scrollFactorX: 0.5`
- Each layer: position at y=0, tile to fill width

**Create phase - Ground layer:**
- Use `this.make.tilemap()` with blank map
- Single layer of ground tiles
- Identify flat ground tile from tileset (tile index TBD from tileset inspection)
- Create static physics body for collision
- Position at bottom of screen (~y=156 for 24px tiles)

**Create phase - Character:**
- Create physics sprite at starting position (x=100, y=100)
- Set world bounds collision
- Configure body: gravity, bounce, collideWorldBounds
- Add collider with ground layer

**Create phase - Animations:**
- Create `char-blue-idle` animation (frames 0-5, rate 8, loop)
- Play idle animation by default

**Create phase - Input:**
- Create cursor keys
- Optional: WASD keys

**Update phase - Movement:**
```
if (left) velocity.x = -100, flipX = true
else if (right) velocity.x = 100, flipX = false
else velocity.x = 0

if (up && onGround) velocity.y = -250 (jump)
```

**Update phase - Animation state:**
- If moving horizontally and on ground: ensure idle plays (no run animation yet)
- If in air: could show idle for now (jump/fall animations optional for baseline)

---

## Tileset Analysis

The tileset is 24x24 tiles, 21 columns x 15 rows (indices 0-314).

Tile index formula: `index = row * 21 + column`

**Simplified approach (user preference)**:
- Use tiles from the **first few cells** of the tileset (indices 0, 1, 2, etc.)
- Looking at row 0: Contains platform corner/edge pieces with grass-top and stone fill
- **Tile 0**: Top-left corner piece (grass top + stone)
- **Tile 1**: Similar platform piece

**Implementation**:
- Create a blank tilemap programmatically: `this.make.tilemap({ tileWidth: 24, tileHeight: 24, width: 14, height: 8 })`
- Add tileset image to map
- Create a single layer
- Fill bottom row(s) with tile index 0 or 1 (simple starting tiles)
- Set collision on these tiles
- This gives us a working ground without complex tile selection

---

## Verification Plan

1. **Run dev server**: `npm run dev`
2. **Check backgrounds**: All 3 layers visible, layered correctly
3. **Check ground**: Flat tileset ground at bottom, character can stand on it
4. **Check character**: Idle animation plays
5. **Check controls**:
   - Left/Right arrow moves character
   - Up arrow makes character jump
   - Character lands back on ground
6. **Check physics**: Character doesn't fall through ground

---

## Implementation Order

1. Create directory structure and type definitions
2. Create main.ts with game config
3. Create BootScene with asset loading
4. Create GameScene with backgrounds only (verify)
5. Add tilemap ground layer (verify collision)
6. Add character with physics (verify standing)
7. Add animations and input (verify movement)

---

## Asset Keys Reference (from assets.json)

| Asset | Key | Dimensions |
|-------|-----|------------|
| BG Layer 1 | `oakwoods-bg-layer1` | 320x180 |
| BG Layer 2 | `oakwoods-bg-layer2` | 320x180 |
| BG Layer 3 | `oakwoods-bg-layer3` | 320x180 |
| Character | `oakwoods-char-blue` | 64x49 frames |
| Tileset | `oakwoods-tileset` | 24x24 tiles |

## Animation Reference

| Animation | Frames | Rate | Loop |
|-----------|--------|------|------|
| char-blue-idle | 0-5 | 8 | yes |
| char-blue-attack | 8-13 | 12 | no |
