---
name: phaser-gamedev
description: "Build 2D browser games with Phaser 3 (JS/TS): scenes, sprites, physics (Arcade/Matter), tilemaps (Tiled), animations, input. Trigger: 'Phaser scene', 'Arcade physics', 'tilemap', 'Phaser 3 game'."
---

# Phaser Game Development

Build 2D browser games using Phaser 3's scene-based architecture and physics systems.

---

## STOP: Before Loading Any Spritesheet

**Read [spritesheets-nineslice.md](references/spritesheets-nineslice.md) FIRST.**

Spritesheet loading is fragile—a few pixels off causes silent corruption that compounds into broken visuals. The reference file contains the mandatory inspection protocol.

**Quick rules** (details in reference):

1. **Measure the asset** before writing loader code—never guess frame dimensions
2. **Character sprites use SQUARE frames**: If you calculate frameWidth=56, try 56 for height first
3. **Different animations have different frame sizes**: A run cycle needs wider frames than idle; an attack needs extra width for weapon swing. Measure EACH spritesheet independently
4. **Check for spacing**: Gaps between frames require `spacing: N` in loader config
5. **Verify the math**: `imageWidth = (frameWidth × cols) + (spacing × (cols - 1))`

---

## Reference Files

Read these BEFORE working on the relevant feature:

| When working on... | Read first |
|--------------------|------------|
| Loading ANY spritesheet | [spritesheets-nineslice.md](references/spritesheets-nineslice.md) |
| Nine-slice UI panels | [spritesheets-nineslice.md](references/spritesheets-nineslice.md) |
| Config, scenes, objects, input, animations | [core-patterns.md](references/core-patterns.md) |
| Tiled tilemaps, collision layers | [tilemaps.md](references/tilemaps.md) |
| Physics tuning, groups, pooling | [arcade-physics.md](references/arcade-physics.md) |
| Performance issues, object pooling | [performance.md](references/performance.md) |

---

## Architecture Decisions (Make Early)

**Before building, decide**:
- What **scenes** does this game need? (Boot, Menu, Game, UI overlay, GameOver)
- What are the **core entities** and how do they interact?
- What **physics** model fits? (Arcade for speed, Matter for realism, None for menus)
- What **input methods**? (keyboard/gamepad/touch)

### Physics System Choice

| System | Use When |
|--------|----------|
| **Arcade** | Platformers, shooters, most 2D games. Fast AABB collisions |
| **Matter** | Physics puzzles, ragdolls, realistic collisions. Slower, more accurate |
| **None** | Menu scenes, visual novels, card games |

---

## Core Principles

1. **Scene-first architecture**: Organize code around scene lifecycle and transitions
2. **Composition over inheritance**: Build entities from sprite/body/controllers, not deep class trees
3. **Physics-aware design**: Choose collision model early; don't retrofit physics late
4. **Asset pipeline discipline**: Preload everything; reference by keys; keep loading deterministic
5. **Frame-rate independence**: Use `delta` for motion and timers; avoid frame counting

---

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Global state on `window` | Scene transitions break state | Use scene data, registries |
| Loading in `create()` | Assets not ready when referenced | Load in `preload()`, use Boot scene |
| Frame counting | Game speed varies with FPS | Use `delta / 1000` |
| Matter for simple collisions | Unnecessary complexity | Arcade handles most 2D games |
| One giant scene | Hard to extend | Separate gameplay/UI/menus |
| Magic numbers | Impossible to balance | Config objects, constants |
| No object pooling | GC stutters | Groups with `setActive(false)` |

---

## Variation Guidance

Outputs should vary based on:
- **Genre** (platformer vs top-down vs shmup)
- **Target platform** (mobile touch, desktop keyboard, gamepad)
- **Art style** (pixel art scaling vs HD smoothing)
- **Performance envelope** (many sprites → pooling; few sprites → simpler code)

---

## Remember

Phaser provides powerful primitives—scenes, sprites, physics, input—but **architecture is your responsibility**.

Think in systems: define the scenes, define the entities, define their interactions—then implement.

**Codex can build complete, polished Phaser games. These guidelines illuminate the path—they don't fence it.**
